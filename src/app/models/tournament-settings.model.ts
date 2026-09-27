import { BoardEnum } from "./board.model";

export interface TournamentSettings {
  qualifierRoundsCount: number;
  preferedPlayerCountPerTablePriority: number[];
  numberOfTables: number;
  roundBoards: BoardEnum[]
}
