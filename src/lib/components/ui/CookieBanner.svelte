<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { CookieIcon, Check, X } from 'lucide-svelte';
    import { fade, slide } from 'svelte/transition';

    const dispatch = createEventDispatcher();
    let showBanner = false;

    // Simulate checking simple localstorage
    onMount(() => {
        const hasAccepted = localStorage.getItem('chillchess_cookies_accepted');
        if (!hasAccepted) {
            // Little delay to let the page load before the banner pops up
            setTimeout(() => {
                showBanner = true;
            }, 1000);
        }
    });

    function acceptCookies() {
        localStorage.setItem('chillchess_cookies_accepted', 'true');
        showBanner = false;
        dispatch('accept');
    }

    function declineCookies() {
        // Here you might record the decline, but we just hide the banner for now.
        sessionStorage.setItem('chillchess_cookies_declined', 'true');
        showBanner = false;
        dispatch('decline');
    }
</script>

{#if showBanner}
    <div
        transition:slide={{ duration: 400, axis: 'y' }}
        class="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 pointer-events-none"
    >
        <div
            class="max-w-4xl mx-auto bg-white dark:bg-slate-900 border-4 border-black shadow-neo p-6 pointer-events-auto flex flex-col md:flex-row items-start md:items-center gap-6 justify-between transform transition-all"
        >
            <div class="flex items-start gap-4 flex-1">
                <div class="bg-primary p-3 border-2 border-black shadow-neo-sm flex-shrink-0">
                    <CookieIcon class="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 class="text-black dark:text-white font-black uppercase tracking-tight mb-1">
                        Tu privacidad nos importa
                    </h3>
                    <p
                        class="text-slate-600 dark:text-slate-400 text-sm font-bold leading-relaxed max-w-xl uppercase tracking-tighter"
                    >
                        Utilizamos cookies para garantizar el funcionamiento básico de la
                        aplicación, mantener tu sesión segura y ofrecerte la mejor experiencia
                        posible. Puedes leer más acerca de esto en nuestra <a
                            href="/cookies"
                            class="text-primary hover:underline underline-offset-2 transition-colors"
                            >Política de Cookies</a
                        >.
                    </p>
                </div>
            </div>

            <div class="flex flex-row md:flex-col lg:flex-row w-full md:w-auto gap-3 flex-shrink-0">
                <button
                    on:click={declineCookies}
                    class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border-2 border-black text-black dark:text-white font-black uppercase tracking-widest shadow-neo-sm hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                    <X class="w-4 h-4" />
                    Rechazar
                </button>
                <button
                    on:click={acceptCookies}
                    class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary border-2 border-black text-white font-black uppercase tracking-widest shadow-neo-sm hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                    <Check class="w-4 h-4" />
                    Aceptar
                </button>
            </div>
        </div>
    </div>
{/if}
