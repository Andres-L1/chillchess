/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

declare module 'cm-chessboard/src/cm-chessboard/Chessboard.js' {
    export class Chessboard {
        constructor(element: HTMLElement, config?: any);
        destroy(): void;
        // add more if strictly needed, otherwise any covers usage
    }
    export const BORDER_TYPE: any;
    export const Input: any;
}

export { };
