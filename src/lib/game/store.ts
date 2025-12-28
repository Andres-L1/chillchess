import { writable, get } from 'svelte/store';
import { Chess, type Move } from 'chess.js';
import { GAMES, type GameMetadata } from './pgns';
import { logger } from '$lib/services/logger';
import { playMoveSound } from '$lib/audio/sfx';

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

// Top players with verified Lichess usernames
const TOP_PLAYERS = ['DrNykterstein', 'Hikaru', 'Alireza2003', 'FabianoCaruana', 'LevonAronian', 'DanielNaroditsky', 'GothamChess'];

export async function loadRandomLichessGame() {
    gameStore.update(s => ({ ...s, isLoadingGame: true }));

    try {
        // Pick a random top player
        const player = TOP_PLAYERS[Math.floor(Math.random() * TOP_PLAYERS.length)];

        console.log(`Loading games from ${player}...`);

        // Fetch recent rated games from Lichess API
        // Using correct endpoint and parameters
        const response = await fetch(
            `https://lichess.org/api/games/user/${player}?max=15&rated=true&perfType=blitz,rapid,classical&pgnInJson=true&clocks=false&evals=false&opening=true`,
            {
                headers: {
                    'Accept': 'application/x-ndjson'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        const lines = text.trim().split('\n').filter(line => line.length > 0);

        if (lines.length === 0) {
            console.warn('No games found for player, using local games');
            throw new Error("No games found");
        }

        // Pick a random game from the fetched batch
        const randomLine = lines[Math.floor(Math.random() * lines.length)];
        const gameData = JSON.parse(randomLine);

        console.log(`Loaded game: ${gameData.id}`);

        // Safely extract player names
        const whiteName = gameData.players?.white?.user?.name || 'Unknown';
        const blackName = gameData.players?.black?.user?.name || 'Unknown';

        const gameMeta: GameMetadata = {
            id: gameData.id,
            white: whiteName,
            black: blackName,
            date: new Date(gameData.createdAt).getFullYear().toString(),
            event: `Lichess ${gameData.speed || 'Blitz'}`,
            win: gameData.winner === 'white' ? 'white' : gameData.winner === 'black' ? 'black' : 'draw',
            description: gameData.opening?.name || 'Classic Game',
            pgn: gameData.pgn
        };

        loadGame(gameMeta);
    } catch (error: any) {
        logger.error('Failed to load Lichess game', { error: error.message || error });
        console.log('Falling back to local games database');
        // Fallback to local games on any error
        const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
        loadGame(randomGame);
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
        playMoveSound(move.flags.includes('c') || move.flags.includes('e'));
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
