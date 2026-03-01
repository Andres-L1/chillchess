<script lang="ts">
    import { pageHeader, mobileMenuOpen } from '$lib/stores/ui';
    import { Menu } from 'lucide-svelte';
</script>

<header
    class="bg-white border-b border-slate-200 shadow-sm z-10 flex-shrink-0 flex items-center px-4 md:px-8 py-4 h-16 md:h-auto"
>
    <button
        on:click={() => mobileMenuOpen.set(true)}
        class="md:hidden p-2 -ml-2 mr-3 text-slate-600 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
    >
        <Menu />
    </button>

    <div class="flex-1 truncate">
        <div class="flex items-center gap-2">
            {#if $pageHeader.category}
                <span
                    class="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600"
                >
                    {$pageHeader.category}
                </span>
            {/if}
            <h2 class="text-xl md:text-2xl font-bold text-slate-800 truncate">
                {$pageHeader.title}
            </h2>
        </div>
        {#if $pageHeader.description}
            <p class="text-slate-500 text-xs md:text-sm mt-0.5 truncate hidden md:block">
                {$pageHeader.description}
            </p>
        {/if}
    </div>
</header>
