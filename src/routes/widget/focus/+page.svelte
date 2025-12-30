<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { db } from "$lib/firebase";
    import { doc, onSnapshot } from "firebase/firestore";
    import "@fontsource/poppins/600.css";
    import "@fontsource/inter/400.css";

    $: uid = $page.url.searchParams.get("uid");

    let timerState = {
        timeLeft: 1500,
        mode: "focus", // 'focus' | 'short' | 'long'
        duration: 1500,
        isRunning: false,
        updatedAt: 0,
        targetEndTime: null as number | null,
    };

    onMount(() => {
        if (!uid) return;

        let localInterval: any;

        const unsub = onSnapshot(doc(db, "nowPlaying", uid), (snap) => {
            if (snap.exists()) {
                const data = snap.data().timer;
                if (data) {
                    // Initial sync
                    if (data.isRunning && data.targetEndTime) {
                        const now = Date.now();
                        const remaining = Math.max(
                            0,
                            Math.ceil((data.targetEndTime - now) / 1000),
                        );
                        timerState = { ...data, timeLeft: remaining };
                    } else {
                        timerState = data;
                    }
                }
            }
        });

        // Local Tick for smooth countdown
        localInterval = setInterval(() => {
            if (timerState.isRunning && timerState.targetEndTime) {
                const now = Date.now();
                const remaining = Math.max(
                    0,
                    Math.ceil((timerState.targetEndTime - now) / 1000),
                );
                timerState.timeLeft = remaining;
            }
        }, 100); // 100ms for responsiveness

        return () => {
            unsub();
            clearInterval(localInterval);
        };
    });

    $: minutes = Math.floor(timerState.timeLeft / 60);
    $: seconds = timerState.timeLeft % 60;
    $: formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    $: isFocus = timerState.mode === "focus";
    $: themeColor = isFocus ? "#ff7b3d" : "#22c55e"; // Orange vs Green
    $: label = isFocus ? "FOCUS TIME" : "BREAK TIME";
</script>

<svelte:head>
    <title>Focus Timer Widget</title>
    <meta name="robots" content="noindex" />
</svelte:head>

<div class="fixed inset-0 flex items-center justify-center p-4">
    <div
        class="relative flex items-center justify-between px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300"
        style="
            background: rgba(0, 0, 0, 0.4);
            min-width: 220px;
        "
    >
        <!-- Indicator Dot (Pulse) -->
        <div class="flex items-center gap-4">
            <div class="relative">
                <div
                    class="w-3 h-3 rounded-full {timerState.isRunning
                        ? 'animate-ping'
                        : ''} absolute inset-0 opacity-75"
                    style="background: {themeColor}"
                ></div>
                <div
                    class="w-3 h-3 rounded-full relative z-10"
                    style="background: {themeColor}"
                ></div>
            </div>

            <div class="flex flex-col">
                <span
                    class="text-[10px] font-bold tracking-widest text-white/50 uppercase font-[Inter]"
                >
                    {label}
                </span>
                <span
                    class="text-3xl font-bold font-[Poppins] tracking-tight tabular-nums leading-none mt-1"
                    style="color: {themeColor}; text-shadow: 0 0 20px {themeColor}40;"
                >
                    {formattedTime}
                </span>
            </div>
        </div>

        <!-- Progress Ring (Mini) -->
        <!-- Optional: A simple circular progress svg could go here -->
    </div>
</div>

<!-- Global Transparency Override -->
<style>
    :global(html),
    :global(body) {
        background: transparent !important;
    }
</style>
