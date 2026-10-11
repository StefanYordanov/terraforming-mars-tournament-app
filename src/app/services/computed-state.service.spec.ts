// import { beforeEach, describe, expect, it } from 'vitest';
// import { BoardEnum } from '../models/board.model';
// import { ComputedStateService } from './computed-state.service';

// describe('ComputedStateService', () => {
//   let service: ComputedStateService;

//   beforeEach(() => {
//     service = new ComputedStateService();
//   });

//   it('should scale the tie-break coefficient down as the player count grows', () => {
//     expect(service.getTiebreakPointCoefficient(2)).toBe(0.5);
//     expect(service.getTiebreakPointCoefficient(3)).toBeCloseTo(1 / 3, 12);
//     expect(service.getTiebreakPointCoefficient(6)).toBeCloseTo(1 / 6, 12);
//     expect(service.getTiebreakPointCoefficient(6)).toBeLessThan(service.getTiebreakPointCoefficient(2));
//   });

//   it('should not shift real-player dominance when average dummy players are added', () => {
//     const baseSession = {
//       board: BoardEnum.Tharsis,
//       generationsPlayed: 1,
//       tableNumber: 1,
//       completed: true,
//       playerScores: [
//         { playerId: 1, pointScore: 80, megaCreditScore: 10, corporationCard: 'Corp A', preludeCards: [] },
//         { playerId: 2, pointScore: 120, megaCreditScore: 30, corporationCard: 'Corp B', preludeCards: [] },
//       ],
//     };

//     const withAverageDummies = {
//       ...baseSession,
//       dummyPlayersCount: 2,
//     };

//     const baseResult = service.computeGameSession(baseSession)!;
//     const withDummiesResult = service.computeGameSession(withAverageDummies)!;

//     expect(baseResult.playerScores[0].dominationPointScore)
//       .toBeCloseTo(withDummiesResult.playerScores[0].dominationPointScore, 12);
//     expect(baseResult.playerScores[1].dominationPointScore)
//       .toBeCloseTo(withDummiesResult.playerScores[1].dominationPointScore, 12);
//   });

//   it('should compare players using earned points after subtracting the starting rating', () => {
//     const session = {
//       board: BoardEnum.Tharsis,
//       generationsPlayed: 1,
//       tableNumber: 1,
//       completed: true,
//       playerScores: [
//         { playerId: 1, pointScore: 40, megaCreditScore: 0, corporationCard: 'Corp A', preludeCards: [] },
//         { playerId: 2, pointScore: 60, megaCreditScore: 0, corporationCard: 'Corp B', preludeCards: [] },
//       ],
//     };

//     const result = service.computeGameSession(session)!;
//     const averageEarnedPoints = ((40 - 20) + (60 - 20)) / 2;
//     const firstPlayerEarned = 40 - 20;
//     const secondPlayerEarned = 60 - 20;

//     expect(result.playerScores[0].dominationPointScore).toBeCloseTo((firstPlayerEarned / averageEarnedPoints) * 100, 12);
//     expect(result.playerScores[1].dominationPointScore).toBeCloseTo((secondPlayerEarned / averageEarnedPoints) * 100, 12);
//   });
// });
