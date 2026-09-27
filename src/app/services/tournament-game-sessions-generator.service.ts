import { Injectable } from "@angular/core";
import { Tournament } from "../models/tournament.model";
import { TournamentRound } from "../models/tournament-round.model";
import { TournamentSettings } from "../models/tournament-settings.model";
import { shuffleArray } from "../utils/array-utils";
import { GameSession } from "../models/game-session.model";

@Injectable({ providedIn: 'root' })
export class TournamentRoundsGeneratorService {
  public generateGameSessions(tournament: Tournament): TournamentRound[] | null {
    const tableDistributions = this.generateTableAllocations(tournament.playersIds.length, tournament.settings);
    if(!tableDistributions) {
      return null;
    }

    const tablesTemplate: number[][] = [];
    for(let i = 0; i < tableDistributions.length; i++) {
      const amountOfTimesToAdd = tableDistributions[i];
      const numberOfPlayersToAdd = tournament.settings.preferedPlayerCountPerTablePriority[i];
      for(let j = 0; j < amountOfTimesToAdd; j++) {
        tablesTemplate.push(Array(numberOfPlayersToAdd).fill(0));
      }
    }

    const tournamentRounds: TournamentRound[] = [];
    for(let i = 0; i < tournament.settings.qualifierRoundsCount; i++) {
      const playerIds = shuffleArray(tournament.playersIds);
      const gameSessionsTemplate : number[][] =
        this.splayPlayersAcrossTableTemplate(playerIds, tablesTemplate);
      const gameSessions: GameSession[] = gameSessionsTemplate.map((playerIds, index) => {
        const gameSession : GameSession = {
          board: tournament.settings.roundBoards[i],
          generationsPlayed: 0,
          tableNumber: index + 1,
          completed: false,
          playerScores: playerIds.map(playerId => ({
            playerId: playerId,
            pointScore: 0,
            megaCreditScore: 0,
            corporationCard: '',
            preludeCards: []
          }))
        };
        return gameSession;
      });

      tournamentRounds.push({
        id: i + 1,
        title: `Round ${i + 1}`,
        gameSessions: gameSessions
      });
    }
    return tournamentRounds;
  }

  public generateTableAllocations(totalPlayers: number, settings: TournamentSettings): number[] | null {
    const prefs = settings.preferedPlayerCountPerTablePriority.slice();
    const maxTables = settings.numberOfTables;
    let countsDistributions = new Array(prefs.length).fill(0);
    while(true) {
      const remainingPlayers = totalPlayers - this.crossMultiply(prefs, countsDistributions);
      const remainingPlayersAreDivideable = remainingPlayers % prefs[0] === 0;
      const topPrioDistribution = remainingPlayers / prefs [0];
      const allPlayersFitTables = topPrioDistribution + countsDistributions.reduce((partialSum, a) => partialSum + a, 0) <= maxTables;
      if(remainingPlayersAreDivideable && allPlayersFitTables) {
        countsDistributions[0] = topPrioDistribution;
        return countsDistributions;
      } else {
        const nextCountsDistributions = this.getNextMostDesireableCountsDistribution(countsDistributions, prefs, totalPlayers);
        if(nextCountsDistributions === null) {
          return null;
        }
        countsDistributions = nextCountsDistributions;
      }
    }

  }

  private getNextMostDesireableCountsDistribution(countsDistribution: number[], prefs: number[], totalPlayers: number): number[] | null{
    const result = countsDistribution.slice();
    let currentIndex = 1;
    while(true){
      result[currentIndex]++;
      if(this.crossMultiply(result, prefs) > totalPlayers) {
        for(let i = 1; i<= currentIndex; i++){
          result[i] = 0;
        }
        currentIndex++;
        if(currentIndex >= countsDistribution.length){
          return null;
        }
      } else {
        break;
      }
    }
    return result;

  }

  private crossMultiply(arr1: number[], arr2: number[]) {
    let result = 0;
    for(let i = 0, len = Math.min(arr1.length, arr2.length); i<len; i++) {
      result += arr1[i] * arr2[i];
    }
    return result;
  }

  private splayPlayersAcrossTableTemplate(playerIds: number[], tablesTemplate: number[][]): number[][] {
    const result = structuredClone(tablesTemplate);
    for(let i=0, j=0, k = 0; i < playerIds.length; i++, k++) {
      if(isNaN(result[j][k])) {
        j++;
        k = 0;
      }
      result[j][k] = playerIds[i];
    }
    return result;
  }
}
