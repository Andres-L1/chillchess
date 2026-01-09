<script lang="ts">
    import { onMount } from 'svelte';
    import { type Album } from '$lib/data/albums';
    import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
    import { fade } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';

    export let album: Album;

    const dispatch = createEventDispatcher();

    let resolvedCover = album.cover || '/logo-mobile.png';
    let cardElement: HTMLElement;
    let isVisible = false;

    onMount(() => {
        if (!cardElement) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    isVisible = true;
                    observer.disconnect(); // Only need to load once
                }
            },
            { rootMargin: '100px' }
        ); // Preload slightly before appearing

        observer.observe(cardElement);
        return () => observer.disconnect();
    });

    let attemptedResolution = false;

    // ✅ R2 Resolution Logic - Detect R2 keys in cover field too
    $: if (isVisible && !attemptedResolution) {
        const r2Key =
            (album as any).r2CoverKey ||
            (album.cover?.startsWith('music/') || album.cover?.startsWith('catalog/')
                ? album.cover
                : null);

        if (r2Key) {
            attemptedResolution = true;

            fetch(`/api/r2/get-url?key=${encodeURIComponent(r2Key)}`)
                .then((res) => {
                    if (!res.ok) throw new Error('Fetch status ' + res.status);
                    return res.json();
                })
                .then((data) => {
                    if (data.url) resolvedCover = data.url;
                })
                .catch((err) => {
                    console.warn('Failed to resolve R2 cover:', err);
                    resolvedCover = '/logo-mobile.png';
                });
        } else if (
            album.cover &&
            !album.cover.startsWith('music/') &&
            !album.cover.startsWith('catalog/')
        ) {
            // Direct URL (not an R2 key)
            resolvedCover = album.cover;
        }
    }

    function handleImageError(e: Event) {
        const target = e.target as HTMLImageElement;
        target.src = '/logo-mobile.png';
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
    bind:this={cardElement}
    in:fade={{ duration: 300 }}
    on:click={() => dispatch('click', album)}
    class="group relative bg-[#181825] rounded-2xl overflow-hidden hover:bg-[#232336] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50 cursor-pointer border border-white/5"
>
    <!-- Cover Wrapper -->
    <div class="aspect-square w-full relative overflow-hidden bg-slate-800">
        <img
            src={resolvedCover}
            alt={album.title}
            loading="lazy"
            decoding="async"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            on:error={handleImageError}
        />

        <!-- Badges -->
        <div class="absolute top-2 left-2 flex flex-col gap-1 items-start">
            {#if album.isPremium}
                <span
                    class="px-2 py-0.5 rounded-md bg-orange-500/90 backdrop-blur-sm text-black text-[10px] font-black uppercase shadow-lg"
                >
                    PRO
                </span>
            {/if}
        </div>

        <!-- Play Overlay -->
        <div
            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]"
        >
            <button
                class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-primary-500/40 transform scale-50 group-hover:scale-100 transition-transform duration-300 hover:scale-110 hover:bg-primary-400"
            >
                <svg class="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </button>
        </div>
    </div>

    <!-- Content -->
    <div class="p-4">
        <h3 class="font-bold text-white text-base truncate mb-1" title={album.title}>
            {album.title}
        </h3>
        <div class="flex items-center gap-1.5 text-sm text-slate-400">
            <span class="truncate max-w-[120px]">{album.artist}</span>
            {#if album.artist === 'JULYACTV' || album.isVerified}
                <VerifiedBadge size="sm" showTooltip={false} />
            {/if}
        </div>
        <div class="flex items-center justify-between mt-3 text-xs text-slate-500 font-medium">
            <span>{album.category.charAt(0).toUpperCase() + album.category.slice(1)}</span>
            <span class="bg-white/5 px-2 py-1 rounded text-slate-400">
                {album.tracks?.length || 0} tracks
            </span>
        </div>
    </div>
</div>
