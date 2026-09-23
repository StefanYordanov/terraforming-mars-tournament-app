import { Component, computed, inject, signal } from '@angular/core';
import { AppStore } from '../../+store/app.store';
import { form, FormField, required } from '@angular/forms/signals';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-players-list',
  imports: [FloatLabelModule, FormField, MatListModule, MatIconModule, InputTextModule, ButtonModule, DividerModule],
  templateUrl: './players-list.component.html',
  styleUrl: './players-list.component.scss',
})
export class PlayersListComponent {
  newPlayerFormModel = signal< { name: string; phoneNumber: string } >({
    name: '',
    phoneNumber: '',
  });
  newPlayerForm = form(this.newPlayerFormModel, (schemaPath) => {
    required(schemaPath.name, {message: 'Name is required'});
    required(schemaPath.phoneNumber, {message: 'Phone number is required'});
  });
  private store = inject(AppStore);
  public $players = computed(() => {
      const players = this.store.$state()?.players || {};
      return Object.keys(players).map(key => ({...players[Number(key)]}));
  });

  onSubmitNewPlayer($event: SubmitEvent) {
    $event.preventDefault();
    const model = this.newPlayerFormModel();
    this.store.addPlayer(model.name, model.phoneNumber);
  }
}
