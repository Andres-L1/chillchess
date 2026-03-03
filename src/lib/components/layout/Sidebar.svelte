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
    } from 'lucide-svelte';

    let searchQuery = '';

    const CATEGORY_ORDER = ['Negocios', 'Productividad', 'Finanzas', 'Seguridad', 'Utilidades'];

    const tools = [
        { id: '/freelance', category: 'Negocios', name: 'Valor de mi Hora', icon: Briefcase },
        { id: '/vcard', category: 'Negocios', name: 'Tarjeta Contacto', icon: User },
        { id: '/kanban', category: 'Productividad', name: 'Tablero Kanban', icon: LayoutList },
        { id: '/pomodoro', category: 'Productividad', name: 'Pomodoro', icon: Timer },
        { id: '/currency', category: 'Finanzas', name: 'Conversor Divisas', icon: DollarSign },
        { id: '/tip', category: 'Finanzas', name: 'Dividir Cuenta', icon: Users },
        { id: '/password', category: 'Seguridad', name: 'Claves Seguras', icon: KeyRound },
        { id: '/qr', category: 'Utilidades', name: 'Generador QR', icon: QrCode },
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
    class="fixed inset-y-0 left-0 z-50 w-72 bg-[#0d1117] shadow-2xl md:shadow-lg md:relative flex flex-col h-[100dvh] transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-slate-800/60"
    class:-translate-x-full={!$mobileMenuOpen}
    class:translate-x-0={$mobileMenuOpen}
>
    <!-- Header del Menú -->
    <div class="p-5 border-b border-slate-800/60 flex items-center justify-between">
        <a href="/" class="flex items-center gap-3">
            <div class="bg-brand-500 text-white p-2 rounded-lg shadow-lg shadow-brand-500/20">
                <Blocks size={24} />
            </div>
            <h1 class="text-xl font-bold text-white tracking-tight">MultiTool</h1>
        </a>
        <button
            on:click={() => mobileMenuOpen.set(false)}
            class="md:hidden p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
        >
            <X size={20} />
        </button>
    </div>

    <!-- Buscador -->
    <div class="px-5 pt-4 pb-2">
        <div class="relative group">
            <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-400 transition-colors"
            />
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Buscar herramienta..."
                class="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-slate-800 transition-all text-slate-300 placeholder:text-slate-500"
            />
            {#if searchQuery}
                <button
                    on:click={() => (searchQuery = '')}
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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
                    <div class="h-px bg-slate-800 flex-1"></div>
                </div>
                {#each group.items as tool}
                    <a
                        href={tool.id}
                        on:click={handleNavigate}
                        class="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all border-r-4 select-none {$page
                            .url.pathname === tool.id
                            ? 'bg-brand-500/10 text-brand-400 border-brand-500'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 border-transparent'}"
                    >
                        <svelte:component this={tool.icon} size={20} class="opacity-80" />
                        <span class="truncate">{tool.name}</span>
                    </a>
                {/each}
            {/each}
        {/if}
    </div>

    <!-- Footer del Menú -->
    <div class="p-4 border-t border-slate-800/60 bg-slate-900/50">
        <p class="text-[11px] font-medium text-slate-600 text-center uppercase tracking-widest">
            MultiTool • v4.0
        </p>
    </div>
</nav>
