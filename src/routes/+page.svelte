<script lang="ts">
    import { audioStore, setVibe, type VibePreset } from "$lib/audio/store";
    import AuthModal from "$lib/components/AuthModal.svelte";
    import PaywallModal from "$lib/components/PaywallModal.svelte";
    import { userStore, logout } from "$lib/auth/userStore";
    import { userSubscription } from "$lib/subscription/userSubscription";

    import { ALBUMS } from "$lib/data/albums";

    let showAuthModal = false;
    let showPaywall = false;
    let blockedFeature: "vibe" | "games" = "vibe";

    function enterSanctuary(vibeId: string) {
        // If it's a paid vibe, check access
        // Note: For albums without explicit vibeId (like ASAP), we assume free or handled elsewhere for now
        // or we check if user is Pro for any custom album.
        // For now, let's keep it simple: Only check blocked vibes from tiers.

        // Find if this ID corresponds to a VibePreset
        const isVibeBlocked = !$userSubscription.canAccessVibe(vibeId);

        if (isVibeBlocked) {
            blockedFeature = "vibe";
            showPaywall = true;
            return;
        }
        setVibe(vibeId as VibePreset);
    }

    function openAuth() {
        showAuthModal = true;
    }
</script>

<AuthModal show={showAuthModal} on:close={() => (showAuthModal = false)} />
<PaywallModal
    show={showPaywall}
    {blockedFeature}
    on:close={() => (showPaywall = false)}
/>

<!-- Changed Background to Midnight Blue and allowed scrolling -->
<div
    class="min-h-screen bg-[#0B1120] text-slate-200 font-poppins overflow-x-hidden"
>
    <!-- Navbar Responsive -->
    <nav
        class="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-6 max-w-7xl mx-auto gap-4"
    >
        <div class="flex items-center gap-3">
            <img
                src="/favicon.svg"
                alt="ChillChess Logo"
                class="w-10 h-10 hover:rotate-12 transition-transform duration-300 drop-shadow-sm filter brightness-110"
            />
            <span
                class="text-2xl font-bold tracking-tight text-white hover:scale-105 transition-transform cursor-default"
                >ChillChess</span
            >
            <span
                class="text-xs uppercase bg-white/10 px-2 py-1 rounded-md text-slate-400"
                >Beta v2.0</span
            >
        </div>

        <!-- Mobile Links -->
        <div
            class="flex gap-4 md:gap-6 text-sm font-medium text-slate-400 overflow-x-auto max-w-full px-2 items-center"
        >
            <button
                class="hover:text-white transition-colors whitespace-nowrap bg-transparent border-none cursor-pointer"
                >Lanzamientos</button
            >
            <button
                class="hover:text-white transition-colors whitespace-nowrap bg-transparent border-none cursor-pointer"
                >Artistas</button
            >
            <button
                class="hover:text-white transition-colors whitespace-nowrap bg-transparent border-none cursor-pointer"
                >Tienda</button
            >

            {#if $userStore.isLoggedIn}
                <button
                    on:click={logout}
                    class="ml-2 text-red-400 hover:text-red-300 whitespace-nowrap transition-colors bg-transparent border-none cursor-pointer"
                    >Salir</button
                >
            {:else}
                <button
                    on:click={openAuth}
                    class="ml-2 hover:text-white whitespace-nowrap transition-colors bg-transparent border-none cursor-pointer"
                    >Acceso</button
                >
            {/if}
        </div>

        <a
            href="/app"
            class="px-8 py-3 bg-white text-black rounded-full text-sm font-bold tracking-wide hover:bg-slate-200 transition-all hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-white/20 active:scale-95 w-full md:w-auto text-center flex items-center justify-center gap-2"
        >
            <span>✨</span> Entrar
        </a>
    </nav>

    <!-- Hero Section -->
    <header
        class="px-4 md:px-8 py-12 md:py-24 max-w-7xl mx-auto text-center space-y-6 md:space-y-8 animate-fade-in relative"
    >
        <!-- Background Glow Effect -->
        <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"
        ></div>

        <h1
            class="text-4xl md:text-7xl font-bold text-white tracking-tighter leading-[1.1]"
        >
            Tu Espacio <br />
            <span
                class="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7B3D] to-[#FFB347]"
                >De Concentración</span
            >
        </h1>
        <p
            class="text-base md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed"
        >
            Atmósferas inmersivas diseñadas para estudiar, jugar y fluir. <br
                class="hidden md:block"
            />
            Ajedrez, música Lo-Fi y calma.
        </p>
    </header>

    <!-- New Releases Grid -->
    <main class="px-4 md:px-8 pb-32 max-w-7xl mx-auto">
        <div
            class="flex justify-between items-end mb-8 border-b border-white/10 pb-4"
        >
            <h2 class="text-xl md:text-3xl font-bold text-white">Colección</h2>
            <button
                class="text-xs font-semibold text-slate-400 border border-white/20 px-5 py-2.5 rounded-full hover:bg-white hover:text-black hover:border-white transition-all hover:shadow-sm cursor-pointer"
                >VER TODO</button
            >
        </div>

        <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10"
        >
            {#each ALBUMS as release}
                <div class="group relative flex flex-col gap-4">
                    <!-- Album Cover Card -->
                    <div
                        class="relative aspect-square rounded-2xl overflow-hidden shadow-lg shadow-black/20 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 cursor-pointer bg-[#1e293b]"
                    >
                        <img
                            src={release.cover}
                            alt={release.title}
                            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                            loading="lazy"
                        />

                        <!-- Overlay on Hover -->
                        <div
                            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]"
                        >
                            <a
                                href="/app"
                                on:click={() =>
                                    enterSanctuary(
                                        release.vibeId || release.id,
                                    )}
                                class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-110 active:scale-95 transition-transform text-black pl-1"
                            >
                                ▶
                            </a>
                        </div>

                        <!-- Tag -->
                        <div
                            class="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/10"
                        >
                            {release.tag}
                        </div>

                        <!-- Lock Overlay for Blocked Vibes -->
                        {#if release.vibeId && !$userSubscription.canAccessVibe(release.vibeId)}
                            <div
                                class="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 transition-opacity"
                            >
                                <div
                                    class="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4"
                                >
                                    <span class="text-3xl">🔒</span>
                                </div>
                                <button
                                    on:click|preventDefault|stopPropagation={() => {
                                        blockedFeature = "vibe";
                                        showPaywall = true;
                                    }}
                                    class="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-orange-500/30 transition-all text-sm"
                                >
                                    Desbloquear
                                </button>
                            </div>
                        {/if}
                    </div>

                    <!-- Meta Info -->
                    <div class="space-y-1 px-1">
                        <h3
                            class="font-bold text-xl text-white group-hover:text-[#FF7B3D] transition-colors leading-tight"
                        >
                            {release.title}
                        </h3>
                        <p class="text-sm font-medium text-slate-400">
                            {release.artist}
                        </p>
                        <p
                            class="text-xs text-slate-500 mt-2 font-light line-clamp-2 leading-relaxed"
                        >
                            {release.description}
                        </p>
                    </div>
                </div>
            {/each}

            <!-- Coming Soon Placeholder -->
            <div
                class="group relative flex flex-col gap-4 opacity-40 hover:opacity-60 transition-all"
            >
                <div
                    class="relative aspect-square rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center border-2 border-dashed border-white/20 group-hover:border-white/40 transition-colors"
                >
                    <div class="text-center space-y-2">
                        <span class="text-4xl block opacity-50">☕</span>
                        <span
                            class="text-slate-400 font-bold uppercase tracking-widest text-xs block"
                            >Próximamente</span
                        >
                    </div>
                </div>
                <div class="space-y-1 px-1">
                    <h3 class="font-bold text-xl text-white/50">Lo-Fi Café</h3>
                    <p class="text-sm text-slate-600">Originales ChillChess</p>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-[#050914] text-white py-16 mt-12 border-t border-white/5">
        <div
            class="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left"
        >
            <div class="space-y-2">
                <div
                    class="flex items-center gap-2 justify-center md:justify-start opacity-80"
                >
                    <img
                        src="/favicon.svg"
                        alt="Logo"
                        class="w-6 h-6 grayscale opacity-50"
                    />
                    <h4 class="font-bold text-xl">ChillChess</h4>
                </div>
                <p class="text-sm text-slate-500">
                    &copy; 2025 ChillChess. Todos los derechos reservados.
                </p>
            </div>
            <div class="flex gap-8 text-sm font-medium">
                <button
                    class="text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                    >Instagram</button
                >
                <button
                    class="text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                    >Twitter</button
                >
                <button
                    class="text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                    >Discord</button
                >
            </div>
        </div>
    </footer>
</div>
