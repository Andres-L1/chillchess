<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Toaster, toast } from 'svelte-french-toast';
    import { db } from '$lib/firebase';
    import { collection, query, where, onSnapshot } from 'firebase/firestore';

    // Sub-components
    import MusicLibrary from './music/MusicLibrary.svelte';
    import CreatorCatalog from './music/CreatorCatalog.svelte';
    import GhostAlbumCleanup from './music/GhostAlbumCleanup.svelte';
    import AlbumCreateModal from './music/modals/AlbumCreateModal.svelte';
    import AlbumEditModal from './music/modals/AlbumEditModal.svelte';

    // --- STATE ---
    let activeSection: 'library' | 'creators' | 'cleanup' = 'library';
    let showCreateAlbumForm = false;
    let editingAlbum: any = null;
    let verifiedArtists: any[] = [];
    let unsubscribeArtists: () => void;

    onMount(() => {
        subscribeToVerifiedArtists();
    });

    onDestroy(() => {
        if (unsubscribeArtists) unsubscribeArtists();
    });

    function subscribeToVerifiedArtists() {
        try {
            const q = query(collection(db, 'users'), where('isVerified', '==', true));
            unsubscribeArtists = onSnapshot(q, (snap) => {
                verifiedArtists = snap.docs.map((d) => {
                    const data = d.data();
                    return {
                        uid: d.id,
                        displayName: data.displayName || data.username || 'Sin Nombre',
                        photoURL: data.photoURL,
                        isFounder:
                            data.subscriptionTier === 'pro' || data.subscriptionTier === 'premium',
                    };
                });
            });
        } catch (e) {
            console.warn('Error subscribing to verified artists:', e);
        }
    }
</script>

<div class="animate-fade-in relative">
    <Toaster position="bottom-right" />

    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-2xl font-bold text-white mb-2">Gestión Musical</h2>
            <p class="text-slate-400">
                Gestiona la biblioteca de la app y el catálogo para creadores.
            </p>
        </div>

        <!-- Section Toggle -->
        <div class="flex bg-black/30 p-1 rounded-xl">
            <button
                class="px-4 py-2 rounded-lg text-sm font-bold transition-colors {activeSection ===
                'library'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'}"
                on:click={() => (activeSection = 'library')}
            >
                Biblioteca App
            </button>
            <button
                class="px-4 py-2 rounded-lg text-sm font-bold transition-colors {activeSection ===
                'creators'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'}"
                on:click={() => (activeSection = 'creators')}
            >
                Catálogo Streamers
            </button>
            <button
                class="px-4 py-2 rounded-lg text-sm font-bold transition-colors {activeSection ===
                'cleanup'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'}"
                on:click={() => (activeSection = 'cleanup')}
            >
                🧹 Limpieza
            </button>
        </div>
    </div>

    {#if activeSection === 'library'}
        <MusicLibrary
            on:create={() => (showCreateAlbumForm = true)}
            on:edit={(e) => (editingAlbum = e.detail)}
        />
    {:else if activeSection === 'cleanup'}
        <GhostAlbumCleanup />
    {:else}
        <CreatorCatalog />
    {/if}

    <!-- MODALS -->
    {#if showCreateAlbumForm}
        <AlbumCreateModal {verifiedArtists} on:close={() => (showCreateAlbumForm = false)} />
    {/if}

    {#if editingAlbum}
        <AlbumEditModal
            album={editingAlbum}
            {verifiedArtists}
            on:close={() => (editingAlbum = null)}
        />
    {/if}
</div>
