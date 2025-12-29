<script lang="ts">
    import { onMount } from "svelte";
    import { db, auth } from "$lib/firebase";
    import { doc, setDoc, writeBatch, collection } from "firebase/firestore";
    import { ALBUMS } from "$lib/data/albums";
    import { onAuthStateChanged } from "firebase/auth";

    let status = "Esperando autenticación...";
    let logs: string[] = [];
    let processing = false;
    let isAdmin = false;

    onMount(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Check if user is the admin (simple check for your email)
                if (user.email === "andreslgumuzio@gmail.com") {
                    isAdmin = true;
                    status = "Listo para migrar. Logueado como " + user.email;
                } else {
                    status = "No tienes permisos (Email no coincide).";
                }
            } else {
                status = "Por favor inicia sesión primero en /admin";
            }
        });
    });

    async function startMigration() {
        if (processing) return;
        processing = true;
        logs = ["Iniciando migración masiva...", "---"];

        try {
            const batch = writeBatch(db);

            // 1. Migrar JULYACTV (Artista)
            logs = [...logs, ">> Preparando perfil de JULYACTV..."];
            const artistRef = doc(db, "artists", "julyactv-official");
            batch.set(artistRef, {
                userId: "julyactv-official",
                artistName: "JULYACTV",
                bio: "Visionario del sonido urbano y creador de atmósferas inmersivas en ChillChess.",
                avatarUrl: "/assets/images/covers/asap.jpg",
                isVerified: true,
                followerCount: 0,
                socialLinks: [
                    {
                        platform: "twitter",
                        url: "https://twitter.com/julyactv",
                    },
                    {
                        platform: "instagram",
                        url: "https://instagram.com/julyactv",
                    },
                ],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });

            // 2. Migrar Álbumes completos (con tracks anidados)
            logs = [...logs, `>> Preparando ${ALBUMS.length} álbumes...`];

            for (const album of ALBUMS) {
                const albumRef = doc(db, "albums", album.id);
                // Convert tracks array to clean objects just in case
                const tracks =
                    album.tracks?.map((t) => ({
                        id: t.id,
                        title: t.title,
                        artist: t.artist,
                        file: t.file,
                        duration: t.duration || 0,
                    })) || [];

                batch.set(albumRef, {
                    ...album,
                    tracks: tracks, // Guardamos tracks dentro del documento del álbum por simplicidad
                    lastUpdated: Date.now(),
                });
                logs = [...logs, `   + Álbum: ${album.title}`];
            }

            logs = [
                ...logs,
                "---",
                "Enviando datos a Firebase (Commit Batch)...",
            ];
            await batch.commit();

            logs = [
                ...logs,
                "✅ ¡MIGRACIÓN COMPLETADA CON ÉXITO!",
                "Ahora los datos están en la nube.",
            ];
            status = "Migración Finalizada.";
        } catch (e: any) {
            console.error(e);
            logs = [...logs, "❌ ERROR FATAL:", e.message];
            status = "Error en la migración.";
        } finally {
            processing = false;
        }
    }
</script>

<div
    class="min-h-screen bg-black text-white font-mono p-8 flex flex-col items-center"
>
    <div
        class="max-w-2xl w-full bg-white/5 border border-white/10 rounded-xl p-6"
    >
        <h1 class="text-3xl font-bold mb-2 text-primary-500">
            System Migration Tool
        </h1>
        <p class="text-slate-400 mb-6">
            Esta herramienta subirá el contenido estático (Albums.ts) y el
            perfil de JULYACTV a la base de datos Firestore en tiempo real.
        </p>

        <div
            class="bg-black/50 p-4 rounded border border-white/10 mb-6 min-h-[100px] max-h-[300px] overflow-y-auto"
        >
            <p class="text-green-400 font-bold mb-2">> ESTADO: {status}</p>
            {#each logs as log}
                <p
                    class="text-xs text-slate-300 border-l-2 border-slate-700 pl-2 mb-1"
                >
                    {log}
                </p>
            {/each}
        </div>

        {#if isAdmin}
            <button
                on:click={startMigration}
                disabled={processing}
                class="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary-500/20"
            >
                {processing
                    ? "MIGRANDO... (NO CIERRES)"
                    : "INICIAR MIGRACIÓN A LA NUBE 🚀"}
            </button>
        {:else}
            <div
                class="p-4 bg-red-500/20 text-red-200 rounded border border-red-500/50 text-center"
            >
                Debes iniciar sesión como Administrador primero.
            </div>
        {/if}
    </div>
</div>
