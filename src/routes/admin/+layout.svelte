<script lang="ts">
    import { page } from "$app/stores";
    import { userStore } from "$lib/auth/userStore";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let isAuthorized = false;
    let isLoading = true;

    // Check admin access
    onMount(async () => {
        if ($userStore.loading) {
            const unsubscribe = userStore.subscribe((state) => {
                if (!state.loading) {
                    checkAccess(state.user);
                    unsubscribe();
                }
            });
        } else {
            checkAccess($userStore.user);
        }
    });

    async function checkAccess(user: any) {
        if (!user) {
            isLoading = false;
            goto("/");
            return;
        }

        const ADMIN_EMAIL = "andreslgumuzio@gmail.com";

        if (user.email !== ADMIN_EMAIL) {
            console.warn("Unauthorized admin access attempt");
            isLoading = false;
            goto("/");
            return;
        }

        try {
            const { doc, getDoc } = await import("firebase/firestore");
            const { db } = await import("$lib/firebase");

            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            if (userData?.isAdmin === true) {
                isAuthorized = true;
            } else {
                goto("/");
            }
        } catch (error) {
            console.error("Error checking admin access:", error);
            goto("/");
        } finally {
            isLoading = false;
        }
    }

    const navItems = [
        { path: "/admin", label: "Dashboard", icon: "📊" },
        { path: "/admin/verify", label: "Verificar Usuarios", icon: "✓" },
        { path: "/admin/logs", label: "Logs", icon: "📝" },
    ];

    $: currentPath = $page.url.pathname;
</script>

{#if isLoading}
    <div class="min-h-screen flex items-center justify-center bg-[#0B1120]">
        <div class="text-center">
            <div
                class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mb-4"
            ></div>
            <p class="text-white/60 font-medium">Verificando acceso...</p>
        </div>
    </div>
{:else if isAuthorized}
    <div class="min-h-screen bg-midnight-900 flex">
        <!-- Sidebar -->
        <aside
            class="w-64 bg-midnight-800 border-r border-white/10 flex flex-col"
        >
            <div class="p-6 border-b border-white/10">
                <h1 class="text-xl font-bold text-white">Admin Panel</h1>
                <p class="text-xs text-slate-400 mt-1">ChillChess</p>
            </div>

            <nav class="flex-1 p-4 space-y-2">
                {#each navItems as item}
                    <a
                        href={item.path}
                        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all {currentPath ===
                        item.path
                            ? 'bg-primary-500 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'}"
                    >
                        <span class="text-xl">{item.icon}</span>
                        <span class="font-medium">{item.label}</span>
                    </a>
                {/each}
            </nav>

            <div class="p-4 border-t border-white/10">
                <a
                    href="/"
                    class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                >
                    <span class="text-xl">←</span>
                    <span class="font-medium">Volver al Sitio</span>
                </a>
            </div>
        </aside>

        <!-- Main content -->
        <main class="flex-1 overflow-auto">
            <slot />
        </main>
    </div>
{/if}
