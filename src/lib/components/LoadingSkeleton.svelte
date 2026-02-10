<!-- Loading Skeleton Component -->
<div class="animate-pulse space-y-4">
    <!-- Header Skeleton -->
    <div class="h-8 bg-white/10 rounded-lg w-1/3"></div>

    <!-- Content Skeleton -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each Array(6) as _}
            <div class="bg-white/5 rounded-xl p-6 space-y-3">
                <div class="h-4 bg-white/10 rounded w-3/4"></div>
                <div class="h-3 bg-white/10 rounded w-1/2"></div>
                <div class="h-20 bg-white/10 rounded"></div>
            </div>
        {/each}
    </div>
</div>
