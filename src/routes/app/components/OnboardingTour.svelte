<script lang="ts">
    import { fly, fade } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let currentStep = 0;
    export let isVisible = true;

    interface TourStep {
        title: string;
        description: string;
        target: string; // CSS selector del elemento destacado
        position: 'top' | 'bottom' | 'left' | 'right';
        icon: string;
    }

    const steps: TourStep[] = [
        {
            title: '¡Bienvenido a ChillChess App! 🎯',
            description:
                'Este es tu espacio personal de productividad. Aquí podrás crear y seguir hábitos, gestionar tareas y mantenerte enfocado mientras disfrutas de música lofi.',
            target: '',
            position: 'bottom',
            icon: '👋',
        },
        {
            title: 'Crea tus primeros hábitos',
            description:
                'Haz clic en "Nuevo Hábito" para empezar. Puedes crear hábitos diarios como ejercicio, lectura, o cualquier rutina que quieras establecer.',
            target: '[data-tour="new-habit"]',
            position: 'bottom',
            icon: '✨',
        },
        {
            title: 'Marca tus progresos',
            description:
                'Cada día, marca tus hábitos completados. Las rachas (streaks) te motivarán a mantener la consistencia.',
            target: '[data-tour="habits-list"]',
            position: 'right',
            icon: '🔥',
        },
        {
            title: 'Activa recordatorios',
            description:
                'Configura notificaciones para que te recordemos tus hábitos incluso cuando cierres la web. Solo necesitas dar permiso de notificaciones.',
            target: '[data-tour="notification-btn"]',
            position: 'left',
            icon: '🔔',
        },
        {
            title: 'Visualiza tus estadísticas',
            description:
                'En la parte superior verás tu racha total y hábitos activos. ¡Compite contigo mismo!',
            target: '[data-tour="stats"]',
            position: 'bottom',
            icon: '📊',
        },
        {
            title: '¡Listo para empezar!',
            description:
                'Recuerda: la consistencia es la clave. Pequeños pasos cada día crean grandes resultados. ¡Mucho éxito! 🚀',
            target: '',
            position: 'bottom',
            icon: '🎉',
        },
    ];

    $: currentStepData = steps[currentStep];
    $: isLastStep = currentStep === steps.length - 1;
    $: isFirstStep = currentStep === 0;

    function nextStep() {
        if (currentStep < steps.length - 1) {
            currentStep++;
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
        }
    }

    function skipTour() {
        dispatch('complete');
        isVisible = false;
    }

    function completeTour() {
        dispatch('complete');
        isVisible = false;
    }

    // Calcular posición del spotlight
    function getTargetRect(selector: string) {
        if (!selector) return null;
        const el = document.querySelector(selector);
        if (!el) return null;
        return el.getBoundingClientRect();
    }

    $: targetRect = currentStepData.target ? getTargetRect(currentStepData.target) : null;
</script>

{#if isVisible}
    <!-- Overlay oscuro -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
        transition:fade={{ duration: 300 }}
        on:click={skipTour}
    ></div>

    <!-- Spotlight highlight (si hay target) -->
    {#if targetRect}
        <div
            class="fixed z-[9999] pointer-events-none"
            style="
                top: {targetRect.top - 8}px;
                left: {targetRect.left - 8}px;
                width: {targetRect.width + 16}px;
                height: {targetRect.height + 16}px;
                box-shadow: 0 0 0 4px rgba(255, 123, 61, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.7);
                border-radius: 12px;
            "
            transition:fly={{ duration: 400 }}
        ></div>
    {/if}

    <!-- Tooltip flotante -->
    <div
        class="fixed z-[10000] w-full md:w-auto md:max-w-md px-4 md:px-0"
        style="
            {targetRect && window.innerWidth >= 768
            ? currentStepData.position === 'bottom'
                ? `top: ${targetRect.bottom + 20}px; left: ${targetRect.left + targetRect.width / 2}px; transform: translateX(-50%);`
                : currentStepData.position === 'right'
                  ? `top: ${targetRect.top}px; left: ${targetRect.right + 20}px;`
                  : currentStepData.position === 'left'
                    ? `top: ${targetRect.top}px; right: ${window.innerWidth - targetRect.left + 20}px;`
                    : `bottom: ${window.innerHeight - targetRect.top + 20}px; left: ${targetRect.left + targetRect.width / 2}px; transform: translateX(-50%);`
            : 'top: auto; bottom: 20px; left: 0; right: 0; transform: none;'} 
        "
        transition:fly={{ y: 20, duration: 400 }}
    >
        <div
            class="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary-500/30 rounded-2xl p-4 md:p-6 shadow-2xl max-w-full"
        >
            <!-- Progreso -->
            <div class="flex items-center gap-2 mb-4">
                {#each steps as _, i}
                    <div
                        class="h-1 flex-1 rounded-full transition-all duration-300 {i <= currentStep
                            ? 'bg-primary-500'
                            : 'bg-white/10'}"
                    ></div>
                {/each}
            </div>

            <!-- Icono -->
            <div class="text-4xl md:text-5xl mb-2 md:mb-3 text-center animate-bounce-subtle">
                {currentStepData.icon}
            </div>

            <!-- Contenido -->
            <h3 class="text-lg md:text-xl font-bold text-white mb-2 text-center">
                {currentStepData.title}
            </h3>
            <p class="text-slate-300 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 text-center">
                {currentStepData.description}
            </p>

            <!-- Controles -->
            <div
                class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 md:gap-3"
            >
                <button
                    on:click={skipTour}
                    class="px-4 py-2 text-slate-400 hover:text-white transition-colors text-xs md:text-sm font-medium order-2 md:order-1"
                >
                    Saltar tutorial
                </button>

                <div class="flex gap-2 order-1 md:order-2">
                    {#if !isFirstStep}
                        <button
                            on:click={prevStep}
                            class="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white font-medium text-xs md:text-sm"
                        >
                            ← <span class="hidden md:inline">Anterior</span>
                        </button>
                    {/if}

                    {#if isLastStep}
                        <button
                            on:click={completeTour}
                            class="flex-1 md:flex-none px-6 py-2.5 md:py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-all shadow-lg shadow-primary-500/25 text-white font-bold text-xs md:text-sm"
                        >
                            ¡Empezar! 🚀
                        </button>
                    {:else}
                        <button
                            on:click={nextStep}
                            class="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-all shadow-lg shadow-primary-500/25 text-white font-bold text-xs md:text-sm"
                        >
                            <span class="hidden md:inline">Siguiente</span> →
                        </button>
                    {/if}
                </div>
            </div>

            <!-- Contador -->
            <div class="text-center mt-2 md:mt-3 text-[10px] md:text-xs text-slate-500">
                Paso {currentStep + 1} de {steps.length}
            </div>
        </div>
    </div>
{/if}

<style>
    @keyframes bounce-subtle {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-5px);
        }
    }
    .animate-bounce-subtle {
        animation: bounce-subtle 2s ease-in-out infinite;
    }
</style>
