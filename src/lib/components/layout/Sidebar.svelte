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
    } from 'lucide-svelte';
    import { currencyStore, type CurrencyPrefix } from '$lib/stores/currencyStore';
    import { APP_VERSION } from '$lib/constants/version';

    const currencies: CurrencyPrefix[] = ['€', '$', '£'];

    let searchQuery = '';

    const CATEGORY_ORDER = [
        'Negocios',
        'Productividad',
        'Finanzas',
        'Seguridad',
        'Utilidades',
        'Comunidad',
    ];

    const tools = [
        {
            id: '/freelance',
            category: 'Negocios',
            name: 'Valor de mi Hora',
            icon: Briefcase,
            pro: true,
        },
        { id: '/vcard', category: 'Negocios', name: 'Tarjeta Contacto', icon: User, pro: true },
        { id: '/invoice', category: 'Negocios', name: 'Facturas', icon: FileText, pro: true },
        {
            id: '/kanban',
            category: 'Productividad',
            name: 'Tablero Kanban',
            icon: LayoutList,
            pro: true,
        },
        { id: '/pomodoro', category: 'Productividad', name: 'Pomodoro', icon: Timer, pro: true },
        {
            id: '/currency',
            category: 'Finanzas',
            name: 'Conversor Divisas',
            icon: DollarSign,
            pro: true,
        },
        { id: '/fire', category: 'Finanzas', name: 'Libertad Financiera', icon: Flame, pro: true },
        { id: '/loan', category: 'Finanzas', name: 'Préstamos', icon: Landmark, pro: true },
        { id: '/tip', category: 'Finanzas', name: 'Dividir Cuenta', icon: Users, pro: true },
        {
            id: '/password',
            category: 'Seguridad',
            name: 'Claves Seguras',
            icon: KeyRound,
            pro: true,
        },
        { id: '/qr', category: 'Utilidades', name: 'Generador QR', icon: QrCode, pro: true },
        {
            id: '/palette',
            category: 'Utilidades',
            name: 'Paletas de Color',
            icon: Palette,
            pro: true,
        },
        {
            id: '/feedback',
            category: 'Comunidad',
            name: 'Sugerencias y Bugs',
            icon: MessageSquare,
            pro: true,
        },
    ];

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
        // If swiped left by more than 40px, close sidebar
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
    class="fixed inset-y-0 left-0 z-50 w-72 bg-black/40 backdrop-blur-2xl shadow-2xl md:shadow-[4px_0_24px_rgba(0,0,0,0.3)] md:relative flex flex-col h-[100dvh] transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-white/10"
    class:-translate-x-full={!$mobileMenuOpen}
    class:translate-x-0={$mobileMenuOpen}
    on:touchstart={handleTouchStart}
    on:touchend={handleTouchEnd}
>
    <!-- Header del Menú -->
    <div class="p-5 border-b border-white/10 flex items-center justify-between">
        <a href="/" class="flex items-center gap-3 group">
            <div
                class="bg-white/5 border border-white/10 text-white p-2 rounded-lg shadow-sm group-hover:bg-white/10 transition-colors"
            >
                <Blocks size={24} class="opacity-80" />
            </div>
            <h1 class="text-xl font-medium text-white tracking-tight">ChillChess</h1>
        </a>
        <button
            on:click={() => mobileMenuOpen.set(false)}
            class="md:hidden p-3 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center min-w-[48px] min-h-[48px]"
            aria-label="Cerrar menú"
        >
            <X size={20} />
        </button>
    </div>

    <!-- Buscador -->
    <div class="px-5 pt-4 pb-2">
        <div class="relative group">
            <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors"
            />
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Buscar herramienta..."
                class="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all text-slate-200 placeholder:text-slate-500"
            />
            {#if searchQuery}
                <button
                    on:click={() => (searchQuery = '')}
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Borrar búsqueda"
                >
                    <XCircle class="w-4 h-4" />
                </button>
            {/if}
        </div>
    </div>

    <!-- Lista de Herramientas -->
    <div class="px-3 pb-4 flex-1 overflow-y-auto">
        {#if filteredTools.length === 0}
            <div class="flex flex-col items-center justify-center py-10 text-slate-500">
                <Search class="w-10 h-10 mb-3 opacity-50" />
                <p class="text-sm font-medium">Sin resultados</p>
            </div>
        {:else}
            {#each groupedTools as group}
                <div
                    class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-5 mb-2 px-3 flex items-center gap-2"
                >
                    <span>{group.category}</span>
                    <div class="h-px bg-white/10 flex-1"></div>
                </div>
                {#each group.items as tool}
                    <a
                        href={tool.id}
                        on:click={handleNavigate}
                        class="w-full flex items-center justify-between p-3 min-h-[48px] rounded-xl text-sm font-medium transition-all select-none group {$page
                            .url.pathname === tool.id
                            ? 'bg-white/10 border border-white/10 text-white shadow-sm'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'}"
                    >
                        <div class="flex items-center gap-3 truncate">
                            <svelte:component
                                this={tool.icon}
                                size={20}
                                class="opacity-80 shrink-0"
                            />
                            <span class="truncate">{tool.name}</span>
                        </div>
                        {#if tool.pro}
                            <Crown size={14} class="text-amber-400 shrink-0" />
                        {/if}
                    </a>
                {/each}
            {/each}
        {/if}
    </div>

    <!-- Footer del Menú -->
    <div class="p-4 border-t border-white/10 bg-transparent safe-bottom space-y-3">
        <!-- Currency selector (visible on mobile where header selector is hidden) -->
        <div class="flex items-center justify-center gap-1 sm:hidden">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-1"
                >Moneda</span
            >
            {#each currencies as c}
                <button
                    on:click={() => currencyStore.set(c)}
                    class="w-9 h-9 rounded-lg font-medium text-sm transition-colors {$currencyStore ===
                    c
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}"
                >
                    {c}
                </button>
            {/each}
        </div>
        <p
            class="text-[10px] font-medium text-slate-600 text-center uppercase tracking-widest pt-2"
        >
            ChillChess • v{APP_VERSION}
        </p>
    </div>
</nav>
