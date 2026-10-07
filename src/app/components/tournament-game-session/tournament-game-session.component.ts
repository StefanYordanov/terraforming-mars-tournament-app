import { Component, input, output } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';

@Component({
  selector: 'app-tournament-game-session',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    SelectModule,
    MultiSelectModule,
    InputNumberModule,
    CheckboxModule,
    IftaLabelModule,
    MatTooltipModule,
  ],
  templateUrl: './tournament-game-session.component.html',
  styleUrl: './tournament-game-session.component.scss',
})
export class TournamentGameSessionComponent {
  readonly gameSessionForm = input.required<FormGroup>();
  readonly boardOptions = input.required<string[]>();
  readonly playerOptions = input.required<Array<{ label: string; value: number; secretLabel?: string }>>();
  readonly corporationOptions = input.required<Array<{ label: string; value: string }>>();
  readonly preludeOptions = input.required<Array<{ label: string; value: string }>>();
  readonly addPlayerScore = output<void>();
  readonly removePlayerScore = output<number>();
  readonly deleteGameSession = output<void>();

  getPlayerScoreControls() {
    const playerScores = this.gameSessionForm().get('playerScores') as FormArray | null;
    return ((playerScores?.controls ?? []) as FormGroup[]) ?? [];
  }

  onAddPlayerScore(): void {
    this.addPlayerScore.emit();
  }

  onAddDummyPlayerScore(): void {
    const dummyPlayersCountControl = this.gameSessionForm().get('dummyPlayersCount');
    if (dummyPlayersCountControl) {
      const currentCount = dummyPlayersCountControl.value ?? 0;
      dummyPlayersCountControl.setValue(currentCount + 1);
    }
  }

  onRemovePlayerScore(index: number): void {
    this.removePlayerScore.emit(index);
  }

  onDelete(): void {
    this.deleteGameSession.emit();
  }
}
