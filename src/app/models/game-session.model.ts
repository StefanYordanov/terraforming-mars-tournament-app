import { BoardEnum } from "./board.model";
import { PlayerScore, ComputedPlayerScore, ComputedDummyScore } from "./player-score.model";

export interface GameSession {
    board: BoardEnum;
    generationsPlayed: number;
    tableNumber: number;
    completed: boolean;
    dummyPlayersCount?: number;
    playerScores: PlayerScore[];
}

export interface ComputedGameSession {
    board: BoardEnum;
    generationsPlayed: number;
    tableNumber: number;
    completed: boolean;
    dummyPlayersCount?: number;
    playerScores: ComputedPlayerScore[];
    dummyPlayerScores: ComputedDummyScore[];
}

