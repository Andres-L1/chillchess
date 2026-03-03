/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            user: {
                uid: string;
                email?: string;
                isAdmin: boolean;
            } | null;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }

    namespace svelteHTML {
        interface HTMLAttributes<T> {
            "on:click_outside"?: (event: CustomEvent) => void;
        }
    }
}

export { };
