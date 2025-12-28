<script lang="ts">
    import { audioStore, setVibe, type VibePreset } from "$lib/audio/store";
    import AuthModal from "$lib/components/AuthModal.svelte";
    import PaywallModal from "$lib/components/PaywallModal.svelte";
    import { userStore, logout } from "$lib/auth/userStore";
    import { userSubscription } from "$lib/subscription/userSubscription";

    let showAuthModal = false;
    let showPaywall = false;
    let blockedFeature: "vibe" | "games" = "vibe";
    let mobileMenuOpen = false;

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
        mobileMenuOpen = false;
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
        class="relative flex justify-between items-center px-4 md:px-8 py-6 max-w-7xl mx-auto"
    >
        <!-- Logo -->
        <div class="flex items-center gap-3 z-20">
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

        <!-- Desktop Menu -->
        <div
            class="hidden md:flex gap-8 text-sm font-medium text-slate-400 items-center"
        >
            <a href="/roadmap" class="hover:text-white transition-colors"
                >Roadmap</a
            >

            {#if $userStore.isLoggedIn}
                <a href="/coleccion" class="hover:text-white transition-colors"
                    >Colección</a
                >
                <a href="/artists" class="hover:text-white transition-colors"
                    >Artistas</a
                >
                <a href="/artist" class="hover:text-white transition-colors"
                    >Mi Perfil</a
                >
                <a href="/app" class="hover:text-white transition-colors"
                    >Ambiente</a
                >
            {/if}

            {#if $userSubscription?.profile?.isAdmin}
                <a
                    href="/admin"
                    class="hover:text-orange-400 transition-colors font-bold"
                    >⚙️ Admin</a
                >
            {/if}

            {#if $userStore.isLoggedIn}
                <div
                    class="flex items-center gap-3 ml-4 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
                >
                    <!-- User Avatar/Name -->
                    <div
                        class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-inner"
                    >
                        {$userStore.user?.displayName?.[0]?.toUpperCase() ||
                            "U"}
                    </div>

                    <div class="flex flex-col items-start leading-none mr-2">
                        <span
                            class="text-xs font-bold text-white tracking-wide"
                        >
                            {$userStore.user?.displayName || "Usuario"}
                        </span>
                        <span
                            class="text-[10px] uppercase font-bold text-slate-400"
                        >
                            {$userSubscription?.tier === "free"
                                ? "Plan Gratuito"
                                : $userSubscription?.tier}
                        </span>
                    </div>

                    <button
                        on:click={logout}
                        class="text-xs text-red-400 hover:text-red-300 transition-colors ml-2 bg-transparent border-none cursor-pointer font-medium hover:bg-red-500/10 px-2 py-1 rounded"
                        title="Cerrar Sessión"
                    >
                        ✕
                    </button>
                </div>
            {:else}
                <button
                    on:click={openAuth}
                    class="ml-2 hover:text-white whitespace-nowrap transition-colors bg-transparent border-none cursor-pointer font-medium"
                    >Acceso</button
                >
            {/if}
        </div>

        <!-- Mobile Hamburger Button -->
        <button
            on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
            class="md:hidden z-20 text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Menu"
        >
            {#if mobileMenuOpen}
                <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            {:else}
                <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            {/if}
        </button>

        <!-- Mobile Menu Dropdown -->
        {#if mobileMenuOpen}
            <div
                class="absolute top-full left-0 right-0 mt-2 mx-4 bg-[#1a1a1a]/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden md:hidden z-10"
            >
                <div class="flex flex-col p-4 gap-3">
                    <a
                        href="/roadmap"
                        on:click={() => (mobileMenuOpen = false)}
                        class="py-3 px-4 hover:bg-white/5 rounded-lg transition-colors text-slate-300 hover:text-white"
                    >
                        Roadmap
                    </a>

                    {#if $userStore.isLoggedIn}
                        <a
                            href="/coleccion"
                            on:click={() => (mobileMenuOpen = false)}
                            class="py-3 px-4 hover:bg-white/5 rounded-lg transition-colors text-slate-300 hover:text-white"
                        >
                            Colección
                        </a>
                        <a
                            href="/artists"
                            on:click={() => (mobileMenuOpen = false)}
                            class="py-3 px-4 hover:bg-white/5 rounded-lg transition-colors text-slate-300 hover:text-white"
                        >
                            Artistas
                        </a>
                        <a
                            href="/artist"
                            on:click={() => (mobileMenuOpen = false)}
                            class="py-3 px-4 hover:bg-gradient-to-r hover:from-purple-900/20 hover:to-pink-900/20 rounded-lg transition-colors text-slate-300 hover:text-purple-300 border border-transparent hover:border-purple-500/30"
                        >
                            🎨 Mi Perfil de Artista
                        </a>
                        <a
                            href="/app"
                            on:click={() => (mobileMenuOpen = false)}
                            class="py-3 px-4 hover:bg-white/5 rounded-lg transition-colors text-slate-300 hover:text-white"
                        >
                            Ambiente
                        </a>
                    {/if}

                    <a
                        href="https://discord.gg/G7SrFtJHnr"
                        target="_blank"
                        class="py-3 px-4 hover:bg-[#5865F2]/10 rounded-lg transition-colors text-slate-300 hover:text-[#5865F2] flex items-center gap-3 border-t border-white/5 mt-2"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.018.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.018.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"
                            />
                        </svg>
                        Soporte & Feedback
                    </a>

                    {#if $userSubscription?.profile?.isAdmin}
                        <a
                            href="/admin"
                            on:click={() => (mobileMenuOpen = false)}
                            class="py-3 px-4 hover:bg-white/5 rounded-lg transition-colors text-orange-400 font-bold"
                        >
                            ⚙️ Admin
                        </a>
                    {/if}

                    <div class="border-t border-white/10 my-2"></div>

                    {#if $userStore.isLoggedIn}
                        <div class="py-3 px-4 bg-white/5 rounded-lg">
                            <div class="flex items-center gap-3 mb-3">
                                <div
                                    class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-inner"
                                >
                                    {$userStore.user?.displayName?.[0]?.toUpperCase() ||
                                        "U"}
                                </div>
                                <div class="flex flex-col leading-tight">
                                    <span class="text-sm font-bold text-white">
                                        {$userStore.user?.displayName ||
                                            "Usuario"}
                                    </span>
                                    <span class="text-xs text-slate-400">
                                        {$userSubscription?.tier === "free"
                                            ? "Plan Gratuito"
                                            : $userSubscription?.tier}
                                    </span>
                                </div>
                            </div>
                            <button
                                on:click={() => {
                                    logout();
                                    mobileMenuOpen = false;
                                }}
                                class="w-full py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    {:else}
                        <button
                            on:click={openAuth}
                            class="py-3 px-4 bg-white text-black rounded-lg font-bold hover:bg-slate-200 transition-colors text-center"
                        >
                            Iniciar Sesión
                        </button>
                    {/if}
                </div>
            </div>
        {/if}

        <!-- CTA Button (visible on all sizes) -->
    </nav>

    <!-- Hero Section -->
    <!-- Hero Section -->
    <header
        class="relative px-4 md:px-8 py-20 md:py-32 max-w-7xl mx-auto text-center space-y-8 animate-fade-in overflow-hidden"
    >
        <!-- Background Glow Effect -->
        <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse-slow"
        ></div>

        <div class="space-y-4 relative z-10">
            <div
                class="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-[#FFB347] mb-4 hover:bg-white/10 transition-colors cursor-default"
            >
                ✨ Música • Ambiente • Vibes
            </div>

            <h1
                class="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-none"
            >
                Encuentra <br />
                <span
                    class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[200%_auto] animate-gradient"
                    >Tu Calma</span
                >
            </h1>

            <p
                class="text-lg md:text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed"
            >
                Una colección exclusiva de música <strong
                    class="text-white font-medium">Lo-Fi, Jazz y Ambient</strong
                >.
                <br class="hidden md:block" /> Diseñada para acompañarte, sin distraerte.
            </p>
        </div>

        <!-- CTA Buttons -->
        <div
            class="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 relative z-10"
        >
            {#if !$userStore.isLoggedIn}
                <button
                    on:click={openAuth}
                    class="px-10 py-4 bg-white text-black font-bold text-lg rounded-full hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] transition-all duration-300 w-full sm:w-auto"
                >
                    Empezar Gratis
                </button>
            {:else}
                <a
                    href="/app"
                    class="px-10 py-4 bg-white text-black font-bold text-lg rounded-full hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] transition-all duration-300 w-full sm:w-auto"
                >
                    Ir al Tablero
                </a>
            {/if}

            <button
                on:click={() =>
                    document
                        .getElementById("coleccion")
                        ?.scrollIntoView({ behavior: "smooth" })}
                class="px-10 py-4 bg-white/5 border border-white/10 text-white font-medium text-lg rounded-full hover:bg-white/10 hover:border-white/20 transition-all w-full sm:w-auto backdrop-blur-sm"
            >
                Explorar Música
            </button>
        </div>
    </header>

    <!-- Features Section -->
    <section class="max-w-7xl mx-auto px-4 md:px-8 py-12 mb-20 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Feature 1 -->
            <div
                class="bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1"
            >
                <div
                    class="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-2xl mb-4 text-purple-400"
                >
                    🎵
                </div>
                <h3 class="text-xl font-bold text-white mb-2">
                    Selección Premium
                </h3>
                <p class="text-slate-400 leading-relaxed">
                    Álbumes curados manualmente para garantizar la máxima
                    calidad y una vibra coherente.
                </p>
            </div>

            <!-- Feature 2 -->
            <div
                class="bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1"
            >
                <div
                    class="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-2xl mb-4 text-orange-400"
                >
                    ⚡
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Sin Pausas</h3>
                <p class="text-slate-400 leading-relaxed">
                    Disfruta de una experiencia continua, ideal para largas
                    sesiones de estudio o descanso.
                </p>
            </div>

            <!-- Feature 3 -->
            <div
                class="bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1"
            >
                <div
                    class="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-2xl mb-4 text-blue-400"
                >
                    🌌
                </div>
                <h3 class="text-xl font-bold text-white mb-2">
                    Visuales Inmersivos
                </h3>
                <p class="text-slate-400 leading-relaxed">
                    Desbloquea fondos dinámicos y sets de piezas premium que
                    transforman tu experiencia visual.
                </p>
            </div>
        </div>
    </section>

    <!-- New Releases Grid -->
    <main id="coleccion" class="px-4 md:px-8 pb-48 max-w-7xl mx-auto">
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
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 mb-16"
        >
            {#each $audioStore.availableAlbums as release}
                <div class="group relative flex flex-col gap-3">
                    <!-- Album Cover Card -->
                    <div
                        class="relative aspect-square rounded-xl overflow-hidden shadow-lg shadow-black/20 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 group-hover:-translate-y-1 cursor-pointer bg-[#1e293b] ring-1 ring-white/5 group-hover:ring-white/10"
                    >
                        <img
                            src={release.cover}
                            alt={release.title}
                            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                            loading="lazy"
                        />

                        <!-- Overlay on Hover -->
                        <div
                            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]"
                        >
                            <a
                                href="/album/{release.id}"
                                class="w-14 h-14 bg-white rounded-full flex items-center justify-center text-xl shadow-xl hover:scale-110 active:scale-95 transition-transform text-black pl-1"
                            >
                                ▶
                            </a>
                        </div>

                        <!-- Tag -->
                        {#if release.tag}
                            <div
                                class="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10"
                            >
                                {release.tag}
                            </div>
                        {/if}

                        <!-- Lock Overlay -->
                        {#if release.vibeId && !$userSubscription.canAccessVibe(release.vibeId)}
                            <div
                                class="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 transition-opacity p-4 text-center"
                            >
                                <div
                                    class="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2 border border-white/10"
                                >
                                    <span class="text-xl">🔒</span>
                                </div>
                                <span
                                    class="text-xs font-bold text-white uppercase tracking-wider mb-2"
                                    >Premium</span
                                >
                                <button
                                    on:click|preventDefault|stopPropagation={() => {
                                        blockedFeature = "vibe";
                                        showPaywall = true;
                                    }}
                                    class="text-[10px] bg-white text-black px-3 py-1.5 rounded-full font-bold hover:bg-slate-200 transition-colors"
                                >
                                    DESBLOQUEAR
                                </button>
                            </div>
                        {/if}
                    </div>

                    <!-- Album Info -->
                    <div class="space-y-0.5">
                        <h3
                            class="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate"
                        >
                            {release.title}
                        </h3>
                        <p class="text-xs text-slate-400 truncate">
                            {release.artist}
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
                <div class="flex gap-8 text-sm font-medium">
                    <a
                        href="/privacy"
                        class="text-slate-500 hover:text-white transition-colors"
                        >Privacidad</a
                    >
                    <a
                        href="/terms"
                        class="text-slate-500 hover:text-white transition-colors"
                        >Términos</a
                    >
                    <a
                        href="https://discord.gg/G7SrFtJHnr"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-slate-500 hover:text-[#5865F2] transition-colors flex items-center gap-2"
                    >
                        <svg
                            class="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.018.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.018.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"
                            />
                        </svg>
                        Ayuda & Soporte
                    </a>
                </div>
            </div>
        </div>
    </footer>
</div>
