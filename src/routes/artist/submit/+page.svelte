<script lang="ts">
    import { onMount } from 'svelte';
    import { userStore } from '$lib/auth/userStore';
    import { goto } from '$app/navigation';
    import { db, storage } from '$lib/firebase';
    import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
    import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
    import { userSubscription } from '$lib/subscription/userSubscription';
    import PaywallModal from '$lib/components/PaywallModal.svelte';
    import { toast } from '$lib/stores/notificationStore';

    let uploading = false;
    let uploadProgress = 0;
    let showPaywall = false;
    let currentStep = 1;

    // Check PRO status
    $: isPro = $userSubscription.tier === 'pro';

    // Form Data
    let releaseTitle = '';
    let genre = 'Lo-fi Hip Hop';
    let customGenre = '';
    let coverFile: File | null = null;
    let coverPreview: string | null = null;

    // Audio Files (Direct Upload)
    let audioFiles: File[] = [];
    let tracklist = '';

    onMount(() => {
        if (!$userStore.user) {
            goto('/');
        }
    });

    function handleCoverSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                toast.warning('La portada no puede superar los 5MB');
                return;
            }
            coverFile = file;
            const reader = new FileReader();
            reader.onload = (e) => (coverPreview = e.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    function handleAudioSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files) {
            audioFiles = Array.from(input.files);
            // Auto-generate tracklist from filenames
            tracklist = audioFiles
                .map((file, idx) => `${idx + 1}. ${file.name.replace(/\.(mp3|wav|m4a)$/i, '')}`)
                .join('\n');
        }
    }

    function canProceedToStep(step: number): boolean {
        if (step === 2) {
            const hasValidGenre =
                genre !== 'Otra' || (genre === 'Otra' && customGenre.trim() !== '');
            return releaseTitle.trim() !== '' && hasValidGenre;
        }
        if (step === 3) {
            return coverFile !== null;
        }
        return audioFiles.length > 0;
    }

    async function uploadToR2(file: File, folder: string) {
        // 1. Get Signed URL
        const res = await fetch('/api/r2/sign-url', {
            method: 'POST',
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                folder,
            }),
        });

        if (!res.ok) throw new Error('Failed to get upload URL');

        const { uploadUrl, key } = await res.json();

        // 2. Upload direct to R2
        const upload = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        if (!upload.ok) throw new Error('Upload to R2 failed');

        return { key, name: file.name, size: file.size, type: file.type };
    }

    async function submitRelease() {
        if (!releaseTitle.trim() || !coverFile || audioFiles.length === 0) {
            toast.warning(
                'Por favor completa todos los campos y sube al menos un archivo de audio'
            );
            return;
        }

        if (!confirm('¿Estás seguro de enviar esta música para revisión?')) return;

        uploading = true;
        uploadProgress = 5;

        try {
            const userId = $userStore.user?.uid;
            const timestamp = Date.now();
            const basePath = `submissions/${userId}/${timestamp}`;

            // Upload Cover to R2
            const coverData = await uploadToR2(coverFile, basePath);
            uploadProgress = 20;

            // Upload Audio Files to R2
            const uploadedAudio = [];
            const totalFiles = audioFiles.length;

            for (let i = 0; i < audioFiles.length; i++) {
                const file = audioFiles[i];
                const data = await uploadToR2(file, basePath);
                uploadedAudio.push(data);
                uploadProgress = 20 + ((i + 1) / totalFiles) * 70;
            }

            // Save Metadata to Firestore
            // We save the 'key' (path in R2) instead of the full URL
            // because we'll generate timed URLs for privacy or simply construct the public URL if public.
            await addDoc(collection(db, 'musicSubmissions'), {
                artistId: userId,
                artistName: $userStore.user?.displayName || 'Unknown Artist',
                artistEmail: $userStore.user?.email,
                releaseTitle,
                genre: genre === 'Otra' ? customGenre : genre,
                r2CoverKey: coverData.key,
                r2AudioKeys: uploadedAudio, // Array of { key, name, size }
                tracklist: tracklist.trim(),
                submissionType: 'r2_direct',
                status: 'pending',
                submittedAt: serverTimestamp(),
            });

            uploadProgress = 100;
            toast.success('✅ ¡Música enviada con éxito! La revisaremos pronto.');
            goto('/artist');
        } catch (e: any) {
            console.error('Error upload:', e);
            toast.error('Error al enviar: ' + e.message);
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
                El envío de música para A&R es una función exclusiva para nuestros miembros <span
                    class="text-primary-400 font-bold">PRO</span
                >.
            </p>
            <div class="space-y-3">
                <button
                    on:click={() => (showPaywall = true)}
                    class="w-full py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
                >
                    Desbloquear Acceso
                </button>
                <a href="/" class="block text-sm text-slate-500 hover:text-white"
                    >Volver al Inicio</a
                >
            </div>
        </div>
        <PaywallModal show={showPaywall} on:close={() => (showPaywall = false)} />
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
                        href="/artist"
                        class="text-slate-400 hover:text-white mb-2 inline-flex items-center gap-2 text-sm py-2 px-1 -ml-1"
                    >
                        <span>←</span> Volver al Panel
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
                                {currentStep > step ? '✓' : step}
                            </div>
                            <span
                                class="text-xs mt-2 {currentStep >= step
                                    ? 'text-white'
                                    : 'text-slate-500'}"
                            >
                                {step === 1 ? 'Info' : step === 2 ? 'Portada' : 'Tracks'}
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
                        <p class="text-white font-bold">Información Importante</p>
                        <ul class="text-slate-300 space-y-1 text-xs">
                            <li>• Debes poseer el 100% de los derechos de autor</li>
                            <li>
                                • <span class="text-yellow-400 font-medium"
                                    >La publicación no está garantizada</span
                                > - Seleccionamos solo lo que encaje con nuestra vibe
                            </li>
                            <li>
                                • Si es aprobada, recibirás verificación ✓ y aparecerás en el feed
                                global
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
                            <span class="block text-sm font-medium mb-2 text-slate-300"
                                >Título del Álbum o Single</span
                            >
                            <input
                                type="text"
                                bind:value={releaseTitle}
                                placeholder="Ej. Midnight Lofi Sessions"
                                class="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                            />
                        </div>

                        <div class="md:col-span-2">
                            <span class="block text-sm font-medium mb-2 text-slate-300"
                                >Género Principal</span
                            >
                            <select
                                bind:value={genre}
                                class="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
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

                        {#if genre === 'Otra'}
                            <div class="md:col-span-2 animate-fade-in">
                                <span class="block text-sm font-medium mb-2 text-slate-300">
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
                    {#if releaseTitle.trim() === ''}
                        <div class="text-sm text-slate-400 flex items-center gap-2">
                            <span class="text-red-400">○</span> Ingresa un título para continuar
                        </div>
                    {:else if genre === 'Otra' && customGenre.trim() === ''}
                        <div class="text-sm text-slate-400 flex items-center gap-2">
                            <span class="text-red-400">○</span> Especifica el género personalizado
                        </div>
                    {:else}
                        <div class="text-sm text-primary-400 flex items-center gap-2">
                            <span>✓</span> Listo para continuar
                        </div>
                    {/if}

                    <button
                        on:click={() => (currentStep = 2)}
                        disabled={releaseTitle.trim() === '' ||
                            (genre === 'Otra' && customGenre.trim() === '')}
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
                                    <p class="text-sm text-slate-400">Haz clic para subir</p>
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
                            <h3 class="font-bold text-white">Requisitos de la Imagen</h3>
                            <ul class="text-sm text-slate-400 space-y-2">
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> Formato cuadrado (1:1)
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> Mínimo 1000x1000px
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> JPG o PNG
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> Máximo 5MB
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

            <!-- Step 3: Download Link & Tracklist -->
            {#if currentStep === 3}
                <div
                    class="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 space-y-6 animate-fade-in"
                >
                    <div class="flex flex-col gap-2">
                        <h2 class="text-xl font-bold flex items-center gap-2">
                            <span class="text-2xl">🎵</span> Archivos de Audio
                        </h2>
                        <p class="text-sm text-slate-400">
                            Sube tus archivos de audio en formato MP3, WAV o M4A
                        </p>
                    </div>

                    <div class="space-y-6">
                        <!-- Audio File Upload -->
                        <div>
                            <label
                                for="audio-files"
                                class="block text-sm font-medium mb-2 text-slate-300"
                            >
                                Archivos de Audio (Arrastra o haz click)
                            </label>
                            <div
                                class="relative border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-primary-500 transition-all bg-[#0B1120]/50"
                            >
                                <input
                                    id="audio-files"
                                    type="file"
                                    multiple
                                    accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
                                    on:change={handleAudioSelect}
                                    class="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div class="text-center">
                                    <span class="text-4xl mb-2 block">🎧</span>
                                    {#if audioFiles.length > 0}
                                        <p class="text-primary-400 font-bold mb-2">
                                            ✓ {audioFiles.length} archivo(s) seleccionado(s)
                                        </p>
                                        <ul class="text-xs text-slate-400 space-y-1">
                                            {#each audioFiles as file}
                                                <li>
                                                    {file.name} ({(file.size / 1024 / 1024).toFixed(
                                                        2
                                                    )} MB)
                                                </li>
                                            {/each}
                                        </ul>
                                    {:else}
                                        <p class="text-sm text-slate-400">
                                            Arrastra archivos aquí o haz clic para seleccionar
                                        </p>
                                    {/if}
                                </div>
                            </div>
                        </div>

                        <!-- Tracklist Textarea -->
                        <div>
                            <label
                                for="tracklist"
                                class="block text-sm font-medium mb-2 text-slate-300"
                            >
                                Lista de Canciones (Tracklist)
                            </label>
                            <textarea
                                id="tracklist"
                                bind:value={tracklist}
                                placeholder="1. Intro - 2:30&#10;2. Midnight Vibes - 3:45&#10;3. ..."
                                rows="6"
                                class="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none font-mono text-sm"
                            ></textarea>
                            <p class="text-xs text-slate-500 mt-2">
                                Escribe el nombre de las canciones en orden.
                            </p>
                        </div>
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
                            disabled={uploading || audioFiles.length === 0}
                            class="flex-1 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg shadow-lg shadow-primary-900/20 transition-all flex items-center justify-center gap-3"
                        >
                            {#if uploading}
                                <div
                                    class="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"
                                ></div>
                                <span>Enviando...</span>
                            {:else}
                                <span>🚀 Finalizar Envío</span>
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
