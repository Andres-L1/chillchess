<script lang="ts">
    import { onMount } from "svelte";
    import { db } from "$lib/firebase";
    import {
        collection,
        getDocs,
        query,
        where,
        doc,
        setDoc,
        updateDoc,
        serverTimestamp,
    } from "firebase/firestore";
    import type { ArtistProfile } from "$lib/types/artist";
    import VerifiedBadge from "$lib/components/VerifiedBadge.svelte";
    import { ALBUMS } from "$lib/data/albums";

    let artists: ArtistProfile[] = [];
    let loading = true;
    let showCreateModal = false;
    let editingArtist: ArtistProfile | null = null;

    // Form data
    let formData = {
        userId: "",
        artistName: "",
        bio: "",
        avatarUrl: "",
        bannerUrl: "",
        isVerified: true,
        socialLinks: [] as any[],
    };

    onMount(async () => {
        await loadArtists();
    });

    async function loadArtists() {
        loading = true;
        try {
            const artistsRef = collection(db, "artists");
            const q = query(artistsRef);
            const snapshot = await getDocs(q);

            artists = snapshot.docs.map(
                (doc) =>
                    ({
                        ...doc.data(),
                        userId: doc.id,
                    }) as ArtistProfile,
            );
        } catch (error) {
            console.error("Error loading artists:", error);
        } finally {
            loading = false;
        }
    }

    function openCreateModal() {
        formData = {
            userId: "",
            artistName: "",
            bio: "",
            avatarUrl: "",
            bannerUrl: "",
            isVerified: true,
            socialLinks: [],
        };
        editingArtist = null;
        showCreateModal = true;
    }

    function openEditModal(artist: ArtistProfile) {
        formData = {
            userId: artist.userId,
            artistName: artist.artistName,
            bio: artist.bio || "",
            avatarUrl: artist.avatarUrl || "",
            bannerUrl: artist.bannerUrl || "",
            isVerified: artist.isVerified || false,
            socialLinks: artist.socialLinks || [],
        };
        editingArtist = artist;
        showCreateModal = true;
    }

    async function saveArtist() {
        try {
            const artistRef = doc(db, "artists", formData.userId);

            const artistData: any = {
                userId: formData.userId,
                artistName: formData.artistName,
                bio: formData.bio,
                isVerified: formData.isVerified,
                socialLinks: formData.socialLinks,
                updatedAt: Date.now(),
            };

            if (formData.avatarUrl) artistData.avatarUrl = formData.avatarUrl;
            if (formData.bannerUrl) artistData.bannerUrl = formData.bannerUrl;

            if (!editingArtist) {
                artistData.createdAt = Date.now();
                artistData.totalPlays = 0;
                artistData.followerCount = 0;
            }

            await setDoc(artistRef, artistData, { merge: true });

            alert(editingArtist ? "Artista actualizado" : "Artista creado");
            showCreateModal = false;
            await loadArtists();
        } catch (error) {
            console.error("Error saving artist:", error);
            alert("Error al guardar artista");
        }
    }

    async function toggleVerification(artist: ArtistProfile) {
        try {
            const artistRef = doc(db, "artists", artist.userId);
            await updateDoc(artistRef, {
                isVerified: !artist.isVerified,
                verifiedAt: !artist.isVerified ? Date.now() : null,
            });
            await loadArtists();
        } catch (error) {
            console.error("Error toggling verification:", error);
        }
    }

    function getArtistAlbums(artistName: string) {
        return ALBUMS.filter((album) => album.artist === artistName);
    }
</script>

<div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-2xl font-bold text-white">Gestión de Artistas</h2>
            <p class="text-slate-400 text-sm mt-1">
                Administra perfiles de artistas verificados
            </p>
        </div>
        <button
            on:click={openCreateModal}
            class="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg font-medium transition-colors"
        >
            + Crear Artista
        </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white/5 border border-white/10 rounded-xl p-4">
            <div class="text-3xl font-bold text-primary-500">
                {artists.length}
            </div>
            <div class="text-sm text-slate-400">Total Artistas</div>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-xl p-4">
            <div class="text-3xl font-bold text-green-500">
                {artists.filter((a) => a.isVerified).length}
            </div>
            <div class="text-sm text-slate-400">Verificados</div>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-xl p-4">
            <div class="text-3xl font-bold text-orange-500">
                {artists.filter((a) => !a.isVerified).length}
            </div>
            <div class="text-sm text-slate-400">Sin Verificar</div>
        </div>
    </div>

    <!-- Artists List -->
    {#if loading}
        <div class="flex items-center justify-center py-12">
            <div
                class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"
            ></div>
        </div>
    {:else if artists.length === 0}
        <div
            class="text-center py-12 bg-white/5 rounded-xl border border-white/10"
        >
            <span class="text-4xl block mb-2">🎤</span>
            <p class="text-slate-400">No hay artistas registrados</p>
        </div>
    {:else}
        <div class="space-y-4">
            {#each artists as artist}
                {@const artistAlbums = getArtistAlbums(artist.artistName)}
                <div
                    class="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                    <div class="flex items-start gap-4">
                        <!-- Avatar -->
                        <div
                            class="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl shrink-0"
                        >
                            {#if artist.avatarUrl}
                                <img
                                    src={artist.avatarUrl}
                                    alt={artist.artistName}
                                    class="w-full h-full rounded-full object-cover"
                                />
                            {:else}
                                🎵
                            {/if}
                        </div>

                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <h3
                                    class="text-lg font-bold text-white truncate"
                                >
                                    {artist.artistName}
                                </h3>
                                {#if artist.isVerified}
                                    <VerifiedBadge size="sm" />
                                {/if}
                            </div>
                            <p class="text-sm text-slate-400 mb-2 line-clamp-2">
                                {artist.bio || "Sin biografía"}
                            </p>
                            <div class="flex gap-4 text-xs text-slate-500">
                                <span>👤 {artist.userId.slice(0, 8)}...</span>
                                <span
                                    >📀 {artistAlbums.length} álbum{artistAlbums.length !==
                                    1
                                        ? "es"
                                        : ""}</span
                                >
                                {#if artist.followerCount}
                                    <span
                                        >👥 {artist.followerCount} seguidores</span
                                    >
                                {/if}
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-2 shrink-0">
                            <button
                                on:click={() => toggleVerification(artist)}
                                class="px-3 py-1.5 {artist.isVerified
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-slate-500/20 text-slate-300'} rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                            >
                                {artist.isVerified
                                    ? "✓ Verificado"
                                    : "Sin verificar"}
                            </button>
                            <button
                                on:click={() => openEditModal(artist)}
                                class="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                            >
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- Create/Edit Modal -->
{#if showCreateModal}
    <div
        class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        on:click={() => (showCreateModal = false)}
    >
        <div
            class="bg-midnight-800 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            on:click|stopPropagation
        >
            <h3 class="text-2xl font-bold text-white mb-6">
                {editingArtist ? "Editar" : "Crear"} Artista
            </h3>

            <div class="space-y-4">
                <!-- User ID -->
                <div>
                    <label
                        class="block text-sm font-medium text-slate-300 mb-2"
                    >
                        User ID (Firebase UID) *
                    </label>
                    <input
                        type="text"
                        bind:value={formData.userId}
                        disabled={!!editingArtist}
                        placeholder="rOLscSZKfLcBm3f4YNR2oCd88em1"
                        class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 disabled:opacity-50"
                    />
                    <p class="text-xs text-slate-500 mt-1">
                        El UID del usuario en Firebase Authentication
                    </p>
                </div>

                <!-- Artist Name -->
                <div>
                    <label
                        class="block text-sm font-medium text-slate-300 mb-2"
                    >
                        Nombre del Artista *
                    </label>
                    <input
                        type="text"
                        bind:value={formData.artistName}
                        placeholder="JULYACTV"
                        class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                    />
                </div>

                <!-- Bio -->
                <div>
                    <label
                        class="block text-sm font-medium text-slate-300 mb-2"
                    >
                        Biografía
                    </label>
                    <textarea
                        bind:value={formData.bio}
                        placeholder="Productor de música Lo-Fi y Chillhop..."
                        rows="3"
                        class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                    ></textarea>
                </div>

                <!-- Avatar URL -->
                <div>
                    <label
                        class="block text-sm font-medium text-slate-300 mb-2"
                    >
                        Avatar URL
                    </label>
                    <input
                        type="url"
                        bind:value={formData.avatarUrl}
                        placeholder="https://..."
                        class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                    />
                </div>

                <!-- Banner URL -->
                <div>
                    <label
                        class="block text-sm font-medium text-slate-300 mb-2"
                    >
                        Banner URL
                    </label>
                    <input
                        type="url"
                        bind:value={formData.bannerUrl}
                        placeholder="https://..."
                        class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                    />
                </div>

                <!-- Verified -->
                <div>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            bind:checked={formData.isVerified}
                            class="w-5 h-5 rounded border-white/20 bg-white/10"
                        />
                        <span class="text-sm font-medium text-slate-300"
                            >Artista Verificado</span
                        >
                    </label>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 mt-6">
                <button
                    on:click={saveArtist}
                    disabled={!formData.userId || !formData.artistName}
                    class="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                    {editingArtist ? "Actualizar" : "Crear"} Artista
                </button>
                <button
                    on:click={() => (showCreateModal = false)}
                    class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </div>
    </div>
{/if}
