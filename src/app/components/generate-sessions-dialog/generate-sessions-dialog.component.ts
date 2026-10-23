import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface GenerateSessionsDialogData {
  playerOptions: Array<{
    label: string;
    value: number;
    secretLabel?: string;
  }>;
  defaultPlayerIds?: number[];
}

@Component({
  selector: 'app-generate-sessions-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>Generate sessions</h2>

    <mat-dialog-content>
      <form [formGroup]="form">
        <div class="player-list" formGroupName="selectedPlayers">
          @for (player of data.playerOptions; track player.value) {
            <mat-checkbox [formControlName]="player.value.toString()" class="player-item">
              {{ player.label }}
            </mat-checkbox>
          }
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [mat-dialog-close]="getSelectedPlayerIds()"
      >
        Apply
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      form {
        min-width: 280px;
      }

      .player-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 260px;
      }

      .player-item {
        display: flex;
        align-items: center;
      }
    `,
  ],
})
export class GenerateSessionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<GenerateSessionsDialogComponent, number[]>);
  readonly data = inject<GenerateSessionsDialogData>(MAT_DIALOG_DATA);

  readonly form = new FormGroup({
    selectedPlayers: new FormGroup(
      Object.fromEntries(
        this.data.playerOptions.map((player) => [String(player.value), new FormControl(this.isPlayerSelectedByDefault(player.value), { nonNullable: true })])
      )
    ),
  });

  private isPlayerSelectedByDefault(playerId: number): boolean {
    if (this.data.defaultPlayerIds?.length) {
      return this.data.defaultPlayerIds.includes(playerId);
    }

    return true;
  }

  getSelectedPlayerIds(): number[] {
    const selectedPlayersGroup = this.form.get('selectedPlayers') as FormGroup;

    return this.data.playerOptions
      .filter((player) => Boolean(selectedPlayersGroup.get(String(player.value))?.value))
      .map((player) => Number(player.value));
  }
}
