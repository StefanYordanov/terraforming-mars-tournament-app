import { BoardEnum } from "./board.model";
import { PlayerScore } from "./player-score.model";

export interface GameSession {
    board: BoardEnum;
    tableNumber: number;
    completed: boolean;
    playerScores: PlayerScore[];
}

