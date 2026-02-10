<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { get } from 'svelte/store';
    import { togglePlayback, nextTrack, prevTrack, seek, audioStore } from '$lib/audio/store';
    import { devLogger } from '$lib/utils/devLogger';

    function handleKeyPress(event: KeyboardEvent) {
        // Ignore if user is typing in an input/textarea
        const target = event.target as HTMLElement;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            return;
        }

        const key = event.key.toLowerCase();
        const ctrl = event.ctrlKey || event.metaKey;

        // Space: Play/Pause
        if (key === ' ' && !ctrl) {
            event.preventDefault();
            togglePlayback();
            devLogger.debug('Keyboard shortcut: Space (Play/Pause)');
        }

        // Arrow Right: Skip forward 10s
        else if (key === 'arrowright' && !ctrl) {
            event.preventDefault();
            const state = get(audioStore);
            seek(state.currentTime + 10);
            devLogger.debug('Keyboard shortcut: Arrow Right (+10s)');
        }

        // Arrow Left: Skip backward 10s
        else if (key === 'arrowleft' && !ctrl) {
            event.preventDefault();
            const state = get(audioStore);
            seek(Math.max(0, state.currentTime - 10));
            devLogger.debug('Keyboard shortcut: Arrow Left (-10s)');
        }

        // Ctrl/Cmd + Arrow Right: Next track
        else if (key === 'arrowright' && ctrl) {
            event.preventDefault();
            nextTrack();
            devLogger.debug('Keyboard shortcut: Ctrl+Right (Next)');
        }

        // Ctrl/Cmd + Arrow Left: Previous track
        else if (key === 'arrowleft' && ctrl) {
            event.preventDefault();
            prevTrack();
            devLogger.debug('Keyboard shortcut: Ctrl+Left (Previous)');
        }
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeyPress);
        devLogger.debug('Keyboard shortcuts initialized');
    });

    onDestroy(() => {
        window.removeEventListener('keydown', handleKeyPress);
    });
</script>

<!-- This component has no UI, it only handles keyboard events -->
