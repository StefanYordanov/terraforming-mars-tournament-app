import { BoardEnum } from "./board.model";
import { GameSession, ComputedGameSession } from "./game-session.model";
import { Player } from "./player.model";

export interface TournamentRound {
  id: number;
  title: string;
  gameSessions: GameSession[];
}

export interface ComputedTournamentRound {
  id: number;
  title: string;
  players: Player[];
  unassignedPlayers: Player[];
  gameSessions: (ComputedGameSession | null)[];
}
