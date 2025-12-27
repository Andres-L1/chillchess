import { writable, get } from 'svelte/store';
import { Chess, type Move } from 'chess.js';
import { GAMES, type GameMetadata } from './pgns';

// --- State Definitions ---

export interface GameState {
    fen: string;
    history: string[]; // FEN history
    currentMoveIndex: number; // -1 for start position
    isPlaying: boolean;
    currentGame: GameMetadata;
    lastMove: Move | null;
}

// --- Internal Chess Logic ---

// We keep a separate chess instance for logic. 
// We will clone it for the "display" state to avoid mutation issues.
let chess = new Chess();
let moves: string[] = []; // Stores the move queue for the current PGN

// --- Store ---

const initialState: GameState = {
    fen: chess.fen(),
    history: [chess.fen()],
    currentMoveIndex: -1,
    isPlaying: false,
    currentGame: GAMES[0],
    lastMove: null
};

export const gameStore = writable<GameState>(initialState);

// --- Actions ---

let timer: any = null;
const MOVE_INTERVAL_MS = 3000; // 3 seconds per move ("Chill" pace)

export function loadGame(gameMeta: GameMetadata) {
    stopAutoPlay();
    chess = new Chess();

    // Load PGN to validate and extract moves
    try {
        chess.loadPgn(gameMeta.pgn);
        const history = chess.history(); // San 'e4', 'Nf6', ...
        moves = history; // Store all moves

        // Reset board to start
        chess.reset();

        gameStore.set({
            fen: chess.fen(),
            history: [chess.fen()],
            currentMoveIndex: -1,
            isPlaying: false,
            currentGame: gameMeta,
            lastMove: null
        });

        // Start playing automatically? Maybe wait for user action or play immediately.
        // Spec says "Al entrar, se carga... Ritmo configurable".
        // Let's start playing automatically after a short delay.
        startAutoPlay();

    } catch (e) {
        console.error("Failed to load PGN", e);
    }
}

export function nextMove() {
    const currentState = get(gameStore);
    if (currentState.currentMoveIndex >= moves.length - 1) {
        // Game Over - Loop or Stop? Spec says "bucle infinito".
        // Let's restart the game.
        resetGamePosition();
        return;
    }

    const nextIndex = currentState.currentMoveIndex + 1;
    const moveSan = moves[nextIndex];

    // Apply move to our internal logic
    const move = chess.move(moveSan);
    // Note: chess.move modifies the internal state of 'chess' instance.
    // However, since we reset it for the "visual" replay, we need to be careful.
    // Actually, 'chess' instance above holds the Start position? No.
    // When we loaded PGN, 'chess' was at the end. 
    // Then we did chess.reset(). So 'chess' is at start.
    // So calling chess.move() advances it correctly.

    if (move) {
        gameStore.update(state => ({
            ...state,
            fen: chess.fen(),
            currentMoveIndex: nextIndex,
            lastMove: move,
            history: [...state.history, chess.fen()]
        }));
    }
}

export function prevMove() {
    // Undo logic
    const currentState = get(gameStore);
    if (currentState.currentMoveIndex < 0) return;

    // chess.undo() updates the internal state back one step
    const move = chess.undo();

    if (move) {
        gameStore.update(state => {
            const newHistory = state.history.slice(0, -1);
            return {
                ...state,
                fen: chess.fen(),
                currentMoveIndex: state.currentMoveIndex - 1,
                lastMove: null, // Hard to know previous move without complex logic, null is fine for now
                history: newHistory
            };
        });
    }
}

export function resetGamePosition() {
    chess.reset();
    gameStore.update(state => ({
        ...state,
        fen: chess.fen(),
        currentMoveIndex: -1,
        history: [chess.fen()],
        lastMove: null
    }));
}

export function toggleAutoPlay() {
    const currentState = get(gameStore);
    if (currentState.isPlaying) {
        stopAutoPlay();
    } else {
        startAutoPlay();
    }
}

function startAutoPlay() {
    if (timer) clearInterval(timer);
    gameStore.update(s => ({ ...s, isPlaying: true }));
    timer = setInterval(() => {
        nextMove();
    }, MOVE_INTERVAL_MS);
}

function stopAutoPlay() {
    if (timer) clearInterval(timer);
    timer = null;
    gameStore.update(s => ({ ...s, isPlaying: false }));
}

// Initialize with the first game
loadGame(GAMES[0]);
