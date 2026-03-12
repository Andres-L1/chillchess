<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    import {
        Settings2,
        Save,
        MonitorUp,
        Image as ImageIcon,
        Clock,
        Share2,
        Wand2,
        Gamepad2,
        Zap,
        Sparkles
    } from 'lucide-svelte';
    import OverlayPreview from './OverlayPreview.svelte';

    export let settings: any;
    export let saving = false;
    export let widgetUrl = '';

    const dispatch = createEventDispatcher();

    // Default settings if undefined
    if (!settings) {
        settings = {
            streamer: {
                channel: '',
                category: '',
                mainText: 'EL DIRECTO VA A EMPEZAR',
                subText: '',
                topBadge: '',
                extraTag: ''
            },
            logo: {
                url: '',
                animation: 'vibrate',
                glow: true
            },
            countdown: {
                active: true,
                minutes: 10,
                seconds: 0,
                targetTime: Date.now() + 600000,
                textAbove: 'COMENZAMOS EN',
                textZero: ''
            },
            platforms: {
                twitch: { active: false, user: '' },
                kick: { active: false, user: '' },
                youtube: { active: false, user: '' },
                discord: { active: false, user: '' },
                tiktok: { active: false, user: '' },
                instagram: { active: false, user: '' }
            },
            effects: {
                particles: 25,
                type: 'circles',
                vignette: true,
                glow: true
            },
            theme: 'cyber',
            platformInterval: 5
        };
    }

    let activeTab = 'templates';

    function handlePreviewUpdate() {
        // Update countdown targetTime whenever minutes/seconds change
        if (settings.countdown.active) {
            settings.countdown.targetTime = Date.now() + (settings.countdown.minutes * 60000) + (settings.countdown.seconds * 1000);
        }
        // Manual save only
    }

    function performManualSave() {
        dispatch('save', settings);
    }

    let copied = false;
    async function copyUrl() {
        // Force save before copying to ensure the URL has the latest data
        // This is now awaited to prevent race conditions
        await performManualSave();
        
        // Give it a tiny bit of extra breathing room for Firestore sync if needed, 
        // though the await should be enough.
        navigator.clipboard.writeText(widgetUrl);
        copied = true;
        setTimeout(() => copied = false, 2000);
    }


    let previewContainerWidth = 0;
    let previewContainerHeight = 0;
    
    // Scale calculation to perfectly fit a 1920x1080 frame inside the container with 16px padding
    $: scaleWidth = previewContainerWidth ? (previewContainerWidth - 32) / 1920 : 0.5;
    $: scaleHeight = previewContainerHeight ? (previewContainerHeight - 32) / 1080 : 0.5;
    $: currentScale = Math.min(scaleWidth, scaleHeight);
</script>

<div class="grid grid-cols-1 lg:grid-cols-4 gap-4 xl:gap-8 items-start h-full">
    <!-- Left Sidebar: Configuration -->
    <div class="lg:col-span-1 border-4 border-black bg-white dark:bg-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[85vh] overflow-hidden">
        
        <!-- Editor Header -->
        <div class="bg-black text-white p-4 border-b-4 border-black shrink-0">
            <h2 class="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                <Settings2 class="w-5 h-5 text-primary" /> Overlay Editor
            </h2>
            <p class="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">OBS • Stream Starting Soon</p>
        </div>

        <!-- Scrollable content area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
            
            <!-- TEMPLATES -->
            <div class="space-y-3">
                <button class="flex items-center justify-between w-full text-left font-black uppercase text-xs" on:click={() => activeTab = activeTab === 'templates' ? '' : 'templates'}>
                    <span class="flex items-center gap-2"><Gamepad2 class="w-4 h-4 text-primary"/> Templates</span>
                    <span class="text-slate-400 text-[10px]">{activeTab === 'templates' ? '▼' : '▶'}</span>
                </button>
                {#if activeTab === 'templates'}
                    <div class="grid grid-cols-2 gap-2" in:fade={{duration:150}}>
                        <button class="border-2 {settings.theme === 'neo-brutal' ? 'border-primary bg-primary/20' : 'border-black hover:bg-slate-100 dark:hover:bg-slate-800'} p-3 flex flex-col items-center gap-2" on:click={() => {settings.theme = 'neo-brutal'; handlePreviewUpdate()}}>
                            <div class="w-8 h-8 bg-slate-900 border-2 border-white flex items-center justify-center font-bold text-[#eab308]">NB</div>
                            <span class="text-[9px] font-black uppercase">Neo-Brutal</span>
                        </button>
                        <button class="border-2 {settings.theme === 'cyber' ? 'border-primary bg-primary/20' : 'border-black hover:bg-slate-100 dark:hover:bg-slate-800'} p-3 flex flex-col items-center gap-2" on:click={() => {settings.theme = 'cyber'; handlePreviewUpdate()}}>
                            <div class="w-8 h-8 bg-slate-900 shadow-[0_0_10px_#f472b6] flex items-center justify-center font-bold text-cyan-400">CY</div>
                            <span class="text-[9px] font-black uppercase">Cyber/Neon</span>
                        </button>
                        <button class="border-2 {settings.theme === 'arcade' ? 'border-primary bg-primary/20' : 'border-black hover:bg-slate-100 dark:hover:bg-slate-800'} p-3 flex flex-col items-center gap-2" on:click={() => {settings.theme = 'arcade'; handlePreviewUpdate()}}>
                            <div class="w-8 h-8 bg-black border-2 border-orange-500 shadow-[0_0_10px_#f97316] flex items-center justify-center font-bold text-orange-500">AR</div>
                            <span class="text-[9px] font-black uppercase">Arcade Era</span>
                        </button>
                        <button class="border-2 {settings.theme === 'matrix' ? 'border-primary bg-primary/20' : 'border-black hover:bg-slate-100 dark:hover:bg-slate-800'} p-3 flex flex-col items-center gap-2" on:click={() => {settings.theme = 'matrix'; handlePreviewUpdate()}}>
                            <div class="w-8 h-8 bg-black border-2 border-green-500 shadow-[0_0_10px_#22c55e] flex items-center justify-center font-bold text-green-500">M</div>
                            <span class="text-[9px] font-black uppercase">Neo Retro</span>
                        </button>
                    </div>
                {/if}
            </div>

            <hr class="border-black/20 dark:border-white/20"/>

            <!-- INFO STREAMER -->
            <div class="space-y-3">
                <button class="flex items-center justify-between w-full text-left font-black uppercase text-xs" on:click={() => activeTab = activeTab === 'info' ? '' : 'info'}>
                    <span class="flex items-center gap-2"><Settings2 class="w-4 h-4 text-primary"/> Info del Streamer</span>
                    <span class="text-slate-400 text-[10px]">{activeTab === 'info' ? '▼' : '▶'}</span>
                </button>
                {#if activeTab === 'info'}
                    <div class="space-y-4" in:fade={{duration:150}}>
                        <div class="space-y-1">
                            <label for="input-channel" class="text-[8px] font-black uppercase text-slate-500">Nombre del canal</label>
                            <input id="input-channel" type="text" bind:value={settings.streamer.channel} class="w-full border-2 border-black bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold font-sans" />
                        </div>
                        <div class="space-y-1">
                            <label for="input-category" class="text-[8px] font-black uppercase text-slate-500">Categoría / Juego</label>
                            <input id="input-category" type="text" bind:value={settings.streamer.category} class="w-full border-2 border-black bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold font-sans" />
                        </div>
                        <div class="space-y-1">
                            <label for="input-maintext" class="text-[8px] font-black uppercase text-slate-500">Texto principal</label>
                            <input id="input-maintext" type="text" bind:value={settings.streamer.mainText} class="w-full border-2 border-black bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold font-sans" />
                        </div>
                        <div class="space-y-1">
                            <label for="input-subtext" class="text-[8px] font-black uppercase text-slate-500">Subtexto</label>
                            <input id="input-subtext" type="text" bind:value={settings.streamer.subText} class="w-full border-2 border-black bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold font-sans" />
                        </div>
                        <div class="space-y-1">
                            <label for="input-topbadge" class="text-[8px] font-black uppercase text-slate-500">Texto Badge Superior</label>
                            <input id="input-topbadge" type="text" bind:value={settings.streamer.topBadge} class="w-full border-2 border-black bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold font-sans" />
                        </div>
                        <div class="space-y-1">
                            <label for="input-extratag" class="text-[8px] font-black uppercase text-slate-500">Nombre del servidor / Tag extra</label>
                            <input id="input-extratag" type="text" bind:value={settings.streamer.extraTag} class="w-full border-2 border-black bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold font-sans" />
                        </div>
                    </div>
                {/if}
            </div>

            <hr class="border-black/20 dark:border-white/20"/>

            <!-- LOGO -->
            <div class="space-y-3">
                <button class="flex items-center justify-between w-full text-left font-black uppercase text-xs" on:click={() => activeTab = activeTab === 'logo' ? '' : 'logo'}>
                    <span class="flex items-center gap-2"><ImageIcon class="w-4 h-4 text-primary"/> Logo</span>
                    <span class="text-slate-400 text-[10px]">{activeTab === 'logo' ? '▼' : '▶'}</span>
                </button>
                {#if activeTab === 'logo'}
                    <div class="space-y-4" in:fade={{duration:150}}>
                        <div class="border-2 border-dashed border-black bg-slate-50 dark:bg-slate-800 p-4 text-center cursor-pointer hover:bg-slate-100 transition-colors">
                            <label for="logo-url-input" class="sr-only">URL de imagen para el logo</label>
                            <input id="logo-url-input" type="text" bind:value={settings.logo.url} placeholder="URL de imagen (Ej: https://.../logo.png)" class="w-full text-xs bg-transparent text-center focus:outline-none placeholder-slate-400 font-bold" on:input={handlePreviewUpdate} />
                        </div>
                        <div class="space-y-1">
                            <label for="input-animation" class="text-[8px] font-black uppercase text-slate-500">Animación del logo</label>
                            <select id="input-animation" bind:value={settings.logo.animation} class="w-full border-2 border-black bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold font-sans">
                                <option value="none">Ninguna</option>
                                <option value="pulse">Respiración (Pulse)</option>
                                <option value="vibrate">Vibración (Bounce)</option>
                            </select>
                        </div>
                        <div class="flex items-center justify-between">
                            <label for="input-glow" class="text-[8px] font-black uppercase text-slate-500">Brillo/Glow alrededor del logo</label>
                            <input id="input-glow" type="checkbox" bind:checked={settings.logo.glow} class="accent-primary w-4 h-4" />
                        </div>
                    </div>
                {/if}
            </div>

            <hr class="border-black/20 dark:border-white/20"/>

             <!-- CUENTA ATRÁS -->
             <div class="space-y-3">
                <button class="flex items-center justify-between w-full text-left font-black uppercase text-xs" on:click={() => activeTab = activeTab === 'countdown' ? '' : 'countdown'}>
                    <span class="flex items-center gap-2"><Clock class="w-4 h-4 text-primary"/> Cuenta Atrás</span>
                    <span class="text-slate-400 text-[10px]">{activeTab === 'countdown' ? '▼' : '▶'}</span>
                </button>
                {#if activeTab === 'countdown'}
                    <div class="space-y-4" in:fade={{duration:150}}>
                        <div class="flex items-center justify-between bg-primary p-2 border-2 border-black">
                            <label for="input-countdown-active" class="text-[10px] font-black uppercase text-black">Activar Cuenta Atrás</label>
                            <input id="input-countdown-active" type="checkbox" bind:checked={settings.countdown.active} class="accent-black w-4 h-4" />
                        </div>
                        
                        {#if settings.countdown.active}
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1">
                                    <label for="input-min" class="text-[8px] font-black uppercase text-slate-500">Minutos</label>
                                    <input id="input-min" type="number" min="0" max="60" bind:value={settings.countdown.minutes} class="w-full border-2 border-black bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold font-sans text-center" on:change={handlePreviewUpdate}/>
                                </div>
                                <div class="space-y-1">
                                    <label for="input-sec" class="text-[8px] font-black uppercase text-slate-500">Segundos</label>
                                    <input id="input-sec" type="number" min="0" max="59" bind:value={settings.countdown.seconds} class="w-full border-2 border-black bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold font-sans text-center" on:change={handlePreviewUpdate}/>
                                </div>
                            </div>
                            <!-- Button to forcibly restart the timer to the set minutes/seconds -->
                            <button class="w-full bg-black text-white p-2 text-[10px] font-black uppercase border-2 border-black hover:bg-slate-800" on:click={() => {
                                settings.countdown.targetTime = Date.now() + (settings.countdown.minutes * 60000) + (settings.countdown.seconds * 1000);
                                handlePreviewUpdate();
                            }}>Reiniciar Temporizador</button>

                            <div class="space-y-1">
                                <label for="input-textabove" class="text-[8px] font-black uppercase text-slate-500">Texto Encima</label>
                                <input id="input-textabove" type="text" bind:value={settings.countdown.textAbove} class="w-full border-2 border-black bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold font-sans" />
                            </div>
                            <div class="space-y-1">
                                <label for="input-textzero" class="text-[8px] font-black uppercase text-slate-500">Texto al llegar a cero</label>
                                <input id="input-textzero" type="text" bind:value={settings.countdown.textZero} class="w-full border-2 border-black bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold font-sans" />
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>

            <hr class="border-black/20 dark:border-white/20"/>

            <!-- PLATAFORMAS -->
            <div class="space-y-3">
                <button class="flex items-center justify-between w-full text-left font-black uppercase text-xs" on:click={() => activeTab = activeTab === 'platforms' ? '' : 'platforms'}>
                    <span class="flex items-center gap-2"><Share2 class="w-4 h-4 text-primary"/> Plataformas</span>
                    <span class="text-slate-400 text-[10px]">{activeTab === 'platforms' ? '▼' : '▶'}</span>
                </button>
                {#if activeTab === 'platforms'}
                    <div class="space-y-4" in:fade={{duration:150}}>
                        {#each ['twitch', 'kick', 'youtube', 'discord', 'tiktok', 'instagram'] as platform (platform)}
                            <div class="flex flex-col gap-1">
                                <div class="flex items-center justify-between">
                                    <label for={`input-` + platform} class="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">{platform}</label>
                                    <input id={`input-` + platform} type="checkbox" bind:checked={settings.platforms[platform].active} class="accent-primary w-3 h-3" />
                                </div>
                                {#if settings.platforms[platform].active}
                                    <label for={`input-user-` + platform} class="sr-only">Usuario de {platform}</label>
                                    <input id={`input-user-` + platform} type="text" bind:value={settings.platforms[platform].user} placeholder={`Usuario de ${platform}`} class="w-full border-2 border-black bg-slate-50 dark:bg-slate-800 p-1 text-[10px] font-bold font-sans" />
                                {/if}
                            </div>
                        {/each}
                        <div class="pt-4 border-t-2 border-dashed border-black">
                            <label for="input-platform-interval" class="text-[8px] font-black uppercase text-slate-500 block mb-1">Rotación Automática (Segundos)</label>
                            <input id="input-platform-interval" type="number" min="1" max="60" bind:value={settings.platformInterval} class="w-full border-2 border-black bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold font-sans text-center" />
                        </div>
                    </div>
                {/if}
            </div>

            <hr class="border-black/20 dark:border-white/20"/>

            <!-- EFECTOS -->
            <div class="space-y-3">
                <button class="flex items-center justify-between w-full text-left font-black uppercase text-xs" on:click={() => activeTab = activeTab === 'effects' ? '' : 'effects'}>
                    <span class="flex items-center gap-2"><Sparkles class="w-4 h-4 text-primary"/> Elementos / Efectos</span>
                    <span class="text-slate-400 text-[10px]">{activeTab === 'effects' ? '▼' : '▶'}</span>
                </button>
                {#if activeTab === 'effects'}
                    <div class="space-y-4" in:fade={{duration:150}}>
                        <div class="flex items-center justify-between">
                            <label for="input-vignette" class="text-[8px] font-black uppercase text-slate-500">Scanlines / TV Overlay</label>
                            <input id="input-vignette" type="checkbox" bind:checked={settings.effects.vignette} class="accent-primary w-4 h-4" />
                        </div>
                        <div class="flex items-center justify-between">
                            <label for="input-effects-glow" class="text-[8px] font-black uppercase text-slate-500">Viñeta (Bordes oscuros)</label>
                            <input id="input-effects-glow" type="checkbox" bind:checked={settings.effects.glow} class="accent-primary w-4 h-4" />
                        </div>
                    </div>
                {/if}
            </div>
            
            <div class="pb-10"></div>
        </div>

        <!-- Footer Actions -->
        <div class="p-4 bg-slate-100 dark:bg-slate-800 border-t-4 border-black space-y-3 shrink-0">
            <button class="w-full {copied ? 'bg-green-400' : 'bg-primary'} text-black font-black uppercase py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2" on:click={copyUrl}>
                <MonitorUp class="w-5 h-5"/> {copied ? '¡URL COPIADA!' : 'EXPORTAR PARA OBS'}
            </button>
            
            <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-black/20 rounded flex items-start gap-2">
                <Sparkles class="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                <p class="text-[9px] font-bold text-slate-600 dark:text-slate-400 leading-tight">
                    Los cambios se verán en tu OBS solo después de guardar.
                </p>
            </div>

            <button class="w-full bg-green-500 text-black font-black uppercase py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2" on:click={performManualSave}>
                {#if saving}
                    <div class="w-4 h-4 border-2 border-black border-r-transparent rounded-full animate-spin"></div>
                    Guardando...
                {:else}
                    <Save class="w-4 h-4"/> GUARDAR CAMBIOS
                {/if}
            </button>
            <p class="text-[8px] text-center text-slate-500 font-bold">Elige un archivo .html o URL de navegador en OBS.</p>
        </div>
    </div>

    <!-- Right Area: Live Preview -->
    <div class="lg:col-span-3 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-slate-900 rounded-lg overflow-hidden flex flex-col items-center justify-center h-[50vh] lg:h-auto min-h-[400px]">
        <div class="w-full px-4 py-2 bg-black border-b-2 border-slate-800 flex justify-between items-center text-slate-400 font-mono text-[10px] shrink-0">
            <span>PREVIEW</span>
            <span>1920 × 1080</span>
        </div>
        
        <div class="flex-1 w-full bg-black/50 overflow-hidden flex items-center justify-center relative p-0 m-0" bind:clientWidth={previewContainerWidth} bind:clientHeight={previewContainerHeight}>
            <!-- A 1920x1080 container strictly scaled down -->
            <div 
                class="absolute origin-center shadow-2xl bg-black border-2 border-slate-800 pointer-events-none" 
                style="width: 1920px; height: 1080px; transform: scale({currentScale});"
            >
                <!-- Inner rendering component which will exactly match OBS scaling -->
                <OverlayPreview {settings} />
            </div>
        </div>
    </div>
</div>
