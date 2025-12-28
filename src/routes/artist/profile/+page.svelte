<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { doc, getDoc } from "firebase/firestore";
    import { db } from "$lib/firebase";
    import type { ArtistProfile } from "$lib/types/artist";
    import ArtistCard from "$lib/components/ArtistCard.svelte";

    let loading = true;
    let profile: ArtistProfile | null = null;
    let isPro = false;
    let notFound = false;

    $: artistId = $page.url.searchParams.get("id");

    onMount(async () => {
        if (!artistId) {
            notFound = true;
            loading = false;
            return;
        }

        try {
            const profileDoc = await getDoc(
                doc(db, "artistProfiles", artistId),
            );

            if (profileDoc.exists()) {
                profile = profileDoc.data() as ArtistProfile;

                // Check if artist is pro (you'd need to cross-reference with users collection)
                const userDoc = await getDoc(doc(db, "users", artistId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    isPro =
                        userData.subscriptionTier === "pro" ||
                        userData.subscriptionTier === "premium";
                }
            } else {
                notFound = true;
            }
        } catch (e) {
            console.error("Error loading artist profile:", e);
            notFound = true;
        } finally {
            loading = false;
        }
    });
</script>

<svelte:head>
    <title>{profile?.artistName || "Artista"} | ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-[#0B1120] text-white font-poppins p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
        <!-- Back Button -->
        <a
            href="/"
            class="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
            <span>←</span> Volver a ChillChess
        </a>

        {#if loading}
            <div class="flex justify-center items-center py-24">
                <div
                    class="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white"
                ></div>
            </div>
        {:else if notFound || !profile}
            <div class="text-center py-24">
                <div class="text-6xl mb-4">🎵</div>
                <h1 class="text-2xl font-bold mb-2">Perfil no encontrado</h1>
                <p class="text-slate-400">
                    Este artista no existe o aún no ha creado su perfil.
                </p>
            </div>
        {:else}
            <div class="flex justify-center py-12">
                <ArtistCard {profile} {isPro} isPreview={false} />
            </div>
        {/if}
    </div>
</div>
