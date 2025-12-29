<script lang="ts">
    import { page } from "$app/stores";
    import { userStore } from "$lib/auth/userStore";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let isAuthorized = false;
    let isLoading = true;

    // Check admin access
    onMount(async () => {
        // Wait for auth to load
        if ($userStore.loading) {
            const unsubscribe = userStore.subscribe((state) => {
                if (!state.loading) {
                    checkAccess(state.user);
                    unsubscribe();
                }
            });
        } else {
            checkAccess($userStore.user);
        }
    });

    async function checkAccess(user: any) {
        if (!user) {
            isLoading = false;
            goto("/");
            return;
        }

        // HARDCODED ADMIN EMAIL - Only this email can access admin panel
        const ADMIN_EMAIL = "andreslgumuzio@gmail.com";

        if (user.email !== ADMIN_EMAIL) {
            console.warn("Unauthorized admin access attempt");
            isLoading = false;
            goto("/");
            return;
        }

        // Check if user is admin in database (secondary check)
        try {
            const { doc, getDoc } = await import("firebase/firestore");
            const { db } = await import("$lib/firebase");

            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            if (userData?.isAdmin === true) {
                isAuthorized = true;
            } else {
                goto("/");
            }
        } catch (error) {
            console.error("Error checking admin access:", error);
            goto("/");
        } finally {
            isLoading = false;
        }
    }
</script>

{#if isLoading}
    <div class="min-h-screen flex items-center justify-center bg-[#0B1120]">
        <div class="text-center">
            <div
                class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mb-4"
            ></div>
            <p class="text-white/60 font-medium">Verificando acceso...</p>
        </div>
    </div>
{:else if isAuthorized}
    <slot />
{/if}
