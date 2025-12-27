<script lang="ts">
	import '../app.postcss';
	
	// Floating UI for Popups
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	// Fonts
    import '@fontsource/cinzel';
    import '@fontsource/inter';
</script>

<!-- App Shell -->
<div class="h-full w-full overflow-hidden relative">
    <!-- Dynamic Background Layer (Phase 3 Placeholder) -->
    <div class="absolute inset-0 bg-cover bg-center z-0 opacity-20 pointer-events-none" 
         style="background-image: url('https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=2071&auto=format&fit=crop');">
    </div>

    <!-- Content -->
    <div class="relative z-10 h-full">
        <slot />
    </div>
</div>

<style>
    :global(body) {
        font-family: 'Inter', sans-serif;
    }
    :global(h1, h2, h3, h4, h5, h6) {
        font-family: 'Cinzel', serif;
    }
</style>
