<script lang="ts">
    import { pageHeader, mobileMenuOpen } from '$lib/stores/ui';
    import { themeModeStore } from '$lib/stores/themeStore';
    import {
        Menu,
        User,
        Settings,
        LogOut,
        ChevronDown,
        Crown,
        Sun,
        Moon,
        QrCode,
    } from 'lucide-svelte';
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

    function triggerHaptic() {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            // Vibra ligeramente durante 50ms
            navigator.vibrate(50);
        }
    }

    function handleMenuClick() {
        triggerHaptic();
        mobileMenuOpen.set(true);
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

<header class="sticky top-0 left-0 right-0 z-30 px-2 md:px-8 py-2 md:py-4 pointer-events-none">
    <div
        class="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-20 bg-white dark:bg-slate-900 border-2 md:border-4 border-black shadow-neo px-4 md:px-6 pointer-events-auto"
    >
        <!-- Left: Quick Links / Socials (NeatPass Style) -->
        <div class="flex items-center gap-4">
            <button
                on:click={handleMenuClick}
                class="md:hidden p-3 text-black dark:text-white border-2 border-black bg-white dark:bg-slate-800 shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
                aria-label="Abrir menú"
            >
                <Menu class="w-5 h-5" />
            </button>

            <div class="hidden lg:flex items-center gap-2"></div>
        </div>

        <!-- Center: Title / Logo -->
        <div class="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3">
            <h2
                class="text-base md:text-xl font-black text-black dark:text-white tracking-tighter uppercase italic"
            >
                CHILL<span class="text-primary">CHESS</span>
            </h2>
            {#if $pageHeader.title && $pageHeader.title !== 'Dashboard'}
                <div class="h-8 w-1.5 bg-black mx-1 hidden sm:block"></div>
                <span
                    class="text-xs font-black border-2 border-black bg-black text-white px-2 py-0.5 uppercase tracking-widest hidden sm:block"
                >
                    {$pageHeader.title}
                </span>
            {/if}
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-3">
            <!-- Currency -->
            <div class="relative hidden sm:block">
                <button
                    on:click|stopPropagation={toggleCurrencyDropdown}
                    class="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 border-2 border-black text-black dark:text-white font-black transition-all shadow-neo-sm hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
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
                        class="absolute right-0 top-full mt-3 w-16 bg-white dark:bg-slate-900 border-4 border-black z-50 overflow-hidden shadow-neo"
                    >
                        {#each currencies as c}
                            <button
                                on:click={() => setCurrency(c)}
                                class="w-full py-3 text-xs font-black transition-colors border-b-2 border-black last:border-0 {$currencyStore ===
                                c
                                    ? 'bg-primary text-white'
                                    : 'text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}"
                            >
                                {c}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Theme Toggle -->
            <button
                on:click={() => themeModeStore.toggle()}
                class="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 border-2 border-black text-black dark:text-white transition-all shadow-neo-sm hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                title="Cambiar Tema"
            >
                {#if $themeModeStore === 'light'}
                    <Moon class="w-5 h-5" />
                {:else}
                    <Sun class="w-5 h-5" />
                {/if}
            </button>

            <!-- Profile -->
            <div class="relative">
                <button
                    on:click|stopPropagation={toggleDropdown}
                    class="flex items-center gap-3 p-1.5 border-4 border-black bg-white dark:bg-slate-900 shadow-neo-sm hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all group"
                    aria-expanded={isDropdownOpen}
                    aria-label="Opciones de usuario"
                >
                    <div
                        class="w-8 h-8 bg-black text-white border-2 border-black flex items-center justify-center font-black text-sm group-hover:bg-primary transition-colors"
                    >
                        {initials}
                    </div>
                    <ChevronDown
                        class="w-4 h-4 mr-2 text-black dark:text-white transition-transform {isDropdownOpen
                            ? 'rotate-180'
                            : ''}"
                    />
                </button>

                {#if isDropdownOpen}
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
                        class="absolute right-0 top-full mt-4 w-64 bg-white dark:bg-slate-900 border-2 border-black z-50 overflow-hidden shadow-neo"
                    >
                        <div
                            class="px-5 py-4 border-b-2 border-black bg-slate-50 dark:bg-slate-800"
                        >
                            <p
                                class="text-xs font-black text-black dark:text-white truncate mb-0.5 uppercase tracking-tighter"
                            >
                                {$authStore.user?.displayName || 'Cuenta'}
                            </p>
                            <p
                                class="text-[10px] text-slate-500 font-bold truncate cursor-copy hover:text-black dark:hover:text-white transition-colors"
                                title="Tu correo"
                            >
                                {$authStore.user?.email}
                            </p>
                        </div>

                        <div class="p-2 space-y-1">
                            <button
                                on:click={() => {
                                    closeDropdown();
                                    goto('/profile');
                                }}
                                class="w-full text-left px-3 py-3 border-2 border-transparent hover:border-black hover:bg-slate-50 dark:hover:bg-slate-800 text-black dark:text-white font-black text-[10px] flex items-center gap-3 transition-all uppercase tracking-widest"
                            >
                                <User class="w-4 h-4 text-primary" />
                                Perfil
                            </button>
                            {#if $authStore.user?.isAdmin}
                                <button
                                    on:click={() => {
                                        closeDropdown();
                                        goto('/admin');
                                    }}
                                    class="w-full text-left px-3 py-3 border-2 border-transparent hover:border-black hover:bg-primary/10 text-black dark:text-white font-black text-[10px] flex items-center gap-3 transition-all uppercase tracking-widest"
                                >
                                    <Crown class="w-4 h-4 text-primary" />
                                    Panel Admin
                                </button>
                            {/if}
                            <button
                                on:click={() => {
                                    closeDropdown();
                                    goto('/dashboard/streamers');
                                }}
                                class="w-full text-left px-3 py-3 border-2 border-transparent hover:border-black hover:bg-slate-50 dark:hover:bg-slate-800 text-black dark:text-white font-black text-[10px] flex items-center gap-3 transition-all uppercase tracking-widest"
                            >
                                <QrCode class="w-4 h-4 text-primary" />
                                Widgets Streamers
                            </button>
                        </div>

                        <div class="p-2 border-t-2 border-black bg-red-50 dark:bg-red-900/10">
                            <button
                                on:click={handleLogout}
                                class="w-full text-left px-3 py-3 border-2 border-transparent hover:border-black hover:bg-white dark:hover:bg-slate-800 text-red-600 font-black text-[10px] flex items-center gap-3 transition-all uppercase tracking-widest"
                            >
                                <LogOut class="w-4 h-4" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</header>
