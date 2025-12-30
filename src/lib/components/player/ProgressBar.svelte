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
        class="relative flex-1 h-3 bg-white/5 rounded-full group cursor-pointer flex items-center"
    >
        <input
            type="range"
            min="0"
            max={$audioStore.duration || 100}
            value={$audioStore.currentTime}
            on:input={handleSeek}
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <!-- Background Track -->
        <div
            class="absolute w-full h-1 bg-white/10 rounded-full pointer-events-none"
        ></div>

        <!-- Active Progress -->
        <div
            class="absolute h-1 bg-primary-500 rounded-full pointer-events-none group-hover:bg-primary-400 transition-colors shadow-[0_0_8px_rgba(249,115,22,0.5)]"
            style="width: {($audioStore.currentTime /
                ($audioStore.duration || 1)) *
                100}%"
        >
            <!-- Handle (Visible on hover) -->
            <div
                class="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform scale-0 group-hover:scale-110"
            ></div>
        </div>
    </div>

    <span class="w-10">{formatTime($audioStore.duration)}</span>
</div>
