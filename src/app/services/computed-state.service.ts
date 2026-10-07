import { Injectable } from "@angular/core";
import { ComputedGameSession, GameSession } from "../models/game-session.model";
import { ComputedDummyScore, ComputedPlayerScore } from "../models/player-score.model";
import { ComputedTournamentRound, TournamentRound } from "../models/tournament-round.model";
import { Player } from "../models/player.model";
import { ComputedPlayerRanking, ComputedTournament, Tournament } from "../models/tournament.model";

@Injectable({ providedIn: 'root' })
export class ComputedStateService {
  private RANK_POINTS_FIRST_PLACE = 100;
  private RANK_POINTS_LAST_PLACE = 10;
  private START_TR_RATING = 20;

  private precalculatedRankPointAwards: { [key: number]: number[] } = {
    2: [100, 10],
    3: [100, 55, 10],
    4: [100, 70, 40, 10],
    5: [100, 77, 55, 33, 10],
    6: [100, 82, 64, 46, 28, 10],
  };

  public generateRankPointAwards(numberOfPlayers: number): number[] | null {
    if(numberOfPlayers <= 1) {
      return null;
    }

    if (this.precalculatedRankPointAwards[numberOfPlayers]) {
      return this.precalculatedRankPointAwards[numberOfPlayers];
    }

    const awards: number[] = [];
    const range = this.RANK_POINTS_FIRST_PLACE - this.RANK_POINTS_LAST_PLACE;

    const step = range / Math.max(1, numberOfPlayers - 1);

    for (let i = 0; i < numberOfPlayers; i++) {
      awards.push(Math.round(this.RANK_POINTS_FIRST_PLACE - (i * step)));
    }
    console.log(awards);
    return awards;
  }

  public computeGameSession(gameSession: GameSession): ComputedGameSession | null {
    const numberOfPlayers = gameSession.playerScores.length + (gameSession.dummyPlayersCount || 0);
    const rankPointAwards = this.generateRankPointAwards(numberOfPlayers) || [];
    if(!rankPointAwards) {
      return null;
    }
    let calculatedDummyPlayers: ComputedDummyScore[] = [];
    if(gameSession.dummyPlayersCount && gameSession.dummyPlayersCount > 0) {
      const averagePlayerValues = this.getAveragePlayerScores(gameSession);
      for(let i = 0; i < gameSession.dummyPlayersCount; i++) {
        calculatedDummyPlayers.push({
          pointScore: averagePlayerValues.pointScore,
          megaCreditScore: averagePlayerValues.megaCreditScore,
          rankPointScore: 0,
          dominationPointScore: 0
        });
      }
    }

    let calculatedPlayerScores: ComputedPlayerScore[] =
        gameSession.playerScores.map((playerScore, index) => {
          return { ...playerScore, rankPointScore: 0, dominationPointScore: 0 };
        });
    const tiebreakPointCoeficient = 0.5;
    const totalAccumulatedPointScore = calculatedDummyPlayers
      .reduce((sum, player) => sum + player.pointScore - this.START_TR_RATING, 0) +
      calculatedPlayerScores.reduce((sum, player) => sum + player.pointScore - this.START_TR_RATING, 0) + tiebreakPointCoeficient;
    const totalAccumulatedMegaCreditScore = calculatedDummyPlayers
      .reduce((sum, player) => sum + player.megaCreditScore, 0) +
      calculatedPlayerScores.reduce((sum, player) => sum + player.megaCreditScore, 0);
    if(totalAccumulatedPointScore === 0 || totalAccumulatedMegaCreditScore === 0) {
      return null;
    }

    for(let player of calculatedPlayerScores) {
      const tiebreakPointShare = player.megaCreditScore / totalAccumulatedMegaCreditScore * tiebreakPointCoeficient;
      const pointsShare = (player.pointScore - this.START_TR_RATING + tiebreakPointShare) / totalAccumulatedPointScore;
      player.dominationPointScore = pointsShare * 100 * numberOfPlayers;
    }

    for(let dummyPlayer of calculatedDummyPlayers) {
      const tiebreakPointShare = dummyPlayer.megaCreditScore / totalAccumulatedMegaCreditScore * tiebreakPointCoeficient;
      const pointsShare = (dummyPlayer.pointScore - this.START_TR_RATING + tiebreakPointShare) / totalAccumulatedPointScore;
      dummyPlayer.dominationPointScore = pointsShare * 100 * numberOfPlayers;
    }

    const allPlayers = [...calculatedPlayerScores, ...calculatedDummyPlayers];

    for(let player of calculatedPlayerScores) {
      const playersBetterThanThisPlayer = allPlayers.filter(p => p.pointScore > player.pointScore).length;
      player.rankPointScore = rankPointAwards[playersBetterThanThisPlayer];
    }

    for(let dummyPlayer of calculatedDummyPlayers) {
      const playersBetterThanThisPlayer = allPlayers.filter(p => p.pointScore > dummyPlayer.pointScore).length;
      dummyPlayer.rankPointScore = rankPointAwards[playersBetterThanThisPlayer];
    }

    return {
      ...gameSession,
      playerScores: calculatedPlayerScores,
      dummyPlayerScores: calculatedDummyPlayers
    };
  }

  public computeTournamentRound(round: TournamentRound, players: Player[]): ComputedTournamentRound | null {
    return {
      ...round,
      players: players,
      unassignedPlayers: players.filter(player => !round.gameSessions.some(session => session.playerScores.some(score => score.playerId === player.id))),
      gameSessions: round.gameSessions.map(session => this.computeGameSession(session))
    };
  }

  public computeTournament(tournament: Tournament, players: Record<number, Player>): ComputedTournament | null {
    const tournamentPlayers = tournament.playersIds.map(playerId => players[playerId]).filter((player): player is Player => !!player);

    return {
      ...tournament,
      players: tournamentPlayers,
      qualifierRounds: tournament.qualifierRounds.map(round => this.computeTournamentRound(round, tournamentPlayers)).filter((round): round is ComputedTournamentRound => round !== null),
      finalRound: tournament.finalRound ? this.computeTournamentRound(tournament.finalRound, tournamentPlayers) : null,
      playerRankings: this.computePlayerRankings(tournament, tournamentPlayers),
    };
  }

  computePlayerRankings(tournament: Tournament, players: Player[]): ComputedPlayerRanking[] | null {
    return null;
  }

  private getAveragePlayerScores(gameSession: GameSession): { pointScore: number; megaCreditScore: number } {
    if(!gameSession.playerScores || gameSession.playerScores.length === 0) {
      return { pointScore: this.START_TR_RATING, megaCreditScore: 0 };
    }
    const totalPointScore = gameSession.playerScores.reduce((sum, player) => sum + player.pointScore, 0);
    const totalMegaCreditScore = gameSession.playerScores.reduce((sum, player) => sum + player.megaCreditScore, 0);
    const averagePointScore = totalPointScore / gameSession.playerScores.length;
    const averageMegaCreditScore = totalMegaCreditScore / gameSession.playerScores.length;

    return { pointScore: averagePointScore, megaCreditScore: averageMegaCreditScore };
  }


}
