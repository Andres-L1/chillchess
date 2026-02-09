<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/firebase';
    import { doc, deleteDoc } from 'firebase/firestore';
    import { fade } from 'svelte/transition';
    import TrashIcon from '$lib/components/icons/TrashIcon.svelte';

    let scanning = false;
    let results: any[] = [];
    let selectedIds: Set<string> = new Set();
    let scanStats = { total: 0, broken: 0 };
    let error: string | null = null;
    let deleting = false;

    async function scanFiles() {
        scanning = true;
        error = null;
        results = [];
        selectedIds.clear();
        
        try {
            const res = await fetch('/api/admin/validate-files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'all' })
            });
            
            if (!res.ok) throw new Error('Scan failed');
            
            const data = await res.json();
            results = data.results;
            scanStats = {
                total: data.totalScanned,
                broken: data.brokenCount
            };
        } catch (e: any) {
            error = e.message;
        } finally {
            scanning = false;
        }
    }

    function toggleSelection(id: string) {
        if (selectedIds.has(id)) {
            selectedIds.delete(id);
        } else {
            selectedIds.add(id);
        }
        selectedIds = selectedIds; // Trigger reactivity
    }

    function toggleAll() {
        if (selectedIds.size === results.length) {
            selectedIds.clear();
        } else {
            selectedIds = new Set(results.map(r => r.id));
        }
        selectedIds = selectedIds;
    }

    async function deleteSelected() {
        if (!confirm(`¿Estás seguro de eliminar ${selectedIds.size} álbumes? Esta acción no se puede deshacer.`)) return;
        
        deleting = true;
        const ids = Array.from(selectedIds);
        
        try {
            // Delete from Firestore
            // Note: Cloud functions might handle R2 cleanup, or we might need to do it here
            // For now, focus on removing broken references from DB
            
            const promises = ids.map(id => deleteDoc(doc(db, 'albums', id)));
            await Promise.all(promises);
            
            // Remove from results
            results = results.filter(r => !selectedIds.has(r.id));
            selectedIds.clear();
            alert('Álbumes eliminados correctamente');
        } catch (e: any) {
            alert('Error al eliminar: ' + e.message);
        } finally {
            deleting = false;
        }
    }
</script>

<div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-2xl font-bold text-white mb-1">Limpieza de Archivos 🧹</h2>
            <p class="text-slate-400">Detecta y elimina álbumes con archivos rotos (404)</p>
        </div>
        <button
            on:click={scanFiles}
            disabled={scanning}
            class="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-primary-500/25 flex items-center gap-2"
        >
            {#if scanning}
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Escaneando...
            {:else}
                <TrashIcon size="sm" />
                Escanear Archivos
            {/if}
        </button>
    </div>

    <!-- Stats -->
    {#if scanStats.total > 0}
        <div class="grid grid-cols-2 gap-4" in:fade>
            <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div class="text-2xl font-bold text-white">{scanStats.total}</div>
                <div class="text-xs text-slate-400">Total Escaneados</div>
            </div>
            <div class="bg-red-500/10 rounded-2xl p-4 border border-red-500/30">
                <div class="text-2xl font-bold text-red-400">{scanStats.broken}</div>
                <div class="text-xs text-red-300">Archivos Rotos Encontrados</div>
            </div>
        </div>
    {/if}

    <!-- Error -->
    {#if error}
        <div class="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl">
            {error}
        </div>
    {/if}

    <!-- Results Table -->
    {#if results.length > 0}
        <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden" in:fade>
            <div class="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div class="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        checked={selectedIds.size === results.length && results.length > 0}
                        on:change={toggleAll}
                        class="w-5 h-5 rounded border-white/20 bg-black/20 text-primary-500 focus:ring-offset-0 focus:ring-0"
                    />
                    <span class="text-sm text-slate-300">Seleccionar Todo ({selectedIds.size})</span>
                </div>
                {#if selectedIds.size > 0}
                    <button
                        on:click={deleteSelected}
                        disabled={deleting}
                        class="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                        {#if deleting}
                            Eliminando...
                        {:else}
                            <TrashIcon size="sm" />
                            Eliminar Seleccionados ({selectedIds.size})
                        {/if}
                    </button>
                {/if}
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="text-xs text-slate-400 uppercase border-b border-white/5">
                            <th class="p-4 w-12"></th>
                            <th class="p-4">Álbum / Artista</th>
                            <th class="p-4">ID</th>
                            <th class="p-4">Problemas Detectados</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm divide-y divide-white/5">
                        {#each results as album}
                            <tr class="hover:bg-white/5 transition-colors {selectedIds.has(album.id) ? 'bg-primary-500/5' : ''}">
                                <td class="p-4">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.has(album.id)}
                                        on:change={() => toggleSelection(album.id)}
                                        class="w-5 h-5 rounded border-white/20 bg-black/20 text-primary-500 focus:ring-offset-0 focus:ring-0"
                                    />
                                </td>
                                <td class="p-4">
                                    <div class="font-bold text-white">{album.title}</div>
                                    <div class="text-slate-400 text-xs">{album.artist}</div>
                                </td>
                                <td class="p-4 font-mono text-xs text-slate-500">
                                    {album.id}
                                </td>
                                <td class="p-4">
                                    <div class="space-y-1">
                                        {#each album.issues as issue}
                                            <div class="text-red-300 text-xs flex items-center gap-1">
                                                <span>⚠️</span> {issue}
                                            </div>
                                        {/each}
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {:else if !scanning && scanStats.total > 0}
        <div class="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <div class="text-4xl mb-3">✅</div>
            <h3 class="text-xl font-bold text-white mb-1">¡Todo limpio!</h3>
            <p class="text-slate-400">No se encontraron archivos rotos en {scanStats.total} álbumes.</p>
        </div>
    {/if}
</div>
