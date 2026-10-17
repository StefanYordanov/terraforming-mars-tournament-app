// import { Component, computed, inject, signal } from '@angular/core';
// import { AppStore } from '../../+store/app.store';
// import { form, FormField, required } from '@angular/forms/signals';
// import { FloatLabelModule } from 'primeng/floatlabel';
// import { MatListModule } from '@angular/material/list';
// import { MatIconModule } from '@angular/material/icon';
// import { InputTextModule } from 'primeng/inputtext';
// import { ButtonModule } from 'primeng/button';
// import { DividerModule } from 'primeng/divider';

// @Component({
//   selector: 'app-tournament-ranking-list',
//   imports: [FloatLabelModule, FormField, MatListModule, MatIconModule, InputTextModule, ButtonModule, DividerModule],
//   templateUrl: './players-list.component.html',
//   styleUrl: './players-list.component.scss',
// })
// export class PlayersListComponent {
//   newPlayerFormModel = signal< { name: string; phoneNumber: string } >({
//     name: '',
//     phoneNumber: '',
//   });
//   newPlayerForm = form(this.newPlayerFormModel, (schemaPath) => {
//     required(schemaPath.name, {message: 'Name is required'});
//     required(schemaPath.phoneNumber, {message: 'Phone number is required'});
//   });
//   private store = inject(AppStore);
//   public $players = computed(() => {
//     const players = this.store.$state()?.players || {};
//     return Object.keys(players).map(key => ({...players[Number(key)]}));
//   });

//   onSubmitNewPlayer($event: SubmitEvent) {
//     $event.preventDefault();
//     const model = this.newPlayerFormModel();
//     this.store.addPlayer(model.name, model.phoneNumber);
//   }
// }


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
