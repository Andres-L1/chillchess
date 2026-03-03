<script lang="ts">
    import { pageHeader, mobileMenuOpen } from '$lib/stores/ui';
    import { Menu, User, Settings, LogOut, ChevronDown, Crown } from 'lucide-svelte';
    import { authStore } from '$lib/stores/authStore';
    import { auth } from '$lib/firebase';
    import { signOut } from 'firebase/auth';
    import { goto } from '$app/navigation';
    import { fade, slide } from 'svelte/transition';

    let isDropdownOpen = false;

    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }

    function closeDropdown() {
        isDropdownOpen = false;
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
    class="bg-[#0d1117]/80 backdrop-blur-md border-b border-slate-800/60 z-10 flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-4 h-16 md:h-auto relative"
>
    <div class="flex items-center gap-3 overflow-hidden">
        <button
            on:click={() => mobileMenuOpen.set(true)}
            class="md:hidden p-2 -ml-2 text-slate-400 hover:text-brand-400 rounded-lg hover:bg-slate-800 transition-colors"
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

    <!-- User Profile Dropdown -->
    <div class="relative ml-4 shrink-0">
        <button
            on:click|stopPropagation={toggleDropdown}
            class="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-xl hover:bg-slate-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
            <div class="relative">
                <div
                    class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center font-bold text-sm md:text-base shadow-lg shadow-brand-500/20 ring-2 ring-slate-800"
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
                class="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] bg-slate-900 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 z-50 overflow-hidden transform origin-top-right"
            >
                <div class="px-5 py-4 border-b border-slate-800 bg-slate-800/30">
                    <p class="text-sm font-bold text-white truncate mb-1">
                        {$authStore.user?.displayName || 'Usuario'}
                    </p>
                    <p
                        class="text-xs text-slate-400 truncate cursor-copy hover:text-brand-400 transition-colors"
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
                        class="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-brand-400 font-medium text-sm flex items-center gap-3 transition-colors"
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
                            class="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-amber-400 font-medium text-sm flex items-center gap-3 transition-colors"
                        >
                            <Crown class="w-4 h-4 text-amber-500" />
                            Panel Admin
                        </button>
                    {/if}
                </div>

                <div class="p-2 border-t border-slate-800 bg-slate-800/20">
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
