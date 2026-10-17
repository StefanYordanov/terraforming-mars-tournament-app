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
    2: [ this.RANK_POINTS_FIRST_PLACE, this.RANK_POINTS_LAST_PLACE],
    3: [ this.RANK_POINTS_FIRST_PLACE, 55, this.RANK_POINTS_LAST_PLACE],
    4: [ this.RANK_POINTS_FIRST_PLACE, 70, 40, this.RANK_POINTS_LAST_PLACE],
    5: [ this.RANK_POINTS_FIRST_PLACE, 77, 55, 33, this.RANK_POINTS_LAST_PLACE],
    6: [ this.RANK_POINTS_FIRST_PLACE, 82, 64, 46, 28, this.RANK_POINTS_LAST_PLACE],
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
    const middle = (this.RANK_POINTS_FIRST_PLACE + this.RANK_POINTS_LAST_PLACE) / 2;

    const step = range / Math.max(1, numberOfPlayers - 1);

    for (let i = 0; i < numberOfPlayers; i++) {
      let rank = this.RANK_POINTS_FIRST_PLACE - (i * step);
      if(rank - Math.floor(rank) != 0.5) {
        awards.push(Math.round(rank));
      } else {
        if(rank >= middle) {
          awards.push(Math.floor(rank));
        } else {
          awards.push(Math.round(rank));
        }
      }
    }
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
          gameSessionRankPointScore: 0,
          gameSessionRank: 0,
          dominationPointScore: 0
        });
      }
    }

    let calculatedPlayerScores: ComputedPlayerScore[] =
        gameSession.playerScores.map((playerScore, index) => {
          return { ...playerScore, gameSessionRankPointScore: 0, gameSessionRank: 0, dominationPointScore: 0 };
        });
    const tiebreakPointCoeficient = 0.1 * numberOfPlayers;
    const totalAccumulatedPointScore =
    calculatedDummyPlayers.reduce(
      (sum, player) => sum + player.pointScore - this.START_TR_RATING, 0)
        +
    calculatedPlayerScores.reduce(
      (sum, player) => sum + player.pointScore - this.START_TR_RATING, 0)
        + tiebreakPointCoeficient;
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
      const playersBetterThanThisPlayer = allPlayers.filter(p => p.dominationPointScore > player.dominationPointScore).length;
      player.gameSessionRankPointScore = rankPointAwards[playersBetterThanThisPlayer];
      player.gameSessionRank = playersBetterThanThisPlayer + 1;
    }

    for(let dummyPlayer of calculatedDummyPlayers) {
      const playersBetterThanThisPlayer = allPlayers.filter(p => p.dominationPointScore > dummyPlayer.dominationPointScore).length;
      dummyPlayer.gameSessionRankPointScore = rankPointAwards[playersBetterThanThisPlayer];
      dummyPlayer.gameSessionRank = playersBetterThanThisPlayer + 1;
    }

    return {
      ...gameSession,
      playerScores: calculatedPlayerScores,
      dummyPlayerScores: calculatedDummyPlayers
    };
  }

  public computeTournamentRound(round: TournamentRound, players: Player[]): ComputedTournamentRound {
    return {
      ...round,
      players: players,
      unassignedPlayers: players.filter(player => !round.gameSessions.some(session => session.playerScores.some(score => score.playerId === player.id))),
      gameSessions: round.gameSessions.map(session => this.computeGameSession(session))
    };
  }

  public computeTournament(tournament: Tournament, players: Record<number, Player>): ComputedTournament | null {
    const tournamentPlayers = tournament.playersIds.map(playerId => players[playerId]).filter((player): player is Player => !!player);
    const computedQualifierRounds = tournament.qualifierRounds.map(round => this.computeTournamentRound(round, tournamentPlayers));
    const computedFinalRound = tournament.finalRound ? this.computeTournamentRound(tournament.finalRound, tournamentPlayers) : null;
    return {
      ...tournament,
      players: tournamentPlayers,
      qualifierRounds: computedQualifierRounds,
      finalRound: computedFinalRound,
      playerRankings: this.computePlayerRankings(tournament, tournamentPlayers, computedQualifierRounds, computedFinalRound),
    };
  }

  computePlayerRankings(tournament: Tournament,
    tournamentPlayers: Player[],
    qualifierRounds: ComputedTournamentRound[],
    finalRound: ComputedTournamentRound | null): ComputedPlayerRanking[] | null {
    const playerAwards = this.generateRankPointAwards(tournamentPlayers.length);
    if(!playerAwards) {
      return null;
    }
    let playerRankings: ComputedPlayerRanking[] = tournamentPlayers.map(player => {
      const finalRoundTournamentRankPoints = finalRound ? finalRound.gameSessions.reduce((sum, session) => {
        const playerScore = session?.playerScores.find(score => score.playerId === player.id);
        return sum + (playerScore ? playerScore.gameSessionRankPointScore : 0);
      }, 0) : null;

      const finalRoundRank = finalRound ? finalRound.gameSessions.reduce((best : (number | null), session) => {
        const playerScore = session?.playerScores.find(score => score.playerId === player.id);
        if(playerScore) {
          return Math.min(playerScore.gameSessionRank, (best == null ? Number.POSITIVE_INFINITY: best));
        }
        return null;
      }, null) : null;

      const qualifierTournamentPoints = qualifierRounds.map(round => {
        return round.gameSessions.reduce((sum, session) => {
          const playerScore = session?.playerScores.find(score => score.playerId === player.id);
          return sum + (playerScore ? playerScore.gameSessionRankPointScore : 0);
        }, 0);
      });

      const qualifierTournamentPointsTotal = qualifierTournamentPoints.reduce((sum, points) => sum + points, 0);
      const qualifierDominancePoints = qualifierRounds.map(round => {
        return round.gameSessions.reduce((sum, session) => {
          const playerScore = session?.playerScores.find(score => score.playerId === player.id);
          return sum + (playerScore ? playerScore.dominationPointScore : 0);
        }, 0);
      });
      const qualifierDominancePointsTotal = qualifierDominancePoints.reduce((sum, points) => sum + points, 0);

      return {
        player: player,
        rank: 0,
        rankPoints: 0,
        finalRoundRank,
        finalRoundTournamentRankPoints,
        qualifierTournamentPoints,
        qualifierTournamentPointsTotal,
        qualifierDominancePoints,
        qualifierDominancePointsTotal
      };
    });

    for(let playerRanking of playerRankings){
      const playersBetterThanThisPlayer = playerRankings.filter(x => this.comparePlayerRankings(playerRanking, x) > 0).length;
      playerRanking.rank = playersBetterThanThisPlayer + 1;
      playerRanking.rankPoints = playerAwards[playersBetterThanThisPlayer];
    }

    return playerRankings;
  }

  private comparePlayerRankings(a: ComputedPlayerRanking, b: ComputedPlayerRanking): number {
    if((b.finalRoundTournamentRankPoints || 0) - (a.finalRoundTournamentRankPoints || 0) !== 0) {
      return (b.finalRoundTournamentRankPoints || 0) - (a.finalRoundTournamentRankPoints || 0);
    }
    if(b.qualifierTournamentPointsTotal - a.qualifierTournamentPointsTotal !== 0) {
      return b.qualifierTournamentPointsTotal - a.qualifierTournamentPointsTotal;
    }
    const sortedQualifierPointsA = a.qualifierTournamentPoints.slice().sort((x, y) => y - x);
    const sortedQualifierPointsB = b.qualifierTournamentPoints.slice().sort((x, y) => y - x);

    for(let i = 0, len = Math.max(sortedQualifierPointsA.length, sortedQualifierPointsB.length); i < len; i++) {
      const qualifierTournamentPointsA = sortedQualifierPointsA[i] || 0;
      const qualifierTournamentPointsB = sortedQualifierPointsB[i] || 0;
      if(qualifierTournamentPointsB - qualifierTournamentPointsA !== 0) {
        return qualifierTournamentPointsB - qualifierTournamentPointsA;
      }
    }

    return b.qualifierDominancePointsTotal - a.qualifierDominancePointsTotal;
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
