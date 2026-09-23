import { Player } from "./player.model";
import { ComputedTournamentRound, TournamentRound } from "./tournament-round.model";
import { TournamentSettings } from "./tournament-settings.model";

export interface Tournament {
  id: number;
  title: string;
  playerReservations: PlayerReservation[];
  playersIds: number[];
  settings: TournamentSettings;
  qualifierRounds: TournamentRound[];
  finalRound: TournamentRound | null;
}

export interface PlayerReservation {
  playerId: string;
  isCheckedIn: boolean;
}

export interface ComputedTournament {
  id: number;
  title: string;
  players: Player[];
  playerReservations: Player[];
  settings: TournamentSettings;
  rounds: ComputedTournamentRound[];
  finalRound: ComputedTournamentRound | null;
  unassignedPlayers: Player[];
  playerRankings: [{
    player: Player;
    rank: number;
    rankPoints: number;
    tournamentPoints: number[];
    tournamentPointsTotal: number;
    dominancePoints: number[];
    dominancePointsTotal: number;
    dominancePointsPrecise: number[];
    dominancePointsPreciseTotal: number;
  }];
}