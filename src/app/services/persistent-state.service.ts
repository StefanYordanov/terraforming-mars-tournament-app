// import { Injectable, signal, effect, computed } from '@angular/core';
// import Dexie from 'dexie';
// // local debounce (avoids extra dependency)
// const debounce = <F extends (...args: any[]) => void>(fn: F, wait = 500) => {
//   let t: any;
//   return (...args: Parameters<F>) => {
//     clearTimeout(t);
//     t = setTimeout(() => fn(...args), wait);
//   };
// };

// import { TournamentState } from '../models/tournament-state';
// import { AppState } from '../models/app-state.model';
// import { TournamentGroup } from '../models/tournament-group.model';

// interface PersistedState {
//   id: string;
//   payload: AppState;
// }

// @Injectable({ providedIn: 'root' })
// export class PersistentStateService {
//   private db: Dexie;
//   private table: Dexie.Table<PersistedState, string>;

//   public $state = signal<AppState>({ players: {}, tournamentGroups: [] });

//   public $playersList = computed(() => Object.keys(this.$state().players).map(id => this.$state().players[Number(id)]));

//   constructor() {
//     this.db = new Dexie('tm_tournament_db');
//     this.db.version(1).stores({ states: 'id' });
//     this.table = this.db.table('states') as unknown as Dexie.Table<PersistedState, string>;

//     this.init();

//     // Save to DB when the state changes, debounced for smoother UX
//     const debouncedSave = debounce(() => void this.save(), 1500);
//     effect(() => {
//       // touch state to register dependency
//       this.$state();
//       debouncedSave();
//     });
//   }

//   private async init() {
//     try {
//       const row = await this.table.get('default');
//       if (row && row.payload) {
//         this.$state.set(row.payload);
//       }
//     } catch (e) {
//       console.error('Failed to initialize persistent state', e);
//     }
//   }

//   public async addTournamentGroup(title: string) {
//     const groups = [...this.$state().tournamentGroups];
//     const id = groups.length ? Math.max(...groups.map(g => g.id)) + 1 : 1;

//     groups.push({ id, title, tournaments: [] });
//     this.$state.update((cur) => ({ ...cur, tournamentGroups: groups }));
//   }

//   public async updateTournamentGroup(tournamentGroup: TournamentGroup) {
//     const groups = this.$state().tournamentGroups.map(g => g.id === tournamentGroup.id ? tournamentGroup : g);
//     this.$state.update((cur) => ({ ...cur, tournamentGroups: groups }));
//   }

//   public async removeTournamentGroup(id: number) {
//     const groups = this.$state().tournamentGroups.filter(g => g.id !== id);
//     this.$state.update((cur) => ({ ...cur, tournamentGroups: groups }));
//   }

//   public async addPlayer(name: string, phoneNumber: string) {
//     const players = { ...this.$state().players };
//     const id = Object.keys(players).length ? Math.max(...Object.keys(players).map(k => Number(k))) + 1 : 1;
//     players[id] = { id, name, phoneNumber };
//     this.$state.update((cur) => ({ ...cur, players }));
//   }

//   public async updatePlayer(id: number, name: string, phoneNumber: string) {
//     const players = { ...this.$state().players };
//     if (!players[id]) return;
//     players[id] = { id, name, phoneNumber };
//     this.$state.update((cur) => ({ ...cur, players }));
//   }

//   public async removePlayer(id: number) {
//     const players = { ...this.$state().players };
//     if (!players[id]) return;
//     delete players[id];
//     this.$state.update((cur) => ({ ...cur, players }));
//   }

//   public async save() {
//     try {
//       await this.table.put({ id: 'default', payload: this.$state() });
//     } catch (e) {
//       console.error('Failed to save state', e);
//     }
//   }

//   public update(patch: Partial<AppState>) {
//     this.$state.update((cur) => ({ ...cur, ...patch }));
//   }

//   public reset() {
//     this.$state.set({ players: {}, tournamentGroups: [] });
//     void this.save();
//   }
// }
