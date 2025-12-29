<script lang="ts">
    import { onMount } from "svelte";
    import { audioStore } from "$lib/audio/store";

    let loading = false;
    let message = "";

    // En el futuro aquí irá la gestión avanzada de música
</script>

<div class="animate-fade-in">
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-white mb-2">Gestión Musical</h2>
        <p class="text-slate-400">Administra la biblioteca musical completa</p>
    </div>

    <div class="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
        <svg
            class="w-16 h-16 mx-auto mb-4 text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
        </svg>
        <h3 class="text-xl font-bold text-white mb-2">
            Gestión Musical Avanzada
        </h3>
        <p class="text-slate-400 mb-4">
            En desarrollo: Añadir álbumes, editar metadata, gestionar tracks,
            etc.
        </p>
        <div class="text-sm text-slate-500">
            <p>Total álbumes: {$audioStore.availableAlbums.length}</p>
        </div>
    </div>
</div>
