<script lang="ts">
    /**
     * Root Layout - Web Vitals Initialization
     *
     * Initialize performance monitoring on app load
     */
    import { onMount } from 'svelte';
    import { initWebVitals } from '$lib/utils/webVitals';
    import { browser } from '$app/environment';

    onMount(() => {
        if (browser) {
            initWebVitals();
        }
    });
</script>

<!-- Add this to your existing +layout.svelte -->
