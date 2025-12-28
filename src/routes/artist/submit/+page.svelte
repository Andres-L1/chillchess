<script lang="ts">
    import { onMount } from "svelte";
    import { userStore } from "$lib/auth/userStore";
    import { goto } from "$app/navigation";
    import { db, storage } from "$lib/firebase";
    import { collection, addDoc, serverTimestamp } from "firebase/firestore";
    import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
    import { userSubscription } from "$lib/subscription/userSubscription";
    import PaywallModal from "$lib/components/PaywallModal.svelte";

    let loading = false;
    let uploading = false;
    let uploadProgress = 0;
    let showPaywall = false;

    // Check PRO status
    $: isPro =
        $userSubscription.tier === "pro" ||
        $userSubscription.tier === "premium";

    // Form Data
    let releaseTitle = "";
    let genre = "Lo-fi";
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

    function triggerFileInput() {
        (
            document.querySelector("input[type=file]") as HTMLInputElement
        )?.click();
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
                // 20MB limit
                alert("El archivo de audio no puede superar los 20MB");
                return;
            }
            tracks[index].file = file;

            // Auto-fill title if empty
            if (!tracks[index].title) {
                tracks[index].title = file.name
                    .replace(".mp3", "")
                    .replace(/_/g, " ");
            }
        }
    }

    async function submitRelease() {
        if (
            !releaseTitle.trim() ||
            !coverFile ||
            tracks.some((t) => !t.title || !t.file)
        ) {
            alert(
                "Por favor completa todos los campos (Portada, Título, y archivos de audio)",
            );
            return;
        }

        if (
            !confirm(
                "¿Estás seguro de enviar esta música para revisión? Asegúrate de tener todos los derechos.",
            )
        )
            return;

        uploading = true;
        uploadProgress = 10; // Started

        try {
            const userId = $userStore.user?.uid;
            const timestamp = Date.now();
            const basePath = `submissions/${userId}/${timestamp}`;

            // 1. Upload Cover
            const coverRef = ref(
                storage,
                `${basePath}/cover_${coverFile.name}`,
            );
            await uploadBytes(coverRef, coverFile);
            const coverUrl = await getDownloadURL(coverRef);
            uploadProgress = 30;

            // 2. Upload Tracks
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
                    duration: 0, // Would need metadata parsing, skipping for now
                    fileName: track.file.name,
                });

                completedTracks++;
                uploadProgress = 30 + (completedTracks / tracks.length) * 50;
            }

            // 3. Save to Firestore
            await addDoc(collection(db, "musicSubmissions"), {
                artistId: userId,
                artistName: $userStore.user?.displayName || "Unknown Artist",
                artistEmail: $userStore.user?.email,
                releaseTitle,
                genre,
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
    <!-- PRO LOCK SCREEN -->
    <div
        class="min-h-screen bg-[#0B1120] text-white font-poppins p-4 flex items-center justify-center"
    >
        <div
            class="text-center max-w-md bg-[#1a1a1a] p-8 rounded-2xl border border-white/10 shadow-2xl"
        >
            <div
                class="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-purple-500/20"
            >
                🔒
            </div>
            <h1 class="text-2xl font-bold mb-2">Acceso Reservado</h1>
            <p class="text-slate-400 mb-6">
                El envío de música para A&R es una función exclusiva para
                nuestros miembros <span class="text-purple-400 font-bold"
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
                    href="/artist"
                    class="block text-sm text-slate-500 hover:text-white"
                    >Volver al Perfil</a
                >
            </div>
        </div>
        <PaywallModal
            show={showPaywall}
            on:close={() => (showPaywall = false)}
        />
    </div>
{:else}
    <!-- SUBMISSION FORM (PRO ONLY) -->
    <div class="min-h-screen bg-[#0B1120] text-white font-poppins p-4 md:p-8">
        <div class="max-w-2xl mx-auto">
            <!-- Header -->
            <a
                href="/artist"
                class="text-slate-400 hover:text-white mb-6 inline-flex items-center gap-2 text-sm"
            >
                <span>←</span> Volver al perfil
            </a>

            <div class="flex items-center justify-between mb-2">
                <h1 class="text-3xl font-bold">Enviar Música</h1>
                <span
                    class="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/20"
                    >PRO FEATURE</span
                >
            </div>

            <div
                class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8"
            >
                <h3 class="text-sm font-bold text-blue-400 mb-1">
                    📢 Información Importante
                </h3>
                <ul
                    class="text-xs text-slate-300 space-y-1 list-disc list-inside"
                >
                    <li>
                        Debes poseer el 100% de los derechos de autor de la
                        obra.
                    </li>
                    <li>
                        <span class="text-white font-medium"
                            >El envío NO garantiza la publicación.</span
                        > Nuestro equipo de curadores seleccionará solo lo que mejor
                        encaje con la vibe de ChillChess.
                    </li>
                    <li>
                        Si tu música es seleccionada, recibirás la verificación
                        y aparecerá en el feed global.
                    </li>
                </ul>
            </div>

            <div class="space-y-8">
                <!-- Global Info -->
                <div
                    class="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 space-y-4"
                >
                    <h2 class="text-lg font-bold border-b border-white/5 pb-2">
                        Información del Lanzamiento
                    </h2>

                    <div>
                        <h3
                            class="block text-sm font-medium mb-1 text-slate-300"
                        >
                            Título del Álbum / Single
                        </h3>
                        <input
                            type="text"
                            bind:value={releaseTitle}
                            placeholder="Ej. Midnight Thoughts"
                            class="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <h3
                            class="block text-sm font-medium mb-1 text-slate-300"
                        >
                            Género Principal
                        </h3>
                        <select
                            bind:value={genre}
                            class="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                        >
                            <option>Lo-fi Hip Hop</option>
                            <option>Jazz Hop</option>
                            <option>Ambient</option>
                            <option>Chillout</option>
                            <option>Piano Solo</option>
                            <option>Synthwave</option>
                        </select>
                    </div>

                    <!-- Cover Upload -->
                    <div>
                        <h3
                            class="block text-sm font-medium mb-2 text-slate-300"
                        >
                            Portada (Cuadrada, min 1000px)
                        </h3>
                        <div class="flex items-start gap-4">
                            <div
                                class="w-24 h-24 bg-[#0B1120] rounded-lg border border-dashed border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0 relative group"
                            >
                                {#if coverPreview}
                                    <img
                                        src={coverPreview}
                                        alt="Preview"
                                        class="w-full h-full object-cover"
                                    />
                                    <div
                                        class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span class="text-xs">Cambiar</span>
                                    </div>
                                {:else}
                                    <span class="text-2xl text-slate-600"
                                        >🖼️</span
                                    >
                                {/if}
                                <input
                                    type="file"
                                    accept="image/*"
                                    class="absolute inset-0 opacity-0 cursor-pointer"
                                    on:change={handleCoverSelect}
                                />
                            </div>
                            <div class="flex-1">
                                <p class="text-xs text-slate-500 mb-2">
                                    JPG o PNG, máx 5MB.
                                </p>
                                <button
                                    class="text-sm text-blue-400 hover:text-blue-300 font-medium"
                                    on:click={triggerFileInput}
                                >
                                    Seleccionar archivo...
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tracks -->
                <div
                    class="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 space-y-4"
                >
                    <div
                        class="flex justify-between items-center border-b border-white/5 pb-2"
                    >
                        <h2 class="text-lg font-bold">Listado de Canciones</h2>
                        <button
                            on:click={addTrack}
                            class="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                        >
                            + Añadir Pista
                        </button>
                    </div>

                    {#each tracks as track, i (track.id)}
                        <div
                            class="bg-[#0B1120] p-4 rounded-xl border border-white/5 relative group animate-fade-in"
                        >
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- File Input -->
                                <div>
                                    <h3
                                        class="block text-xs font-medium mb-1 text-slate-400"
                                    >
                                        Archivo MP3
                                    </h3>
                                    <input
                                        type="file"
                                        accept=".mp3,audio/mpeg"
                                        class="block w-full text-xs text-slate-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-xs file:font-semibold
                                        file:bg-blue-500/10 file:text-blue-400
                                        hover:file:bg-blue-500/20"
                                        on:change={(e) =>
                                            handleAudioSelect(e, i)}
                                    />
                                </div>

                                <!-- Title Input -->
                                <div>
                                    <h3
                                        class="block text-xs font-medium mb-1 text-slate-400"
                                    >
                                        Título de la Pista
                                    </h3>
                                    <input
                                        type="text"
                                        bind:value={track.title}
                                        placeholder="Nombre de la canción"
                                        class="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <!-- Remove Button -->
                            {#if tracks.length > 1}
                                <button
                                    on:click={() => removeTrack(i)}
                                    class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    title="Eliminar pista"
                                >
                                    ✕
                                </button>
                            {/if}
                        </div>
                    {/each}
                </div>

                <!-- Submit -->
                <button
                    on:click={submitRelease}
                    disabled={uploading}
                    class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-3"
                >
                    {#if uploading}
                        <div
                            class="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"
                        ></div>
                        <span>Subiendo {Math.round(uploadProgress)}%...</span>
                    {:else}
                        <span>🚀 Enviar Lanzamiento</span>
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}
