<script lang="ts">
    import { onMount } from "svelte";
    import { userStore } from "$lib/auth/userStore";
    import { db } from "$lib/firebase";
    import { doc, updateDoc, getDoc } from "firebase/firestore";

    let currentUser: any = null;
    let currentData: any = null;
    let isAdmin = false;
    let loading = true;
    let message = "";

    onMount(async () => {
        if (!$userStore.user) {
            message = "Debes estar logueado";
            loading = false;
            return;
        }

        currentUser = $userStore.user;

        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
                currentData = userDoc.data();
                isAdmin = currentData?.isAdmin || false;
            }
        } catch (e: any) {
            message = "Error: " + e.message;
        }

        loading = false;
    });

    async function setAsAdmin() {
        if (!currentUser) return;

        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                isAdmin: true,
                updatedAt: Date.now(),
            });

            message = "✅ Acceso de admin otorgado. Recarga la página.";
            isAdmin = true;
        } catch (e: any) {
            message = "❌ Error: " + e.message;
        }
    }
</script>

<div class="min-h-screen bg-midnight-900 text-white p-8">
    <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Restaurar Acceso Admin</h1>

        {#if loading}
            <p>Cargando...</p>
        {:else if !currentUser}
            <p class="text-red-400">
                Debes estar logueado para usar esta herramienta
            </p>
        {:else}
            <div
                class="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4"
            >
                <div>
                    <p class="text-sm text-slate-400">Email</p>
                    <p class="font-mono">{currentUser.email}</p>
                </div>

                <div>
                    <p class="text-sm text-slate-400">UID</p>
                    <p class="font-mono text-xs">{currentUser.uid}</p>
                </div>

                <div>
                    <p class="text-sm text-slate-400">Estado Admin Actual</p>
                    <p
                        class="font-bold {isAdmin
                            ? 'text-green-400'
                            : 'text-red-400'}"
                    >
                        {isAdmin ? "✅ Admin" : "❌ No Admin"}
                    </p>
                </div>

                {#if !isAdmin}
                    <button
                        on:click={setAsAdmin}
                        class="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        Restaurar Acceso de Admin
                    </button>
                {/if}

                {#if message}
                    <p class="text-center p-3 rounded-lg bg-white/10">
                        {message}
                    </p>
                {/if}

                {#if isAdmin}
                    <a
                        href="/admin"
                        class="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        Ir al Panel Admin
                    </a>
                {/if}
            </div>

            <div
                class="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
            >
                <p class="text-xs text-yellow-200">
                    ⚠️ Esta página es temporal. Elimínala después de restaurar
                    tu acceso.
                </p>
            </div>
        {/if}
    </div>
</div>
