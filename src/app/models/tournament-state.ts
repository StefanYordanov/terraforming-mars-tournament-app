export interface Player {
  id: number;
  name: string;
  score: number;
}

export interface TournamentSettings {
  rounds: number;
}

export interface TournamentState {
  players: Player[];
  settings: TournamentSettings;
}

