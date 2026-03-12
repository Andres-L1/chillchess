<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { db } from '$lib/firebase';
    import { doc, onSnapshot } from 'firebase/firestore';
    import OverlayPreview from '$lib/components/streamers/OverlayPreview.svelte';

    let settings: any = null;
    let loading = true;

    onMount(() => {
        const uid = $page.params.uid;
        if (!uid) return;

        const widgetRef = doc(db, 'users', uid, 'streamerSettings', 'stream_intro');
        
        const unsubscribe = onSnapshot(widgetRef, (docSnap) => {
            if (docSnap.exists()) {
                settings = docSnap.data();
            }
            loading = false;
        });

        return () => {
            unsubscribe();
        };
    });
</script>

<svelte:head>
    <title>Stream Intro Overlay</title>
</svelte:head>

<div class="fixed inset-0 w-screen h-screen overflow-hidden bg-transparent">
    {#if loading}
        <div class="w-full h-full flex items-center justify-center bg-black">
            <div class="text-white font-mono text-sm animate-pulse">CARGANDO OVERLAY...</div>
        </div>
    {:else if settings}
        <!-- Give the overlay absolute full dimensions -->
        <div class="w-full h-full">
            <OverlayPreview {settings} />
        </div>
    {:else}
        <div class="w-full h-full flex items-center justify-center bg-black">
            <div class="text-white font-mono text-sm">NO HAY CONFIGURACIÓN AÚN.</div>
        </div>
    {/if}
</div>
