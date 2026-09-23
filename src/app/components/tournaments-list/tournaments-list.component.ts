import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AppStore } from '../../+store/app.store';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { form, FormField, required } from '@angular/forms/signals';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-tournaments-list',
  imports: [
    CommonModule,
    DividerModule,
    ButtonModule,
    FloatLabelModule,
    InputTextModule,
    FormField,
    RouterModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  providers: [],
  templateUrl: './tournaments-list.component.html',
  styleUrls: ['./tournaments-list.component.scss'],
})
export class TournamentsListComponent {
  tournamentGroupId = input.required<number>();

  $newTournamentFormModel = signal<{ title: string }>({
    title: '',
  });

  newTournamentForm = form(this.$newTournamentFormModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
  });

  private store = inject(AppStore);

  public $tournaments = computed(
    () => this.store.$state()?.tournamentGroups?.find((tg) => tg.id === this.tournamentGroupId())?.tournaments || [],
  );

  addTournamentGroup(title?: string) {
    this.store.addTournamentGroup(title);
  }

  onSubmitNewTournament($event: SubmitEvent) {
    $event.preventDefault();
    const model = this.$newTournamentFormModel();
    this.store.addTornamentToGroup(this.tournamentGroupId(), model.title);
  }
}
