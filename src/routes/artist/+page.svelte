<script lang="ts">
    import { onMount } from 'svelte';
    import { userStore } from '$lib/auth/userStore';
    import { userSubscription } from '$lib/subscription/userSubscription';
    import { goto } from '$app/navigation';
    import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
    import { db } from '$lib/firebase';
    import type { ArtistProfile, SocialLink } from '$lib/types/artist';
    import { SOCIAL_PLATFORMS, DEFAULT_THEME_COLORS } from '$lib/types/artist';
    import ArtistCard from '$lib/components/ArtistCard.svelte';
    import { toast } from '$lib/stores/notificationStore';

    let loading = true;
    let saving = false;
    let profile: ArtistProfile | null = null;
    let isPro = false;

    // Form state
    let artistName = '';
    let bio = '';
    let avatarUrl = '';
    let bannerUrl = '';
    let themeColor = '#9333EA';
    let accentColor = '#A855F7';
    let socialLinks: SocialLink[] = [];

    // UI state
    let showPreview = false;
    let addingLink = false;
    let newLinkPlatform: any = 'spotify';
    let newLinkUrl = '';
    let newLinkLabel = '';

    // Badge preferences
    let showVerifiedBadge = true;
    let showFounderBadge = true;

    // Activity Heatmap
    let activityMap: Record<string, number> = {};
    let calendar: { date: string; count: number; intensity: number }[] = [];

    onMount(async () => {
        // Check auth
        if (!$userStore.user) {
            goto('/');
            return;
        }

        // Check if pro
        isPro = $userSubscription.tier === 'pro';

        // Load badge preferences from user profile (users collection)
        showVerifiedBadge = $userSubscription.profile?.showVerifiedBadge ?? true;
        showFounderBadge = $userSubscription.profile?.showFounderBadge ?? true;

        // Load existing profile
        try {
            const profileDoc = await getDoc(doc(db, 'artists', $userStore.user.uid));

            if (profileDoc.exists()) {
                profile = profileDoc.data() as ArtistProfile;
                // Populate form
                artistName = profile.artistName;
                bio = profile.bio;
                avatarUrl = profile.avatarUrl || '';
                bannerUrl = profile.bannerUrl || '';
                themeColor = profile.themeColor || '#9333EA';
                accentColor = profile.accentColor || '#A855F7';
                socialLinks = profile.socialLinks || [];
            } else {
                // Initialize with user data
                artistName = $userStore.user.displayName || 'Mi Nombre';
                bio = 'Artista en ChillChess';
            }

            // Load activity data for heatmap
            const userDoc = await getDoc(doc(db, 'users', $userStore.user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                activityMap = userData.activityMap || {};
                generateCalendar();
            }
        } catch (e) {
            console.error('Error loading profile:', e);
        } finally {
            loading = false;
        }
    });

    function generateCalendar() {
        const days = 365;
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);

        const tempCal = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const key = d.toISOString().split('T')[0];
            const count = activityMap[key] || 0;

            let intensity = 0;
            if (count > 0) intensity = 1;
            if (count > 2) intensity = 2;
            if (count > 5) intensity = 3;
            if (count > 8) intensity = 4;

            tempCal.push({ date: key, count, intensity });
        }
        calendar = tempCal;
    }

    async function saveProfile() {
        if (!$userStore.user) return;
        if (!artistName.trim()) {
            toast.warning('El nombre de artista es obligatorio');
            return;
        }

        saving = true;

        try {
            // 1. Prepare Data with Nuclear Sanitization (removes all undefined)
            // This fixes the issue where Firestore rejects the update if any field is undefined
            const rawData = {
                userId: $userStore.user.uid,
                artistName: artistName.trim(),
                bio: bio.trim(),
                socialLinks: socialLinks.map((l) => ({
                    platform: l.platform,
                    url: l.url,
                    label: l.label || null, // Use null instead of undefined
                })),
                totalPlays: profile?.totalPlays || 0,
                followerCount: profile?.followerCount || 0,
                createdAt: profile?.createdAt || Date.now(),
                updatedAt: Date.now(),
                // Optional fields
                avatarUrl: avatarUrl.trim() || null,
                bannerUrl: isPro ? bannerUrl.trim() || null : null,
                themeColor: isPro ? themeColor : null,
                accentColor: isPro ? accentColor : null,
            };

            // Remove nulls if you prefer compact DB, or keep them.
            // Firestore handles null fine, but undefined throws error.
            // We'll use the JSON trick to strip undefined if any slipped in.
            const cleanData = JSON.parse(JSON.stringify(rawData));

            // 2. Update Artist Profile
            await setDoc(doc(db, 'artists', $userStore.user.uid), cleanData, { merge: true });

            profile = cleanData as ArtistProfile;

            // 3. Update User Preferences (Badges)
            await updateDoc(doc(db, 'users', $userStore.user.uid), {
                showVerifiedBadge,
                showFounderBadge,
                updatedAt: Date.now(),
            });

            toast.success('✅ Perfil guardado correctamente');

            // Force reload to ensure all stores and UI are synced
            window.location.reload();
        } catch (error: any) {
            console.error('Error saving profile:', error);
            toast.error('❌ Error al guardar: ' + (error.message || 'Intenta de nuevo'));
        } finally {
            saving = false;
        }
    }

    function addSocialLink() {
        if (!newLinkUrl.trim()) {
            toast.warning('La URL es obligatoria');
            return;
        }

        const newLink: any = {
            platform: newLinkPlatform,
            url: newLinkUrl.trim(),
        };

        // Only add label if it has a value (Firestore doesn't accept undefined)
        if (newLinkLabel.trim()) {
            newLink.label = newLinkLabel.trim();
        }

        socialLinks = [...socialLinks, newLink];

        // Reset form
        newLinkUrl = '';
        newLinkLabel = '';
        addingLink = false;
    }

    function removeSocialLink(index: number) {
        socialLinks = socialLinks.filter((_, i) => i !== index);
    }

    $: previewProfile = {
        userId: $userStore.user?.uid || '',
        artistName,
        bio,
        avatarUrl,
        bannerUrl: isPro ? bannerUrl : '',
        themeColor: isPro ? themeColor : '#9333EA',
        accentColor: isPro ? accentColor : '#A855F7',
        socialLinks,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    } as ArtistProfile;
</script>

<svelte:head>
    <title>Mi Perfil de Artista | ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-[#0B1120] text-white font-poppins p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
            <div>
                <a
                    href="/"
                    class="text-slate-400 hover:text-white mb-2 inline-flex items-center gap-2 text-sm py-2 px-1 -ml-1"
                >
                    <span>←</span> Volver
                </a>
                <h1 class="text-3xl font-bold">Mi Tarjeta de Artista</h1>
                <p class="text-slate-400 text-sm mt-1">
                    {isPro
                        ? '✨ Personalización completa disponible'
                        : '🎨 Versión básica - Actualiza a Pro para más opciones'}
                </p>
            </div>

            <div class="flex items-center gap-3">
                <button
                    on:click={() => (showPreview = !showPreview)}
                    class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                    {showPreview ? '✏️ Editar' : '👁️ Vista Previa'}
                </button>
            </div>
        </div>

        {#if loading}
            <div class="text-center py-12">
                <div
                    class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"
                ></div>
                <p class="mt-4 text-slate-400">Cargando perfil...</p>
            </div>
        {:else if showPreview}
            <!-- Preview Mode -->
            <div class="flex justify-center py-12">
                <ArtistCard profile={previewProfile} {isPro} isPreview={true} />
            </div>
        {:else}
            <!-- Edit Mode -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Left: Form -->
                <div class="space-y-6">
                    <!-- Basic Info Card -->
                    <div class="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6">
                        <h2 class="text-xl font-bold mb-4">Información Básica</h2>

                        <div class="space-y-4">
                            <div>
                                <label for="artist-name" class="block text-sm font-medium mb-2"
                                    >Nombre de Artista *</label
                                >
                                <input
                                    id="artist-name"
                                    type="text"
                                    bind:value={artistName}
                                    placeholder="Tu nombre artístico"
                                    class="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label for="artist-bio" class="block text-sm font-medium mb-2"
                                    >Bio</label
                                >
                                <textarea
                                    id="artist-bio"
                                    bind:value={bio}
                                    placeholder="Cuéntanos sobre tu música..."
                                    rows="3"
                                    maxlength="200"
                                    class="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none resize-none"
                                ></textarea>
                                <p class="text-xs text-slate-500 mt-1">
                                    {bio.length}/200 caracteres
                                </p>
                            </div>

                            <div>
                                <label for="avatar-url" class="block text-sm font-medium mb-2"
                                    >Avatar URL</label
                                >
                                <input
                                    id="avatar-url"
                                    type="url"
                                    bind:value={avatarUrl}
                                    placeholder="https://example.com/avatar.jpg"
                                    class="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Activity Heatmap Card (NEW) -->
                    <div class="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6">
                        <h2 class="text-xl font-bold mb-4">Tu Actividad (Tracker)</h2>
                        <div class="overflow-x-auto pb-4">
                            <div class="inline-grid grid-rows-7 grid-flow-col gap-1 min-w-max">
                                {#each calendar as day}
                                    <div
                                        class="w-3 h-3 rounded-sm transition-all hover:scale-125"
                                        style="background-color: {day.intensity === 0
                                            ? '#334155'
                                            : day.intensity === 1
                                              ? '#fed7aa'
                                              : day.intensity === 2
                                                ? '#fb923c'
                                                : day.intensity === 3
                                                  ? '#f97316'
                                                  : '#ea580c'}; opacity: {day.intensity === 0
                                            ? 0.3
                                            : 1}"
                                        title="{day.date}: {day.count} pts"
                                    ></div>
                                {/each}
                            </div>
                        </div>
                        <div
                            class="flex items-center justify-end gap-2 text-xs text-slate-500 mt-2"
                        >
                            <span>Off</span>
                            <div class="flex gap-1">
                                <div class="w-2 h-2 rounded-sm bg-[#334155] opacity-30"></div>
                                <div class="w-2 h-2 rounded-sm bg-[#fed7aa]"></div>
                                <div class="w-2 h-2 rounded-sm bg-[#fb923c]"></div>
                                <div class="w-2 h-2 rounded-sm bg-[#f97316]"></div>
                                <div class="w-2 h-2 rounded-sm bg-[#ea580c]"></div>
                            </div>
                            <span>On Fire</span>
                        </div>
                    </div>

                    <!-- Badge Visibility Settings -->
                    <div class="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6">
                        <h2 class="text-xl font-bold mb-4">Insignias y Visibilidad</h2>
                        <p class="text-sm text-slate-400 mb-6">
                            Controla qué insignias se muestran en tu perfil público
                        </p>

                        <div class="space-y-4">
                            <!-- Verified Badge Toggle -->
                            {#if $userSubscription.profile?.isVerified}
                                <label
                                    class="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                                >
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg"
                                        >
                                            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                                <path
                                                    d="M8.5 12L11 14.5L15.5 9.5"
                                                    stroke="white"
                                                    stroke-width="2.5"
                                                    stroke-linecap="round"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="font-medium text-white">
                                                Artista Verificado
                                            </div>
                                            <div class="text-xs text-slate-400">
                                                Check dorado oficial
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        bind:checked={showVerifiedBadge}
                                        class="w-5 h-5 rounded bg-white/10 border-white/20 text-primary-500 focus:ring-primary-500"
                                    />
                                </label>
                            {/if}

                            <!-- Founder Badge Toggle -->
                            {#if isPro}
                                <label
                                    class="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                                >
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg"
                                        >
                                            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                                <path
                                                    d="M12 2L2 12L12 22L22 12L12 2Z"
                                                    fill="white"
                                                    fill-opacity="0.9"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="font-medium text-white">Fundador</div>
                                            <div class="text-xs text-slate-400">
                                                Diamante púrpura exclusivo
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        bind:checked={showFounderBadge}
                                        class="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                                    />
                                </label>
                            {/if}

                            {#if !$userSubscription.profile?.isVerified && !isPro}
                                <div class="text-center py-8 text-slate-500">
                                    <svg
                                        class="w-12 h-12 mx-auto mb-3 opacity-30"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                                    </svg>
                                    <p class="text-sm">
                                        Conviértete en <a
                                            href="/pricing"
                                            class="text-primary-400 hover:underline">Fundador</a
                                        > para desbloquear insignias exclusivas
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Customization (PRO) -->
                    {#if isPro}
                        <div
                            class="bg-gradient-to-br from-primary-900/10 to-primary-800/10 rounded-2xl border border-primary-500/20 p-6 relative overflow-hidden group"
                        >
                            <!-- Background decoration -->
                            <div
                                class="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-700"
                            ></div>

                            <div class="flex items-center gap-3 mb-6 relative z-10">
                                <span class="text-2xl">🎨</span>
                                <div>
                                    <h2 class="text-xl font-bold text-slate-100">
                                        Personalización Pro
                                    </h2>
                                    <p class="text-xs text-purple-300">Diseña tu identidad única</p>
                                </div>
                            </div>

                            <div class="space-y-6 relative z-10">
                                <!-- Banner URL -->
                                <div>
                                    <label
                                        for="banner-url"
                                        class="block text-sm font-medium mb-2 text-slate-300"
                                        >Banner de Fondo (URL)</label
                                    >
                                    <input
                                        id="banner-url"
                                        type="url"
                                        bind:value={bannerUrl}
                                        placeholder="https://imgur.com/..."
                                        class="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
                                    />
                                    <p class="text-[10px] text-slate-500 mt-1">
                                        Recomendado: 1200x400px o similar.
                                    </p>
                                </div>

                                <!-- Theme Presets -->
                                <div>
                                    <h3 class="block text-sm font-medium mb-3 text-slate-300">
                                        Temas Predefinidos
                                    </h3>
                                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <!-- Themes Loop -->
                                        {#each [{ name: 'Chill Original', p: '#9333EA', a: '#A855F7' }, { name: 'Ocean Vibes', p: '#0ea5e9', a: '#38bdf8' }, { name: 'Sunset Lo-fi', p: '#f59e0b', a: '#fbbf24' }, { name: 'Forest Rain', p: '#10b981', a: '#34d399' }, { name: 'Cherry', p: '#ec4899', a: '#f472b6' }, { name: 'Cyberpunk', p: '#f43f5e', a: '#22d3ee' }, { name: 'Royal Gold', p: '#d97706', a: '#fcd34d' }, { name: 'Noir', p: '#334155', a: '#94a3b8' }] as theme}
                                            <button
                                                on:click={() => {
                                                    themeColor = theme.p;
                                                    accentColor = theme.a;
                                                }}
                                                class="flex flex-col items-center gap-2 p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-all group/btn"
                                            >
                                                <div
                                                    class="w-full h-8 rounded-lg shadow-sm transition-transform group-hover/btn:scale-105"
                                                    style="background: linear-gradient(135deg, {theme.p}, {theme.a})"
                                                ></div>
                                                <span
                                                    class="text-[10px] font-medium text-slate-400 group-hover/btn:text-white"
                                                    >{theme.name}</span
                                                >
                                            </button>
                                        {/each}
                                    </div>
                                </div>

                                <!-- Custom Colors -->
                                <div>
                                    <h3 class="block text-sm font-medium mb-3 text-slate-300">
                                        Colores Personalizados
                                    </h3>
                                    <div class="grid grid-cols-2 gap-4">
                                        <!-- Primary Color -->
                                        <div class="space-y-2">
                                            <div
                                                class="flex justify-between text-xs text-slate-400"
                                            >
                                                <span>Primario (Botones/Bordes)</span>
                                                <span class="font-mono">{themeColor}</span>
                                            </div>
                                            <div
                                                class="flex items-center gap-3 bg-[#0B1120]/50 p-2 rounded-xl border border-white/10"
                                            >
                                                <input
                                                    type="color"
                                                    bind:value={themeColor}
                                                    class="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0"
                                                />
                                                <input
                                                    type="text"
                                                    bind:value={themeColor}
                                                    class="bg-transparent text-sm w-full focus:outline-none uppercase font-mono text-white"
                                                />
                                            </div>
                                        </div>

                                        <!-- Accent Color -->
                                        <div class="space-y-2">
                                            <div
                                                class="flex justify-between text-xs text-slate-400"
                                            >
                                                <span>Acento (Gradientes/Detalles)</span>
                                                <span class="font-mono">{accentColor}</span>
                                            </div>
                                            <div
                                                class="flex items-center gap-3 bg-[#0B1120]/50 p-2 rounded-xl border border-white/10"
                                            >
                                                <input
                                                    type="color"
                                                    bind:value={accentColor}
                                                    class="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0"
                                                />
                                                <input
                                                    type="text"
                                                    bind:value={accentColor}
                                                    class="bg-transparent text-sm w-full focus:outline-none uppercase font-mono text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Social Links -->
                    <div class="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-bold">Redes Sociales</h2>
                            <button
                                on:click={() => (addingLink = !addingLink)}
                                class="px-3 py-1 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium transition-colors"
                            >
                                {addingLink ? 'Cancelar' : '+ Añadir'}
                            </button>
                        </div>

                        {#if !isPro}
                            <p class="text-xs text-yellow-400 mb-4">
                                ⚠️ Los links solo funcionan para usuarios Pro
                            </p>
                        {/if}

                        <!-- Add Link Form -->
                        {#if addingLink}
                            <div class="bg-[#0B1120] rounded-lg p-4 mb-4 space-y-3">
                                <div>
                                    <h3
                                        class="block text-xs mb-2 font-medium text-slate-400 uppercase"
                                    >
                                        Plataforma
                                    </h3>
                                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {#each SOCIAL_PLATFORMS as platform}
                                            <button
                                                type="button"
                                                on:click={() => (newLinkPlatform = platform.id)}
                                                class="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all text-left {newLinkPlatform ===
                                                platform.id
                                                    ? 'bg-blue-500/10 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                                                    : 'bg-[#1a1a1a] border-white/5 text-slate-400 hover:bg-[#252525] hover:border-white/10'}"
                                            >
                                                <span class="text-lg">{platform.icon}</span>
                                                <span class="truncate">{platform.label}</span>
                                            </button>
                                        {/each}
                                    </div>
                                </div>
                                <div>
                                    <label for="link-url" class="block text-xs mb-1">URL *</label>
                                    <input
                                        id="link-url"
                                        type="url"
                                        bind:value={newLinkUrl}
                                        placeholder="https://..."
                                        class="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label for="link-label" class="block text-xs mb-1"
                                        >Label (opcional)</label
                                    >
                                    <input
                                        id="link-label"
                                        type="text"
                                        bind:value={newLinkLabel}
                                        placeholder="Nombre personalizado"
                                        class="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                                <button
                                    on:click={addSocialLink}
                                    class="w-full py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-medium transition-colors"
                                >
                                    ✓ Agregar Link
                                </button>
                            </div>
                        {/if}

                        <!-- Links List -->
                        <div class="space-y-2">
                            {#each socialLinks as link, i}
                                {@const platform = SOCIAL_PLATFORMS.find(
                                    (p) => p.id === link.platform
                                )}
                                <div
                                    class="flex items-center justify-between bg-[#0B1120] rounded-lg p-3"
                                >
                                    <div class="flex items-center gap-3 flex-1 min-w-0">
                                        <span class="text-xl">
                                            {platform?.icon}
                                        </span>
                                        <div class="flex-1 min-w-0">
                                            <div class="font-medium text-sm">
                                                {link.label || platform?.label}
                                            </div>
                                            <div class="text-xs text-slate-500 truncate">
                                                {link.url}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        on:click={() => removeSocialLink(i)}
                                        class="px-2 py-1 text-red-400 hover:text-red-300 text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            {:else}
                                <p class="text-slate-500 text-sm text-center py-4">
                                    No hay links añadidos
                                </p>
                            {/each}
                        </div>
                    </div>

                    <!-- Save Button -->
                    <button
                        on:click={saveProfile}
                        disabled={saving}
                        class="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg shadow-lg transition-all"
                    >
                        {saving ? 'Guardando...' : '💾 Guardar Perfil'}
                    </button>
                </div>

                <!-- Right: Live Preview -->
                <div class="sticky top-8 h-fit">
                    <div class="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6">
                        <h3 class="text-lg font-bold mb-4">Vista Previa en Vivo</h3>
                        <div class="flex justify-center">
                            <ArtistCard profile={previewProfile} {isPro} isPreview={true} />
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
