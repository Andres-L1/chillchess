<script lang="ts">
    import { audioStore, seek } from "$lib/audio/store";

    function formatTime(seconds: number) {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    function handleSeek(e: Event) {
        const input = e.target as HTMLInputElement;
        seek(parseFloat(input.value));
    }
</script>

<div class="w-full flex items-center gap-2 text-xs text-slate-400 font-mono">
    <span class="w-10 text-right">{formatTime($audioStore.currentTime)}</span>

    <div
        class="relative flex-1 h-1 bg-white/10 rounded-full group cursor-pointer group"
    >
        <input
            type="range"
            min="0"
            max={$audioStore.duration || 100}
            value={$audioStore.currentTime}
            on:input={handleSeek}
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
            class="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-green-500 transition-colors pointer-events-none"
            style="width: {($audioStore.currentTime /
                ($audioStore.duration || 1)) *
                100}%"
        ></div>
    </div>

    <span class="w-10">{formatTime($audioStore.duration)}</span>
</div>
