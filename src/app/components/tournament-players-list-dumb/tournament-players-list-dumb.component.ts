import { Component, computed, effect, inject, input, Output, EventEmitter, OnDestroy, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormArray, FormControl, ReactiveFormsModule, FormsModule, Validators, AbstractControl } from '@angular/forms';
import { startWith } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { Player } from '../../models/player.model';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-tournament-players-list-dumb',
  imports: [MatListModule, SelectModule, ReactiveFormsModule, FormsModule, MatIconModule,
    MatButtonModule],
  templateUrl: './tournament-players-list-dumb.component.html',
  styleUrl: './tournament-players-list-dumb.component.scss',
})
export class TorunamentPlayersListDumbComponent {
  playerIds = input.required<number[]>();
  players = input.required<Record<number, Player>>();

  private fb = inject(FormBuilder);

  // FormArray of FormControl<number | null> where each control is a selected player id
  playerIdsForm: FormArray<FormControl<number | null>> = this.fb.array([], {
    validators: [this.uniquePlayerIdsValidator.bind(this)],
  }) as unknown as FormArray<FormControl<number | null>>;

  constructor() {
    effect(() => {
      this.setPlayerIds(this.playerIds());
    });
    // subscribe to form changes and emit when valid + unique
    this._valueChangesSub = this.playerIdsForm.valueChanges.pipe(startWith(this.playerIdsForm.value)).subscribe(values => this.onFormValuesChanged(values as Array<number | null>));
  }

  private _valueChangesSub?: import('rxjs').Subscription;

  @Output() playerIdsValid = new EventEmitter<number[]>();

  // Signal that holds the latest valid unique ids or null when invalid
  playerIdsOutputSignal: WritableSignal<number[] | null> = signal<number[] | null>(null);

  private setPlayerIds(ids: number[]) {
    this.playerIdsForm.clear();
    for (const id of ids || []) {
      this.playerIdsForm.push(this.createPlayerControl(id));
    }
  }

  private createPlayerControl(id?: number): FormControl<number | null> {
    return this.fb.control<number | null>(id ?? null, Validators.required);
  }

  private uniquePlayerIdsValidator(control: AbstractControl) {
    if (!(control instanceof FormArray)) {
      return null;
    }

    const values = control.controls
      .map(c => c instanceof FormControl ? c.value : (c.get?.('playerId')?.value))
      .filter((v): v is number => v !== undefined && v !== null);

    const duplicates = values.filter((v, i) => values.indexOf(v) !== i);
    return duplicates.length ? { duplicatePlayerIds: true } : null;
  }

  private onFormValuesChanged(values: Array<number | null>) {
    const ids = (values || []).filter((v): v is number => v !== undefined && v !== null);
    const allFilled = ids.length === this.playerIdsForm.length && this.playerIdsForm.valid;
    const unique = new Set(ids).size === ids.length;

    if (allFilled && unique) {
      this.playerIdsOutputSignal.set(ids);
      this.playerIdsValid.emit(ids);
    } else {
      this.playerIdsOutputSignal.set(null);
    }
  }

  ngOnDestroy(): void {
    this._valueChangesSub?.unsubscribe();
  }

  // Helpers for template
  playerOptions = computed(() => {
    return Object.values(this.players() || {}).map(p => ({ label: `${p.name}`, secretLabel: `${p.name}(${p.phoneNumber})`, value: p.id }));
  });

  get controls() {
    return this.playerIdsForm.controls as FormControl<number | null>[];
  }

  addPlayer() {
    this.playerIdsForm.push(this.createPlayerControl());
  }

  removePlayer(index: number) {
    this.playerIdsForm.removeAt(index);
  }
}
