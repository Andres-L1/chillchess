<script lang="ts">
    import { audioStore, setVibe } from "$lib/audio/store";

    const RELEASES = [
        {
            id: "noir",
            title: "Noir City",
            artist: "ChillChess Originals",
            cover: "/assets/images/covers/noir.png",
            tag: "Popular",
            price: "Free",
            description: "Rainy cyberpunk vibes for deep focus.",
        },
        {
            id: "library",
            title: "Grandmaster Library",
            artist: "Classic Collection",
            cover: "/assets/images/covers/library.png",
            tag: "New",
            price: "Free",
            description: "Cozy fireplace and old books.",
        },
        {
            id: "zen",
            title: "Zen Garden",
            artist: "Eastern Flow",
            cover: "/assets/images/covers/zen.png",
            tag: "Relaxing",
            price: "Free",
            description: "Peaceful nature sounds and flute.",
        },
    ];

    function enterSanctuary(vibeId: string) {
        // Set the vibe before entering
        // @ts-ignore
        setVibe(vibeId);
    }
</script>

<div
    class="min-h-screen bg-[#F3EFE9] text-[#4A4A4A] font-poppins overflow-y-auto"
>
    <!-- Navbar -->
    <nav class="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div class="flex items-center gap-2">
            <span class="text-2xl font-bold tracking-tight text-[#2D2D2D]"
                >ChillChess</span
            >
            <span
                class="text-xs uppercase bg-[#E5E0D8] px-2 py-1 rounded-md text-[#666]"
                >Beta v2.0</span
            >
        </div>
        <div class="flex gap-6 text-sm font-medium text-[#666]">
            <a href="#" class="hover:text-black transition-colors">Releases</a>
            <a href="#" class="hover:text-black transition-colors">Artists</a>
            <a href="#" class="hover:text-black transition-colors">Merch</a>
        </div>
        <a
            href="/app"
            class="px-5 py-2 bg-[#2D2D2D] text-white rounded-full text-sm font-medium hover:bg-black transition-all hover:scale-105 shadow-lg"
        >
            Enter Sanctuary
        </a>
    </nav>

    <!-- Hero Section -->
    <header class="px-8 py-12 max-w-7xl mx-auto text-center space-y-4">
        <h1 class="text-5xl font-bold text-[#2D2D2D] tracking-tight">
            Visual Sanctuaries
        </h1>
        <p class="text-lg text-[#666] max-w-2xl mx-auto font-light">
            Curated atmospheric experiences for chess, study, and deep work. <br
            />
            Select a vibe to begin your session.
        </p>
    </header>

    <!-- New Releases Grid -->
    <main class="px-8 pb-20 max-w-7xl mx-auto">
        <div
            class="flex justify-between items-end mb-8 border-b border-[#Ddd] pb-4"
        >
            <h2 class="text-2xl font-bold text-[#2D2D2D]">New Releases</h2>
            <button
                class="text-xs font-semibold text-[#666] border border-[#ccc] px-4 py-2 rounded hover:bg-white transition-colors"
                >SEE ALL</button
            >
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {#each RELEASES as release}
                <div class="group relative flex flex-col gap-4">
                    <!-- Album Cover Card -->
                    <div
                        class="relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 cursor-pointer"
                    >
                        <img
                            src={release.cover}
                            alt={release.title}
                            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        <!-- Overlay on Hover -->
                        <div
                            class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"
                        >
                            <a
                                href="/app"
                                on:click={() => enterSanctuary(release.id)}
                                class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-110 transition-transform text-black pl-1"
                            >
                                ▶
                            </a>
                        </div>

                        <!-- Tag -->
                        <div
                            class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-black shadow-sm"
                        >
                            {release.tag}
                        </div>
                    </div>

                    <!-- Meta Info -->
                    <div class="space-y-1">
                        <h3
                            class="font-bold text-lg text-[#2D2D2D] group-hover:text-[#FF7B3D] transition-colors"
                        >
                            {release.title}
                        </h3>
                        <p class="text-sm text-[#666]">{release.artist}</p>
                        <p class="text-xs text-[#999] mt-2 font-light">
                            {release.description}
                        </p>
                    </div>
                </div>
            {/each}

            <!-- Coming Soon Placeholder -->
            <div
                class="group relative flex flex-col gap-4 opacity-50 grayscale hover:grayscale-0 transition-all"
            >
                <div
                    class="relative aspect-square rounded-xl overflow-hidden bg-[#E5E0D8] flex items-center justify-center border-2 border-dashed border-[#ccc]"
                >
                    <span class="text-[#999] font-medium">Coming Soon</span>
                </div>
                <div class="space-y-1">
                    <h3 class="font-bold text-lg text-[#2D2D2D]">Lo-Fi Café</h3>
                    <p class="text-sm text-[#666]">ChillChess Premium</p>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-[#2D2D2D] text-white py-12">
        <div
            class="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6"
        >
            <div class="text-sm text-white/60">
                &copy; 2024 ChillChess. All rights reserved.
            </div>
            <div class="flex gap-6">
                <a
                    href="#"
                    class="text-white/60 hover:text-white transition-colors"
                    >Instagram</a
                >
                <a
                    href="#"
                    class="text-white/60 hover:text-white transition-colors"
                    >Twitter</a
                >
                <a
                    href="#"
                    class="text-white/60 hover:text-white transition-colors"
                    >Discord</a
                >
            </div>
        </div>
    </footer>
</div>

<style>
    /* Remove default scrollbar for clean look */
    ::-webkit-scrollbar {
        width: 0px;
        background: transparent;
    }
</style>
