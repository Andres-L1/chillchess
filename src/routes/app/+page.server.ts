// Prevent SSR for this page since it depends heavily on browser APIs
export const ssr = false;

export async function load() {
    // Return empty data - all data loading happens client-side
    return {};
}
