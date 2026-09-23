import { Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormArray, FormGroup, FormControl, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { startWith } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { Player } from '../../models/player.model';
import { MatListModule } from '@angular/material/list';
import { PlayerReservation } from '../../models/tournament.model';

@Component({
  selector: 'app-tournament-players-list-dumb',
  imports: [MatListModule, SelectModule, ReactiveFormsModule],
  templateUrl: './tournament-players-list-dumb.component.html',
  styleUrl: './tournament-players-list-dumb.component.scss',
})
export class TorunamentPlayersListDumbComponent {
  playerIds = input.required<number[]>();
  playerReservations = input.required<PlayerReservation[]>();
  players = input.required<Record<number, Player>>();

  private fb = inject(FormBuilder);

  playerReservationsForm: FormArray<FormGroup<{
    playerId: FormControl<string>;
    isCheckedIn: FormControl<boolean>;
  }>> = this.fb.array([], {
    validators: [this.uniquePlayerIdsValidator.bind(this)],
  }) as unknown as FormArray<FormGroup<{
    playerId: FormControl<string>;
    isCheckedIn: FormControl<boolean>;
  }>>;

  private playerReservationsFormSignal = toSignal(
      this.playerReservationsForm.valueChanges.pipe(
        startWith(this.playerReservationsForm.value as PlayerReservation[])
      ),
      { initialValue: this.playerReservationsForm.value as PlayerReservation[] }
    );
  playerReservationsFormValue = computed(() => this.playerReservationsFormSignal() as PlayerReservation[]);

  constructor() {
    effect(() => {
      this.setPlayerReservations(this.playerReservations());
    });
  }

  private setPlayerReservations(reservations: PlayerReservation[]) {
    this.playerReservationsForm.clear();
    for (const reservation of reservations || []) {
      this.playerReservationsForm.push(this.createReservationGroup(reservation));
    }
  }

  private createReservationGroup(reservation: PlayerReservation): FormGroup {
    return this.fb.group({
      playerId: [reservation.playerId, Validators.required],
      isCheckedIn: [reservation.isCheckedIn],
    });
  }

  private uniquePlayerIdsValidator(control: AbstractControl) {
    if (!(control instanceof FormArray)) {
      return null;
    }

    const ids = control.controls
      .map(group => group.get('playerId')?.value)
      .filter((id): id is string => id !== undefined && id !== null);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    return duplicates.length ? { duplicatePlayerIds: true } : null;
  }
}
