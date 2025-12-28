<script lang="ts">
    import { onMount } from "svelte";
    import { userStore } from "$lib/auth/userStore";
    import { userSubscription } from "$lib/subscription/userSubscription";
    // @ts-ignore - SvelteKit module alias
    import { goto } from "$app/navigation";
    import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
    import { db } from "$lib/firebase";
    import type { ArtistProfile, SocialLink } from "$lib/types/artist";
    import { SOCIAL_PLATFORMS, DEFAULT_THEME_COLORS } from "$lib/types/artist";
    import ArtistCard from "$lib/components/ArtistCard.svelte";

    let loading = true;
    let saving = false;
    let profile: ArtistProfile | null = null;
    let isPro = false;

    // Form state
    let artistName = "";
    let bio = "";
    let avatarUrl = "";
    let bannerUrl = "";
    let themeColor = "#9333EA";
    let accentColor = "#A855F7";
    let socialLinks: SocialLink[] = [];

    // UI state
    let showPreview = false;
    let addingLink = false;
    let newLinkPlatform: any = "spotify";
    let newLinkUrl = "";
    let newLinkLabel = "";

    onMount(async () => {
        // Check auth
        if (!$userStore.user) {
            goto("/");
            return;
        }

        // Check if pro
        isPro =
            $userSubscription.tier === "pro" ||
            $userSubscription.tier === "premium";

        // Load existing profile
        try {
            const profileDoc = await getDoc(
                doc(db, "artistProfiles", $userStore.user.uid),
            );

            if (profileDoc.exists()) {
                profile = profileDoc.data() as ArtistProfile;
                // Populate form
                artistName = profile.artistName;
                bio = profile.bio;
                avatarUrl = profile.avatarUrl || "";
                bannerUrl = profile.bannerUrl || "";
                themeColor = profile.themeColor || "#9333EA";
                accentColor = profile.accentColor || "#A855F7";
                socialLinks = profile.socialLinks || [];
            } else {
                // Initialize with user data
                artistName = $userStore.user.displayName || "Mi Nombre";
                bio = "Artista en ChillChess";
            }
        } catch (e) {
            console.error("Error loading profile:", e);
        } finally {
            loading = false;
        }
    });

    async function saveProfile() {
        if (!$userStore.user) return;
        if (!artistName.trim()) {
            alert("El nombre de artista es obligatorio");
            return;
        }

        saving = true;

        const profileData: ArtistProfile = {
            userId: $userStore.user.uid,
            artistName: artistName.trim(),
            bio: bio.trim(),
            avatarUrl: avatarUrl.trim() || undefined,
            bannerUrl: isPro ? bannerUrl.trim() || undefined : undefined,
            themeColor: isPro ? themeColor : undefined,
            accentColor: isPro ? accentColor : undefined,
            socialLinks: socialLinks,
            totalPlays: profile?.totalPlays || 0,
            followerCount: profile?.followerCount || 0,
            createdAt: profile?.createdAt || Date.now(),
            updatedAt: Date.now(),
        };

        try {
            await setDoc(
                doc(db, "artistProfiles", $userStore.user.uid),
                profileData,
            );
            profile = profileData;
            alert("✅ Perfil guardado correctamente");
        } catch (error: any) {
            console.error("Error saving profile:", error);
            alert("❌ Error al guardar: " + error.message);
        } finally {
            saving = false;
        }
    }

    function addSocialLink() {
        if (!newLinkUrl.trim()) {
            alert("La URL es obligatoria");
            return;
        }

        socialLinks = [
            ...socialLinks,
            {
                platform: newLinkPlatform,
                url: newLinkUrl.trim(),
                label: newLinkLabel.trim() || undefined,
            },
        ];

        // Reset form
        newLinkUrl = "";
        newLinkLabel = "";
        addingLink = false;
    }

    function removeSocialLink(index: number) {
        socialLinks = socialLinks.filter((_, i) => i !== index);
    }

    $: previewProfile = {
        userId: $userStore.user?.uid || "",
        artistName,
        bio,
        avatarUrl,
        bannerUrl: isPro ? bannerUrl : "",
        themeColor: isPro ? themeColor : "#9333EA",
        accentColor: isPro ? accentColor : "#A855F7",
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
                    class="text-slate-400 hover:text-white mb-2 inline-flex items-center gap-2 text-sm"
                >
                    <span>←</span> Volver
                </a>
                <h1 class="text-3xl font-bold">Mi Tarjeta de Artista</h1>
                <p class="text-slate-400 text-sm mt-1">
                    {isPro
                        ? "✨ Personalización completa disponible"
                        : "🎨 Versión básica - Actualiza a Pro para más opciones"}
                </p>
            </div>

            <button
                on:click={() => (showPreview = !showPreview)}
                class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
                {showPreview ? "✏️ Editar" : "👁️ Vista Previa"}
            </button>
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
                    <div
                        class="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6"
                    >
                        <h2 class="text-xl font-bold mb-4">
                            Información Básica
                        </h2>

                        <div class="space-y-4">
                            <div>
                                <label
                                    for="artist-name"
                                    class="block text-sm font-medium mb-2"
                                    >Nombre de Artista *</label
                                >
                                <input
                                    id="artist-name"
                                    type="text"
                                    bind:value={artistName}
                                    placeholder="Tu nombre artístico"
                                    class="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label
                                    for="artist-bio"
                                    class="block text-sm font-medium mb-2"
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
                                <label
                                    for="avatar-url"
                                    class="block text-sm font-medium mb-2"
                                    >Avatar URL</label
                                >
                                <input
                                    id="avatar-url"
                                    type="url"
                                    bind:value={avatarUrl}
                                    placeholder="https://example.com/avatar.jpg"
                                    class="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Customization (PRO) -->
                    {#if isPro}
                        <div
                            class="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30 p-6"
                        >
                            <div class="flex items-center gap-2 mb-4">
                                <span class="text-xl">✨</span>
                                <h2 class="text-xl font-bold">
                                    Personalización Pro
                                </h2>
                            </div>

                            <div class="space-y-4">
                                <div>
                                    <label
                                        for="banner-url"
                                        class="block text-sm font-medium mb-2"
                                        >Banner URL</label
                                    >
                                    <input
                                        id="banner-url"
                                        type="url"
                                        bind:value={bannerUrl}
                                        placeholder="https://example.com/banner.jpg"
                                        class="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                                    />
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            for="theme-color"
                                            class="block text-sm font-medium mb-2"
                                            >Color Primario</label
                                        >
                                        <input
                                            id="theme-color"
                                            type="color"
                                            bind:value={themeColor}
                                            class="w-full h-10 rounded-lg cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            for="accent-color"
                                            class="block text-sm font-medium mb-2"
                                            >Color Acento</label
                                        >
                                        <input
                                            id="accent-color"
                                            type="color"
                                            bind:value={accentColor}
                                            class="w-full h-10 rounded-lg cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <!-- Quick color presets -->
                                <div>
                                    <p class="text-xs text-slate-400 mb-2">
                                        Presets:
                                    </p>
                                    <div class="flex flex-wrap gap-2">
                                        {#each DEFAULT_THEME_COLORS as preset}
                                            <button
                                                on:click={() => {
                                                    themeColor = preset.primary;
                                                    accentColor = preset.accent;
                                                }}
                                                class="px-3 py-1 rounded-full text-xs font-medium hover:scale-105 transition-transform"
                                                style="background: linear-gradient(135deg, {preset.primary}, {preset.accent})"
                                            >
                                                {preset.name}
                                            </button>
                                        {/each}
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Social Links -->
                    <div
                        class="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6"
                    >
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-bold">Redes Sociales</h2>
                            <button
                                on:click={() => (addingLink = !addingLink)}
                                class="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
                            >
                                {addingLink ? "Cancelar" : "+ Añadir"}
                            </button>
                        </div>

                        {#if !isPro}
                            <p class="text-xs text-yellow-400 mb-4">
                                ⚠️ Los links solo funcionan para usuarios Pro
                            </p>
                        {/if}

                        <!-- Add Link Form -->
                        {#if addingLink}
                            <div
                                class="bg-[#0B1120] rounded-lg p-4 mb-4 space-y-3"
                            >
                                <div>
                                    <p
                                        class="block text-xs mb-2 font-medium text-slate-400 uppercase"
                                    >
                                        Plataforma
                                    </p>
                                    <div
                                        class="grid grid-cols-2 sm:grid-cols-3 gap-2"
                                    >
                                        {#each SOCIAL_PLATFORMS as platform}
                                            <button
                                                type="button"
                                                on:click={() =>
                                                    (newLinkPlatform =
                                                        platform.id)}
                                                class="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all text-left {newLinkPlatform ===
                                                platform.id
                                                    ? 'bg-blue-500/10 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                                                    : 'bg-[#1a1a1a] border-white/5 text-slate-400 hover:bg-[#252525] hover:border-white/10'}"
                                            >
                                                <span class="text-lg"
                                                    >{platform.icon}</span
                                                >
                                                <span class="truncate"
                                                    >{platform.label}</span
                                                >
                                            </button>
                                        {/each}
                                    </div>
                                </div>
                                <div>
                                    <label
                                        for="link-url"
                                        class="block text-xs mb-1">URL *</label
                                    >
                                    <input
                                        id="link-url"
                                        type="url"
                                        bind:value={newLinkUrl}
                                        placeholder="https://..."
                                        class="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label
                                        for="link-label"
                                        class="block text-xs mb-1"
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
                                    (p) => p.id === link.platform,
                                )}
                                <div
                                    class="flex items-center justify-between bg-[#0B1120] rounded-lg p-3"
                                >
                                    <div
                                        class="flex items-center gap-3 flex-1 min-w-0"
                                    >
                                        <span class="text-xl">
                                            {platform?.icon}
                                        </span>
                                        <div class="flex-1 min-w-0">
                                            <div class="font-medium text-sm">
                                                {link.label || platform?.label}
                                            </div>
                                            <div
                                                class="text-xs text-slate-500 truncate"
                                            >
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
                                <p
                                    class="text-slate-500 text-sm text-center py-4"
                                >
                                    No hay links añadidos
                                </p>
                            {/each}
                        </div>
                    </div>

                    <!-- Save Button -->
                    <button
                        on:click={saveProfile}
                        disabled={saving}
                        class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg shadow-lg transition-all"
                    >
                        {saving ? "Guardando..." : "💾 Guardar Perfil"}
                    </button>
                </div>

                <!-- Right: Live Preview -->
                <div class="sticky top-8 h-fit">
                    <div
                        class="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6"
                    >
                        <h3 class="text-lg font-bold mb-4">
                            Vista Previa en Vivo
                        </h3>
                        <div class="flex justify-center">
                            <ArtistCard
                                profile={previewProfile}
                                {isPro}
                                isPreview={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
