<script lang="ts">
    import { audioStore } from '$lib/audio/store';
    import { db } from '$lib/firebase';
    import { deleteDoc, doc } from 'firebase/firestore';
    import { toast } from 'svelte-french-toast';
    import { createEventDispatcher } from 'svelte';
    import type { Album } from '$lib/data/albums';
    import { logger } from '$lib/utils/logger';
    import { page } from '$app/stores';

    const dispatch = createEventDispatcher();

    // --- STATE ---
    let searchTerm = '';
    let playingTrack: string | null = null;
    let audio: HTMLAudioElement | null = null;
    let viewMode: 'grid' | 'list' = 'grid';
    let paginationLimit = 50;

    // --- DERIVED ---
    $: filteredAlbums = $audioStore.availableAlbums
        .filter((album) => {
            const term = searchTerm.toLowerCase();
            return (
                album.title.toLowerCase().includes(term) ||
                album.artist.toLowerCase().includes(term)
            );
        })
        .slice(0, paginationLimit);

    // --- ACTIONS ---
    function loadMore() {
        paginationLimit += 50;
    }

    // Reset pagination on search
    $: if (searchTerm) paginationLimit = 50;

    function togglePlay(url: string) {
        if (playingTrack === url) {
            audio?.pause();
            playingTrack = null;
        } else {
            if (audio) audio.pause();
            audio = new Audio(url);
            audio.play().catch((err) => toast.error('Error al reproducir: ' + err.message));
            playingTrack = url;
            audio.onended = () => (playingTrack = null);
        }
    }

    async function deleteAlbum(album: Album) {
        if (!confirm(`⚠️ ¿ELIMINAR ÁLBUM "${album.title}"?\n\nEsta acción es irreversible.`))
            return;

        const toastId = toast.loading('Eliminando álbum...');
        try {
            await deleteDoc(doc(db, 'albums', album.id));

            // Manual store update for instant feel
            audioStore.update((state) => ({
                ...state,
                availableAlbums: state.availableAlbums.filter((a) => a.id !== album.id),
            }));

            toast.success('Álbum eliminado', { id: toastId });

            // Audit Log
            const adminId = $page.data.user?.uid || 'unknown-admin';
            logger.audit(
                'album_deleted',
                adminId,
                {
                    albumId: album.id,
                    title: album.title,
                    artist: album.artist,
                },
                album.id
            );
        } catch (e: any) {
            console.error(e);
            if (e.code === 'permission-denied') {
                toast.error('❌ Sin permisos o álbum de sistema', { id: toastId });
            } else {
                toast.error('❌ Error al eliminar: ' + e.message, { id: toastId });
            }
        }
    }

    function handleEdit(album: Album) {
        dispatch('edit', album);
    }
</script>

<div class="animate-fade-in">
    <!-- FILTER & ACTIONS BAR -->
    <div
        class="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-black/20 p-4 rounded-2xl border border-white/5"
    >
        <div class="flex-1 w-full md:w-auto flex items-center gap-4">
            <div class="relative flex-1 max-w-md group">
                <span
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors"
                    >🔍</span
                >
                <input
                    type="text"
                    bind:value={searchTerm}
                    placeholder="Buscar por álbum, artista o track..."
                    class="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-slate-600"
                />
            </div>
            <!-- View Toggle -->
            <div class="flex bg-black/40 p-1 rounded-lg border border-white/5 shrink-0">
                <button
                    class="p-2 rounded-md transition-all {viewMode === 'grid'
                        ? 'bg-white/10 text-white shadow'
                        : 'text-slate-500 hover:text-white'}"
                    on:click={() => (viewMode = 'grid')}
                    title="Vista Cuadrícula"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        /></svg
                    >
                </button>
                <button
                    class="p-2 rounded-md transition-all {viewMode === 'list'
                        ? 'bg-white/10 text-white shadow'
                        : 'text-slate-500 hover:text-white'}"
                    on:click={() => (viewMode = 'list')}
                    title="Vista Lista"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        /></svg
                    >
                </button>
            </div>
        </div>

        <button
            on:click={() => dispatch('create')}
            class="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 rounded-xl font-bold text-white shadow-lg shadow-primary-900/20 flex items-center gap-2 transform active:scale-95 transition-all text-sm whitespace-nowrap"
        >
            ＋ Nuevo Álbum
        </button>
    </div>

    <!-- CONTENT -->
    {#if filteredAlbums.length === 0}
        <div class="text-center py-20 text-slate-500">
            <p class="text-4xl mb-4">💿</p>
            <p>No se encontraron álbumes</p>
        </div>
    {:else if viewMode === 'grid'}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {#each filteredAlbums as album}
                <div
                    class="group bg-[#131b2e]/60 border border-white/5 rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10"
                >
                    <div class="relative aspect-square overflow-hidden">
                        <img
                            src={album.cover}
                            alt={album.title}
                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div
                            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4"
                        >
                            <div class="flex gap-2">
                                <button
                                    on:click={() => handleEdit(album)}
                                    class="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                    <span>✏️</span> Editar
                                </button>
                                <button
                                    on:click={() => deleteAlbum(album)}
                                    class="w-8 h-8 bg-red-500/20 hover:bg-red-500 text-white rounded-lg flex items-center justify-center transition-colors"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        {#if album.isPremium}
                            <div
                                class="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full"
                            >
                                PREMIUM
                            </div>
                        {/if}
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-white truncate text-sm" title={album.title}>
                            {album.title}
                        </h3>
                        <p class="text-xs text-slate-400 truncate">{album.artist}</p>
                        <div class="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                            <span class="bg-white/5 px-1.5 py-0.5 rounded"
                                >{album.tracks?.length || 0} tracks</span
                            >
                            <span class="bg-white/5 px-1.5 py-0.5 rounded capitalize"
                                >{album.albumCategory || 'musica'}</span
                            >
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <!-- LIST VIEW -->
        <div class="bg-[#131b2e]/60 border border-white/5 rounded-2xl overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr
                        class="border-b border-white/5 bg-black/20 text-xs text-slate-400 uppercase"
                    >
                        <th class="p-4 font-bold">Álbum</th>
                        <th class="p-4 font-bold">Artista</th>
                        <th class="p-4 font-bold">Categoría</th>
                        <th class="p-4 font-bold">Tracks</th>
                        <th class="p-4 font-bold text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    {#each filteredAlbums as album}
                        <tr class="hover:bg-white/5 transition-colors group">
                            <td class="p-4">
                                <div class="flex items-center gap-3">
                                    <img
                                        src={album.cover}
                                        alt=""
                                        class="w-10 h-10 rounded object-cover"
                                    />
                                    <div>
                                        <div class="font-bold text-sm text-white">
                                            {album.title}
                                        </div>
                                        {#if album.isPremium}
                                            <span
                                                class="text-[9px] bg-yellow-400/20 text-yellow-400 px-1 rounded"
                                                >PREMIUM</span
                                            >
                                        {/if}
                                    </div>
                                </div>
                            </td>
                            <td class="p-4 text-sm text-slate-300">{album.artist}</td>
                            <td class="p-4 text-sm capitalize text-slate-400"
                                >{album.albumCategory || 'musica'}</td
                            >
                            <td class="p-4 text-sm text-slate-400"
                                >{album.tracks?.length || 0} canciones</td
                            >
                            <td class="p-4">
                                <div
                                    class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <button
                                        on:click={() => handleEdit(album)}
                                        class="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        on:click={() => deleteAlbum(album)}
                                        class="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400"
                                        title="Eliminar"
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
    {/if}

    {#if filteredAlbums.length >= paginationLimit}
        <div class="flex justify-center mt-8">
            <button
                on:click={loadMore}
                class="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors text-sm font-bold"
            >
                Cargar más álbumes
            </button>
        </div>
    {/if}
</div>
