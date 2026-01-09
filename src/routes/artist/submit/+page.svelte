<script lang="ts">
    import { onMount } from 'svelte';
    import { userStore } from '$lib/auth/userStore';
    import { goto } from '$app/navigation';
    import { db } from '$lib/firebase';
    import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
    import { userSubscription } from '$lib/subscription/userSubscription';
    import PaywallModal from '$lib/components/PaywallModal.svelte';
    import { toast } from '$lib/stores/notificationStore';

    let uploading = false;
    let uploadProgress = 0;
    let uploadStage = '';
    let showPaywall = false;
    let currentStep = 1;

    // Check PRO status and Verified status
    $: isPro = $userSubscription.tier === 'pro';
    $: isVerified = $userSubscription.profile?.isVerified || false;

    // Form Data
    let releaseTitle = '';
    let genre = 'Lo-fi Hip Hop';
    let customGenre = '';
    let category: 'musica' | 'juegos' | 'ambiente' = 'musica';
    let coverFile: File | null = null;
    let coverPreview: string | null = null;

    // Audio Files
    interface AudioFile {
        file: File;
        title: string;
        preview?: string;
        duration?: number;
    }
    let audioFiles: AudioFile[] = [];

    // Helper to get duration
    function getAudioDuration(url: string): Promise<number> {
        return new Promise((resolve) => {
            const audio = new Audio(url);
            audio.onloadedmetadata = () => {
                if (audio.duration === Infinity) {
                    audio.currentTime = 1e101;
                    audio.ontimeupdate = () => {
                        audio.ontimeupdate = null;
                        resolve(audio.duration);
                        audio.currentTime = 0;
                    };
                } else {
                    resolve(audio.duration);
                }
            };
            audio.onerror = () => resolve(0);
        });
    }

    // Drag & Drop States
    let coverDragging = false;
    let audioDragging = false;

    onMount(() => {
        if (!$userStore.user) {
            goto('/');
        }
    });

    // Cover Upload Handlers
    function handleCoverSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            processCoverFile(input.files[0]);
        }
    }

    function handleCoverDrop(e: DragEvent) {
        e.preventDefault();
        coverDragging = false;
        const file = e.dataTransfer?.files[0];
        if (file && file.type.startsWith('image/')) {
            processCoverFile(file);
        } else {
            toast.warning('Por favor sube solo archivos de imagen');
        }
    }

    function processCoverFile(file: File) {
        validateAndSetCover(file);
    }

    function validateAndSetCover(file: File) {
        if (file.size > 5 * 1024 * 1024) {
            toast.warning('La portada no puede superar los 5MB');
            return;
        }
        coverFile = file;
        const reader = new FileReader();
        reader.onload = (e) => (coverPreview = e.target?.result as string);
        reader.readAsDataURL(file);
    }

    // Audio Upload Handlers
    async function handleAudioSelect(e: Event) {
        const target = e.target as HTMLInputElement;
        if (!target.files) return;

        const files = Array.from(target.files);
        const validFiles = files.filter((file) => {
            if (file.size > 1000 * 1024 * 1024) {
                toast.warning(`${file.name} es demasiado grande (Máx 1GB).`);
                return false;
            }
            if (!file.type.startsWith('audio/')) {
                toast.warning(`${file.name} no es un archivo de audio válido.`);
                return false;
            }
            return true;
        });

        const newFiles = await Promise.all(
            validFiles.map(async (file) => {
                const preview = URL.createObjectURL(file);
                const duration = await getAudioDuration(preview);
                return {
                    file,
                    title: file.name.replace(/\.(mp3|wav|m4a)$/i, ''),
                    preview,
                    duration,
                };
            })
        );

        audioFiles = [...audioFiles, ...newFiles];
    }

    function handleAudioDrop(e: DragEvent) {
        e.preventDefault();
        audioDragging = false;
        const files = e.dataTransfer?.files;
        if (files) {
            // processAudioFiles(Array.from(files)); // This function is removed, logic moved to handleAudioSelect
            // Re-using handleAudioSelect logic for drop
            const input = { files: Array.from(files) } as unknown as HTMLInputElement;
            handleAudioSelect({ target: input } as unknown as Event);
        }
    }

    function removeAudioFile(index: number) {
        audioFiles = audioFiles.filter((_, i) => i !== index);
    }

    function updateTrackTitle(index: number, newTitle: string) {
        audioFiles[index].title = newTitle;
    }

    // Reactive validation for each step
    $: hasValidGenre = genre !== 'Otra' || (genre === 'Otra' && customGenre.trim() !== '');
    $: canProceedFromStep1 = releaseTitle.trim() !== '' && hasValidGenre;
    $: canProceedFromStep2 = coverFile !== null;
    $: canProceedFromStep3 = audioFiles.length > 0;

    async function uploadToR2WithProgress(
        file: File,
        folder: string,
        onProgress?: (percent: number) => void
    ) {
        const user = $userStore.user;
        if (!user) {
            console.error('❌ No user found in userStore');
            throw new Error('Usuario no autenticado');
        }

        // Get Firebase ID token
        console.log('🔑 Getting Firebase ID token for upload...');
        const token = await user.getIdToken();
        console.log('✅ Token obtained successfully');

        // Step 1: Get presigned URL from server
        console.log('📝 Requesting presigned URL for:', file.name);
        const presignRes = await fetch('/api/r2/sign-url', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                folder,
            }),
        });

        if (!presignRes.ok) {
            const errData = await presignRes.json();
            throw new Error(errData.error || `Failed to get upload URL (${presignRes.status})`);
        }

        const { uploadUrl, key } = await presignRes.json();
        console.log('✅ Got presigned URL, uploading directly to R2...');

        // Step 2: Upload directly to R2 using presigned URL
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.timeout = 600000; // 10 minutes

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const percent = (e.loaded / e.total) * 100;
                    onProgress(percent);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    console.log('✅ Upload successful to R2');
                    resolve({ key, name: file.name, size: file.size, type: file.type });
                } else {
                    let errorMsg = `Upload failed (${xhr.status})`;
                    try {
                        const res = JSON.parse(xhr.responseText);
                        if (res.error) {
                            errorMsg = res.error;
                            if (res.code) errorMsg += ` (${res.code})`;
                        }
                    } catch (e) {
                        // ignore
                    }
                    console.error(`❌ Upload failed:`, errorMsg);
                    reject(new Error(errorMsg));
                }
            });

            xhr.addEventListener('error', () => {
                console.error('❌ Network error during upload');
                reject(new Error('Error de red al subir archivo. Verifica tu conexión.'));
            });

            xhr.addEventListener('timeout', () => {
                console.error('❌ Upload timeout for file:', file.name);
                reject(
                    new Error('El archivo tardó demasiado. Intenta con un archivo más pequeño.')
                );
            });

            // FORCE Content-Type based on extension for iOS compatibility
            const ext = file.name.split('.').pop()?.toLowerCase();
            let contentType = file.type;

            // Map common extensions to correct MIME types
            const mimeMap: Record<string, string> = {
                mp3: 'audio/mpeg',
                wav: 'audio/wav',
                m4a: 'audio/mp4',
                aac: 'audio/aac',
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                webp: 'image/webp',
            };

            if (ext && mimeMap[ext]) {
                contentType = mimeMap[ext];
                console.log(`🔧 Forcing Content-Type for ${file.name}: ${contentType}`);
            }

            xhr.open('PUT', uploadUrl);
            xhr.setRequestHeader('Content-Type', contentType);
            xhr.send(file);
        });
    }

    async function submitRelease() {
        if (!releaseTitle.trim() || !coverFile || audioFiles.length === 0) {
            toast.warning(
                'Por favor completa todos los campos y sube al menos un archivo de audio'
            );
            return;
        }

        const confirmMsg = isVerified
            ? '¿Publicar este álbum? Se publicará inmediatamente.'
            : '¿Enviar esta música para revisión?';
        if (!confirm(confirmMsg)) return;

        uploading = true;
        uploadProgress = 0;

        try {
            const userId = $userStore.user?.uid;
            const timestamp = Date.now();

            // Step 1: Upload Cover
            uploadStage = 'Subiendo portada...';
            const coverData: any = await uploadToR2WithProgress(
                coverFile,
                'submissions',
                (p) => (uploadProgress = p * 0.3)
            );

            // Step 2: Upload Audio Files
            uploadStage = 'Subiendo archivos de audio...';
            const uploadedAudio = [];
            const totalFiles = audioFiles.length;

            for (let i = 0; i < totalFiles; i++) {
                const audioFile = audioFiles[i];
                uploadStage = `Subiendo ${audioFile.title} (${i + 1}/${totalFiles})...`;

                const fileData = (await uploadToR2WithProgress(
                    audioFile.file,
                    'submissions',
                    (p) => {
                        const base = 30 + (i / totalFiles) * 60;
                        uploadProgress = base + (p / totalFiles) * 60;
                    }
                )) as { key: string; name: string; size: number; type: string };

                uploadedAudio.push({
                    key: fileData.key,
                    name: fileData.name,
                    size: fileData.size,
                    type: fileData.type,
                    title: audioFile.title,
                });

                // Add delay between uploads to avoid rate limiting
                if (i < totalFiles - 1) {
                    uploadStage = `Esperando... (${i + 1}/${totalFiles})`;
                    await new Promise((resolve) => setTimeout(resolve, 800));
                }
            }

            //  BIFURCATION: Verified vs Non-Verified Flow
            if (isVerified) {
                // AUTO-PUBLISH for verified artists
                uploadStage = '🚀 Publicando álbum...';
                uploadProgress = 95;

                const autoPublishRes = await fetch('/api/albums/auto-publish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        albumData: {
                            artistName: $userStore.user?.displayName || 'Unknown',
                            albumTitle: releaseTitle.trim(),
                            genre: genre === 'Otra' ? customGenre.trim() : genre,
                            albumCategory: category, // Use existing category variable
                            coverUrl: null,
                            tracks: uploadedAudio.map((a, idx) => ({
                                title: a.title,
                                r2Key: a.key,
                            })),
                        },
                        files: [coverData, ...uploadedAudio],
                    }),
                });

                if (!autoPublishRes.ok) {
                    const errData = await autoPublishRes.json();

                    // FALLBACK: If auto-publish fails, create submission
                    if (errData.requiresReview) {
                        uploadStage = 'Guardando en revisión...';
                        if (!userId) throw new Error('User ID not found');
                        await createSubmission(userId, coverData, uploadedAudio);
                        toast.warning('⚠️ Enviado para revisión manual.');
                    } else {
                        throw new Error(errData.error || 'Error al publicar');
                    }
                } else {
                    const result = await autoPublishRes.json();
                    uploadProgress = 100;
                    uploadStage = '¡Publicado!';
                    toast.success('🎉 ¡Álbum publicado exitosamente!');

                    setTimeout(() => {
                        goto(`/album/${result.albumId}`);
                    }, 1500);
                    return;
                }
            } else {
                // STANDARD SUBMISSION for non-verified
                uploadStage = 'Guardando información...';
                uploadProgress = 95;

                if (!userId) throw new Error('User ID not found');
                await createSubmission(userId, coverData, uploadedAudio);
                toast.success('✅ ¡Música enviada! La revisaremos pronto.');
            }

            uploadProgress = 100;
            uploadStage = '¡Completado!';

            setTimeout(() => {
                goto('/artist');
            }, 1500);
        } catch (e: any) {
            console.error('Error upload:', e);
            toast.error('Error al enviar: ' + e.message);
        } finally {
            uploading = false;
        }
    }

    // Helper to create submission (shared for both fallback and non-verified)
    async function createSubmission(userId: string, coverData: any, uploadedAudio: any[]) {
        await addDoc(collection(db, 'musicSubmissions'), {
            userId,
            artistId: userId,
            artistName: $userStore.user?.displayName || 'Unknown',
            releaseTitle: releaseTitle.trim(),
            genre: genre === 'Otra' ? customGenre.trim() : genre,
            category,
            r2CoverKey: coverData.key,
            r2AudioKeys: uploadedAudio,
            tracklist: audioFiles.map((f) => f.title).join('\n'),
            submissionType: 'r2_direct',
            status: 'pending',
            submittedAt: serverTimestamp(),
        });
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
        class="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#0f1729] to-[#0B1120] text-white font-poppins p-4 md:p-8 pb-32"
    >
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <a
                        href="/artist"
                        class="text-slate-400 hover:text-white mb-2 inline-flex items-center gap-2 text-sm py-2 px-1 -ml-1 group"
                    >
                        <span class="group-hover:-translate-x-1 transition-transform">←</span> Volver
                        al Panel
                    </a>
                    <h1
                        class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent"
                    >
                        Enviar Música
                    </h1>
                    <p class="text-slate-400 text-sm mt-1">
                        {#if isVerified}
                            <span class="text-green-400 font-semibold">✓ Verificado</span> - Tu álbum
                            se publicará inmediatamente
                        {:else}
                            Comparte tu arte con la comunidad ChillChess
                        {/if}
                    </p>
                </div>
                <div class="hidden md:flex flex-col items-end gap-2">
                    <span
                        class="bg-primary-500/10 text-primary-400 px-4 py-2 rounded-xl text-sm font-bold border border-primary-500/20"
                    >
                        ✨ PRO ONLY
                    </span>
                    {#if isVerified}
                        <span
                            class="bg-green-500/10 text-green-400 px-4 py-2 rounded-xl text-xs font-bold border border-green-500/20 animate-pulse"
                        >
                            🚀 PUBLICACIÓN INSTANTÁNEA
                        </span>
                    {/if}
                </div>
            </div>

            <!-- Progress Steps -->
            <div
                class="flex items-center justify-between mb-8 bg-[#1a1a1a]/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/5"
            >
                {#each [1, 2, 3] as step}
                    <div class="flex items-center {step < 3 ? 'flex-1' : ''}">
                        <div class="flex flex-col items-center">
                            <div
                                class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all {currentStep ===
                                step
                                    ? 'bg-primary-500 text-white scale-110 shadow-lg shadow-primary-500/50'
                                    : currentStep > step
                                      ? 'bg-green-500 text-white'
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

                    <div class="space-y-6">
                        <div>
                            <label
                                for="release-title"
                                class="block text-sm font-medium mb-2 text-slate-300"
                            >
                                Título del Álbum o Single
                            </label>
                            <input
                                id="release-title"
                                type="text"
                                bind:value={releaseTitle}
                                placeholder="Ej. Midnight Lofi Sessions"
                                class="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                            />
                        </div>

                        <div>
                            <label
                                for="genre-select"
                                class="block text-sm font-medium mb-2 text-slate-300"
                            >
                                Género Principal
                            </label>
                            <select
                                id="genre-select"
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
                            <div class="animate-fade-in">
                                <label
                                    for="custom-genre"
                                    class="block text-sm font-medium mb-2 text-slate-300"
                                >
                                    Especifica el género
                                </label>
                                <input
                                    id="custom-genre"
                                    type="text"
                                    bind:value={customGenre}
                                    placeholder="Ej. Future Garage"
                                    class="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                />
                            </div>
                        {/if}

                        <div>
                            <span class="block text-sm font-medium mb-2 text-slate-300">
                                Tipo de Contenido
                            </span>
                            <div class="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    on:click={() => (category = 'musica')}
                                    class="p-3 rounded-xl border-2 transition-all {category ===
                                    'musica'
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'}"
                                >
                                    <div class="text-2xl mb-1">🎵</div>
                                    <div class="text-xs font-medium">Música</div>
                                </button>
                                <button
                                    type="button"
                                    on:click={() => (category = 'juegos')}
                                    class="p-3 rounded-xl border-2 transition-all {category ===
                                    'juegos'
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'}"
                                >
                                    <div class="text-2xl mb-1">🎮</div>
                                    <div class="text-xs font-medium">Juegos</div>
                                </button>
                                <button
                                    type="button"
                                    on:click={() => (category = 'ambiente')}
                                    class="p-3 rounded-xl border-2 transition-all {category ===
                                    'ambiente'
                                        ? 'border-green-500 bg-green-500/10'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'}"
                                >
                                    <div class="text-2xl mb-1">🌿</div>
                                    <div class="text-xs font-medium">Ambiente</div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        on:click={() => (currentStep = 2)}
                        disabled={!canProceedFromStep1}
                        class="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary-900/20"
                    >
                        Continuar →
                    </button>
                </div>
            {/if}

            <!-- Step 2: Cover Art -->
            {#if currentStep === 2}
                <div
                    class="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 space-y-6 animate-fade-in"
                >
                    <h2 class="text-xl font-bold flex items-center gap-2">
                        <span class="text-2xl">🖼️</span> Portada del Álbum
                    </h2>

                    <div class="grid md:grid-cols-2 gap-6">
                        <!-- Cover Upload -->
                        <div
                            role="button"
                            tabindex="0"
                            aria-label="Upload cover image by clicking or dragging"
                            class="relative aspect-square bg-[#0B1120] rounded-xl overflow-hidden border-2 border-dashed transition-all {coverDragging
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-white/20 hover:border-primary-500/50'} group cursor-pointer"
                            on:dragover|preventDefault={() => (coverDragging = true)}
                            on:dragleave={() => (coverDragging = false)}
                            on:drop={handleCoverDrop}
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
                                <div
                                    class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                                >
                                    <span class="text-4xl mb-2 block">🖼️</span>
                                    <p class="text-sm text-slate-400">Arrastra o haz clic</p>
                                    <p class="text-xs text-slate-500 mt-1">Máx 5MB</p>
                                </div>
                            {/if}
                            <input
                                type="file"
                                accept="image/*"
                                class="absolute inset-0 opacity-0 cursor-pointer"
                                on:change={handleCoverSelect}
                            />
                        </div>

                        <!-- Requirements -->
                        <div class="flex flex-col justify-center space-y-3">
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
                                    class="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm flex items-center gap-2"
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
                            disabled={!canProceedFromStep2}
                            class="flex-1 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary-900/20"
                        >
                            Continuar →
                        </button>
                    </div>
                </div>
            {/if}

            <!-- Step 3: Audio Files -->
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

                    <!-- Audio Upload Zone -->
                    {#if audioFiles.length === 0}
                        <div
                            role="button"
                            tabindex="0"
                            aria-label="Upload audio files by clicking or dragging"
                            class="relative border-2 border-dashed rounded-xl p-12 transition-all {audioDragging
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-white/20 hover:border-primary-500/50'} bg-[#0B1120]/50 text-center"
                            on:dragover|preventDefault={() => (audioDragging = true)}
                            on:dragleave={() => (audioDragging = false)}
                            on:drop={handleAudioDrop}
                        >
                            <input
                                type="file"
                                multiple
                                accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
                                on:change={handleAudioSelect}
                                class="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div class="space-y-3">
                                <div class="text-5xl">🎧</div>
                                <p class="text-white font-medium">
                                    Arrastra archivos de audio aquí
                                </p>
                                <p class="text-sm text-slate-400">o haz clic para seleccionar</p>
                                <p class="text-xs text-slate-500">
                                    MP3, WAV, M4A • Máx 1GB por archivo
                                </p>
                            </div>
                        </div>
                    {:else}
                        <!-- Track List -->
                        <div class="space-y-3">
                            {#each audioFiles as audio, i}
                                <div
                                    class="bg-[#0B1120] border border-white/10 rounded-xl p-4 flex items-center gap-4 group hover:border-primary-500/30 transition-all"
                                >
                                    <div class="text-2xl text-slate-400 w-8 text-center">
                                        {i + 1}
                                    </div>

                                    <div class="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            bind:value={audio.title}
                                            on:input={(e) =>
                                                updateTrackTitle(i, e.currentTarget.value)}
                                            class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                        />
                                        {#if audio.preview}
                                            <audio
                                                src={audio.preview}
                                                controls
                                                class="w-full h-8 rounded"
                                            />
                                        {/if}
                                    </div>

                                    <button
                                        on:click={() => removeAudioFile(i)}
                                        class="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Eliminar"
                                    >
                                        <svg
                                            class="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            {/each}

                            <!-- Add More Button -->
                            <div class="relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
                                    on:change={handleAudioSelect}
                                    class="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <button
                                    class="w-full py-3 border-2 border-dashed border-white/20 hover:border-primary-500 rounded-xl text-slate-400 hover:text-white transition-all font-medium"
                                >
                                    + Agregar más archivos
                                </button>
                            </div>
                        </div>
                    {/if}

                    <div class="flex gap-3">
                        <button
                            on:click={() => (currentStep = 2)}
                            class="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
                        >
                            ← Atrás
                        </button>
                        <button
                            on:click={submitRelease}
                            disabled={!canProceedFromStep3 || uploading}
                            class="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-900/20"
                        >
                            {#if uploading}
                                Subiendo...
                            {:else if isVerified}
                                🚀 Publicar Álbum
                            {:else}
                                📤 Enviar para Revisión
                            {/if}
                        </button>
                    </div>
                </div>
            {/if}

            <!-- Upload Progress Overlay -->
            {#if uploading}
                <div
                    class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                >
                    <div
                        class="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8 max-w-md w-full space-y-6"
                    >
                        <div class="text-center space-y-2">
                            <div class="text-4xl mb-4 animate-bounce">📤</div>
                            <h3 class="text-xl font-bold">{uploadStage}</h3>
                            <p class="text-sm text-slate-400">No cierres esta ventana</p>
                        </div>

                        <!-- Progress Bar -->
                        <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-400">Progreso</span>
                                <span class="text-primary-400 font-bold">{uploadProgress}%</span>
                            </div>
                            <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    class="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out"
                                    style="width: {uploadProgress}%"
                                ></div>
                            </div>
                        </div>
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
