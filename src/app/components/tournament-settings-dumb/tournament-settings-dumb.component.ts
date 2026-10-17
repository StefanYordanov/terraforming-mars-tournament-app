import { Component, effect, inject, input, output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { BoardEnum } from '../../models/board.model';
import { TournamentSettings } from '../../models/tournament-settings.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-tournament-settings-dumb',
  imports: [ReactiveFormsModule, InputNumberModule, SelectModule, MatIconModule,
    MatButtonModule],
  templateUrl: './tournament-settings-dumb.component.html',
  styleUrl: './tournament-settings-dumb.component.scss',
})
export class TournamentSettingsDumbComponent {
  settings = input.required<TournamentSettings>();
  valuesChanged = output<TournamentSettings>();

  readonly boardOptions = Object.values(BoardEnum).map(be => ({ label: be, value: be }));
  readonly priorityOptions = [1, 2, 3, 4, 5, 6].map(value => ({ label: String(value), value }));

  private readonly fb = inject(FormBuilder);

  settingsForm = this.fb.group({
    qualifierRoundsCount: this.fb.nonNullable.control(0, [Validators.min(0)]),
    preferedPlayerCountPerTablePriority: this.fb.array<FormControl<number | null>>([]),
    numberOfTables: this.fb.nonNullable.control(1, [Validators.min(1)]),
    roundBoards: this.fb.array<FormControl<BoardEnum | null>>([]),
  });

  private valueChanges = toSignal(this.settingsForm.valueChanges);

  constructor() {
    effect(() => {
      this.setSettings(this.settings());
    });

    effect(() => {
      const values = this.valueChanges();
      if (!values) {
        return;
      }

      const nextValue: TournamentSettings = {
        qualifierRoundsCount: Number(values.qualifierRoundsCount ?? 0),
        preferedPlayerCountPerTablePriority: (values.preferedPlayerCountPerTablePriority ?? [])
          .map(value => Number(value ?? 0))
          .filter(value => Number.isFinite(value) && value > 0),
        numberOfTables: Number(values.numberOfTables ?? 1),
        roundBoards: (values.roundBoards ?? []).filter((board): board is BoardEnum => !!board && Object.values(BoardEnum).includes(board as BoardEnum)),
      };

      const currentSettings = this.settings();
      if (JSON.stringify(currentSettings) === JSON.stringify(nextValue)) {
        return;
      }

      this.valuesChanged.emit(nextValue);
    });
  }

  private setSettings(settings: TournamentSettings) {
    this.settingsForm.patchValue({
      qualifierRoundsCount: settings?.qualifierRoundsCount ?? 0,
      numberOfTables: settings?.numberOfTables ?? 1,
    }, { emitEvent: false });

    this.setArrayValues(
      this.preferredPlayerCountPriorityArray,
      settings?.preferedPlayerCountPerTablePriority ?? [],
      value => this.fb.nonNullable.control(value, [Validators.min(1)]),
    );

    this.setArrayValues(
      this.roundBoardsArray,
      settings?.roundBoards ?? [],
      value => this.fb.nonNullable.control(value),
    );
  }

  private setArrayValues<T>(
    array: FormArray<FormControl<T | null>>,
    values: T[],
    factory: (value: T) => FormControl<T | null>,
  ) {
    array.clear();
    values.forEach(value => {
      array.push(factory(value));
    });
  }

  get preferredPlayerCountPriorityArray(): FormArray<FormControl<number | null>> {
    return this.settingsForm.get('preferedPlayerCountPerTablePriority') as FormArray<FormControl<number | null>>;
  }

  get roundBoardsArray(): FormArray<FormControl<BoardEnum | null>> {
    return this.settingsForm.get('roundBoards') as FormArray<FormControl<BoardEnum | null>>;
  }

  get preferredPlayerCountPriorityControls(): FormControl<number | null>[] {
    return this.preferredPlayerCountPriorityArray.controls as FormControl<number | null>[];
  }

  get roundBoardControls(): FormControl<BoardEnum | null>[] {
    return this.roundBoardsArray.controls as FormControl<BoardEnum | null>[];
  }

  addPreferredPlayerCountPriority() {
    this.preferredPlayerCountPriorityArray.push(this.fb.nonNullable.control(0, [Validators.min(1)]));
  }

  removePreferredPlayerCountPriority(index: number) {
    this.preferredPlayerCountPriorityArray.removeAt(index);
  }

  addRoundBoard() {
    this.roundBoardsArray.push(this.fb.nonNullable.control(undefined as unknown as BoardEnum, [Validators.required]));
  }

  removeRoundBoard(index: number) {
    this.roundBoardsArray.removeAt(index);
  }
}
