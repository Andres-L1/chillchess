<script lang="ts">
    export let id: string;
    export let label: string;
    export let type: string = "text";
    export let value: string = "";
    export let placeholder: string = "";
    export let error: string = "";
    export let required: boolean = false;
    export let maxlength: number | undefined = undefined;
    export let disabled: boolean = false;
    export let helperText: string = "";
</script>

<div class="w-full">
    <label
        for={id}
        class="block text-sm font-medium mb-2 text-slate-300"
        class:text-red-400={error}
    >
        {label}
        {#if required}
            <span class="text-red-400">*</span>
        {/if}
    </label>

    <input
        {id}
        {type}
        {placeholder}
        {maxlength}
        {disabled}
        bind:value
        on:input
        on:blur
        on:focus
        class="w-full bg-[#0B1120] border rounded-lg px-4 py-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        class:border-white/10={!error}
        class:focus:border-purple-500={!error}
        class:border-red-500={error}
        class:focus:border-red-500={error}
        class:ring-1={error}
        class:ring-red-500/50={error}
    />

    {#if error}
        <p class="text-xs text-red-400 mt-1 flex items-center gap-1">
            <svg
                class="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                />
            </svg>
            {error}
        </p>
    {:else if helperText}
        <p class="text-xs text-slate-500 mt-1">{helperText}</p>
    {/if}
</div>
