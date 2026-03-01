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
    } from 'lucide-svelte';

    let searchQuery = '';

    const CATEGORY_ORDER = ['Negocios', 'Productividad', 'Finanzas', 'Seguridad', 'Utilidades'];

    const tools = [
        { id: '/freelance', category: 'Negocios', name: 'Valor de mi Hora', icon: Briefcase },
        { id: '/vcard', category: 'Negocios', name: 'Tarjeta Contacto', icon: User },
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
        searchQuery = ''; // Clear search on navigation
    }
</script>

<svelte:window
    on:resize={() => {
        if (window.innerWidth >= 768) mobileMenuOpen.set(false);
    }}
/>

<!-- Overlay for mobile -->
<div
    class="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity duration-300"
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
    class="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl md:shadow-lg md:relative flex flex-col h-[100dvh] transition-transform duration-300 ease-in-out md:translate-x-0"
    class:-translate-x-full={!$mobileMenuOpen}
    class:translate-x-0={$mobileMenuOpen}
>
    <!-- Header del Menú -->
    <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <a href="/" class="flex items-center gap-3">
            <div class="bg-brand-500 text-white p-2 rounded-lg shadow-sm">
                <Blocks size={24} />
            </div>
            <h1 class="text-xl font-bold text-slate-800 tracking-tight">MultiTool</h1>
        </a>
        <button
            on:click={() => mobileMenuOpen.set(false)}
            class="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
            <X size={20} />
        </button>
    </div>

    <!-- Buscador -->
    <div class="px-5 pt-4 pb-2">
        <div class="relative group">
            <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors"
            />
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Buscar herramienta..."
                class="w-full bg-slate-100 border border-transparent rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
            />
            {#if searchQuery}
                <button
                    on:click={() => (searchQuery = '')}
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                    <XCircle class="w-4 h-4" />
                </button>
            {/if}
        </div>
    </div>

    <!-- Lista de Herramientas -->
    <div class="px-3 pb-4 flex-1 overflow-y-auto">
        {#if filteredTools.length === 0}
            <div class="flex flex-col items-center justify-center py-10 text-slate-400">
                <Search class="w-10 h-10 mb-3 opacity-50" />
                <p class="text-sm font-medium">Sin resultados</p>
            </div>
        {:else}
            {#each groupedTools as group}
                <div
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-5 mb-2 px-3 flex items-center gap-2"
                >
                    <span>{group.category}</span>
                    <div class="h-px bg-slate-100 flex-1"></div>
                </div>
                {#each group.items as tool}
                    <a
                        href={tool.id}
                        on:click={handleNavigate}
                        class="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all border-r-4 select-none"
                        class:bg-brand-50={$page.url.pathname === tool.id}
                        class:text-brand-700={$page.url.pathname === tool.id}
                        class:border-brand-500={$page.url.pathname === tool.id}
                        class:text-slate-600={$page.url.pathname !== tool.id}
                        class:hover:bg-slate-50={$page.url.pathname !== tool.id}
                        class:border-transparent={$page.url.pathname !== tool.id}
                    >
                        <svelte:component this={tool.icon} size={20} class="opacity-80" />
                        <span class="truncate">{tool.name}</span>
                    </a>
                {/each}
            {/each}
        {/if}
    </div>

    <!-- Footer del Menú -->
    <div class="p-4 border-t border-slate-100 bg-slate-50/50">
        <p class="text-[11px] font-medium text-slate-400 text-center uppercase tracking-widest">
            Dashboard OS • v3.5
        </p>
    </div>
</nav>
