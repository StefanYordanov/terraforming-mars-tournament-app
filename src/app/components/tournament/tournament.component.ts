import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { AppStore } from '../../+store/app.store';
import { TorunamentPlayersListDumbComponent } from "../tournament-players-list-dumb/tournament-players-list-dumb.component";
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatButtonModule} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { TournamentRoundsListComponent } from '../tournament-rounds-list/tournament-rounds-list.component';
import { TournamentRound } from '../../models/tournament-round.model';
import { ComputedStateService } from '../../services/computed-state.service';
import { TournamentRankingListComponent } from '../tournament-ranking-list/tournament-ranking-list.component';
import { TournamentSettingsDumbComponent } from '../tournament-settings-dumb/tournament-settings-dumb.component';
import { TournamentSettings } from '../../models/tournament-settings.model';

@Component({
  selector: 'app-tournament',
  imports: [TorunamentPlayersListDumbComponent, TournamentRoundsListComponent, BreadcrumbModule, MatButtonToggleModule, FormsModule, MatButtonModule, TournamentRankingListComponent, TournamentSettingsDumbComponent],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.scss',
})
export class TournamentComponent {
  private route = inject(ActivatedRoute);
  public store = inject(AppStore);
  private computedStateService = inject(ComputedStateService);
  readonly selectedViews = signal<string[]>(['rounds', 'ranking', 'players']);
  isViewSelected(view: string, selectedViews: string[]): boolean {
    return selectedViews.includes(view) || false;
  }
  isRankingViewSelected = computed(() => this.isViewSelected('ranking', this.selectedViews()));
  isRoundsViewSelected = computed(() => this.isViewSelected('rounds', this.selectedViews()));
  isPlayersViewSelected = computed(() => this.isViewSelected('players', this.selectedViews()));
  isSettingsViewSelected = computed(() => this.isViewSelected('settings', this.selectedViews()));

  $tournamentGroupId = toSignal(this.route.params.pipe(
    map(params => Number(params['tournamentGroupId']))));
  $tournamentId = toSignal(this.route.params.pipe(
    map(params => Number(params['tournamentId']))));

  $breadcrumbItems = computed(() => {
    const group = this.$tournamentGroup();
    const tournament = this.$tournament();
    if (!group || !tournament) {
      return [];
    }
    return [
      { icon: 'pi pi-home', label: 'Home', routerLink: ['/home'] },
      { label: group.title, routerLink: [`/tournament-groups/${group.id}`] },
      { label: tournament.title, routerLink: [`/tournament-groups/${group.id}/tournaments/${tournament.id}`] }
    ];
  });

  constructor() {
    effect(() => {
      console.log(this.$computedTournament());
    });
  }

  $tournament = computed(() => {
    const groupId = this.$tournamentGroupId();
    const tournamentId = this.$tournamentId();
    if (!groupId || !tournamentId) {
      return null;
    }
    const group = this.store.$state()?.tournamentGroups?.find(g => g.id === groupId);
    return group?.tournaments?.find(t => t.id === tournamentId) || null;
  });

  $computedTournament = computed(() => {
    const tournament = this.$tournament();
    if(!tournament) {
      return null;
    }
    return this.computedStateService.computeTournament(tournament, this.store.$state()?.players || {});
  });

  $tournamentGroup = computed(() => {
    const groupId = this.$tournamentGroupId();
    const tournamentId = this.$tournamentId();
    if (!groupId || !tournamentId) {
      return null;
    }
    const group = this.store.$state()?.tournamentGroups?.find(g => g.id === groupId);
    return group || null;
  });

  playersChanged($event: { playerIds: number[]; }) {
    this.store.setTournamentPlayers(this.$tournamentGroupId(), this.$tournamentId(), $event.playerIds);
  }

  tournamentRoundsChanged($event: { qualifierRounds: TournamentRound[]; finalRound: TournamentRound | null; }) {
    const tournament = this.$tournament();
    const tournamentGroupId = this.$tournamentGroupId();
    const tournamentId = this.$tournamentId();
    if (!tournament || !tournamentGroupId || !tournamentId) {
      return;
    }

    this.store.setTournament(tournamentGroupId, tournamentId, {
      ...tournament,
      qualifierRounds: $event.qualifierRounds,
      finalRound: $event.finalRound,
    });
  }

  settingsChanged(settings: TournamentSettings) {
    const tournament = this.$tournament();
    const tournamentGroupId = this.$tournamentGroupId();
    const tournamentId = this.$tournamentId();
    if (!tournament || !tournamentGroupId || !tournamentId) {
      return;
    }
    this.store.setTournament(tournamentGroupId, tournamentId, {...tournament, settings});
  }

  addQualifierRound() {
    const tournament = this.$tournament();
    const tournamentGroupId = this.$tournamentGroupId();
    const tournamentId = this.$tournamentId();
    if(!tournament || !tournamentGroupId || !tournamentId) {
      return;
    }

    const nextQualifierId = tournament.qualifierRounds.reduce((max, q)=> Math.max(max, q.id), 0) + 1;
    const newTournamentRound: TournamentRound = {
      id: nextQualifierId,
      title: `Round ${nextQualifierId}`,
      gameSessions: []
    };

    this.store.setTournament(tournamentGroupId, tournamentId, {
      ...tournament,
      qualifierRounds: [...tournament.qualifierRounds, newTournamentRound]
    });

  }
}
