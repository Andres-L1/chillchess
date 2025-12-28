<!-- TAB: USERS - Simple Version -->
{#if activeTab === "users"}
    <div class="animate-fade-in space-y-4">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">
                Usuarios ({realUsers.length})
            </h2>
            <button
                on:click={fetchRealUsers}
                disabled={usersLoading}
                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
            >
                {usersLoading ? "⏳ Cargando..." : "🔄 Refrescar"}
            </button>
        </div>

        <!-- Table Container -->
        <div
            class="bg-[#1e293b]/50 rounded-2xl border border-white/5 overflow-hidden"
        >
            <div class="overflow-x-auto">
                <table class="w-full">
                    <!-- Header -->
                    <thead class="bg-white/5">
                        <tr class="text-left">
                            <th
                                class="px-6 py-4 text-xs font-bold text-slate-400 uppercase"
                                >Usuario</th
                            >
                            <th
                                class="px-6 py-4 text-xs font-bold text-slate-400 uppercase"
                                >Email</th
                            >
                            <th
                                class="px-6 py-4 text-xs font-bold text-slate-400 uppercase"
                                >Plan</th
                            >
                            <th
                                class="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center"
                                >Acción</th
                            >
                        </tr>
                    </thead>

                    <!-- Body -->
                    <tbody class="divide-y divide-white/5">
                        {#if usersLoading}
                            <!-- Loading State -->
                            <tr>
                                <td colspan="4" class="px-6 py-12 text-center">
                                    <div
                                        class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white mb-2"
                                    ></div>
                                    <p class="text-slate-400">
                                        Cargando usuarios...
                                    </p>
                                </td>
                            </tr>
                        {:else if realUsers.length === 0}
                            <!-- Empty State -->
                            <tr>
                                <td
                                    colspan="4"
                                    class="px-6 py-12 text-center text-slate-400"
                                >
                                    No hay usuarios registrados
                                </td>
                            </tr>
                        {:else}
                            <!-- Users List -->
                            {#each realUsers as user}
                                {@const isPro =
                                    user.subscriptionTier === "pro" ||
                                    user.subscriptionTier === "premium"}
                                <tr class="hover:bg-white/5 transition-colors">
                                    <!-- Usuario: Avatar + Name -->
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0"
                                            >
                                                {(user.displayName ||
                                                    user.email ||
                                                    "U")[0].toUpperCase()}
                                            </div>
                                            <span
                                                class="text-white font-medium"
                                            >
                                                {user.displayName ||
                                                    "Sin nombre"}
                                            </span>
                                        </div>
                                    </td>

                                    <!-- Email -->
                                    <td class="px-6 py-4">
                                        <span class="text-slate-300 text-sm">
                                            {user.email || "No especificado"}
                                        </span>
                                    </td>

                                    <!-- Plan Badge -->
                                    <td class="px-6 py-4">
                                        {#if isPro}
                                            <span
                                                class="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-bold text-white"
                                            >
                                                ✨ PRO
                                            </span>
                                        {:else}
                                            <span
                                                class="inline-flex items-center px-3 py-1 bg-slate-700 rounded-full text-xs font-medium text-slate-300"
                                            >
                                                GRATUITO
                                            </span>
                                        {/if}
                                    </td>

                                    <!-- Action Button -->
                                    <td class="px-6 py-4 text-center">
                                        <button
                                            on:click={() =>
                                                toggleUserPlan(user.id, isPro)}
                                            class="px-4 py-2 rounded-lg font-medium text-xs transition-all {isPro
                                                ? 'bg-red-600 hover:bg-red-500 text-white'
                                                : 'bg-green-600 hover:bg-green-500 text-white'}"
                                        >
                                            {isPro
                                                ? "❌ Quitar Pro"
                                                : "✅ Dar Pro"}
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
{/if}
