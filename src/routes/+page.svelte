<script lang="ts">
    import { audioStore, setVibe, type VibePreset } from "$lib/audio/store";
    import AuthModal from "$lib/components/AuthModal.svelte";
    import PaywallModal from "$lib/components/PaywallModal.svelte";
    import { userStore, logout } from "$lib/auth/userStore";
    import { userSubscription } from "$lib/subscription/userSubscription";
    import SettingsIcon from "$lib/components/icons/SettingsIcon.svelte";
    import UserIcon from "$lib/components/icons/UserIcon.svelte";
    import HeartIcon from "$lib/components/icons/HeartIcon.svelte";
    import BulbIcon from "$lib/components/icons/BulbIcon.svelte";
    import SendIcon from "$lib/components/icons/SendIcon.svelte";
    import BoltIcon from "$lib/components/icons/BoltIcon.svelte";
    import StarIcon from "$lib/components/icons/StarIcon.svelte";
    import MusicIcon from "$lib/components/icons/MusicIcon.svelte";
    import EyeIcon from "$lib/components/icons/EyeIcon.svelte";
    import VerifiedBadge from "$lib/components/VerifiedBadge.svelte";
    import FounderBadge from "$lib/components/FounderBadge.svelte";

    let showAuthModal = false;
    let showPaywall = false;
    let blockedFeature: "vibe" | "games" = "vibe";
    let mobileMenuOpen = false;
    let showUserMenu = false; // New state for desktop user dropdown

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

<svelte:head>
    <title>ChillChess - Música Lo-Fi, Ambient y Jazz para Concentrarse</title>
    <meta
        name="description"
        content="Tu santuario digital de música Lo-Fi y Ambient. Escucha sin interrupciones, descubre artistas exclusivos y mejora tu productividad con nuestros ambientes inmersivos."
    />
    <meta
        name="keywords"
        content="lo-fi, música para estudiar, ambient, jazz, focus music, chillchess, productividad, pomodoro, relax, white noise, stream safe music, copyright free music"
    />
    <meta name="author" content="ChillChess" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://chillchess.app/" />
    <meta property="og:title" content="ChillChess - Tu Espacio de Calma" />
    <meta
        property="og:description"
        content="Música reactiva y ambientes visuales para potenciar tu concentración. Únete a la comunidad de ChillChess."
    />
    <!-- <meta property="og:image" content="https://chillchess.app/og-image.jpg" /> -->

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://chillchess.app/" />
    <meta property="twitter:title" content="ChillChess - Tu Espacio de Calma" />
    <meta
        property="twitter:description"
        content="Música reactiva y ambientes visuales para potenciar tu concentración."
    />
</svelte:head>

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
            <!-- Unified Logo for both Mobile and Desktop -->
            <img
                src="/logo-desktop.png"
                alt="ChillChess Logo"
                class="h-8 md:h-10 w-auto hover:scale-105 transition-transform duration-300"
            />

            <span
                class="text-xs uppercase bg-white/10 px-2 py-1 rounded-md text-slate-400"
                >Beta v0.3</span
            >
        </div>

        <!-- Desktop Menu -->
        <div
            class="hidden md:flex gap-6 text-sm font-medium text-slate-400 items-center"
        >
            <a href="/roadmap" class="hover:text-primary-400 transition-colors"
                >Roadmap</a
            >

            {#if $userStore.isLoggedIn}
                <a
                    href="/coleccion"
                    class="hover:text-primary-400 transition-colors"
                    >Colección</a
                >
                <a href="/app" class="hover:text-primary-400 transition-colors"
                    >Ambiente</a
                >
                <a
                    href="/rooms"
                    class="hover:text-primary-400 transition-colors">🎵 Salas</a
                >
                <a
                    href="/patches"
                    class="hover:text-primary-400 transition-colors">Parches</a
                >
                <!-- Pricing CTA -->
                <a
                    href="/pricing"
                    class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-1.5 rounded-full font-bold transition-all shadow-lg shadow-primary-500/20 hover:scale-105 ml-2 flex items-center gap-1"
                >
                    {#if $userSubscription?.tier === "free"}
                        <BoltIcon size="sm" gradient={false} />
                        <span>Mejorar Plan</span>
                    {:else}
                        <StarIcon size="sm" gradient={false} />
                        <span>Mi Plan</span>
                    {/if}
                </a>
            {:else}
                <a
                    href="/pricing"
                    class="hover:text-primary-400 transition-colors">Planes</a
                >
            {/if}

            {#if $userSubscription?.profile?.isAdmin}
                <a
                    href="/admin"
                    class="text-slate-300 hover:text-primary-400 transition-colors font-bold flex items-center gap-2 bg-white/5 px-2 py-1.5 rounded"
                >
                    <SettingsIcon size="sm" gradient={false} />
                    <span>Admin</span>
                </a>
            {/if}

            {#if $userStore.isLoggedIn}
                <div class="relative ml-4">
                    <button
                        on:click={() => (showUserMenu = !showUserMenu)}
                        class="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <!-- User Avatar/Name -->
                        <div
                            class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-inner"
                        >
                            {$userStore.user?.displayName?.[0]?.toUpperCase() ||
                                "U"}
                        </div>

                        <div
                            class="flex flex-col items-start leading-none mr-2"
                        >
                            <span
                                class="text-xs font-bold text-white tracking-wide flex items-center gap-1"
                            >
                                {$userStore.user?.displayName || "Usuario"}
                                <div class="flex items-center gap-1">
                                    {#if $userSubscription.profile?.isVerified && ($userSubscription.profile?.showVerifiedBadge ?? true)}
                                        <VerifiedBadge size="sm" />
                                    {/if}
                                    {#if $userSubscription.tier === "pro" && ($userSubscription.profile?.showFounderBadge ?? true)}
                                        <FounderBadge size="sm" />
                                    {/if}
                                </div>
                            </span>
                            <span
                                class="text-[10px] uppercase font-bold text-slate-400"
                            >
                                {$userSubscription?.tier === "free"
                                    ? "Plan Gratuito"
                                    : $userSubscription?.tier}
                            </span>
                        </div>

                        <!-- Dropdown Arrow -->
                        <svg
                            class="w-4 h-4 text-slate-400 {showUserMenu
                                ? 'rotate-180'
                                : ''} transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            /></svg
                        >
                    </button>

                    <!-- User Dropdown Menu -->
                    {#if showUserMenu}
                        <div
                            class="absolute top-full right-0 mt-2 w-48 bg-midnight-800 border border-white/10 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50 flex flex-col py-1"
                        >
                            <a
                                href="/artist"
                                class="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 text-left flex items-center gap-2"
                            >
                                <UserIcon size="sm" gradient={false} />
                                <span>Mi Perfil</span>
                            </a>
                            <a
                                href="/creators"
                                class="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 text-left flex items-center gap-2"
                            >
                                <span class="text-sm">✨</span>
                                <span>Creators Catalog</span>
                            </a>
                            <a
                                href="/favorites"
                                class="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 text-left flex items-center gap-2"
                            >
                                <HeartIcon size="sm" gradient={false} />
                                <span>Mis Favoritos</span>
                            </a>
                            <a
                                href="/widget/config"
                                class="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 text-left flex items-center gap-2"
                            >
                                📺
                                <span>Widget OBS</span>
                            </a>
                            {#if $userSubscription.tier === "pro"}
                                <a
                                    href="/proposals"
                                    class="px-4 py-2 text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 text-left flex items-center gap-2"
                                >
                                    <BulbIcon size="sm" gradient={true} />
                                    <span>Propuestas</span>
                                    <span
                                        class="text-[10px] bg-purple-500/30 px-1.5 py-0.5 rounded font-bold"
                                        >PRO</span
                                    >
                                </a>
                                <a
                                    href="/artist/submit"
                                    class="px-4 py-2 text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 text-left flex items-center gap-2"
                                >
                                    <SendIcon size="sm" gradient={false} />
                                    <span>Enviar Música</span>
                                    <span
                                        class="text-[10px] bg-blue-500/30 px-1.5 py-0.5 rounded font-bold"
                                        >PRO</span
                                    >
                                </a>
                            {/if}
                            <div class="h-px bg-white/10 my-1"></div>
                            <button
                                on:click={() => {
                                    logout();
                                    showUserMenu = false;
                                }}
                                class="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left flex items-center gap-2 w-full"
                            >
                                🚪 Cerrar Sesión
                            </button>
                        </div>

                        <!-- Backdrop to close -->
                        <button
                            class="fixed inset-0 z-40 bg-transparent cursor-default w-full h-full border-none"
                            on:click={() => (showUserMenu = false)}
                            aria-label="Close menu"
                        ></button>
                    {/if}
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
                class="absolute top-full left-0 right-0 mt-2 mx-4 bg-[#1a1a1a]/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden md:hidden z-50 transform origin-top animate-fade-in"
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
                        <!-- Artists moved inside collection conceptually, removing link here or nesting? Keeping simpler for mobile too -->

                        <a
                            href="/app"
                            on:click={() => (mobileMenuOpen = false)}
                            class="py-3 px-4 hover:bg-white/5 rounded-lg transition-colors text-slate-300 hover:text-white"
                        >
                            Ambiente
                        </a>
                        <a
                            href="/rooms"
                            on:click={() => (mobileMenuOpen = false)}
                            class="py-3 px-4 hover:bg-white/5 rounded-lg transition-colors text-slate-300 hover:text-white"
                        >
                            🎵 Salas Compartidas
                        </a>
                        <a
                            href="/patches"
                            on:click={() => (mobileMenuOpen = false)}
                            class="py-3 px-4 hover:bg-white/5 rounded-lg transition-colors text-slate-300 hover:text-white"
                        >
                            📜 Notas del Parche
                        </a>
                        <!-- Mobile Pricing -->
                        <a
                            href="/pricing"
                            on:click={() => (mobileMenuOpen = false)}
                            class="py-3 px-4 bg-primary-500/10 hover:bg-primary-500 text-primary-500 hover:text-white rounded-lg transition-colors font-bold flex items-center gap-2 mt-2"
                        >
                            {#if $userSubscription?.tier === "free"}
                                <BoltIcon size="sm" gradient={false} />
                                <span>Mejorar Plan</span>
                            {:else}
                                <StarIcon size="sm" gradient={false} />
                                <span>Mi Plan</span>
                            {/if}
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
                            ><path
                                d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.018.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.018.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"
                            /></svg
                        >
                        Soporte & Feedback
                    </a>

                    {#if $userSubscription?.profile?.isAdmin}
                        <a
                            href="/admin"
                            on:click={() => (mobileMenuOpen = false)}
                            class="py-3 px-4 hover:bg-white/5 rounded-lg transition-colors text-orange-400 font-bold flex items-center gap-2"
                        >
                            <SettingsIcon size="sm" gradient={false} />
                            <span>Admin</span>
                        </a>
                    {/if}

                    <div class="border-t border-white/10 my-2"></div>

                    {#if $userStore.isLoggedIn}
                        <div class="py-3 px-4 bg-white/5 rounded-lg">
                            <a
                                href="/artist"
                                class="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity"
                                on:click={() => (mobileMenuOpen = false)}
                            >
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
                                        Configurar Perfil >
                                    </span>
                                </div>
                            </a>
                            <a
                                href="/creators"
                                class="flex items-center gap-3 mb-3 text-sm font-bold text-slate-300 hover:text-white px-1"
                                on:click={() => (mobileMenuOpen = false)}
                            >
                                <span class="text-lg">✨</span>
                                <span>Creators Catalog</span>
                            </a>
                            <a
                                href="/favorites"
                                class="flex items-center gap-3 mb-3 text-sm font-bold text-slate-300 hover:text-white px-1"
                                on:click={() => (mobileMenuOpen = false)}
                            >
                                <HeartIcon size="sm" gradient={false} />
                                <span>Mis Favoritos</span>
                            </a>
                            {#if $userSubscription.tier === "pro"}
                                <a
                                    href="/proposals"
                                    class="flex items-center gap-3 mb-3 text-sm font-bold text-purple-300 hover:text-purple-200 px-1"
                                    on:click={() => (mobileMenuOpen = false)}
                                >
                                    <BulbIcon size="sm" gradient={true} />
                                    <span>Propuestas</span>
                                    <span
                                        class="text-[10px] bg-purple-500/30 px-1.5 py-0.5 rounded font-bold ml-auto"
                                        >PRO</span
                                    >
                                </a>
                                <a
                                    href="/artist/submit"
                                    class="flex items-center gap-3 mb-3 text-sm font-bold text-blue-300 hover:text-blue-200 px-1"
                                    on:click={() => (mobileMenuOpen = false)}
                                >
                                    <SendIcon size="sm" gradient={false} />
                                    <span>Enviar Música</span>
                                    <span
                                        class="text-[10px] bg-blue-500/30 px-1.5 py-0.5 rounded font-bold ml-auto"
                                        >PRO</span
                                    >
                                </a>
                            {/if}
                            <button
                                on:click={() => {
                                    logout();
                                    mobileMenuOpen = false;
                                }}
                                class="w-full py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left pl-0"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    {:else}
                        <a
                            href="/pricing"
                            on:click={() => (mobileMenuOpen = false)}
                            class="py-3 px-4 bg-primary-500/10 hover:bg-primary-500 text-primary-500 hover:text-white rounded-lg transition-colors font-bold text-center block mb-3"
                        >
                            Ver Planes
                        </a>
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
    <header
        class="relative px-4 md:px-8 py-20 md:py-32 max-w-7xl mx-auto text-center space-y-8 animate-fade-in overflow-hidden"
    >
        <!-- Background Glow Effect -->
        <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse-slow"
        ></div>

        <div class="space-y-4 relative z-10">
            <div
                class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-[#FFB347] mb-4 hover:bg-white/10 transition-colors cursor-default"
            >
                <StarIcon size="sm" gradient={false} />
                <span>Música • Ambiente • Vibes</span>
            </div>

            <h1
                class="text-4xl md:text-7xl font-bold text-slate-100 tracking-tighter leading-tight"
            >
                Encuentra Tu Calma <br />
                <span
                    class="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7B3D] via-[#FFB347] to-[#FF7B3D] bg-[200%_auto] animate-gradient"
                    >Encuentra Tu Estilo</span
                >
            </h1>

            <p
                class="text-lg md:text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed"
            >
                Música de todo tipo sin interrupciones.
                <strong class="text-white font-medium"
                    >Perfecta para tus Streams y Sesiones de Trabajo.</strong
                >
                <br class="hidden md:block" />
                Olvídate del Copyright y los anuncios.
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
                    Ir a mi Espacio
                </a>
            {/if}

            <a
                href="/coleccion"
                class="px-10 py-4 bg-white/5 border border-white/10 text-white font-medium text-lg rounded-full hover:bg-white/10 hover:border-white/20 transition-all w-full sm:w-auto backdrop-blur-sm inline-block text-center"
            >
                Explorar Música
            </a>
        </div>
    </header>

    <!-- Features Section (Funciones) -->
    <section class="max-w-7xl mx-auto px-4 md:px-8 py-20 mb-20 relative z-10">
        <div class="text-center mb-16">
            <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">
                La atmósfera perfecta para tu audiencia
            </h2>
            <p class="text-slate-400 max-w-2xl mx-auto text-lg">
                ChillChess te da el control total del ambiente. Sin sorpresas,
                sin cortes y seguras para tu contenido.
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Feature 1: Stream Safe -->
            <div
                class="group bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 hover:border-green-500/30 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10"
            >
                <div
                    class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform"
                >
                    <div class="text-2xl">🎥</div>
                </div>
                <h3 class="text-2xl font-bold text-slate-100 mb-3">
                    100% Stream Safe
                </h3>
                <p class="text-slate-400 leading-relaxed text-sm">
                    Utiliza nuestra música en tus directos de Twitch, YouTube o
                    Kick. Solo pedimos créditos en la descripción. ¡Cero
                    strikes!
                </p>
            </div>

            <!-- Feature 2: Infinite Radio -->
            <div
                class="group bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 hover:border-primary-500/30 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/10"
            >
                <div
                    class="w-14 h-14 bg-gradient-to-br from-primary-500 to-orange-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform"
                >
                    <MusicIcon size="md" />
                </div>
                <h3 class="text-2xl font-bold text-slate-100 mb-3">
                    Radio Sin Cortes
                </h3>
                <p class="text-slate-400 leading-relaxed text-sm">
                    Olvídate de cambiar de canción a mitad de una partida. Flujo
                    continuo de Lo-Fi y Jazz para mantener el "vibe" durante
                    horas.
                </p>
            </div>

            <!-- Feature 3: Visuals -->
            <div
                class="group bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10"
            >
                <div
                    class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform"
                >
                    <EyeIcon size="md" />
                </div>
                <h3 class="text-2xl font-bold text-slate-100 mb-3">
                    Estética Visual
                </h3>
                <p class="text-slate-400 leading-relaxed text-sm">
                    Fondos animados y elegantes que puedes capturar en tu OBS
                    para darle un toque profesional a tus escenas de "Just
                    Chatting" o "Be Right Back".
                </p>
            </div>

            <!-- Feature 4: Artist Community (Wide) -->
            <div
                class="group bg-[#131b2e]/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 lg:col-span-2"
            >
                <div
                    class="flex flex-col md:flex-row gap-6 items-start md:items-center"
                >
                    <div
                        class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform"
                    >
                        <UserIcon size="md" />
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-slate-100 mb-2">
                            Apoya a Artistas Reales
                        </h3>
                        <p
                            class="text-slate-400 leading-relaxed text-sm max-w-xl"
                        >
                            Al usar ChillChess, ayudas a músicos independientes
                            a ser escuchados. Una comunidad real detrás de cada
                            beat.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Feature 5: Premium Experience -->
            <div
                class="group bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-white/30 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5 flex flex-col justify-center items-center text-center"
            >
                <div class="mb-4">
                    <StarIcon size="md" gradient={true} />
                </div>
                <h3 class="text-xl font-bold text-white mb-2">
                    Gratis para Empezar
                </h3>
                <p class="text-slate-400 text-sm">
                    Biblioteca básica gratuita y planes Pro para desbloquear
                    todo.
                </p>
            </div>
        </div>
    </section>

    <!-- CTA to Collection -->
    <section class="max-w-7xl mx-auto px-4 md:px-8 pb-48 text-center">
        <div
            class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 rounded-3xl p-12"
        >
            <h2 class="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
                Listo para mejorar tu Stream?
            </h2>
            <p class="text-slate-400 mb-8 max-w-xl mx-auto">
                Únete a otros creadores que ya usan ChillChess para sus fondos
                musicales.
            </p>
            <a
                href="/coleccion"
                class="inline-block px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-all shadow-lg hover:shadow-white/20"
            >
                Ver Toda la Música
            </a>
        </div>
    </section>

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
                        src="/logo-desktop.png"
                        alt="Logo"
                        class="h-6 w-auto"
                    />
                </div>
                <p class="text-sm text-slate-500">
                    &copy; 2025 ChillChess. Todos los derechos reservados.
                </p>
                <p
                    class="text-xs text-slate-600 max-w-md flex items-center gap-2 justify-center md:justify-start"
                >
                    <MusicIcon size="sm" />
                    <span>
                        Nuestra música es de uso libre en Streams. Te pedimos
                        por favor que nos menciones como
                        <span class="text-slate-500 font-medium"
                            >ChillChess</span
                        > en tu descripción.
                    </span>
                </p>
            </div>
            <div
                class="flex flex-col md:flex-row gap-4 md:gap-8 text-sm font-medium items-center md:items-start"
            >
                <a
                    href="/legal/cookies"
                    class="text-slate-500 hover:text-white transition-colors"
                    >Política de Cookies</a
                >
                <a
                    href="/legal/terms"
                    class="text-slate-500 hover:text-white transition-colors"
                    >Términos y Condiciones</a
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
    </footer>
</div>
