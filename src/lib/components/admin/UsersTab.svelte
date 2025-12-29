<script lang="ts">
    import { onMount } from "svelte";
    import { db } from "$lib/firebase";
    import {
        collection,
        query,
        getDocs,
        doc,
        updateDoc,
        deleteDoc,
        orderBy,
        limit,
    } from "firebase/firestore";

    interface User {
        uid: string;
        email: string;
        displayName: string;
        isVerified?: boolean;
        isAdmin?: boolean;
        subscriptionTier?: string;
        createdAt?: number;
    }

    let users: User[] = [];
    let filteredUsers: User[] = [];
    let loading = true;
    let searchTerm = "";
    let filterType: "all" | "verified" | "unverified" | "pro" | "admin" = "all";
    let statusMessage = "";
    let editingUser: User | null = null;

    onMount(async () => {
        await loadUsers();
    });

    async function loadUsers() {
        loading = true;
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, orderBy("createdAt", "desc"), limit(200));
            const snapshot = await getDocs(q);

            users = snapshot.docs.map((doc) => ({
                uid: doc.id,
                ...(doc.data() as any),
            }));

            applyFilters();
        } catch (e: any) {
            console.error(e);
            statusMessage = "❌ Error al cargar usuarios: " + e.message;
        } finally {
            loading = false;
        }
    }

    function applyFilters() {
        filteredUsers = users.filter((user) => {
            const matchesSearch =
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.displayName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                user.uid.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter =
                filterType === "all" ||
                (filterType === "verified" && user.isVerified) ||
                (filterType === "unverified" && !user.isVerified) ||
                (filterType === "pro" &&
                    (user.subscriptionTier === "pro" ||
                        user.subscriptionTier === "premium")) ||
                (filterType === "admin" && user.isAdmin);

            return matchesSearch && matchesFilter;
        });
    }

    $: {
        searchTerm;
        filterType;
        applyFilters();
    }

    async function toggleVerified(user: User) {
        try {
            const newValue = !user.isVerified;
            const updates = [];

            // 1. Update User document
            const userRef = doc(db, "users", user.uid);
            updates.push(
                updateDoc(userRef, {
                    isVerified: newValue,
                    updatedAt: Date.now(),
                }),
            );

            // 2. Try to update Artist document (if it exists)
            try {
                const { getDoc } = await import("firebase/firestore");
                const artistRef = doc(db, "artists", user.uid);
                const artistSnap = await getDoc(artistRef);

                if (artistSnap.exists()) {
                    updates.push(
                        updateDoc(artistRef, {
                            isVerified: newValue,
                        }),
                    );
                }
            } catch (err) {
                console.warn("Could not sync with artist profile:", err);
            }

            await Promise.all(updates);

            user.isVerified = newValue;
            users = users;

            statusMessage = `✅ ${user.email} ${newValue ? "verificado" : "desverificado"} correctamente`;
            setTimeout(() => (statusMessage = ""), 3000);
        } catch (e: any) {
            console.error(e);
            statusMessage = "❌ Error: " + e.message;
        }
    }

    async function toggleAdmin(user: User) {
        if (
            !confirm(
                `¿${user.isAdmin ? "Quitar" : "Dar"} permisos de ADMIN a ${user.email}?`,
            )
        )
            return;

        try {
            const userRef = doc(db, "users", user.uid);
            const newValue = !user.isAdmin;

            await updateDoc(userRef, {
                isAdmin: newValue,
                updatedAt: Date.now(),
            });

            user.isAdmin = newValue;
            users = users;

            statusMessage = `✅ ${user.email} ${newValue ? "es" : "ya no es"} admin`;
            setTimeout(() => (statusMessage = ""), 3000);
        } catch (e: any) {
            statusMessage = "❌ Error: " + e.message;
        }
    }

    async function changeTier(user: User, tier: string) {
        if (!confirm(`¿Cambiar plan de ${user.email} a ${tier.toUpperCase()}?`))
            return;

        try {
            const userRef = doc(db, "users", user.uid);

            await updateDoc(userRef, {
                subscriptionTier: tier,
                updatedAt: Date.now(),
            });

            user.subscriptionTier = tier;
            users = users;

            statusMessage = `✅ Plan de ${user.email} cambiado a ${tier.toUpperCase()}`;
            setTimeout(() => (statusMessage = ""), 3000);
        } catch (e: any) {
            statusMessage = "❌ Error: " + e.message;
        }
    }

    async function deleteUser(user: User) {
        if (
            !confirm(
                `⚠️ ¿ELIMINAR PERMANENTEMENTE a ${user.email}?\n\nEsta acción NO se puede deshacer.`,
            )
        )
            return;
        if (
            !confirm(
                `¿Estás SEGURO? Esto eliminará:\n- Usuario\n- Sus datos\n- Su perfil de artista (si existe)`,
            )
        )
            return;

        try {
            // Delete user document
            await deleteDoc(doc(db, "users", user.uid));

            // Try to delete artist profile if exists
            try {
                await deleteDoc(doc(db, "artists", user.uid));
            } catch (e) {
                // Artist profile may not exist, that's ok
            }

            users = users.filter((u) => u.uid !== user.uid);
            applyFilters();

            statusMessage = `✅ Usuario ${user.email} eliminado permanentemente`;
            setTimeout(() => (statusMessage = ""), 5000);
        } catch (e: any) {
            statusMessage = "❌ Error al eliminar: " + e.message;
        }
    }
</script>

<div class="animate-fade-in">
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-white mb-2">Gestión de Usuarios</h2>
        <p class="text-slate-400">
            Ver, editar, verificar y gestionar todos los usuarios
        </p>
    </div>

    <!-- Status Message -->
    {#if statusMessage}
        <div class="mb-6 p-4 bg-white/10 border border-white/20 rounded-xl">
            {statusMessage}
        </div>
    {/if}

    <!-- Filters -->
    <div class="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div class="grid md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
                <label
                    for="user-search-input"
                    class="block text-sm font-medium mb-2 text-white"
                    >Buscar Usuario</label
                >
                <input
                    id="user-search-input"
                    type="text"
                    bind:value={searchTerm}
                    placeholder="Email, nombre o UID..."
                    class="w-full bg-midnight-800 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                />
            </div>

            <div>
                <label
                    for="user-filter-select"
                    class="block text-sm font-medium mb-2 text-white"
                    >Filtrar</label
                >
                <select
                    id="user-filter-select"
                    bind:value={filterType}
                    class="w-full bg-midnight-800 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                >
                    <option value="all">Todos</option>
                    <option value="verified">Solo Verificados</option>
                    <option value="unverified">Solo No Verificados</option>
                    <option value="pro">Solo PRO/Premium</option>
                    <option value="admin">Solo Admins</option>
                </select>
            </div>
        </div>
    </div>

    <!-- Users List -->
    {#if loading}
        <div class="text-center py-12">
            <div
                class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"
            ></div>
            <p class="mt-4 text-slate-400">Cargando usuarios...</p>
        </div>
    {:else}
        <!-- Desktop Table (Hidden on Mobile) -->
        <div
            class="hidden md:block bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        >
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-white/5 border-b border-white/10">
                        <tr>
                            <th
                                class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-300"
                                >Usuario</th
                            >
                            <th
                                class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-300"
                                >Plan</th
                            >
                            <th
                                class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-300"
                                >Estado</th
                            >
                            <th
                                class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-300"
                                >Acciones</th
                            >
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        {#each filteredUsers as user}
                            <tr class="hover:bg-white/5 transition-colors">
                                <td class="px-6 py-4">
                                    <div>
                                        <p class="font-medium text-white">
                                            {user.displayName || "Sin nombre"}
                                        </p>
                                        <p class="text-sm text-slate-400">
                                            {user.email}
                                        </p>
                                        <p
                                            class="text-xs text-slate-500 font-mono mt-1"
                                        >
                                            {user.uid}
                                        </p>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <select
                                        on:change={(e) =>
                                            changeTier(
                                                user,
                                                e.currentTarget.value,
                                            )}
                                        value={user.subscriptionTier || "free"}
                                        class="px-3 py-1.5 rounded-lg text-xs font-bold bg-midnight-800 border border-white/20 text-white focus:outline-none focus:border-primary-500"
                                    >
                                        <option value="free">Free</option>
                                        <option value="pro">PRO</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex flex-wrap gap-2">
                                        {#if user.isVerified}
                                            <span
                                                class="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs font-bold"
                                            >
                                                ✓ Verificado
                                            </span>
                                        {/if}
                                        {#if user.isAdmin}
                                            <span
                                                class="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-300 rounded-lg text-xs font-bold"
                                            >
                                                👑 Admin
                                            </span>
                                        {/if}
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div
                                        class="flex items-center justify-end gap-2"
                                    >
                                        <button
                                            on:click={() =>
                                                toggleVerified(user)}
                                            class="p-2 rounded-lg transition-colors {user.isVerified
                                                ? 'bg-red-500/20 text-red-300'
                                                : 'bg-green-500/20 text-green-300'}"
                                            title={user.isVerified
                                                ? "Quitar verificado"
                                                : "Verificar"}
                                        >
                                            {user.isVerified ? "✗" : "✓"}
                                        </button>
                                        <button
                                            on:click={() => toggleAdmin(user)}
                                            class="p-2 rounded-lg transition-colors {user.isAdmin
                                                ? 'bg-orange-500/20 text-orange-300'
                                                : 'bg-slate-500/20 text-slate-300'}"
                                            title={user.isAdmin
                                                ? "Quitar admin"
                                                : "Hacer admin"}
                                        >
                                            👑
                                        </button>
                                        <button
                                            on:click={() => deleteUser(user)}
                                            class="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                            title="Eliminar usuario"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Mobile Cards (Visible on Mobile) -->
        <div class="md:hidden space-y-4">
            {#each filteredUsers as user}
                <div
                    class="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4"
                >
                    <!-- Header -->
                    <div class="flex justify-between items-start">
                        <div class="flex-1 pr-4">
                            <p class="font-bold text-white text-lg break-all">
                                {user.displayName || "Sin nombre"}
                            </p>
                            <p class="text-sm text-slate-400 break-all">
                                {user.email}
                            </p>
                            <p
                                class="text-xs text-slate-600 font-mono mt-1 text-ellipsis overflow-hidden w-full"
                            >
                                {user.uid}
                            </p>
                        </div>
                        <div
                            class="flex flex-col gap-2 items-end flex-shrink-0"
                        >
                            <select
                                on:change={(e) =>
                                    changeTier(user, e.currentTarget.value)}
                                value={user.subscriptionTier || "free"}
                                class="px-3 py-1 rounded-lg text-xs font-bold bg-midnight-800 border border-white/20 text-white"
                            >
                                <option value="free">Free</option>
                                <option value="pro">PRO</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>
                    </div>

                    <!-- Badges -->
                    <div class="flex flex-wrap gap-2">
                        {#if user.isVerified}
                            <span
                                class="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs font-bold"
                                >✓ Verificado</span
                            >
                        {/if}
                        {#if user.isAdmin}
                            <span
                                class="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-300 rounded-lg text-xs font-bold"
                                >👑 Admin</span
                            >
                        {/if}
                    </div>

                    <!-- Actions -->
                    <div
                        class="grid grid-cols-3 gap-2 pt-4 border-t border-white/10"
                    >
                        <button
                            on:click={() => toggleVerified(user)}
                            class="py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1 transition-colors {user.isVerified
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-green-500/20 text-green-300'}"
                        >
                            {user.isVerified ? "Quitar" : "Verificar"}
                        </button>
                        <button
                            on:click={() => toggleAdmin(user)}
                            class="py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1 transition-colors {user.isAdmin
                                ? 'bg-orange-500/20 text-orange-300'
                                : 'bg-slate-500/20 text-slate-300'}"
                        >
                            Admin
                        </button>
                        <button
                            on:click={() => deleteUser(user)}
                            class="py-2 px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg font-medium text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            {/each}
        </div>

        {#if filteredUsers.length === 0}
            <div class="text-center py-12 text-slate-400">
                <p>No se encontraron usuarios con esos criterios</p>
            </div>
        {/if}

        <div class="px-2 py-4 text-sm text-slate-500 text-center">
            Mostrando {filteredUsers.length} de {users.length} usuarios
        </div>
    {/if}
</div>
