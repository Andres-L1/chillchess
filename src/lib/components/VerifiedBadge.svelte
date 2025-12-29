<script lang="ts">
    export let size: "sm" | "md" | "lg" | "xl" = "md";
    export let showTooltip = true;

    const sizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6", // Slightly bigger for profiles
        xl: "w-12 h-12", // Giant for success modals
    };
</script>

<div
    class="inline-flex items-center justify-center relative group select-none"
    role="img"
    aria-label="Verificado"
>
    <!-- Glow Effect (Background) -->
    <div
        class="absolute inset-0 bg-primary-500 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500"
    ></div>

    <!-- Main Badge SVG -->
    <svg
        class="{sizes[
            size
        ]} relative z-10 transition-transform duration-300 ease-out group-hover:scale-110 drop-shadow-sm"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient
                id="goldGradient-{size}"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
            >
                <stop offset="0%" stop-color="#FFD700" />
                <!-- Pure Gold -->
                <stop offset="50%" stop-color="#FDB931" />
                <!-- Mid Gold -->
                <stop offset="100%" stop-color="#FF8C00" />
                <!-- Deep Orange -->
            </linearGradient>
        </defs>

        <!-- Star/Rosette Shape (Background) -->
        <path
            d="M12 2C13.2 2 14.2 2.8 14.6 3.8C15.6 3.6 16.7 4.1 17.2 5C18.2 5.4 18.6 6.5 18.5 7.6C19.5 8.2 20 9.3 19.8 10.4C20.6 11.3 20.6 12.7 19.8 13.6C20 14.7 19.5 15.8 18.5 16.4C18.6 17.5 18.2 18.6 17.2 19C16.7 19.9 15.6 20.4 14.6 20.2C14.2 21.2 13.2 22 12 22C10.8 22 9.8 21.2 9.4 20.2C8.4 20.4 7.3 19.9 6.8 19C5.8 18.6 5.4 17.5 5.5 16.4C4.5 15.8 4 14.7 4.2 13.6C3.4 12.7 3.4 11.3 4.2 10.4C4 9.3 4.5 8.2 5.5 7.6C5.4 6.5 5.8 5.4 6.8 5C7.3 4.1 8.4 3.6 9.4 3.8C9.8 2.8 10.8 2 12 2Z"
            fill="url(#goldGradient-{size})"
            stroke="white"
            stroke-width="0.5"
            stroke-opacity="0.2"
        />

        <!-- Shine Effect (Overlay) -->
        <path
            d="M12 2C13.2 2 14.2 2.8 14.6 3.8C15.6 3.6 16.7 4.1 17.2 5C18.2 5.4 18.6 6.5 18.5 7.6C19.5 8.2 20 9.3 19.8 10.4C20.6 11.3 20.6 12.7 19.8 13.6C20 14.7 19.5 15.8 18.5 16.4C18.6 17.5 18.2 18.6 17.2 19C16.7 19.9 15.6 20.4 14.6 20.2C14.2 21.2 13.2 22 12 22C10.8 22 9.8 21.2 9.4 20.2C8.4 20.4 7.3 19.9 6.8 19C5.8 18.6 5.4 17.5 5.5 16.4C4.5 15.8 4 14.7 4.2 13.6C3.4 12.7 3.4 11.3 4.2 10.4C4 9.3 4.5 8.2 5.5 7.6C5.4 6.5 5.8 5.4 6.8 5C7.3 4.1 8.4 3.6 9.4 3.8C9.8 2.8 10.8 2 12 2Z"
            fill="white"
            fill-opacity="0.1"
        />

        <!-- Checkmark -->
        <path
            d="M8.5 12L11 14.5L15.5 9.5"
            stroke="white"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            filter="drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
        />
    </svg>

    <!-- Sparkle Decoration (Only for large sizes) -->
    {#if size === "lg" || size === "xl"}
        <div
            class="absolute -top-1 -right-1 text-yellow-300 animate-pulse text-[10px]"
        >
            ✨
        </div>
    {/if}

    <!-- Tooltip -->
    {#if showTooltip}
        <div
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-primary-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none shadow-xl z-50"
        >
            ARTISTA OFICIAL
            <div
                class="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-black/90"
            ></div>
        </div>
    {/if}
</div>
