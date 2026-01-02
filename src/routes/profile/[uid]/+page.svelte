<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { db } from '$lib/firebase';
    import { doc, getDoc } from 'firebase/firestore';
    import BackIcon from '$lib/components/icons/BackIcon.svelte';
    import { fade } from 'svelte/transition';

    let uid = $page.params.uid;
    let profile: any = null;
    let loading = true;
    let activityMap: Record<string, number> = {};

    // Heatmap Config
    const days = 365;
    let calendar: { date: string; count: number; intensity: number }[] = [];

    async function loadProfile() {
        if (!uid) return;
        try {
            const snap = await getDoc(doc(db, 'users', uid));
            if (snap.exists()) {
                profile = snap.data();
                activityMap = profile.activityMap || {};
                generateCalendar();
            }
        } catch (e) {
            console.error('Error loading profile', e);
        } finally {
            loading = false;
        }
    }

    function generateCalendar() {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);

        const tempCal = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const key = d.toISOString().split('T')[0];
            const count = activityMap[key] || 0;

            // Intensity 0-4
            let intensity = 0;
            if (count > 0) intensity = 1;
            if (count > 2) intensity = 2;
            if (count > 5) intensity = 3;
            if (count > 8) intensity = 4;

            tempCal.push({ date: key, count, intensity });
        }
        calendar = tempCal;
    }

    onMount(() => {
        loadProfile();
    });
</script>

<div class="min-h-screen bg-[#0B1120] text-slate-200 font-poppins p-4 md:p-8">
    <header class="max-w-4xl mx-auto mb-8">
        <a
            href="/"
            class="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors text-xs font-medium uppercase tracking-wider"
        >
            <BackIcon size="sm" />
            <span>Inicio</span>
        </a>
    </header>

    {#if loading}
        <div class="flex justify-center py-20">
            <div
                class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"
            ></div>
        </div>
    {:else if !profile}
        <div class="text-center py-20 text-slate-500">
            <h1 class="text-2xl font-bold mb-2">Perfil no encontrado</h1>
            <p>El usuario no existe o es privado.</p>
        </div>
    {:else}
        <main class="max-w-4xl mx-auto space-y-8" in:fade>
            <!-- Profile Card -->
            <div
                class="bg-[#1e293b] border border-white/5 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden"
            >
                <!-- Glowing Background -->
                <div
                    class="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
                ></div>

                <!-- Avatar -->
                <div
                    class="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-green-500/20 flex-shrink-0 border-4 border-[#1e293b]"
                >
                    {profile.displayName ? profile.displayName[0].toUpperCase() : '?'}
                </div>

                <div class="flex-1 text-center md:text-left z-10">
                    <div class="flex flex-col md:flex-row items-center gap-3 mb-2">
                        <h1 class="text-3xl font-bold text-white">
                            @{profile.displayName || 'Usuario'}
                        </h1>
                        <span
                            class="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/10"
                        >
                            Nivel {Math.ceil(calendar.filter((d) => d.count > 0).length / 10) || 1} •
                            Activo
                        </span>
                    </div>
                    <p class="text-slate-400 max-w-lg mx-auto md:mx-0">
                        {profile.bio || 'Este usuario prefiere mantener el misterio...'}
                    </p>

                    <div class="mt-6 flex justify-center md:justify-start gap-4">
                        <div class="flex items-center gap-2 text-sm text-slate-300">
                            <svg
                                class="w-4 h-4 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                                /></svg
                            >
                            <span>Racha: {calendar.reduce((acc, d) => acc + d.count, 0)} pts</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Heatmap Section -->
            <div class="bg-[#1e293b] border border-white/5 rounded-3xl p-6 md:p-8">
                <h2
                    class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4"
                >
                    Actividad (Último Año)
                </h2>

                <div class="overflow-x-auto pb-4">
                    <div class="inline-grid grid-rows-7 grid-flow-col gap-1 min-w-max">
                        {#each calendar as day}
                            <div
                                class="w-3 h-3 md:w-4 md:h-4 rounded-sm transition-all hover:scale-125 hover:ring-1 ring-white/50"
                                style="background-color: {day.intensity === 0
                                    ? '#334155'
                                    : day.intensity === 1
                                      ? '#0e4429'
                                      : day.intensity === 2
                                        ? '#006d32'
                                        : day.intensity === 3
                                          ? '#26a641'
                                          : '#39d353'}; opacity: {day.intensity === 0 ? 0.3 : 1}"
                                title="{day.date}: {day.count} actividades"
                            ></div>
                        {/each}
                    </div>
                </div>

                <div class="flex items-center justify-end gap-2 text-xs text-slate-500 mt-4">
                    <span>Menos</span>
                    <div class="flex gap-1">
                        <div class="w-3 h-3 rounded-sm bg-[#334155] opacity-30"></div>
                        <div class="w-3 h-3 rounded-sm bg-[#0e4429]"></div>
                        <div class="w-3 h-3 rounded-sm bg-[#006d32]"></div>
                        <div class="w-3 h-3 rounded-sm bg-[#26a641]"></div>
                        <div class="w-3 h-3 rounded-sm bg-[#39d353]"></div>
                    </div>
                    <span>Más</span>
                </div>
            </div>
        </main>
    {/if}
</div>
