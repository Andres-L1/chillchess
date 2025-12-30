<script lang="ts">
    import { onMount } from "svelte";
    import { db } from "$lib/firebase";
    import { collection, query, getDocs, orderBy } from "firebase/firestore";
    import { fade, fly } from "svelte/transition";

    let tracks: any[] = [];
    let loading = true;
    let searchTerm = "";
    let playingTrack: string | null = null;
    let audio: HTMLAudioElement | null = null;

    $: filteredTracks = tracks.filter((track) => {
        const term = searchTerm.toLowerCase();
        return (
            track.title.toLowerCase().includes(term) ||
            track.artist.toLowerCase().includes(term)
        );
    });

    onMount(async () => {
        await loadCatalog();
    });

    async function loadCatalog() {
        try {
            const q = query(
                collection(db, "creatorCatalog"),
                orderBy("createdAt", "desc"),
            );
            const snap = await getDocs(q);
            tracks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch (e) {
            console.error("Error loading catalogue:", e);
        } finally {
            loading = false;
        }
    }

    function togglePlay(url: string) {
        if (playingTrack === url) {
            audio?.pause();
            playingTrack = null;
        } else {
            if (audio) audio.pause();
            audio = new Audio(url);
            audio.play();
            playingTrack = url;
            audio.onended = () => (playingTrack = null);
        }
    }

    function copyCredits(track: any) {
        const creditText = `Music provided by ChillChess\nTrack: ${track.title}\nArtist: ${track.artist}\nListen: https://chillchess.com/creators`;
        navigator.clipboard.writeText(creditText);
        alert("📋 Créditos copiados al portapapeles");
    }

    function downloadTrack(url: string) {
        window.open(url, "_blank");
    }
</script>

<svelte:head>
    <title>Creators Catalog | ChillChess</title>
</svelte:head>

<div
    class="min-h-screen bg-[#0B1120] text-white pt-24 pb-12 px-4 md:px-8 font-poppins relative"
>
    <!-- Ambient Background -->
    <div
        class="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none"
    ></div>

    <div class="max-w-6xl mx-auto relative z-10">
        <!-- Header -->
        <div
            class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
            in:fly={{ y: 20, duration: 800 }}
        >
            <div>
                <span
                    class="text-purple-400 font-mono tracking-widest text-sm uppercase mb-2 block"
                    >Royalty Free Music</span
                >
                <h1
                    class="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
                >
                    Creators Catalog
                </h1>
                <p class="text-slate-400 max-w-xl text-lg">
                    Música segura para tus streams y vídeos. Sin copyright, sin
                    problemas. Solo copia los créditos y disfruta.
                </p>
            </div>

            <div class="w-full md:w-auto">
                <div class="relative group">
                    <span
                        class="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-purple-400 transition-colors"
                        >🔍</span
                    >
                    <input
                        type="text"
                        bind:value={searchTerm}
                        placeholder="Buscar canción..."
                        class="w-full md:w-80 bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-3 text-white focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all font-medium"
                    />
                </div>
            </div>
        </div>

        <!-- Track List -->
        {#if loading}
            <div class="flex justify-center py-20">
                <div
                    class="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500"
                ></div>
            </div>
        {:else if tracks.length === 0}
            <div
                class="text-center py-20 bg-white/5 rounded-3xl border border-white/10"
            >
                <p class="text-2xl mb-2">📭</p>
                <p class="text-slate-400">
                    El catálogo se está actualizando. Vuelve pronto.
                </p>
            </div>
        {:else}
            <div
                class="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl"
            >
                <!-- Table Header -->
                <div
                    class="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_2fr_1fr_1fr_auto] gap-4 p-4 border-b border-white/10 text-xs font-bold text-slate-500 uppercase tracking-wider bg-black/20"
                >
                    <div class="w-12 text-center">#</div>
                    <div>Título</div>
                    <div class="hidden md:block">Artista</div>
                    <div class="hidden md:block">Info</div>
                    <div class="text-right pr-4">Acciones</div>
                </div>

                <!-- Rows -->
                <div class="divide-y divide-white/5">
                    {#each filteredTracks as track, i}
                        <div
                            class="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_2fr_1fr_1fr_auto] gap-4 p-4 items-center hover:bg-white/5 transition-colors group"
                            in:fade={{ duration: 300, delay: i * 50 }}
                        >
                            <!-- Play Button -->
                            <div class="w-12 flex justify-center">
                                <button
                                    on:click={() => togglePlay(track.url)}
                                    class="w-10 h-10 rounded-full bg-white/10 hover:bg-purple-500 text-white flex items-center justify-center transition-all hover:scale-110"
                                >
                                    {#if playingTrack === track.url}
                                        ⏸
                                    {:else}
                                        ▶
                                    {/if}
                                </button>
                            </div>

                            <!-- Title & Cover -->
                            <div class="flex items-center gap-4 min-w-0">
                                <div
                                    class="w-12 h-12 rounded-lg bg-black/50 overflow-hidden flex-shrink-0"
                                >
                                    <img
                                        src={track.coverUrl}
                                        alt={track.title}
                                        class="w-full h-full object-cover"
                                    />
                                </div>
                                <div class="min-w-0">
                                    <p
                                        class="font-bold text-white truncate text-lg"
                                    >
                                        {track.title}
                                    </p>
                                    <p
                                        class="md:hidden text-sm text-slate-400 truncate"
                                    >
                                        {track.artist}
                                    </p>
                                </div>
                            </div>

                            <!-- Artist (Desktop) -->
                            <div
                                class="hidden md:block text-slate-300 font-medium truncate"
                            >
                                {track.artist}
                            </div>

                            <!-- Tags/Info -->
                            <div class="hidden md:flex items-center gap-2">
                                <span
                                    class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-bold border border-green-500/20"
                                >
                                    Safe for Stream</span
                                >
                            </div>

                            <!-- Actions -->
                            <div class="flex items-center justify-end gap-2">
                                <button
                                    on:click={() => copyCredits(track)}
                                    class="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Copiar Créditos"
                                >
                                    📋
                                </button>
                                <button
                                    on:click={() => downloadTrack(track.url)}
                                    class="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                                    title="Descargar MP3"
                                >
                                    ⬇️
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>
