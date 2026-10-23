import { Component, effect, inject, input, output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { BoardEnum } from '../../models/board.model';
import { ComputedGameSession, GameSession } from '../../models/game-session.model';
import { PlayerScore } from '../../models/player-score.model';
import { Player } from '../../models/player.model';
import { TournamentRound } from '../../models/tournament-round.model';
import { ComputedTournament, Tournament } from '../../models/tournament.model';
import { CORPORATIONS } from '../../consts/corporations.const';
import { PRELUDES } from '../../consts/preludes.const';
import { TournamentGameSessionComponent } from '../tournament-game-session/tournament-game-session.component';
import { GenerateSessionsDialogComponent } from '../generate-sessions-dialog/generate-sessions-dialog.component';
import { TournamentRoundsGeneratorService } from '../../services/tournament-game-sessions-generator.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-tournament-rounds-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    SelectModule,
    MultiSelectModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    IftaLabelModule,
    TournamentGameSessionComponent,
  ],
  templateUrl: './tournament-rounds-list.component.html',
  styleUrl: './tournament-rounds-list.component.scss',
})
export class TournamentRoundsListComponent {
  getComputedFinalRoundGameSession(ct: ComputedTournament,index: number): ComputedGameSession|null {
    return ct?.finalRound?.gameSessions?.[index] ?? null;
  }

  getQualifierRoundGameSession(ct: ComputedTournament,roundIndex: number, sessionIndex: number): ComputedGameSession|null {
    return ct?.qualifierRounds?.[roundIndex]?.gameSessions?.[sessionIndex] ?? null;
  }
  readonly tournament = input.required<Tournament>();
  readonly computedTournament = input.required<ComputedTournament>();
  readonly players = input.required<Record<number, Player>>();
  readonly valuesChanged = output<{ qualifierRounds: TournamentRound[]; finalRound: TournamentRound | null }>();
  readonly playerRelations = input.required<Record<number, number[]>>();

  private fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private tournamentRoundsGeneratorService = inject(TournamentRoundsGeneratorService);
  private messageService = inject(MessageService);
  readonly qualifierRoundsForm = this.fb.array<FormGroup>([]);
  finalRoundForm: FormGroup | null = null;

  readonly boardOptions = Object.values(BoardEnum);

  private isSyncing = false;
  private lastEmittedValue: string | null = null;

  constructor() {
    effect(() => {
      this.syncFromTournament(this.tournament());
    });
  }

  private syncFromTournament(tournament: Tournament) {
    this.isSyncing = true;
    this.qualifierRoundsForm.clear();

    for (const round of tournament.qualifierRounds ?? []) {
      const roundGroup = this.createRoundGroup(round);
      this.qualifierRoundsForm.push(roundGroup);
      this.attachValueChangeListener(roundGroup);
    }

    this.finalRoundForm = tournament.finalRound ? this.createRoundGroup(tournament.finalRound) : null;
    if (this.finalRoundForm) {
      this.attachValueChangeListener(this.finalRoundForm);
    }

    this.isSyncing = false;
    this.lastEmittedValue = JSON.stringify(this.buildTournamentValue());
    this.emitTournamentValues();
  }

  private attachValueChangeListener(group: FormGroup) {
    group.valueChanges.subscribe(() => {
      if (!this.isSyncing) {
        this.emitTournamentValues();
      }
    });
  }

  getPlayerOptions() {
    const signedInPlayerIds = new Set(this.tournament()?.playersIds ?? []);
    return Object.values(this.players() ?? {})
      .filter((player) => signedInPlayerIds.has(player.id))
      .map((player) => ({
        label: `${player.name}`,
        secretLabel: `${player.name}(${player.phoneNumber})`,
        value: player.id,
      }));
  }

  getCorporationOptions() {
    return CORPORATIONS.map((corporation) => ({
      label: corporation,
      value: corporation,
    }));
  }

  getPreludeOptions() {
    return PRELUDES.map((prelude) => ({
      label: prelude.title,
      value: prelude.id,
    }));
  }

  getGameSessionControls(roundIndex: number): FormGroup[] {
    const roundGroup = this.qualifierRoundsForm.at(roundIndex) as FormGroup;
    return ((roundGroup?.get('gameSessions') as FormArray | null)?.controls ?? []) as FormGroup[];
  }

  getPlayerScoreControls(roundIndex: number, sessionIndex: number): FormGroup[] {
    const gameSessionGroup = this.getGameSessionControls(roundIndex)[sessionIndex] ?? null;
    return ((gameSessionGroup?.get('playerScores') as FormArray | null)?.controls ?? []) as FormGroup[];
  }

  addGameSession(roundIndex: number) {
    const roundGroup = this.qualifierRoundsForm.at(roundIndex) as FormGroup;
    const gameSessions = roundGroup.get('gameSessions') as FormArray;
    const nextTableNumber = gameSessions.length + 1;
    gameSessions.push(
      this.createGameSessionGroup({
        board: BoardEnum.Tharsis,
        generationsPlayed: 0,
        tableNumber: nextTableNumber,
        dummyPlayersCount: 0,
        completed: false,
        playerScores: [],
      })
    );
  }

  generateSessions(roundIndex: number) {
    const playerOptions = this.getPlayerOptions();
    const allPlayerIds = playerOptions.map((player) => Number(player.value));

    const dialogRef = this.dialog.open(GenerateSessionsDialogComponent, {
      width: '420px',
      data: {
        playerOptions,
        defaultPlayerIds: allPlayerIds,
      },
    });

    dialogRef.afterClosed().subscribe((selectedPlayerIds: number[] | undefined) => {
      const playerIds = selectedPlayerIds ?? [];
      const gameSessions = this.tournamentRoundsGeneratorService.generateRoundGameSessions(
        playerIds,
        this.tournament().settings,
        this.playerRelations(),
        this.tournament().qualifierRounds.slice(0, roundIndex));
      if(gameSessions?.length){
        const qualifierRounds = this.tournament().qualifierRounds.map((qr, i) => i === roundIndex ? {
          ...qr, gameSessions
        }: qr );
        const finalRound = this.tournament().finalRound;
        this.valuesChanged.emit({qualifierRounds, finalRound});
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Generation of the rounds failed.' });
      }
    });
  }

  removeGameSession(roundIndex: number, sessionIndex: number) {
    const roundGroup = this.qualifierRoundsForm.at(roundIndex) as FormGroup;
    const gameSessions = roundGroup.get('gameSessions') as FormArray;
    gameSessions.removeAt(sessionIndex);
  }

  addPlayerScore(roundIndex: number, sessionIndex: number) {
    const gameSessionGroup = this.getGameSessionControls(roundIndex)[sessionIndex] as FormGroup;
    const playerScores = gameSessionGroup.get('playerScores') as FormArray;
    playerScores.push(this.createPlayerScoreGroup({
      playerId: 0,
      pointScore: 0,
      megaCreditScore: 0,
      corporationCard: '',
      preludeCards: [],
    }));
  }

  removePlayerScore(roundIndex: number, sessionIndex: number, scoreIndex: number) {
    const gameSessionGroup = this.getGameSessionControls(roundIndex)[sessionIndex] as FormGroup;
    const playerScores = gameSessionGroup.get('playerScores') as FormArray;
    playerScores.removeAt(scoreIndex);
  }

  addFinalRound() {
    const tournament = this.tournament();
    if(!tournament?.settings?.roundBoards?.length){
      return;
    }
    const finalBoard = tournament.settings.roundBoards[tournament.settings.roundBoards.length - 1];
    this.finalRoundForm = this.createRoundGroup({
      id: Date.now(),
      title: 'Final round',
      gameSessions: [
        {
          board: finalBoard,
          generationsPlayed: 0,
          tableNumber: 1,
          completed: false,
          playerScores: [],
        },
      ],
    });
    this.attachValueChangeListener(this.finalRoundForm);
    this.emitTournamentValues();
  }

  removeFinalRound() {
    this.finalRoundForm = null;
    this.emitTournamentValues();
  }

  getFinalRoundGameSessionControls(): FormGroup[] {
    if (!this.finalRoundForm) {
      return [];
    }
    return ((this.finalRoundForm.get('gameSessions') as FormArray | null)?.controls ?? []) as FormGroup[];
  }

  swapQualifierRoundTables(roundIndex: number, table1Index: number, table2Index: number) {
    const tournament = structuredClone(this.tournament());
    if(!tournament) {
      return;
    }
    const qualifierRound = tournament.qualifierRounds[roundIndex];
    if(!qualifierRound) {
      return;
    };
    const table1 = qualifierRound.gameSessions[table1Index];
    const table2 = qualifierRound.gameSessions[table2Index];
    if(!table1 || !table2) {
      return;
    }
    const table1Number = table1.tableNumber;
    const table2Number = table2.tableNumber;
    let swap = qualifierRound.gameSessions[table1Index];
    qualifierRound.gameSessions[table1Index] = qualifierRound.gameSessions[table2Index];
    qualifierRound.gameSessions[table2Index] = swap;
    qualifierRound.gameSessions[table1Index].tableNumber = table1Number;
    qualifierRound.gameSessions[table2Index].tableNumber = table2Number;
    this.valuesChanged.emit({
      qualifierRounds : tournament.qualifierRounds,
      finalRound: tournament.finalRound});
    return;
  }

  getFinalRoundPlayerScoreControls(sessionIndex: number): FormGroup[] {
    if (!this.finalRoundForm) {
      return [];
    }
    const sessionGroup = this.getFinalRoundGameSessionControls()[sessionIndex] as FormGroup | undefined;
    return ((sessionGroup?.get('playerScores') as FormArray | null)?.controls ?? []) as FormGroup[];
  }

  addFinalRoundGameSession() {
    if (!this.finalRoundForm) {
      return;
    }
    const gameSessions = this.finalRoundForm.get('gameSessions') as FormArray;
    const nextTableNumber = gameSessions.length + 1;
    gameSessions.push(
      this.createGameSessionGroup({
        board: BoardEnum.Tharsis,
        generationsPlayed: 0,
        tableNumber: nextTableNumber,
        completed: false,
        playerScores: [],
      })
    );
  }

  removeFinalRoundGameSession(sessionIndex: number) {
    if (!this.finalRoundForm) {
      return;
    }
    const gameSessions = this.finalRoundForm.get('gameSessions') as FormArray;
    gameSessions.removeAt(sessionIndex);
  }

  addFinalRoundPlayerScore(sessionIndex: number) {
    if (!this.finalRoundForm) {
      return;
    }
    const gameSessionGroup = this.getFinalRoundGameSessionControls()[sessionIndex] as FormGroup;
    const playerScores = gameSessionGroup.get('playerScores') as FormArray;
    playerScores.push(this.createPlayerScoreGroup({
      playerId: 0,
      pointScore: 0,
      megaCreditScore: 0,
      corporationCard: '',
      preludeCards: [],
    }));
  }

  removeFinalRoundPlayerScore(sessionIndex: number, scoreIndex: number) {
    if (!this.finalRoundForm) {
      return;
    }
    const gameSessionGroup = this.getFinalRoundGameSessionControls()[sessionIndex] as FormGroup;
    const playerScores = gameSessionGroup.get('playerScores') as FormArray;
    playerScores.removeAt(scoreIndex);
  }

  private createRoundGroup(round: Partial<TournamentRound> = {}): FormGroup {
    return this.fb.group({
      id: this.fb.control<number>(round.id ?? Date.now()),
      title: this.fb.control<string>(round.title ?? 'Round'),
      gameSessions: this.fb.array(
        (round.gameSessions ?? []).map((gameSession) => this.createGameSessionGroup(gameSession)),
        { validators: [this.roundDuplicatePlayersValidator.bind(this)] }
      ),
    }, { validators: [this.roundDuplicatePlayersValidator.bind(this)] });
  }

  private createGameSessionGroup(gameSession: Partial<GameSession> = {}): FormGroup {
    return this.fb.group({
      board: this.fb.control<BoardEnum>(gameSession.board ?? BoardEnum.Tharsis),
      generationsPlayed: this.fb.control<number>(gameSession.generationsPlayed ?? 0),
      tableNumber: this.fb.control<number>(gameSession.tableNumber ?? 1),
      completed: this.fb.control<boolean>(gameSession.completed ?? false),
      dummyPlayersCount: this.fb.control<number>(gameSession.dummyPlayersCount ?? 0),
      playerScores: this.fb.array((gameSession.playerScores ?? []).map((score) => this.createPlayerScoreGroup(score))),
    });
  }

  private createPlayerScoreGroup(score: Partial<PlayerScore> = {}): FormGroup {
    return this.fb.group({
      playerId: this.fb.control<number | null>(score.playerId ?? null),
      pointScore: this.fb.control<number>(score.pointScore ?? 0),
      megaCreditScore: this.fb.control<number>(score.megaCreditScore ?? 0),
      corporationCard: this.fb.control<string>(score.corporationCard ?? ''),
      preludeCards: this.fb.control<string[]>(score.preludeCards ?? []),
    });
  }

  private roundDuplicatePlayersValidator(control: AbstractControl): ValidationErrors | null {
    const gameSessions = control instanceof FormGroup
      ? (control.get('gameSessions') as FormArray | null)
      : control instanceof FormArray
        ? control
        : null;

    if (!gameSessions) {
      return null;
    }

    const playerIds: number[] = [];
    for (const sessionControl of gameSessions.controls) {
      const sessionGroup = sessionControl as FormGroup;
      const playerScores = (sessionGroup.get('playerScores') as FormArray | null)?.controls ?? [];
      for (const scoreControl of playerScores) {
        const scoreGroup = scoreControl as FormGroup;
        const playerId = Number(scoreGroup.get('playerId')?.value ?? 0);
        if (playerId > 0) {
          playerIds.push(playerId);
        }
      }
    }

    const duplicatePlayerIds = playerIds.filter((playerId, index) => playerIds.indexOf(playerId) !== index);
    return duplicatePlayerIds.length ? { duplicatePlayerIds: true } : null;
  }

  private emitTournamentValues() {
    if (this.isSyncing) {
      return;
    }

    const tournamentValue = this.buildTournamentValue();
    const serializedValue = JSON.stringify(tournamentValue);
    if (this.lastEmittedValue === serializedValue) {
      return;
    }

    this.lastEmittedValue = serializedValue;
    this.valuesChanged.emit(tournamentValue);
  }

  private buildTournamentValue(): { qualifierRounds: TournamentRound[]; finalRound: TournamentRound | null } {
    const qualifierRounds = this.qualifierRoundsForm.controls.map((roundControl) => this.roundGroupToTournamentRound(roundControl as FormGroup));
    const finalRound = this.finalRoundForm ? this.roundGroupToTournamentRound(this.finalRoundForm) : null;

    return {
      qualifierRounds,
      finalRound,
    };
  }

  private roundGroupToTournamentRound(roundGroup: FormGroup): TournamentRound {
    const gameSessions = ((roundGroup.get('gameSessions') as FormArray | null)?.controls ?? []).map((sessionControl) => {
      const sessionGroup = sessionControl as FormGroup;
      const playerScores = ((sessionGroup.get('playerScores') as FormArray | null)?.controls ?? []).map((scoreControl) => {
        const scoreGroup = scoreControl as FormGroup;
        const preludeCards = Array.isArray(scoreGroup.get('preludeCards')?.value)
          ? scoreGroup.get('preludeCards')?.value ?? []
          : [];

        return {
          playerId: Number(scoreGroup.get('playerId')?.value ?? 0),
          pointScore: Number(scoreGroup.get('pointScore')?.value ?? 0),
          megaCreditScore: Number(scoreGroup.get('megaCreditScore')?.value ?? 0),
          corporationCard: String(scoreGroup.get('corporationCard')?.value ?? ''),
          preludeCards,
        } satisfies PlayerScore;
      });

      return {
        board: (sessionGroup.get('board')?.value ?? BoardEnum.Tharsis) as BoardEnum,
        generationsPlayed: Number(sessionGroup.get('generationsPlayed')?.value ?? 0),
        tableNumber: Number(sessionGroup.get('tableNumber')?.value ?? 1),
        dummyPlayersCount: Number(sessionGroup.get('dummyPlayersCount')?.value ?? 0),
        completed: Boolean(sessionGroup.get('completed')?.value ?? false),
        playerScores,
      } satisfies GameSession;
    });

    return {
      id: Number(roundGroup.get('id')?.value ?? 0),
      title: String(roundGroup.get('title')?.value ?? 'Round'),
      gameSessions,
    } satisfies TournamentRound;
  }
}
