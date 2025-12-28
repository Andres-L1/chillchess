<script lang="ts">
    import { onMount } from "svelte";
    import { userStore } from "$lib/auth/userStore";
    import { goto } from "$app/navigation";
    import { db, storage } from "$lib/firebase";
    import { collection, addDoc, serverTimestamp } from "firebase/firestore";
    import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
    import { userSubscription } from "$lib/subscription/userSubscription";
    import PaywallModal from "$lib/components/PaywallModal.svelte";

    let uploading = false;
    let uploadProgress = 0;
    let showPaywall = false;
    let currentStep = 1;

    // Check PRO status
    $: isPro =
        $userSubscription.tier === "pro" ||
        $userSubscription.tier === "premium";

    // Form Data
    let releaseTitle = "";
    let genre = "Lo-fi Hip Hop";
    let customGenre = "";
    let coverFile: File | null = null;
    let coverPreview: string | null = null;

    interface TrackInput {
        id: string;
        title: string;
        file: File | null;
    }

    let tracks: TrackInput[] = [
        { id: Math.random().toString(36), title: "", file: null },
    ];

    onMount(() => {
        if (!$userStore.user) {
            goto("/login");
        }
    });

    function handleCoverSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                alert("La portada no puede superar los 5MB");
                return;
            }
            coverFile = file;
            const reader = new FileReader();
            reader.onload = (e) => (coverPreview = e.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    function addTrack() {
        tracks = [
            ...tracks,
            { id: Math.random().toString(36), title: "", file: null },
        ];
    }

    function removeTrack(index: number) {
        if (tracks.length > 1) {
            tracks = tracks.filter((_, i) => i !== index);
        }
    }

    function handleAudioSelect(e: Event, index: number) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            if (file.type !== "audio/mpeg" && !file.name.endsWith(".mp3")) {
                alert("Solo se admiten archivos MP3");
                return;
            }
            if (file.size > 20 * 1024 * 1024) {
                alert("El archivo de audio no puede superar los 20MB");
                return;
            }
            tracks[index].file = file;

            if (!tracks[index].title) {
                tracks[index].title = file.name
                    .replace(".mp3", "")
                    .replace(/_/g, " ");
            }
        }
    }

    function canProceedToStep(step: number): boolean {
        if (step === 2) {
            // Para avanzar AL paso 2, solo necesitamos título y género
            const hasValidGenre =
                genre !== "Otra" ||
                (genre === "Otra" && customGenre.trim() !== "");
            return releaseTitle.trim() !== "" && hasValidGenre;
        }
        if (step === 3) {
            // Para avanzar AL paso 3, necesitamos la portada
            return coverFile !== null;
        }
        // Para enviar (desde paso 3), necesitamos todos los tracks
        return tracks.every((t) => t.title && t.file);
    }

    async function submitRelease() {
        if (
            !releaseTitle.trim() ||
            !coverFile ||
            tracks.some((t) => !t.title || !t.file)
        ) {
            alert("Por favor completa todos los campos");
            return;
        }

        if (!confirm("¿Estás seguro de enviar esta música para revisión?"))
            return;

        uploading = true;
        uploadProgress = 10;

        try {
            const userId = $userStore.user?.uid;
            const timestamp = Date.now();
            const basePath = `submissions/${userId}/${timestamp}`;

            const coverRef = ref(
                storage,
                `${basePath}/cover_${coverFile.name}`,
            );
            await uploadBytes(coverRef, coverFile);
            const coverUrl = await getDownloadURL(coverRef);
            uploadProgress = 30;

            const processedTracks = [];
            let completedTracks = 0;

            for (const track of tracks) {
                if (!track.file) continue;

                const trackRef = ref(
                    storage,
                    `${basePath}/tracks/${track.file.name}`,
                );
                await uploadBytes(trackRef, track.file);
                const audioUrl = await getDownloadURL(trackRef);

                processedTracks.push({
                    title: track.title,
                    url: audioUrl,
                    duration: 0,
                    fileName: track.file.name,
                });

                completedTracks++;
                uploadProgress = 30 + (completedTracks / tracks.length) * 50;
            }

            await addDoc(collection(db, "musicSubmissions"), {
                artistId: userId,
                artistName: $userStore.user?.displayName || "Unknown Artist",
                artistEmail: $userStore.user?.email,
                releaseTitle,
                genre: genre === "Otra" ? customGenre : genre,
                coverUrl,
                tracks: processedTracks,
                status: "pending",
                submittedAt: serverTimestamp(),
            });

            uploadProgress = 100;
            alert("✅ ¡Música enviada con éxito! La revisaremos pronto.");
            goto("/artist");
        } catch (e: any) {
            console.error("Error upload:", e);
            alert("Error al subir contenido: " + e.message);
        } finally {
            uploading = false;
        }
    }
</script>

{#if !isPro}
    <div
        class="min-h-screen bg-[#0B1120] text-white font-poppins p-4 flex items-center justify-center"
    >
        <div
            class="text-center max-w-md bg-[#1a1a1a] p-8 rounded-2xl border border-white/10 shadow-2xl"
        >
            <div
                class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-primary-500/20"
            >
                🔒
            </div>
            <h1 class="text-2xl font-bold mb-2">Acceso Reservado</h1>
            <p class="text-slate-400 mb-6">
                El envío de música para A&R es una función exclusiva para
                nuestros miembros <span class="text-primary-400 font-bold"
                    >PRO</span
                >.
            </p>
            <div class="space-y-3">
                <button
                    on:click={() => (showPaywall = true)}
                    class="w-full py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
                >
                    Desbloquear Acceso
                </button>
                <a
                    href="/"
                    class="block text-sm text-slate-500 hover:text-white"
                    >Volver al Inicio</a
                >
            </div>
        </div>
        <PaywallModal
            show={showPaywall}
            on:close={() => (showPaywall = false)}
        />
    </div>
{:else}
    <div
        class="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#0f1729] to-[#0B1120] text-white font-poppins p-4 md:p-8"
    >
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <a
                        href="/"
                        class="text-slate-400 hover:text-white mb-2 inline-flex items-center gap-2 text-sm"
                    >
                        <span>←</span> Volver
                    </a>
                    <h1
                        class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent"
                    >
                        Enviar Música
                    </h1>
                    <p class="text-slate-400 text-sm mt-1">
                        Comparte tu arte con la comunidad ChillChess
                    </p>
                </div>
                <span
                    class="hidden md:block bg-primary-500/10 text-primary-400 px-4 py-2 rounded-xl text-sm font-bold border border-primary-500/20"
                >
                    ✨ PRO ONLY
                </span>
            </div>

            <!-- Progress Steps -->
            <div
                class="flex items-center justify-between mb-8 bg-[#1a1a1a]/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5"
            >
                {#each [1, 2, 3] as step}
                    <div class="flex items-center {step < 3 ? 'flex-1' : ''}">
                        <div class="flex flex-col items-center">
                            <div
                                class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all {currentStep ===
                                step
                                    ? 'bg-primary-500 text-white scale-110 shadow-lg shadow-primary-500/50'
                                    : currentStep > step
                                      ? 'bg-primary-600 text-white'
                                      : 'bg-white/10 text-slate-500'}"
                            >
                                {currentStep > step ? "✓" : step}
                            </div>
                            <span
                                class="text-xs mt-2 {currentStep >= step
                                    ? 'text-white'
                                    : 'text-slate-500'}"
                            >
                                {step === 1
                                    ? "Info"
                                    : step === 2
                                      ? "Portada"
                                      : "Tracks"}
                            </span>
                        </div>
                        {#if step < 3}
                            <div
                                class="flex-1 h-0.5 mx-2 {currentStep > step
                                    ? 'bg-green-500'
                                    : 'bg-white/10'} transition-all"
                            ></div>
                        {/if}
                    </div>
                {/each}
            </div>

            <!-- Important Notice -->
            <div
                class="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-xl p-4 mb-6 backdrop-blur-xl"
            >
                <div class="flex items-start gap-3">
                    <span class="text-2xl">📢</span>
                    <div class="flex-1 text-sm space-y-1">
                        <p class="text-white font-bold">
                            Información Importante
                        </p>
                        <ul class="text-slate-300 space-y-1 text-xs">
                            <li>
                                • Debes poseer el 100% de los derechos de autor
                            </li>
                            <li>
                                • <span class="text-yellow-400 font-medium"
                                    >La publicación no está garantizada</span
                                > - Seleccionamos solo lo que encaje con nuestra
                                vibe
                            </li>
                            <li>
                                • Si es aprobada, recibirás verificación ✓ y
                                aparecerás en el feed global
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Step 1: Basic Info -->
            {#if currentStep === 1}
                <div
                    class="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 space-y-6 animate-fade-in"
                >
                    <h2 class="text-xl font-bold flex items-center gap-2">
                        <span class="text-2xl">📝</span> Información del Lanzamiento
                    </h2>

                    <div class="grid md:grid-cols-2 gap-6">
                        <div class="md:col-span-2">
                            <span
                                class="block text-sm font-medium mb-2 text-slate-300"
                                >Título del Álbum o Single</span
                            >
                            <input
                                type="text"
                                bind:value={releaseTitle}
                                placeholder="Ej. Midnight Lofi Sessions"
                                class="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        <div class="md:col-span-2">
                            <span
                                class="block text-sm font-medium mb-2 text-slate-300"
                                >Género Principal</span
                            >
                            <select
                                bind:value={genre}
                                class="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option>Lo-fi Hip Hop</option>
                                <option>Jazz Hop</option>
                                <option>Chillhop</option>
                                <option>Ambient</option>
                                <option>Chillout</option>
                                <option>Downtempo</option>
                                <option>Piano Solo</option>
                                <option>Synthwave</option>
                                <option>Vaporwave</option>
                                <option>Study Beats</option>
                                <option>Instrumental Hip Hop</option>
                                <option>Trip Hop</option>
                                <option>Otra</option>
                            </select>
                        </div>

                        {#if genre === "Otra"}
                            <div class="md:col-span-2 animate-fade-in">
                                <span
                                    class="block text-sm font-medium mb-2 text-slate-300"
                                >
                                    Especifica el género
                                </span>
                                <input
                                    type="text"
                                    bind:value={customGenre}
                                    placeholder="Ej. Jazzy Lo-fi, Neo-Soul..."
                                    class="w-full bg-[#0B1120] border border-primary-500/30 rounded-xl px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                />
                            </div>
                        {/if}
                    </div>

                    <!-- Validation feedback -->
                    {#if releaseTitle.trim() === ""}
                        <div
                            class="text-sm text-slate-400 flex items-center gap-2"
                        >
                            <span class="text-red-400">○</span> Ingresa un título
                            para continuar
                        </div>
                    {:else if genre === "Otra" && customGenre.trim() === ""}
                        <div
                            class="text-sm text-slate-400 flex items-center gap-2"
                        >
                            <span class="text-red-400">○</span> Especifica el género
                            personalizado
                        </div>
                    {:else}
                        <div
                            class="text-sm text-primary-400 flex items-center gap-2"
                        >
                            <span>✓</span> Listo para continuar
                        </div>
                    {/if}

                    <button
                        on:click={() => (currentStep = 2)}
                        disabled={releaseTitle.trim() === "" ||
                            (genre === "Otra" && customGenre.trim() === "")}
                        class="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary-900/20"
                    >
                        Continuar →
                    </button>
                </div>
            {/if}

            <!-- Step 2: Cover -->
            {#if currentStep === 2}
                <div
                    class="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 space-y-6 animate-fade-in"
                >
                    <h2 class="text-xl font-bold flex items-center gap-2">
                        <span class="text-2xl">🎨</span> Portada del Álbum
                    </h2>

                    <div class="flex flex-col md:flex-row gap-6 items-start">
                        <div
                            class="w-full md:w-64 aspect-square bg-[#0B1120] rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-primary-500/50 transition-all"
                        >
                            {#if coverPreview}
                                <img
                                    src={coverPreview}
                                    alt="Preview"
                                    class="w-full h-full object-cover"
                                />
                                <div
                                    class="absolute inset-0 bg-black/70 flex flex-col gap-2 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span class="text-2xl">📷</span>
                                    <span class="text-sm">Cambiar</span>
                                </div>
                            {:else}
                                <div class="text-center p-6">
                                    <span class="text-4xl mb-2 block">🖼️</span>
                                    <p class="text-sm text-slate-400">
                                        Haz clic para subir
                                    </p>
                                </div>
                            {/if}
                            <input
                                type="file"
                                accept="image/*"
                                class="absolute inset-0 opacity-0 cursor-pointer"
                                on:change={handleCoverSelect}
                            />
                        </div>

                        <div class="flex-1 space-y-3">
                            <h3 class="font-bold text-white">
                                Requisitos de la Imagen
                            </h3>
                            <ul class="text-sm text-slate-400 space-y-2">
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> Formato
                                    cuadrado (1:1)
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> Mínimo
                                    1000x1000px
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> JPG o PNG
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> Máximo
                                    5MB
                                </li>
                            </ul>
                            {#if coverPreview}
                                <div
                                    class="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3 text-primary-400 text-sm flex items-center gap-2"
                                >
                                    <span>✓</span> Portada cargada correctamente
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button
                            on:click={() => (currentStep = 1)}
                            class="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
                        >
                            ← Atrás
                        </button>
                        <button
                            on:click={() => (currentStep = 3)}
                            disabled={!coverFile}
                            class="flex-1 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary-900/20"
                        >
                            Continuar →
                        </button>
                    </div>
                </div>
            {/if}

            <!-- Step 3: Tracks -->
            {#if currentStep === 3}
                <div
                    class="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 space-y-6 animate-fade-in"
                >
                    <div class="flex justify-between items-center">
                        <h2 class="text-xl font-bold flex items-center gap-2">
                            <span class="text-2xl">🎵</span> Canciones ({tracks.length})
                        </h2>
                        <button
                            on:click={addTrack}
                            class="px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                        >
                            <span>+</span> Añadir
                        </button>
                    </div>

                    <div class="space-y-4">
                        {#each tracks as track, i (track.id)}
                            <div
                                class="bg-[#0B1120] p-4 rounded-xl border border-white/5 relative group hover:border-primary-500/20 transition-all"
                            >
                                <div class="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <span
                                            class="block text-xs font-medium mb-2 text-slate-400 flex items-center gap-2"
                                        >
                                            <span
                                                class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs"
                                                >{i + 1}</span
                                            >
                                            Archivo MP3
                                        </span>
                                        <div class="relative">
                                            <input
                                                type="file"
                                                accept=".mp3,audio/mpeg"
                                                class="block w-full text-xs text-slate-400
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-lg file:border-0
                                                file:text-xs file:font-semibold
                                                file:bg-primary-500/10 file:text-primary-400
                                                hover:file:bg-primary-500/20 file:cursor-pointer file:transition-all"
                                                on:change={(e) =>
                                                    handleAudioSelect(e, i)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <span
                                            class="block text-xs font-medium mb-2 text-slate-400"
                                        >
                                            Título
                                        </span>
                                        <input
                                            type="text"
                                            bind:value={track.title}
                                            placeholder="Nombre de la canción"
                                            class="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {#if tracks.length > 1}
                                    <button
                                        on:click={() => removeTrack(i)}
                                        class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        title="Eliminar"
                                    >
                                        ✕
                                    </button>
                                {/if}
                            </div>
                        {/each}
                    </div>

                    <div class="flex gap-3">
                        <button
                            on:click={() => (currentStep = 2)}
                            class="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
                        >
                            ← Atrás
                        </button>
                        <button
                            on:click={submitRelease}
                            disabled={uploading || !canProceedToStep(3)}
                            class="flex-1 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg shadow-lg shadow-primary-900/20 transition-all flex items-center justify-center gap-3"
                        >
                            {#if uploading}
                                <div
                                    class="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"
                                ></div>
                                <span
                                    >Subiendo {Math.round(
                                        uploadProgress,
                                    )}%...</span
                                >
                            {:else}
                                <span>🚀 Enviar para Revisión</span>
                            {/if}
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-fade-in {
        animation: fade-in 0.3s ease-out;
    }
</style>
