<script lang="ts">
    import { goto } from "$app/navigation";
    import type { ArtistProfile } from "$lib/types/artist";
    import VerifiedBadge from "$lib/components/VerifiedBadge.svelte";
    import MusicIcon from "$lib/components/icons/MusicIcon.svelte";
    import { ALBUMS } from "$lib/data/albums";
    import { playAlbum, audioStore } from "$lib/audio/store";
    import { SOCIAL_PLATFORMS } from "$lib/types/artist";

    export let data: { artistProfile: ArtistProfile };

    $: artist = data.artistProfile;
    $: artistAlbums = ALBUMS.filter(
        (album) => album.artist === artist.artistName,
    );
    $: totalTracks = artistAlbums.reduce(
        (sum, album) => sum + (album.tracks?.length || 0),
        0,
    );
    $: popularTracks = artistAlbums
        .flatMap((album) => album.tracks || [])
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

    function handlePlayAlbum(albumId: string) {
        playAlbum(albumId);
    }

    function getSocialIcon(platform: string) {
        return SOCIAL_PLATFORMS.find((p) => p.id === platform)?.icon || "🔗";
    }
</script>

<svelte:head>
    <title>{artist.artistName} | Artistas ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-midnight-900 text-white font-poppins">
    <!-- Header with Banner -->
    <div class="relative h-64 md:h-80 overflow-hidden">
        {#if artist.bannerUrl}
            <img
                src={artist.bannerUrl}
                alt="{artist.artistName} banner"
                class="w-full h-full object-cover"
            />
        {:else}
            <div
                class="w-full h-full bg-gradient-to-br from-primary-900/40 via-midnight-800 to-midnight-900"
            ></div>
        {/if}
        <div
            class="absolute inset-0 bg-gradient-to-t from-midnight-900 via-midnight-900/50 to-transparent"
        ></div>

        <!-- Back Button -->
        <div class="absolute top-6 left-6">
            <a
                href="/artists"
                class="inline-flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/10 rounded-xl transition-all text-white"
            >
                <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                Volver a Artistas
            </a>
        </div>
    </div>

    <!-- Profile Section -->
    <div class="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
        <div class="flex flex-col md:flex-row gap-8 mb-12">
            <!-- Avatar -->
            <div class="mx-auto md:mx-0">
                <div
                    class="w-40 h-40 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-6xl shadow-2xl ring-4 ring-midnight-900"
                >
                    {#if artist.avatarUrl}
                        <img
                            src={artist.avatarUrl}
                            alt={artist.artistName}
                            class="w-full h-full rounded-full object-cover"
                        />
                    {:else}
                        <MusicIcon size="xl" gradient={true} />
                    {/if}
                </div>
            </div>

            <!-- Info -->
            <div class="flex-1 text-center md:text-left">
                <div
                    class="flex flex-col md:flex-row items-center md:items-start gap-3 mb-4"
                >
                    <h1 class="text-4xl md:text-5xl font-bold">
                        {artist.artistName}
                    </h1>
                    <VerifiedBadge size="md" />
                </div>

                <p class="text-lg text-slate-300 mb-6 max-w-2xl">
                    {artist.bio}
                </p>

                <!-- Stats -->
                <div
                    class="flex flex-wrap justify-center md:justify-start gap-6 mb-6"
                >
                    <div class="text-center md:text-left">
                        <div class="text-2xl font-bold text-primary-500">
                            {artistAlbums.length}
                        </div>
                        <div class="text-sm text-slate-500">Álbumes</div>
                    </div>
                    <div class="text-center md:text-left">
                        <div class="text-2xl font-bold text-primary-500">
                            {totalTracks}
                        </div>
                        <div class="text-sm text-slate-500">Canciones</div>
                    </div>
                    {#if artist.followerCount}
                        <div class="text-center md:text-left">
                            <div class="text-2xl font-bold text-primary-500">
                                {artist.followerCount}
                            </div>
                            <div class="text-sm text-slate-500">Seguidores</div>
                        </div>
                    {/if}
                </div>

                <!-- Social Links -->
                {#if artist.socialLinks && artist.socialLinks.length > 0}
                    <div
                        class="flex flex-wrap justify-center md:justify-start gap-3"
                    >
                        {#each artist.socialLinks as social}
                            <a
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all flex items-center gap-2"
                            >
                                <span>{getSocialIcon(social.platform)}</span>
                                <span class="text-sm capitalize"
                                    >{social.platform}</span
                                >
                            </a>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Albums Section -->
        <div class="pb-32">
            <h2 class="text-3xl font-bold mb-8">Discografía</h2>

            {#if artistAlbums.length === 0}
                <div
                    class="text-center py-12 bg-white/5 rounded-2xl border border-white/10"
                >
                    <span class="text-4xl block mb-3">🎵</span>
                    <p class="text-slate-400">
                        Este artista aún no tiene álbumes publicados.
                    </p>
                </div>
            {:else}
                <div
                    class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                >
                    {#each artistAlbums as album}
                        <button
                            on:click={() => goto(`/album/${album.id}`)}
                            class="group text-left"
                        >
                            <div
                                class="aspect-square rounded-2xl bg-slate-800 mb-4 overflow-hidden relative shadow-lg group-hover:shadow-primary-500/30 transition-all group-hover:-translate-y-2"
                            >
                                <img
                                    src={album.cover}
                                    alt={album.title}
                                    class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />

                                <!-- Play Overlay -->
                                <div
                                    class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    <button
                                        on:click|stopPropagation={() =>
                                            handlePlayAlbum(album.id)}
                                        class="w-14 h-14 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                                    >
                                        {#if $audioStore.currentAlbumId === album.id && $audioStore.isPlaying}
                                            <svg
                                                class="w-6 h-6"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"
                                                />
                                            </svg>
                                        {:else}
                                            <svg
                                                class="w-6 h-6 ml-1"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        {/if}
                                    </button>
                                </div>
                            </div>

                            <h3
                                class="font-bold text-white/90 group-hover:text-primary-400 transition-colors truncate mb-1"
                            >
                                {album.title}
                            </h3>
                            <p class="text-sm text-slate-400 truncate">
                                {album.tracks.length} canciones
                            </p>

                            {#if album.tag}
                                <span
                                    class="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-300 font-bold"
                                >
                                    {album.tag}
                                </span>
                            {/if}
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>
