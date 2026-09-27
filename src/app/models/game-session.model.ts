import { BoardEnum } from "./board.model";
import { PlayerScore } from "./player-score.model";

export interface GameSession {
    board: BoardEnum;
    generationsPlayed: number;
    tableNumber: number;
    completed: boolean;
    playerScores: PlayerScore[];
}

