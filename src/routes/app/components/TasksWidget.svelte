<script lang="ts">
    export let tasks: any[] = [];
    export let onOpenModal: (task: any) => void;
    export let onToggle: (task: any) => void;
</script>

<div
    class="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full min-h-[400px] backdrop-blur-md"
>
    <!-- Header -->
    <div class="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    /></svg
                >
            </div>
            <div>
                <h2 class="text-lg font-bold text-white tracking-tight">Tareas</h2>
                <p class="text-xs text-slate-400">¿Qué hay para hoy?</p>
            </div>
        </div>
        <button
            on:click={() => onOpenModal(null)}
            class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                /></svg
            >
        </button>
    </div>

    <!-- Lista -->
    <div class="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
        {#if tasks.length === 0}
            <div class="flex flex-col items-center justify-center h-48 text-slate-600 text-center">
                <svg
                    class="w-12 h-12 mb-3 opacity-20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    /></svg
                >
                <p class="text-slate-500 text-sm">Lista vacía. ¡Bien!</p>
                <button
                    on:click={() => onOpenModal(null)}
                    class="mt-2 text-blue-400 text-sm font-medium hover:underline"
                >
                    Añadir tarea
                </button>
            </div>
        {:else}
            {#each tasks as task}
                <div
                    class="flex items-center p-3 rounded-2xl bg-black/20 border border-white/5 hover:border-blue-500/30 hover:bg-white/5 transition-all group {task.completed
                        ? 'opacity-50'
                        : ''}"
                >
                    <button
                        on:click|stopPropagation={() => onToggle(task)}
                        class="w-6 h-6 rounded-lg border-2 border-slate-600 mr-4 flex items-center justify-center transition-colors hover:border-blue-400 {task.completed
                            ? 'bg-blue-500 border-blue-500'
                            : ''}"
                    >
                        {#if task.completed}<svg
                                class="w-3.5 h-3.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="3"
                                    d="M5 13l4 4L19 7"
                                /></svg
                            >{/if}
                    </button>

                    <button on:click={() => onOpenModal(task)} class="flex-1 text-left py-1">
                        <span
                            class="font-medium text-sm md:text-base block {task.completed
                                ? 'line-through text-slate-500'
                                : 'text-slate-200 group-hover:text-white'} transition-colors"
                            >{task.title}</span
                        >
                        {#if task.dueDate && task.dueDate !== 'Sin fecha'}
                            <div class="flex items-center gap-2 mt-1">
                                <span
                                    class="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md flex items-center gap-1"
                                >
                                    <svg
                                        class="w-3 h-3 opacity-50"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        /></svg
                                    >
                                    {task.dueDate}
                                </span>
                            </div>
                        {/if}
                    </button>

                    {#if task.priority === 'high'}
                        <span
                            class="text-[9px] font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded-lg border border-red-500/20"
                            >ALTA</span
                        >
                    {:else if task.priority === 'medium'}
                        <span
                            class="text-[9px] font-bold bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg border border-yellow-500/20"
                            >MED</span
                        >
                    {/if}
                </div>
            {/each}
        {/if}
    </div>
</div>
