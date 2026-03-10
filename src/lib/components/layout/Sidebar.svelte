<script lang="ts">
    import { mobileMenuOpen } from '$lib/stores/ui';
    import { page } from '$app/stores';
    import {
        Blocks,
        X,
        Search,
        XCircle,
        Briefcase,
        User,
        QrCode,
        KeyRound,
        Timer,
        DollarSign,
        Users,
        LayoutList,
        Crown,
        FileText,
        Flame,
        Landmark,
        Palette,
        MessageSquare,
        Share2,
        LayoutDashboard,
        Radio
    } from 'lucide-svelte';
    import { currencyStore, type CurrencyPrefix } from '$lib/stores/currencyStore';
    import { APP_VERSION } from '$lib/constants/version';
    import { dashboardMode } from '$lib/stores/ui';

    const currencies: CurrencyPrefix[] = ['€', '$', '£'];

    let searchQuery = '';

    const CATEGORY_ORDER = [
        'STREAMER HUB',
        'WIDGETS OBS',
        'TRABAJO',
        'GESTIÓN',
        'FINANZAS',
        'SEGURIDAD',
        'HERRAMIENTAS',
        'SOPORTE',
    ];

    const CORE_TOOLS = [
        { id: '/freelance', category: 'TRABAJO', name: 'Tarifa Freelance', icon: Briefcase, pro: true },
        { id: '/vcard', category: 'TRABAJO', name: 'Tarjeta Virtual', icon: User, pro: true },
        { id: '/invoice', category: 'TRABAJO', name: 'Facturación', icon: FileText, pro: true },
        { id: '/kanban', category: 'GESTIÓN', name: 'Tablero Kanban', icon: LayoutList, pro: true },
        { id: '/pomodoro', category: 'GESTIÓN', name: 'Reloj Pomodoro', icon: Timer, pro: true },
        { id: '/currency', category: 'FINANZAS', name: 'Conversor de Moneda', icon: DollarSign, pro: true },
        { id: '/fire', category: 'FINANZAS', name: 'Calculadora FIRE', icon: Flame, pro: true },
        { id: '/loan', category: 'FINANZAS', name: 'Préstamos e Hipotecas', icon: Landmark, pro: true },
        { id: '/tip', category: 'FINANZAS', name: 'Dividir Cuenta', icon: Users, pro: true },
        { id: '/password', category: 'SEGURIDAD', name: 'Generador Claves', icon: KeyRound, pro: true },
        { id: '/qr', category: 'HERRAMIENTAS', name: 'Códigos QR', icon: QrCode, pro: true },
        { id: '/palette', category: 'HERRAMIENTAS', name: 'Paletas de Color', icon: Palette, pro: true },
        { id: '/feedback', category: 'SOPORTE', name: 'Ayuda y Soporte', icon: MessageSquare, pro: true },
    ];

    const STREAMER_TOOLS = [
        { id: '/dashboard/streamers', category: 'STREAMER HUB', name: 'Panel Principal', icon: LayoutDashboard, pro: true },
        { id: '/dashboard/streamers?tab=chat', category: 'WIDGETS OBS', name: 'Configurar Chat', icon: MessageSquare, pro: true },
        { id: '/dashboard/streamers?tab=social', category: 'WIDGETS OBS', name: 'Redes Sociales', icon: Share2, pro: true },
        { id: '/dashboard/streamers?tab=countdown', category: 'WIDGETS OBS', name: 'Cuenta Atrás', icon: Timer, pro: true },
        { id: '/dashboard/streamers?tab=qr', category: 'WIDGETS OBS', name: 'QR Dinámico', icon: QrCode, pro: true },
    ];

    $: tools = $dashboardMode === 'tools' ? CORE_TOOLS : STREAMER_TOOLS;

    $: filteredTools = tools.filter(
        (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    $: groupedTools = CATEGORY_ORDER.map((cat) => ({
        category: cat,
        items: filteredTools.filter((t) => t.category === cat),
    })).filter((g) => g.items.length > 0);

    function handleNavigate() {
        if (window.innerWidth < 768) {
            mobileMenuOpen.set(false);
        }
        searchQuery = '';
    }

    // Swipe to close functionality for mobile
    let touchStartX = 0;

    function handleTouchStart(e: TouchEvent) {
        touchStartX = e.touches[0].clientX;
    }

    function triggerHaptic() {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    function handleTouchEnd(e: TouchEvent) {
        if (!$mobileMenuOpen) return;
        const touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchStartX - touchEndX;
        if (swipeDistance > 40) {
            triggerHaptic();
            mobileMenuOpen.set(false);
        }
    }
</script>

<svelte:window
    on:resize={() => {
        if (window.innerWidth >= 768) mobileMenuOpen.set(false);
    }}
/>

<!-- Overlay for mobile -->
<div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
    class:opacity-100={$mobileMenuOpen}
    class:opacity-0={!$mobileMenuOpen}
    class:pointer-events-none={!$mobileMenuOpen}
    on:click={() => mobileMenuOpen.set(false)}
    on:keydown={(e) => e.key === 'Escape' && mobileMenuOpen.set(false)}
    role="button"
    tabindex="0"
    aria-label="Cerrar menú"
></div>

<!-- Sidebar Navigation -->
<nav
    class="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 md:relative flex flex-col h-[100dvh] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] md:translate-x-0 border-r-4 border-black"
    class:-translate-x-full={!$mobileMenuOpen}
    class:translate-x-0={$mobileMenuOpen}
    on:touchstart={handleTouchStart}
    on:touchend={handleTouchEnd}
>
    <!-- Header del Menú -->
    <div class="px-8 py-10 flex items-center justify-between">
        <a href="/" class="flex items-center gap-3 active:scale-95 transition-transform group">
            <div
                class="w-10 h-10 bg-primary border-4 border-black shadow-neo-sm flex items-center justify-center group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            >
                <Blocks class="text-white w-6 h-6" />
            </div>
            <h1
                class="text-xl font-black text-black dark:text-white tracking-tighter uppercase italic"
            >
                CHILL<span class="text-primary">CHESS</span>
            </h1>
        </a>
        <button
            on:click={() => mobileMenuOpen.set(false)}
            class="md:hidden p-2 text-black dark:text-white border-4 border-black bg-[#FFD54F] shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            aria-label="Cerrar menú"
        >
            <X size={20} />
        </button>
    </div>

    <!-- Selector de Modo (Neo-Brutal Switcher) -->
    <div class="px-6 mb-6">
        <div class="flex border-4 border-black shadow-neo-sm overflow-hidden bg-white dark:bg-slate-800">
            <button 
                on:click={() => dashboardMode.set('tools')}
                class="flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all
                {$dashboardMode === 'tools' 
                    ? 'bg-black text-white' 
                    : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary'} border-r-4 border-black"
            >
                MODO TOOLS
            </button>
            <button 
                on:click={() => dashboardMode.set('streamer')}
                class="flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all
                {$dashboardMode === 'streamer' 
                    ? 'bg-primary text-white' 
                    : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary'}"
            >
                MODO STREAMER
            </button>
        </div>
    </div>

    <!-- Buscador -->
    <div class="px-6 mb-8">
        <div class="relative group">
            <Search
                class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black dark:text-white pointer-events-none"
            />
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="BUSCAR..."
                class="w-full bg-slate-50 dark:bg-slate-800 border-[6px] border-black rounded-none pl-11 pr-4 py-3 text-[10px] font-black tracking-[0.2em] focus:outline-none focus:ring-0 shadow-neo-sm focus:shadow-neo transition-all text-black dark:text-white placeholder:text-slate-500"
            />
            {#if searchQuery}
                <button
                    on:click={() => (searchQuery = '')}
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-white hover:scale-110 transition-transform"
                >
                    <XCircle class="w-4 h-4" />
                </button>
            {/if}
        </div>
    </div>

    <!-- Lista de Herramientas -->
    <div class="px-4 pb-8 flex-1 overflow-y-auto custom-scrollbar space-y-8">
        {#if filteredTools.length === 0}
            <div
                class="flex flex-col items-center justify-center py-10 text-slate-400 border-4 border-dashed border-black/10 dark:border-white/10 m-2"
            >
                <Search class="w-10 h-10 mb-3 opacity-20" />
                <p class="text-[10px] font-black uppercase tracking-widest text-center">
                    Sin resultados
                </p>
            </div>
        {:else}
            {#each groupedTools as group}
                <div class="space-y-3">
                    <div
                        class="text-[11px] font-black text-black dark:text-white tracking-[0.25em] px-4 flex items-center gap-2"
                    >
                        <span class="w-2 h-2 bg-primary border-2 border-black transform rotate-45"
                        ></span>
                        {group.category}
                    </div>
                    <div class="space-y-2">
                        {#each group.items as tool}
                            <a
                                href={tool.id}
                                on:click={handleNavigate}
                                class="w-full flex items-center justify-between px-4 py-3 border-4 transition-all duration-200 group tracking-tighter {(tool.id.includes('?') ? ($page.url.pathname + $page.url.search).includes(tool.id) : $page.url.pathname === tool.id)
                                    ? 'bg-black text-white border-black shadow-neo translate-x-1 translate-y-1'
                                    : 'bg-white dark:bg-slate-900 dark:text-white text-black border-black hover:bg-primary/10 hover:-translate-y-1 hover:-translate-x-0.5 shadow-neo-sm hover:shadow-neo'}"
                            >
                                <div class="flex items-center gap-4 truncate">
                                    <svelte:component
                                        this={tool.icon}
                                        size={18}
                                        class="shrink-0 {$page.url.pathname === tool.id
                                            ? 'text-white'
                                            : 'text-black dark:text-white'}"
                                    />
                                    <span class="truncate font-black text-[11px] uppercase"
                                        >{tool.name}</span
                                    >
                                </div>
                                {#if tool.pro}
                                    <div
                                        class="neo-sticker p-1 bg-white dark:bg-slate-800 rotate-3"
                                    >
                                        <Crown
                                            size={12}
                                            class="{$page.url.pathname === tool.id
                                                ? 'text-primary'
                                                : 'text-primary'} fill-current"
                                        />
                                    </div>
                                {/if}
                            </a>
                        {/each}
                    </div>
                </div>
            {/each}
        {/if}
    </div>

    <!-- Footer del Menú -->
    <div class="p-6 border-t-4 border-black bg-slate-50 dark:bg-slate-800 safe-bottom space-y-6">
        <!-- Currency selector para movil -->
        <div class="flex items-center justify-between sm:hidden">
            <span
                class="text-[10px] font-black text-black dark:text-white uppercase tracking-widest"
                >DIVISA</span
            >
            <div class="flex gap-1">
                {#each currencies as c}
                    <button
                        on:click={() => currencyStore.set(c)}
                        class="w-9 h-9 border-4 border-black font-black text-xs transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none {$currencyStore ===
                        c
                            ? 'bg-primary text-white shadow-none'
                            : 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-neo-sm hover:-translate-y-0.5'}"
                    >
                        {c}
                    </button>
                {/each}
            </div>
        </div>

        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div
                    class="w-2.5 h-2.5 rounded-none bg-green-500 border-2 border-black animate-pulse shadow-neo-sm"
                ></div>
                <span class="text-[9px] font-black text-black dark:text-white tracking-[0.2em]"
                    >ONLINE</span
                >
            </div>
            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                V{APP_VERSION}
            </p>
        </div>
    </div>
</nav>
