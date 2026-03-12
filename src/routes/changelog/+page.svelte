<script lang="ts">
    import { onMount } from 'svelte';
    import { ArrowLeft, ScrollText, Calendar, Tag, Zap, Palette, Shield } from 'lucide-svelte';
    
    export let data;
    const { content } = data;

    // A very simple markdown-ish parser for our changelog format
    function parseChangelog(text: string) {
        const lines = text.split('\n');
        const sections: any[] = [];
        let currentVersion: any = null;
        let currentCategory: any = null;

        lines.forEach(line => {
            if (line.startsWith('## [')) {
                const match = line.match(/## \[(.*?)\] - (.*?) "(.*?)"/);
                if (match) {
                    currentVersion = {
                        version: match[1],
                        date: match[2],
                        title: match[3],
                        categories: []
                    };
                    sections.push(currentVersion);
                    currentCategory = null;
                }
            } else if (line.startsWith('### ')) {
                if (currentVersion) {
                    currentCategory = {
                        name: line.replace('### ', '').trim(),
                        items: []
                    };
                    currentVersion.categories.push(currentCategory);
                }
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                if (currentCategory) {
                    const rawItem = line.substring(2).trim();
                    // Split into bolded title and description if it contains a colon
                    const colonIndex = rawItem.indexOf(':');
                    if (colonIndex !== -1 && colonIndex < 40) { // Limit length to avoid false positives
                        currentCategory.items.push({
                            title: rawItem.substring(0, colonIndex).trim(),
                            description: rawItem.substring(colonIndex + 1).trim()
                        });
                    } else {
                        currentCategory.items.push({
                            title: '',
                            description: rawItem
                        });
                    }
                }
            } else if (line.trim() && !line.startsWith('#') && currentVersion && !currentCategory) {
                // Intro text for the version
                currentVersion.intro = (currentVersion.intro || '') + line + ' ';
            }
        });

        return sections;
    }

    const changelogEntries = parseChangelog(content);

    function getCategoryIcon(name: string) {
        const n = name.toLowerCase();
        if (n.includes('diseño') || n.includes('estilo') || n.includes('art') || n.includes('visual')) return Palette;
        if (n.includes('streamer') || n.includes('herramientas') || n.includes('added') || n.includes('zap')) return Zap;
        if (n.includes('seguridad') || n.includes('control') || n.includes('admin') || n.includes('shield')) return Shield;
        return Tag;
    }
</script>

<div class="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8 font-display selection:bg-primary selection:text-white">
    <div class="max-w-4xl mx-auto space-y-8">
        <!-- Navigation -->
        <div class="flex items-center justify-between bg-white dark:bg-background-dark border-4 border-black p-4 shadow-neo">
            <a href="/" class="flex items-center gap-2 font-bold hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
                <ArrowLeft size={20} />
                <span>VOLVER</span>
            </a>
            <div class="flex items-center gap-2 font-black italic text-xl sm:text-2xl uppercase tracking-tighter">
                <ScrollText class="text-primary" />
                <span>Notas del Parche</span>
            </div>
            <div class="hidden sm:block font-mono text-sm border-2 border-black px-2 py-1 bg-primary text-white">
                v0.9.0
            </div>
        </div>

        <!-- Intro -->
        <div class="bg-primary text-white border-4 border-black p-6 shadow-neo-lg relative overflow-hidden">
            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="space-y-2">
                    <h1 class="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">¿Qué hay de nuevo?</h1>
                    <p class="font-bold text-lg opacity-90">Sigue la evolución de la plataforma paso a paso.</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <span class="bg-black text-white px-3 py-1 font-bold text-sm border-2 border-white shadow-neo-sm">VERSIÓN BETA</span>
                    <span class="bg-white text-black px-3 py-1 font-bold text-sm border-2 border-black shadow-neo-sm">CHILLCHESS OS</span>
                </div>
            </div>
            <!-- Decorative stripes -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rotate-45 translate-x-16 -translate-y-16"></div>
        </div>

        <!-- Changelog entries -->
        <div class="space-y-16 pb-20">
            {#each changelogEntries as entry}
                <section class="space-y-6">
                    <!-- Version Header -->
                    <div class="flex items-center gap-4">
                        <div class="bg-black text-white px-4 py-2 text-2xl font-black border-4 border-black shadow-neo transform -rotate-1">
                            v{entry.version}
                        </div>
                        <div class="h-1 flex-grow bg-black opacity-10 dark:opacity-30"></div>
                        <div class="flex items-center gap-2 font-mono text-sm font-bold opacity-60">
                            <Calendar size={16} />
                            {entry.date}
                        </div>
                    </div>

                    <div class="bg-white dark:bg-background-dark border-4 border-black p-6 shadow-neo-lg space-y-8">
                        <h2 class="text-3xl font-black italic uppercase text-primary transform -rotate-1 inline-block">
                            "{entry.title}"
                        </h2>

                        {#if entry.intro}
                            <p class="text-lg font-medium leading-relaxed border-l-4 border-primary pl-4 py-2 italic bg-gray-50 dark:bg-gray-800/40">
                                {entry.intro}
                            </p>
                        {/if}

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {#each entry.categories as category}
                                <div class="space-y-6">
                                    <div class="flex items-center gap-2 font-black uppercase tracking-tight text-xl border-b-4 border-black pb-2">
                                        <svelte:component this={getCategoryIcon(category.name)} size={24} class="text-primary" />
                                        {category.name}
                                    </div>
                                    <ul class="space-y-5">
                                        {#each category.items as item}
                                            <li class="group">
                                                <div class="flex items-start gap-3">
                                                    <span class="mt-1.5 w-2.5 h-2.5 bg-black dark:bg-white rounded-none flex-shrink-0 group-hover:bg-primary transition-colors"></span>
                                                    <div class="font-bold leading-snug">
                                                        {#if item.title}
                                                            <span class="text-primary uppercase tracking-tight block text-sm mb-1">{item.title}</span>
                                                        {/if}
                                                        <span class="group-hover:translate-x-1 transition-transform inline-block">
                                                            {item.description}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        {/each}
                                    </ul>
                                </div>
                            {/each}
                        </div>
                    </div>
                </section>
            {/each}
        </div>

        <!-- Footer -->
        <div class="border-t-4 border-black pt-8 text-center space-y-4">
            <p class="font-black italic text-xl uppercase tracking-tighter">Hecho con ❤️ por el equipo de ChillChess</p>
            <div class="flex justify-center gap-4">
                <a href="/dashboard" class="bg-primary text-white px-6 py-2 font-black border-4 border-black shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    IR AL DASHBOARD
                </a>
            </div>
        </div>
    </div>
</div>
