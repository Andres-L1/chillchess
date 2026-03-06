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
            class="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl p-6 pointer-events-auto flex flex-col md:flex-row items-start md:items-center gap-6 justify-between transform transition-all"
        >
            <div class="flex items-start gap-4 flex-1">
                <div
                    class="bg-brand-500/20 p-3 rounded-xl border border-brand-500/30 flex-shrink-0"
                >
                    <CookieIcon class="w-6 h-6 text-brand-400" />
                </div>
                <div>
                    <h3 class="text-white font-bold mb-1">Tu privacidad nos importa</h3>
                    <p class="text-slate-400 text-sm leading-relaxed max-w-xl">
                        Utilizamos cookies para garantizar el funcionamiento básico de la
                        aplicación, mantener tu sesión segura y ofrecerte la mejor experiencia
                        posible. Puedes leer más acerca de esto en nuestra <a
                            href="/cookies"
                            class="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
                            >Política de Cookies</a
                        >.
                    </p>
                </div>
            </div>

            <div class="flex flex-row md:flex-col lg:flex-row w-full md:w-auto gap-3 flex-shrink-0">
                <button
                    on:click={declineCookies}
                    class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium transition-colors"
                >
                    <X class="w-4 h-4" />
                    Rechazar
                </button>
                <button
                    on:click={acceptCookies}
                    class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/20 transition-colors"
                >
                    <Check class="w-4 h-4" />
                    Aceptar Todo
                </button>
            </div>
        </div>
    </div>
{/if}
