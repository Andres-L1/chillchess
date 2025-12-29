<script lang="ts">
    import { onMount } from "svelte";
    import { db } from "$lib/firebase";
    import {
        collection,
        query,
        getDocs,
        doc,
        updateDoc,
        orderBy,
        limit,
    } from "firebase/firestore";

    interface User {
        uid: string;
        email: string;
        displayName: string;
        isVerified?: boolean;
        subscriptionTier?: string;
        createdAt?: number;
    }

    let users: User[] = [];
    let filteredUsers: User[] = [];
    let loading = true;
    let searchTerm = "";
    let filterType: "all" | "verified" | "unverified" = "all";
    let statusMessage = "";

    onMount(async () => {
        await loadUsers();
    });

    async function loadUsers() {
        loading = true;
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, orderBy("createdAt", "desc"), limit(100));
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
                (filterType === "unverified" && !user.isVerified);

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
            const userRef = doc(db, "users", user.uid);
            const newValue = !user.isVerified;

            await updateDoc(userRef, {
                isVerified: newValue,
                updatedAt: Date.now(),
            });

            // Update local state
            user.isVerified = newValue;
            users = users;

            statusMessage = `✅ ${user.email} ahora ${newValue ? "ES" : "NO ES"} verificado`;
            setTimeout(() => (statusMessage = ""), 3000);
        } catch (e: any) {
            statusMessage = "❌ Error: " + e.message;
        }
    }

    async function makeAdmin(user: User) {
        if (!confirm(`¿Dar permisos de ADMIN a ${user.email}?`)) return;

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                isAdmin: true,
                updatedAt: Date.now(),
            });

            statusMessage = `✅ ${user.email} ahora es ADMIN`;
            setTimeout(() => (statusMessage = ""), 3000);
        } catch (e: any) {
            statusMessage = "❌ Error: " + e.message;
        }
    }
</script>

<div class="animate-fade-in">
    <!-- Status Message -->
    {#if statusMessage}
        <div class="mb-6 p-4 bg-white/10 border border-white/20 rounded-xl">
            {statusMessage}
        </div>
    {/if}

    <!-- Filters -->
    <div class="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div class="grid md:grid-cols-2 gap-4">
            <div>
                <label
                    for="verify-search-input"
                    class="block text-sm font-medium mb-2">Buscar Usuario</label
                >
                <input
                    id="verify-search-input"
                    type="text"
                    bind:value={searchTerm}
                    placeholder="Email, nombre o UID..."
                    class="w-full bg-midnight-800 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500"
                />
            </div>

            <div>
                <label
                    for="verify-filter-select"
                    class="block text-sm font-medium mb-2"
                    >Filtrar por Estado</label
                >
                <select
                    id="verify-filter-select"
                    bind:value={filterType}
                    class="w-full bg-midnight-800 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500"
                >
                    <option value="all">Todos</option>
                    <option value="verified">Solo Verificados</option>
                    <option value="unverified">Solo No Verificados</option>
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
        <div
            class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        >
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-white/5 border-b border-white/10">
                        <tr>
                            <th
                                class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                                >Usuario</th
                            >
                            <th
                                class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                                >Plan</th
                            >
                            <th
                                class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                                >Estado</th
                            >
                            <th
                                class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider"
                                >Acciones</th
                            >
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        {#each filteredUsers as user}
                            <tr class="hover:bg-white/5 transition-colors">
                                <td class="px-6 py-4">
                                    <div>
                                        <p class="font-medium">
                                            {user.displayName || "Sin nombre"}
                                        </p>
                                        <p class="text-sm text-slate-400">
                                            {user.email}
                                        </p>
                                        <p
                                            class="text-xs text-slate-500 font-mono"
                                        >
                                            {user.uid}
                                        </p>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span
                                        class="px-3 py-1 rounded-full text-xs font-bold {user.subscriptionTier ===
                                            'pro' ||
                                        user.subscriptionTier === 'premium'
                                            ? 'bg-purple-500/20 text-purple-300'
                                            : 'bg-slate-500/20 text-slate-300'}"
                                    >
                                        {user.subscriptionTier || "free"}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    {#if user.isVerified}
                                        <span
                                            class="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-bold"
                                        >
                                            ✓ Verificado
                                        </span>
                                    {:else}
                                        <span
                                            class="inline-flex items-center gap-2 px-3 py-1 bg-slate-500/20 text-slate-400 rounded-full text-xs font-bold"
                                        >
                                            No Verificado
                                        </span>
                                    {/if}
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div
                                        class="flex items-center justify-end gap-2"
                                    >
                                        <button
                                            on:click={() =>
                                                toggleVerified(user)}
                                            class="px-4 py-2 rounded-lg font-medium text-sm transition-colors {user.isVerified
                                                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                                : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'}"
                                        >
                                            {user.isVerified
                                                ? "Quitar Verificado"
                                                : "Verificar"}
                                        </button>

                                        <button
                                            on:click={() => makeAdmin(user)}
                                            class="px-4 py-2 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 rounded-lg font-medium text-sm transition-colors"
                                            title="Dar permisos de administrador"
                                        >
                                            👑 Admin
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            {#if filteredUsers.length === 0}
                <div class="text-center py-12 text-slate-400">
                    <p>No se encontraron usuarios con esos criterios</p>
                </div>
            {/if}

            <div
                class="px-6 py-4 bg-white/5 border-t border-white/10 text-sm text-slate-400"
            >
                Mostrando {filteredUsers.length} de {users.length} usuarios
            </div>
        </div>
    {/if}
</div>
