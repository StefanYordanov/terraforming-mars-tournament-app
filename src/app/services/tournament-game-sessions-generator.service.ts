import { Injectable } from "@angular/core";
import { Tournament } from "../models/tournament.model";
import { TournamentRound } from "../models/tournament-round.model";
import { TournamentSettings } from "../models/tournament-settings.model";
import { getRandomInt, getRandomIntegerExceptValue, shuffleArray } from "../utils/array-utils";
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
    const processedRoundTemplates: number[][][] = [];
    for(let i = 0; i < tournament.settings.qualifierRoundsCount; i++) {
      const playerIds = shuffleArray(tournament.playersIds);
      const gameSessionsTemplate : number[][] =
        this.splayPlayersAcrossTableTemplate(playerIds, tablesTemplate);

      const optimizedGameSessionsTemplate = this.minimizePlayerCollisions(gameSessionsTemplate, processedRoundTemplates);

      processedRoundTemplates.push(optimizedGameSessionsTemplate);
      const gameSessions: GameSession[] = optimizedGameSessionsTemplate.map((playerIds, index) => {
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

  private minimizePlayerCollisions(tablesTemplate: number[][], processedRoundTemplates: number[][][]): number[][]{
    if(tablesTemplate.length <2) {
      return tablesTemplate;
    }

    const playerInteractionMap: {[key: number]: Set<number>} = {};
    for(let processedRoundTemplate of processedRoundTemplates){
      for(let processedTableTemplate of processedRoundTemplate) {
        for(let playerId of processedTableTemplate) {
          for(let playerId2 of processedTableTemplate) {
            if(playerId !== playerId2) {
              if(!playerInteractionMap[playerId]){
                playerInteractionMap[playerId] = new Set<number>();
              }
              playerInteractionMap[playerId].add(playerId2);
            }
          }
        }
      }
    }

    let bestResult = structuredClone(tablesTemplate);

    for(let i = 0; i< 1000; i++) {
      const collisions = this.calculatePlayerCollisions(bestResult, playerInteractionMap);
      if(collisions.length === 0){
        break;
      }
      const collisionsPerPlayer = collisions.reduce((res: {[playerKey:string]:number}, collision)=>{
        const playerKey=`${collision.playerId1}_${collision.tableIndex}_${collision.player1Index}`;
        if(res[playerKey]){
          res[playerKey]++;
        } else {
          res[playerKey]=1;
        }
        return res;
      }, {});
      const collisionsCounts: {playerId: number, tableIndex: number, playerIndex: number, count: number}[] = [];
      for (const [key, count] of Object.entries(collisionsPerPlayer)) {
        const playerInfo = key.split('_').map(k => Number(k));
        collisionsCounts.push({playerId: playerInfo[0], tableIndex: playerInfo[1], playerIndex: playerInfo[2], count});
      }
      collisionsCounts.sort((cc1, cc2) => cc2.count - cc1.count);
      const topCollisionRecord = collisionsCounts[0];
      const testResult = structuredClone(bestResult);

      const randomOtherTableIndex= getRandomIntegerExceptValue(0, testResult.length - 1, topCollisionRecord.tableIndex);
      const randomOtherPlayerIndex = getRandomInt(0, testResult[randomOtherTableIndex].length - 1);
      const swapPlayerId = testResult[topCollisionRecord.tableIndex][topCollisionRecord.playerIndex];
      testResult[topCollisionRecord.tableIndex][topCollisionRecord.playerIndex] = testResult[randomOtherTableIndex][randomOtherPlayerIndex];
      testResult[randomOtherTableIndex][randomOtherPlayerIndex] = swapPlayerId;

      const testResultCollisions = this.calculatePlayerCollisions(testResult, playerInteractionMap);
      if(testResultCollisions.length > collisions.length){
        continue;
      } else {
        if(testResultCollisions.length < collisions.length) {
          i = 0;
        }
        bestResult = testResult;
      }
    }

    return bestResult;
  }

  private calculatePlayerCollisions(tablesTemplate: number[][], playerInteractionMap: {[key: number]: Set<number>}): CollisionTemplate[] {
    const resultCollisions: CollisionTemplate[] = [];
    for(let tableIndex = 0; tableIndex < tablesTemplate.length; tableIndex++) {
      const table= tablesTemplate[tableIndex];
      for(let player1Index = 0; player1Index < table.length; player1Index++){
        const playerId1 = table[player1Index];
        for(let player2Index= 0; player2Index < table.length; player2Index++) {
          const playerId2 = table[player2Index];
          if(playerInteractionMap[playerId1] && playerInteractionMap[playerId1].has(playerId2)){
            resultCollisions.push({
              tableIndex, player1Index, playerId1, player2Index, playerId2
            });
          }
        }
      }
    }
    return resultCollisions;
  }
}
interface CollisionTemplate {
  tableIndex: number;
  player1Index: number;
  playerId1: number;
  player2Index: number;
  playerId2: number;
}
