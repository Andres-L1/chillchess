import { writable } from 'svelte/store';

export interface UIState {
    // Modals
    showAuthModal: boolean;
    showPaywall: boolean;
    showMusicExplorer: boolean;

    // Paywall
    blockedFeature: string;

    // Mobile
    mobileMenuOpen: boolean;

    // Player
    isPlayerCollapsed: boolean;
    showVolumeSlider: boolean;
}

const initialState: UIState = {
    showAuthModal: false,
    showPaywall: false,
    showMusicExplorer: false,
    blockedFeature: '',
    mobileMenuOpen: false,
    isPlayerCollapsed: false,
    showVolumeSlider: false
};

function createUIStore() {
    const { subscribe, set, update } = writable<UIState>(initialState);

    return {
        subscribe,

        // Modal actions
        openAuthModal: () => update(s => ({ ...s, showAuthModal: true })),
        closeAuthModal: () => update(s => ({ ...s, showAuthModal: false })),

        openPaywall: (feature: string) => update(s => ({
            ...s,
            showPaywall: true,
            blockedFeature: feature
        })),
        closePaywall: () => update(s => ({ ...s, showPaywall: false, blockedFeature: '' })),

        toggleMusicExplorer: () => update(s => ({ ...s, showMusicExplorer: !s.showMusicExplorer })),
        closeMusicExplorer: () => update(s => ({ ...s, showMusicExplorer: false })),

        // Mobile menu
        toggleMobileMenu: () => update(s => ({ ...s, mobileMenuOpen: !s.mobileMenuOpen })),
        closeMobileMenu: () => update(s => ({ ...s, mobileMenuOpen: false })),

        // Player
        togglePlayerCollapse: () => update(s => ({ ...s, isPlayerCollapsed: !s.isPlayerCollapsed })),
        expandPlayer: () => update(s => ({ ...s, isPlayerCollapsed: false })),
        collapsePlayer: () => update(s => ({ ...s, isPlayerCollapsed: true })),

        toggleVolumeSlider: () => update(s => ({ ...s, showVolumeSlider: !s.showVolumeSlider })),

        // Reset all
        reset: () => set(initialState)
    };
}

export const uiStore = createUIStore();
