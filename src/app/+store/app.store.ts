import { filter, pipe, switchMap, debounceTime, Subject, tap } from "rxjs";
import { GlobalStoreState } from "./app.state";
import { patchState, signalState } from "@ngrx/signals";
import {tapResponse} from "@ngrx/operators";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import { effect, inject, Injectable } from "@angular/core";
import { ApiService } from "../services/api.service";
import { AppState } from "../models/app-state.model";
import { MessageService } from 'primeng/api';
import { Tournament } from "../models/tournament.model";
import { BoardEnum } from "../models/board.model";

const state: GlobalStoreState = {
  lastFetchedState: null,
  state: null,
  canRedo: false,
  canUndo: false,
  initialized: false
};

@Injectable({ providedIn: 'root' })
export class AppStore {
  private $globalState = signalState(state);
  private readonly delayPostMs = 1500;
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private updateSubject = new Subject<AppState>();
  public readonly $lastFetchedState = this.$globalState.lastFetchedState;
  public readonly $state = this.$globalState.state;
  public readonly $initialized = this.$globalState.initialized;
  public readonly $canUndo = this.$globalState.canUndo;
  public readonly $canRedo = this.$globalState.canRedo;

  public addTournamentGroup(title?: string) {
    patchState(this.$globalState, {
      state: {
        ...this.$state()!,
        tournamentGroups: [
          ...(this.$state()?.tournamentGroups || []),
          {
            id: this.$state()?.tournamentGroups ? Math.max(...this.$state()!.tournamentGroups.map(g => g.id)) + 1 : 1,
            title: title?.trim() || '',
            tournaments: []
          }
        ]
      }
    });
  }

  public addPlayer(name: string, phoneNumber: string) {
    const players = this.$state()?.players || {};
    const playersIds = Object.keys(players).map(id => Number(id));

    const newId = Math.max(...playersIds, 0) + 1;
    patchState(this.$globalState, {
      state: {
        ...this.$state()!,
        players: {
          ...players,
          [newId]: { id: newId, name, phoneNumber }
        }
      }
    });
  }

  public addTornamentToGroup(groupId: number, tournamentTitle: string) {
    const groups = [...(this.$state()?.tournamentGroups) || []];
    const groupIdx = groups.findIndex(g => g.id === groupId);
    if(groupIdx === -1) {
      console.warn(`Group with id ${groupId} not found`);
      return;
    }
    const groupTournaments = [...(groups[groupIdx].tournaments)];
    const newTournamentId = Math.max(...groupTournaments.map(t => t.id), 0) + 1 ;
    const newTournament : Tournament = { id: newTournamentId, title: tournamentTitle, playerReservations: [], playersIds: [], settings: { qualifierRoundsCount: 2, preferedPlayerCountPerTablePriority: [4, 3, 5, 2], numberOfTables: 8, roundBoards: [BoardEnum.Tharsis, BoardEnum.Elysium, BoardEnum.Hellas]}, qualifierRounds: [], finalRound: null };
    groupTournaments.push(newTournament);
    groups[groupIdx] = { ...groups[groupIdx], tournaments: groupTournaments };
    console.log(groups);
    patchState(this.$globalState, {
      state: {
        ...this.$state()!,
        tournamentGroups: groups
      }
    });
  }

  setTournamentPlayers(tournamentGroupId: number | undefined, tournamentId: number | undefined, playerIds: number[]) {
    if(tournamentGroupId === undefined || tournamentId === undefined) {
      console.warn("Tournament group id or tournament id is undefined");
      return;
    }
    const groups = [...(this.$state()?.tournamentGroups) || []];
    const groupIdx = groups.findIndex(g => g.id === tournamentGroupId);
    if(groupIdx === -1) {
      console.warn(`Group with id ${tournamentGroupId} not found`);
      return;
    }
    const groupTournaments = [...(groups[groupIdx].tournaments)];
    const tournamentIdx = groupTournaments.findIndex(t => t.id === tournamentId);
    if(tournamentIdx === -1) {
      console.warn(`Tournament with id ${tournamentId} not found`);
      return;
    }
    groupTournaments[tournamentIdx] = { ...groupTournaments[tournamentIdx], playersIds: playerIds };
    groups[groupIdx] = { ...groups[groupIdx], tournaments: groupTournaments };
    patchState(this.$globalState, {
      state: {
        ...this.$state()!,
        tournamentGroups: groups
      }
    });
  }

  setTournament(tournamentGroupId: number, tournamentId: number, tournament: Tournament) {
    if(tournamentGroupId === undefined || tournamentId === undefined) {
      console.warn("Tournament group id or tournament id is undefined");
      return;
    }

    const groups = [...(this.$state()?.tournamentGroups) || []];
    const groupIdx = groups.findIndex(g => g.id === tournamentGroupId);
    if(groupIdx === -1) {
      console.warn(`Group with id ${tournamentGroupId} not found`);
      return;
    }
    const groupTournaments = [...(groups[groupIdx].tournaments)];
    const tournamentIdx = groupTournaments.findIndex(t => t.id === tournamentId);
    if(tournamentIdx === -1) {
      console.warn(`Tournament with id ${tournamentId} not found`);
      return;
    }
    groupTournaments[tournamentIdx] = { ...tournament };
    groups[groupIdx] = { ...groups[groupIdx], tournaments: groupTournaments };
    patchState(this.$globalState, {
      state: {
        ...this.$state()!,
        tournamentGroups: groups
      }
    });
  }

  constructor() {
    effect(() => {
      console.log("State changed:", this.$state());
      if(!this.$initialized()) {
        return;
      }
      console.log("Passed check 1");
      if(!this.$state()) {
        return;
      }
      console.log("Passed check 2");
      console.log("Last fetched state:", this.$lastFetchedState(), "Current state:", this.$state());
      if(JSON.stringify(this.$state()) == JSON.stringify(this.$lastFetchedState())) {
        return;
      }
      console.log("Passed check 3");
      this.updateSubject.next(this.$state()!);
    });

    this.updateSubject.pipe(debounceTime(this.delayPostMs)).subscribe(state => this.update(state));
  }

  public init = rxMethod<void>(
    pipe(
      filter(() => !this.$initialized()),
      tap(() => this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Init started' })),
      switchMap(() => this.apiService.getState$().pipe(
        tapResponse({
          next: (response) => {
            patchState(this.$globalState, {
              state: response.state,
              lastFetchedState: response.state,
              canUndo: response.canUndo,
              canRedo: response.canRedo,
              initialized: true
            });
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Init succeeded' });

          },
          error: (err) => {
            console.error("Failed to fetch initial state", err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to initialize '+ JSON.stringify(err) });
          },
        })
      )
      )
    ));

  private update = rxMethod<AppState>(
    pipe(
      filter((newStateValue) => {
        const lastFetchedState = this.$globalState.lastFetchedState();
        return JSON.stringify(newStateValue) !== JSON.stringify(lastFetchedState) && this.$globalState.initialized();
      }),
      switchMap((newStateValue) => this.apiService.saveState$(newStateValue).pipe(
        tapResponse({
          next: (response) => {
            patchState(this.$globalState, {
              state: response.state,
              lastFetchedState: response.state,
              canUndo: response.canUndo,
              canRedo: response.canRedo,
            });
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Update succeeded' });
          },
          error: (err) => {
            console.error("Failed to update state", err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update state ' + JSON.stringify(err)});
          },
        })
      ))
    ));

  public undo = rxMethod<void>(
    switchMap(() => this.apiService.undoState$().pipe(
      tapResponse({
        next: (response) => {
          patchState(this.$globalState, {
            state: response.state,
            lastFetchedState: response.state,
            canUndo: response.canUndo,
            canRedo: response.canRedo,
          });
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Undo succeeded' });
        },
        error: (err) => {
          console.error("Failed to undo state", err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to undo state ' + JSON.stringify(err) });
        },
      })
    ))
  );

  public redo = rxMethod<void>(
    switchMap(() => this.apiService.redoState$().pipe(
      tapResponse({
        next: (response) => {
          patchState(this.$globalState, {
            state: response.state,
            lastFetchedState: response.state,
            canUndo: response.canUndo,
            canRedo: response.canRedo,
          });
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Redo succeeded' });
        },
        error: (err) => {
          console.error("Failed to redo state", err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to redo state ' + JSON.stringify(err) });
        },
      })
    ))
  );



}
