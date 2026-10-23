import { Player } from './player.model';
import { ComputedTournamentGroup, TournamentGroup } from './tournament-group.model';

export interface AppState {
  players: Record<number, Player>;
  playerRelations: Record<number, number[]>;
  tournamentGroups: TournamentGroup[];
}

export interface ComputedAppState {
  players: Record<number, Player>;
  tournamentGroups: ComputedTournamentGroup[];
}
