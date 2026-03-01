<script lang="ts">
    import '../app.postcss';
    import Sidebar from '$lib/components/layout/Sidebar.svelte';
    import Header from '$lib/components/layout/Header.svelte';
    import Toast from '$lib/components/ui/Toast.svelte';
</script>

<div class="flex-1 flex flex-col h-[100dvh] w-full md:w-auto relative">
    <Sidebar />

    <main class="flex-1 flex flex-col h-[100dvh] w-full md:w-auto relative">
        <Header />

        <div class="flex-1 overflow-y-auto bg-slate-50/50 relative" id="main-scroll-area">
            <div class="p-4 md:p-8">
                <div
                    id="app-content"
                    class="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 md:p-8 min-h-[60vh] md:min-h-[500px]"
                >
                    <slot />
                </div>
            </div>
        </div>
    </main>
</div>

<Toast />
