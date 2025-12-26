<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fly, fade } from "svelte/transition";

    export let isOpen = false;
    export let h3Index = "";
    export let distance = 0;

    const dispatch = createEventDispatcher();

    function close() {
        dispatch("close");
    }

    function conquer() {
        dispatch("conquer");
    }
</script>

{#if isOpen}
    <div
        class="modal-backdrop"
        transition:fade={{ duration: 200 }}
        on:click={close}
        on:keydown={(e) => e.key === "Escape" && close()}
        role="button"
        tabindex="0"
    >
        <div
            class="modal-content glass"
            transition:fly={{ y: 50, duration: 300 }}
            on:click|stopPropagation
            role="dialog"
            aria-modal="true"
        >
            <div class="header">
                <h2 class="text-xl font-bold text-glow">
                    <span class="text-chill-cyan">Territory</span> Detected
                </h2>
                <button class="close-btn" on:click={close}>&times;</button>
            </div>

            <div class="body">
                <div class="hex-icon">⬡</div>
                <p class="text-sm opacity-70 mb-2">ID: {h3Index}</p>
                <p class="text-md mb-4">
                    Distance: <span class="text-chill-pink font-bold"
                        >{Math.round(distance)}m</span
                    >
                </p>

                <div class="stats">
                    <div class="stat-item">
                        <span class="label">Status</span>
                        <span class="value text-chill-cyan">Unclaimed</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">Difficulty</span>
                        <span class="value">Easy</span>
                    </div>
                </div>
            </div>

            <div class="footer">
                <button class="btn btn-secondary" on:click={close}
                    >Cancel</button
                >
                <button class="btn btn-primary" on:click={conquer}>
                    Conquer via Chess
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 14, 39, 0.8);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 1rem;
    }

    .modal-content {
        width: 100%;
        max-width: 350px;
        border-radius: 1.5rem;
        padding: 1.5rem;
        background: rgba(26, 31, 58, 0.9);
        border: 1px solid rgba(0, 217, 255, 0.3);
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0.7;
    }

    .body {
        text-align: center;
        margin-bottom: 2rem;
    }

    .hex-icon {
        font-size: 4rem;
        color: #00d9ff;
        margin-bottom: 0.5rem;
        text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
    }

    .stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 1.5rem;
        background: rgba(0, 0, 0, 0.2);
        padding: 1rem;
        border-radius: 1rem;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .label {
        font-size: 0.75rem;
        opacity: 0.6;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .value {
        font-weight: bold;
    }

    .footer {
        display: flex;
        gap: 1rem;
    }

    .btn {
        flex: 1;
        padding: 0.75rem;
        border-radius: 0.75rem;
        border: none;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .btn-primary {
        background: linear-gradient(135deg, #00d9ff, #0099ff);
        color: #0a0e27;
        box-shadow: 0 0 15px rgba(0, 217, 255, 0.4);
    }

    .btn-primary:active {
        transform: scale(0.98);
        box-shadow: 0 0 10px rgba(0, 217, 255, 0.4);
    }
</style>
