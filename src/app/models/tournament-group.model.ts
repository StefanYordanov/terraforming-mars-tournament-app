import { Player } from "./player.model";
import { ComputedTournament, Tournament } from "./tournament.model";

export interface TournamentGroup {
  id: number;
  title: string;
  tournaments: Tournament[]
}

export interface ComputedTournamentGroup {
  id: number;
  title: string;
  tournaments: ComputedTournament[];
  playerRankings: [{
    player: Player;
    rank: number;
    overallScore: number;
  }];
}