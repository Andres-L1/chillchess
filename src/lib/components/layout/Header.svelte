<script lang="ts">
    import { pageHeader, mobileMenuOpen } from '$lib/stores/ui';
    import { Menu, User, Settings, LogOut, ChevronDown, Crown } from 'lucide-svelte';
    import { authStore } from '$lib/stores/authStore';
    import { auth } from '$lib/firebase';
    import { signOut } from 'firebase/auth';
    import { goto } from '$app/navigation';
    import { fade, slide } from 'svelte/transition';
    import { currencyStore, type CurrencyPrefix } from '$lib/stores/currencyStore';

    const currencies: CurrencyPrefix[] = ['€', '$', '£'];

    let isDropdownOpen = false;
    let isCurrencyDropdownOpen = false;

    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
        if (isDropdownOpen) isCurrencyDropdownOpen = false;
    }

    function closeDropdown() {
        isDropdownOpen = false;
    }

    function toggleCurrencyDropdown() {
        isCurrencyDropdownOpen = !isCurrencyDropdownOpen;
        if (isCurrencyDropdownOpen) isDropdownOpen = false;
    }

    function closeCurrencyDropdown() {
        isCurrencyDropdownOpen = false;
    }

    function setCurrency(c: CurrencyPrefix) {
        currencyStore.set(c);
        closeCurrencyDropdown();
    }

    async function handleLogout() {
        try {
            closeDropdown();
            await signOut(auth);
            goto('/landing');
        } catch (e) {
            console.error(e);
        }
    }

    $: initials = (() => {
        if (!$authStore.user) return 'U';
        if ($authStore.user.displayName) {
            return $authStore.user.displayName.substring(0, 2).toUpperCase();
        }
        if ($authStore.user.email) {
            return $authStore.user.email.substring(0, 2).toUpperCase();
        }
        return 'U';
    })();
</script>

<header
    class="bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] z-50 flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-4 h-16 md:h-auto relative"
>
    <div class="flex items-center gap-3 overflow-hidden">
        <button
            on:click={() => mobileMenuOpen.set(true)}
            class="md:hidden p-3 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center min-w-[48px] min-h-[48px]"
            aria-label="Abrir menú"
        >
            <Menu class="w-6 h-6" />
        </button>

        <div class="flex-1 truncate">
            <div class="flex items-center gap-2">
                {#if $pageHeader.category}
                    <span
                        class="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 shrink-0"
                    >
                        {$pageHeader.category}
                    </span>
                {/if}
                <h2 class="text-xl md:text-2xl font-bold text-white truncate">
                    {$pageHeader.title}
                </h2>
            </div>
            {#if $pageHeader.description}
                <p class="text-slate-500 text-xs md:text-sm mt-0.5 truncate hidden md:block">
                    {$pageHeader.description}
                </p>
            {/if}
        </div>
    </div>

    <!-- Currency Selector -->
    <div class="relative ml-auto shrink-0 hidden sm:block">
        <button
            on:click|stopPropagation={toggleCurrencyDropdown}
            class="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10 ring-1 ring-inset ring-transparent active:scale-95"
            title="Cambiar Moneda Global"
        >
            {$currencyStore}
        </button>

        {#if isCurrencyDropdownOpen}
            <div
                class="fixed inset-0 z-40"
                on:click={closeCurrencyDropdown}
                on:keydown={(e) => e.key === 'Escape' && closeCurrencyDropdown()}
                role="button"
                tabindex="0"
                aria-label="Cerrar selector de moneda"
            ></div>
            <div
                transition:slide={{ duration: 150, axis: 'y' }}
                class="absolute right-0 top-full mt-2 w-16 bg-black/60 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden transform origin-top-right"
            >
                <div class="flex flex-col p-1 gap-1">
                    {#each currencies as c}
                        <button
                            on:click={() => setCurrency(c)}
                            class="w-full py-2 font-medium text-center rounded-lg transition-colors {$currencyStore ===
                            c
                                ? 'text-white bg-white/10 border border-white/5'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}"
                        >
                            {c}
                        </button>
                    {/each}
                </div>
            </div>
        {/if}
    </div>

    <!-- User Profile Dropdown -->
    <div class="relative ml-4 shrink-0">
        <button
            on:click|stopPropagation={toggleDropdown}
            class="flex items-center gap-2 md:gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[48px]"
            aria-expanded={isDropdownOpen}
            aria-label="Opciones de usuario"
        >
            <div class="relative">
                <div
                    class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center font-bold text-sm md:text-base shadow-sm"
                >
                    {initials}
                </div>
                {#if $authStore.user?.isAdmin || $authStore.user?.isPro}
                    <div
                        class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-[#0d1117] flex items-center justify-center text-amber-900 shadow-sm flex-shrink-0"
                    >
                        <Crown class="w-2.5 h-2.5" />
                    </div>
                {/if}
            </div>

            <div class="hidden md:block text-left">
                <p class="text-sm font-bold text-slate-200 truncate max-w-[120px]">
                    {$authStore.user?.displayName || 'Usuario'}
                </p>
                <p class="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                    {#if $authStore.user?.isAdmin}
                        Admin
                    {:else if $authStore.user?.isPro}
                        Premium
                    {:else}
                        Básico
                    {/if}
                </p>
            </div>
            <ChevronDown
                class="w-4 h-4 text-slate-500 hidden xl:block transition-transform {isDropdownOpen
                    ? 'rotate-180'
                    : ''}"
            />
        </button>

        {#if isDropdownOpen}
            <!-- Transparent backdrop for closing -->
            <div
                class="fixed inset-0 z-40"
                on:click={closeDropdown}
                on:keydown={(e) => e.key === 'Escape' && closeDropdown()}
                role="button"
                tabindex="0"
                aria-label="Cerrar menú flotante"
            ></div>

            <div
                transition:slide={{ duration: 200, axis: 'y' }}
                class="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] bg-black/60 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 z-50 overflow-hidden transform origin-top-right"
            >
                <div class="px-5 py-4 border-b border-white/10 bg-white/5">
                    <p class="text-sm font-medium text-white truncate mb-1">
                        {$authStore.user?.displayName || 'Usuario'}
                    </p>
                    <p
                        class="text-xs text-slate-400 truncate cursor-copy hover:text-white transition-colors"
                        title="Tu correo"
                    >
                        {$authStore.user?.email}
                    </p>
                </div>

                <div class="p-2 flex flex-col gap-1">
                    <button
                        on:click={() => {
                            closeDropdown();
                            goto('/profile');
                        }}
                        class="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white font-medium text-sm flex items-center gap-3 transition-colors"
                    >
                        <User class="w-4 h-4" />
                        Mi Perfil
                    </button>

                    {#if $authStore.user?.isAdmin}
                        <button
                            on:click={() => {
                                closeDropdown();
                                goto('/admin');
                            }}
                            class="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-amber-300 font-medium text-sm flex items-center gap-3 transition-colors"
                        >
                            <Crown class="w-4 h-4 text-amber-400" />
                            Panel Admin
                        </button>
                    {/if}
                </div>

                <div class="p-2 border-t border-white/10 bg-transparent">
                    <button
                        on:click={handleLogout}
                        class="w-full text-left px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium text-sm flex items-center gap-3 transition-colors"
                    >
                        <LogOut class="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        {/if}
    </div>
</header>
