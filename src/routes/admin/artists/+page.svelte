<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { userStore } from "$lib/auth/userStore";
    import ArtistsTab from "$lib/components/admin/ArtistsTab.svelte";

    let loading = true;

    onMount(async () => {
        // Check if user is admin (you can adjust this logic)
        if (!$userStore) {
            goto("/");
            return;
        }
        loading = false;
    });
</script>

<svelte:head>
    <title>Admin - Artistas | ChillChess</title>
</svelte:head>

{#if loading}
    <div class="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"
        ></div>
    </div>
{:else}
    <div class="min-h-screen bg-midnight-900 text-white">
        <!-- Header -->
        <header
            class="border-b border-white/10 bg-midnight-800/50 backdrop-blur-sm sticky top-0 z-10"
        >
            <div
                class="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between"
            >
                <div class="flex items-center gap-4">
                    <a
                        href="/admin"
                        class="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        ← Admin Panel
                    </a>
                    <h1 class="text-2xl font-bold">Gestión de Artistas</h1>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <ArtistsTab />
        </main>
    </div>
{/if}
