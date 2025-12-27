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
    isLoadingGame: boolean;
}

// --- Internal Chess Logic ---

let chess = new Chess();
let moves: string[] = [];

// --- Store ---

const initialState: GameState = {
    fen: chess.fen(),
    history: [chess.fen()],
    currentMoveIndex: -1,
    isPlaying: false,
    currentGame: GAMES[0],
    lastMove: null,
    isLoadingGame: false
};

export const gameStore = writable<GameState>(initialState);

// --- Actions ---

let timer: any = null;
const MOVE_INTERVAL_MS = 3000;

export async function loadRandomLichessGame() {
    gameStore.update(s => ({ ...s, isLoadingGame: true }));

    try {
        // Lichess API: Get random game from top players
        const response = await fetch('https://lichess.org/api/games/user/DrNykterstein?max=1&rated=true&perfType=blitz&opening=true&clocks=false&evals=false&pgnInJson=true', {
            headers: { 'Accept': 'application/x-ndjson' }
        });

        const text = await response.text();
        const lines = text.trim().split('\n');
        const gameData = JSON.parse(lines[0]);

        const gameMeta: GameMetadata = {
            id: gameData.id,
            white: gameData.players.white.user.name,
            black: gameData.players.black.user.name,
            date: new Date(gameData.createdAt).getFullYear().toString(),
            event: `Lichess ${gameData.speed} • ${gameData.perf}`,
            win: gameData.winner === 'white' ? 'white' : gameData.winner === 'black' ? 'black' : 'draw',
            description: `${gameData.opening?.name || 'Classic Opening'}`,
            pgn: gameData.pgn
        };

        loadGame(gameMeta);
    } catch (error) {
        console.error('Failed to load Lichess game:', error);
        // Fallback to local games
        loadGame(GAMES[Math.floor(Math.random() * GAMES.length)]);
    } finally {
        gameStore.update(s => ({ ...s, isLoadingGame: false }));
    }
}

export function loadGame(gameMeta: GameMetadata) {
    stopAutoPlay();
    chess = new Chess();

    try {
        chess.loadPgn(gameMeta.pgn);
        const history = chess.history();
        moves = history;

        chess.reset();

        gameStore.set({
            fen: chess.fen(),
            history: [chess.fen()],
            currentMoveIndex: -1,
            isPlaying: false,
            currentGame: gameMeta,
            lastMove: null,
            isLoadingGame: false
        });

        startAutoPlay();

    } catch (e) {
        console.error("Failed to load PGN", e);
    }
}

export function nextMove() {
    const currentState = get(gameStore);
    if (currentState.currentMoveIndex >= moves.length - 1) {
        // Load new random game from Lichess
        loadRandomLichessGame();
        return;
    }

    const nextIndex = currentState.currentMoveIndex + 1;
    const moveSan = moves[nextIndex];

    const move = chess.move(moveSan);

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
    const currentState = get(gameStore);
    if (currentState.currentMoveIndex < 0) return;

    const move = chess.undo();

    if (move) {
        gameStore.update(state => {
            const newHistory = state.history.slice(0, -1);
            return {
                ...state,
                fen: chess.fen(),
                currentMoveIndex: state.currentMoveIndex - 1,
                lastMove: null,
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

// Initialize with random Lichess game
loadRandomLichessGame();
