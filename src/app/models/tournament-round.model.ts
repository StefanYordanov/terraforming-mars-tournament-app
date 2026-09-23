import { BoardEnum } from "./board.model";
import { GameSession } from "./game-session.model";
import { Player } from "./player.model";

export interface TournamentRound {
  id: number;
  title: string;
  gameSessions: GameSession[];
}

export interface ComputedTournamentRound {
  id: number;
  board: BoardEnum;
  title: string;
  players: Player[];
  unassignedPlayers: Player[];
  gameSessions: GameSession[];
}