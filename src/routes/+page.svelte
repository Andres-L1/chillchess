<script lang="ts">
    import { audioStore, setVibe, type VibePreset } from "$lib/audio/store";
    import AuthModal from "$lib/components/AuthModal.svelte";
    import { userStore, logout } from "$lib/auth/userStore";

    let showAuthModal = false;

    const RELEASES = [
        {
            id: "noir",
            title: "Ciudad Noir",
            artist: "Originales ChillChess",
            cover: "/assets/images/covers/noir.png",
            tag: "Popular",
            price: "Gratis",
            description: "Lluvia cyberpunk para concentración profunda.",
        },
        {
            id: "library",
            title: "Biblioteca Gran Maestro",
            artist: "Colección Clásica",
            cover: "/assets/images/covers/library.png",
            tag: "Nuevo",
            price: "Gratis",
            description: "Chimenea acogedora y libros antiguos.",
        },
        {
            id: "zen",
            title: "Jardín Zen",
            artist: "Flujo Oriental",
            cover: "/assets/images/covers/zen.png",
            tag: "Relax",
            price: "Gratis",
            description: "Sonidos de naturaleza y flauta suave.",
        },
    ];

    function enterSanctuary(vibeId: string) {
        setVibe(vibeId as VibePreset);
    }

    function openAuth() {
        showAuthModal = true;
    }
</script>

<AuthModal show={showAuthModal} on:close={() => (showAuthModal = false)} />

<div
    class="min-h-screen bg-[#F3EFE9] text-[#4A4A4A] font-poppins overflow-x-hidden"
>
    <!-- Navbar Responsive -->
    <nav
        class="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-6 max-w-7xl mx-auto gap-4"
    >
        <div class="flex items-center gap-2">
            <span
                class="text-2xl font-bold tracking-tight text-[#2D2D2D] hover:scale-105 transition-transform cursor-default"
                >ChillChess</span
            >
            <span
                class="text-xs uppercase bg-[#E5E0D8] px-2 py-1 rounded-md text-[#666]"
                >Beta v2.0</span
            >
        </div>

        <!-- Mobile Links -->
        <div
            class="flex gap-4 md:gap-6 text-sm font-medium text-[#666] overflow-x-auto max-w-full px-2 items-center"
        >
            <button
                class="hover:text-black transition-colors whitespace-nowrap bg-transparent border-none cursor-pointer"
                >Lanzamientos</button
            >
            <button
                class="hover:text-black transition-colors whitespace-nowrap bg-transparent border-none cursor-pointer"
                >Artistas</button
            >
            <button
                class="hover:text-black transition-colors whitespace-nowrap bg-transparent border-none cursor-pointer"
                >Tienda</button
            >

            {#if $userStore.isLoggedIn}
                <button
                    on:click={logout}
                    class="ml-2 text-red-500 hover:text-red-700 whitespace-nowrap transition-colors bg-transparent border-none cursor-pointer"
                    >Salir</button
                >
            {:else}
                <button
                    on:click={openAuth}
                    class="ml-2 hover:text-black whitespace-nowrap transition-colors bg-transparent border-none cursor-pointer"
                    >Acceso</button
                >
            {/if}
        </div>

        <a
            href="/app"
            class="px-8 py-3 bg-[#1a1a1a] text-white rounded-full text-sm font-bold tracking-wide hover:bg-black transition-all hover:scale-105 shadow-xl hover:shadow-2xl active:scale-95 w-full md:w-auto text-center flex items-center justify-center gap-2"
        >
            <span>✨</span> Entrar al Santuario
        </a>
    </nav>

    <!-- Hero Section -->
    <header
        class="px-4 md:px-8 py-12 md:py-24 max-w-7xl mx-auto text-center space-y-6 md:space-y-8 animate-fade-in"
    >
        <h1
            class="text-4xl md:text-7xl font-bold text-[#1a1a1a] tracking-tighter leading-[1.1]"
        >
            Santuarios Visuales <br />
            <span
                class="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7B3D] to-[#FFB347]"
                >De Ajedrez</span
            >
        </h1>
        <p
            class="text-base md:text-xl text-[#666] max-w-2xl mx-auto font-light leading-relaxed"
        >
            Experiencias atmosféricas curadas para alcanzar el estado de flujo. <br
                class="hidden md:block"
            />
            Elige tu ambiente y domina el tablero.
        </p>
    </header>

    <!-- New Releases Grid -->
    <main class="px-4 md:px-8 pb-20 max-w-7xl mx-auto">
        <div
            class="flex justify-between items-end mb-8 border-b border-[#Ddd] pb-4"
        >
            <h2 class="text-xl md:text-3xl font-bold text-[#1a1a1a]">
                Colección Premium
            </h2>
            <button
                class="text-xs font-semibold text-[#666] border border-[#ccc] px-5 py-2.5 rounded-full hover:bg-white hover:border-[#aaa] transition-all hover:shadow-sm cursor-pointer"
                >VER TODO</button
            >
        </div>

        <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10"
        >
            {#each RELEASES as release}
                <div class="group relative flex flex-col gap-4">
                    <!-- Album Cover Card -->
                    <div
                        class="relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 cursor-pointer bg-gray-200"
                    >
                        <img
                            src={release.cover}
                            alt={release.title}
                            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                        />

                        <!-- Overlay on Hover -->
                        <div
                            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]"
                        >
                            <a
                                href="/app"
                                on:click={() => enterSanctuary(release.id)}
                                class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-110 active:scale-95 transition-transform text-black pl-1"
                            >
                                ▶
                            </a>
                        </div>

                        <!-- Tag -->
                        <div
                            class="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-black shadow-sm"
                        >
                            {release.tag}
                        </div>
                        <!-- Price Tag -->
                        <div
                            class="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                        >
                            {release.price}
                        </div>
                    </div>

                    <!-- Meta Info -->
                    <div class="space-y-1 px-1">
                        <h3
                            class="font-bold text-xl text-[#1a1a1a] group-hover:text-[#FF7B3D] transition-colors leading-tight"
                        >
                            {release.title}
                        </h3>
                        <p class="text-sm font-medium text-[#666]">
                            {release.artist}
                        </p>
                        <p
                            class="text-xs text-[#888] mt-2 font-light line-clamp-2 leading-relaxed"
                        >
                            {release.description}
                        </p>
                    </div>
                </div>
            {/each}

            <!-- Coming Soon Placeholder -->
            <div
                class="group relative flex flex-col gap-4 opacity-40 hover:opacity-60 transition-all grayscale"
            >
                <div
                    class="relative aspect-square rounded-2xl overflow-hidden bg-[#E5E0D8] flex items-center justify-center border-2 border-dashed border-[#ccc] group-hover:border-[#999] transition-colors"
                >
                    <div class="text-center space-y-2">
                        <span class="text-4xl block">☕</span>
                        <span
                            class="text-[#999] font-bold uppercase tracking-widest text-xs block"
                            >Próximamente</span
                        >
                    </div>
                </div>
                <div class="space-y-1 px-1">
                    <h3 class="font-bold text-xl text-[#1a1a1a]">Lo-Fi Café</h3>
                    <p class="text-sm text-[#666]">Originales ChillChess</p>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-[#1a1a1a] text-white py-16 mt-12">
        <div
            class="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left"
        >
            <div class="space-y-2">
                <h4 class="font-bold text-xl">ChillChess</h4>
                <p class="text-sm text-white/40">
                    &copy; 2025 ChillChess. Todos los derechos reservados.
                </p>
            </div>
            <div class="flex gap-8 text-sm font-medium">
                <button
                    class="text-white/40 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                    >Instagram</button
                >
                <button
                    class="text-white/40 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                    >Twitter</button
                >
                <button
                    class="text-white/40 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                    >Discord</button
                >
            </div>
        </div>
    </footer>
</div>
