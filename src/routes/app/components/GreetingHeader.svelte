<script lang="ts">
    import { userStore } from '$lib/auth/userStore';

    import { onMount, onDestroy } from 'svelte';

    let timeOfDay = new Date().getHours();
    let timer: NodeJS.Timeout;

    onMount(() => {
        // Update every minute (60000ms) to ensure greeting changes
        timer = setInterval(() => {
            timeOfDay = new Date().getHours();
        }, 60000);

        // Initial set
        timeOfDay = new Date().getHours();
    });

    onDestroy(() => {
        if (timer) clearInterval(timer);
    });

    $: greeting =
        timeOfDay >= 5 && timeOfDay < 12
            ? 'Buenos días'
            : timeOfDay >= 12 && timeOfDay < 20
              ? 'Buenas tardes'
              : 'Buenas noches';
</script>

<div class="mb-8 relative z-10">
    <div class="flex items-center gap-3 mb-2">
        <h1 class="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {greeting},
            <span
                class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200"
            >
                {$userStore.user?.displayName?.split(' ')[0] || 'Viajero'}
            </span>
        </h1>
        <div
            class="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider backdrop-blur-md"
        >
            HQ
        </div>
    </div>
    <p class="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed">
        Tu centro de comando personal. Organiza tu día y mantén la racha.
    </p>
</div>
