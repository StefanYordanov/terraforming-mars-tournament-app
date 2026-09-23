import { Component, computed, inject, signal } from '@angular/core';
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
  selector: 'app-tournament-groups-list',
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
  templateUrl: './tournament-groups-list.component.html',
  styleUrls: ['./tournament-groups-list.component.scss'],
  styles: [`.groups-list { padding: 1rem } .new-group { margin-top: 1rem }`],
})
export class TournamentGroupsListComponent {
  newTournamentGroupFormModel = signal<{ title: string }>({
    title: '',
  });

  newTournamentGroupForm = form(this.newTournamentGroupFormModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
  });

  private store = inject(AppStore);
  public $groups = computed(() => this.store.$state()?.tournamentGroups);

  public stringify = JSON.stringify;
  public displayedColumns = ['id', 'title'];

  addTournamentGroup(title?: string) {
    this.store.addTournamentGroup(title);
  }

  onSubmitNewTournamentGroup($event: SubmitEvent) {
    $event.preventDefault();
    const model = this.newTournamentGroupFormModel();
    this.store.addTournamentGroup(model.title);
  }
}
