import {Component, computed, input} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { ComputedPlayerRanking } from '../../models/tournament.model';
import { CommonModule } from '@angular/common';

/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'app-tournament-ranking-list',
  styleUrl: 'tournament-ranking-list.scss',
  templateUrl: 'tournament-ranking-list.component.html',
  imports: [MatTableModule, CommonModule],
})
export class TournamentRankingListComponent {
  $computedPlayerRankings = input.required<ComputedPlayerRanking[]> ({
    alias: 'computedPlayerRankings'
  });
  $computedPlayerRankingsSorted = computed(() => {
    return this.$computedPlayerRankings().slice().sort((x, y) => x.rank - y.rank);
  });
  displayedColumns: string[] = ['rank', 'player', 'qualifierTournamentPoints', 'qualifierDominancePointsTotal'];
}
