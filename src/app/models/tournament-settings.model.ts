import { BoardEnum } from "./board.model";

export interface TournamentSettings {
  qualifierRoundsCount: number;
  preferedPlayerCountPerTable: number;
  numberOfTables: number;
  roundBoards: BoardEnum[]
}
