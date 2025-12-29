<script lang="ts">
    export let size: "sm" | "md" | "lg" | "xl" = "md";
    export let showTooltip = true;

    const sizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
        xl: "w-8 h-8",
    };
</script>

<div
    class="inline-flex items-center justify-center relative group select-none"
    role="img"
    aria-label="Fundador"
>
    <!-- Glow -->
    <div
        class="absolute inset-0 bg-purple-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500"
    ></div>

    <svg
        class="{sizes[
            size
        ]} relative z-10 drop-shadow-sm transition-transform group-hover:scale-110"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient
                id="founderGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
            >
                <stop offset="0%" stop-color="#C084FC" />
                <!-- Purple 400 -->
                <stop offset="100%" stop-color="#A855F7" />
                <!-- Purple 500 -->
            </linearGradient>
        </defs>

        <!-- Diamond Shape -->
        <path
            d="M12 2L2 12L12 22L22 12L12 2Z"
            fill="url(#founderGradient)"
            stroke="white"
            stroke-width="1.5"
            stroke-opacity="0.3"
        />

        <!-- Inner F or Star -->
        <path
            d="M12 7L13.5 10.5L17 12L13.5 13.5L12 17L10.5 13.5L7 12L10.5 10.5L12 7Z"
            fill="white"
        />
    </svg>

    {#if showTooltip}
        <div
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black/90 backdrop-blur-md border border-purple-500/30 rounded-full text-[10px] font-bold text-purple-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none shadow-xl z-50 uppercase tracking-wider"
        >
            Fundador
        </div>
    {/if}
</div>
