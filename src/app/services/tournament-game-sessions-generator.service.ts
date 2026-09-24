import { Injectable } from "@angular/core";
import { Tournament } from "../models/tournament.model";
import { TournamentRound } from "../models/tournament-round.model";
import { TournamentSettings } from "../models/tournament-settings.model";

@Injectable({ providedIn: 'root' })
export class TournamentRoundsGeneratorService {
  public generateGameSessions(tournament: Tournament): TournamentRound[] {
    const config = tournament.settings;
    // placeholder - real round generation not in scope for this task
    return [];
  }

  /**
   * Generate table allocations (players per table) given total players and tournament settings.
   * - Won't produce more than settings.numberOfTables tables
   * - Tries to maximize usage of earlier entries in preferedPlayerCountPerTablePriority
   *   (the earlier a value appears, the more preferred it is)
   * Returns an array of table sizes or an empty array when impossible.
   */
  public generateTableAllocations(totalPlayers: number, settings: TournamentSettings): number[] {
    const prefs = settings.preferedPlayerCountPerTablePriority.slice();
    const maxTables = settings.numberOfTables;

    // basic sanity
    if (totalPlayers <= 0 || prefs.length === 0 || maxTables <= 0) return [];

    // recursive search over counts per preference index.
    let best: number[] | null = null;

    function compareCounts(a: number[], b: number[]) {
      // lexicographic compare favoring larger counts of earlier (better) prefs
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return a[i] - b[i];
      }
      return 0;
    }

    const n = prefs.length;

    function dfs(index: number, remainingPlayers: number, remainingTables: number, counts: number[]) {
      if (remainingPlayers < 0 || remainingTables < 0) return;
      if (index === n) {
        if (remainingPlayers === 0) {
          const candidateCounts = counts.slice();
          // build flat table sizes array from counts
          const tables: number[] = [];
          for (let i = 0; i < n; i++) {
            for (let k = 0; k < candidateCounts[i]; k++) tables.push(prefs[i]);
          }
          if (tables.length <= maxTables) {
            // compare lexicographically by counts (we want more of earlier prefs)
            if (!best) best = tables;
            else {
              // build counts from best for compare
              const bestCounts = new Array(n).fill(0);
              for (const s of best) {
                const idx = prefs.indexOf(s);
                if (idx >= 0) bestCounts[idx]++;
              }
              const candCounts = candidateCounts;
              if (compareCounts(candCounts, bestCounts) > 0) {
                best = tables;
              }
            }
          }
        }
        return;
      }

      // max possible tables with this pref
      const pref = prefs[index];
      const maxCountByPlayers = Math.floor(remainingPlayers / pref);
      const maxCount = Math.min(remainingTables, maxCountByPlayers);
      // iterate from max to 0 to prefer more of earlier prefs
      for (let c = maxCount; c >= 0; c--) {
        counts[index] = c;
        dfs(index + 1, remainingPlayers - c * pref, remainingTables - c, counts);
      }
      counts[index] = 0;
    }

    dfs(0, totalPlayers, maxTables, new Array(n).fill(0));

    if (best && best.length > 0) return best;

    // fallback: if no exact combination found, distribute players across up to maxTables
    // as evenly as possible (difference at most 1)
    const tablesCount = Math.min(maxTables, totalPlayers);
    const base = Math.floor(totalPlayers / tablesCount);
    const remainder = totalPlayers % tablesCount;
    const fallback: number[] = [];
    for (let i = 0; i < tablesCount; i++) fallback.push(base + (i < remainder ? 1 : 0));
    return fallback;
  }
}
