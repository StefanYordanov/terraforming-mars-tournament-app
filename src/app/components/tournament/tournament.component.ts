import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { AppStore } from '../../+store/app.store';
import { TorunamentPlayersListDumbComponent } from "../tournament-players-list-dumb/tournament-players-list-dumb.component";
import { TournamentRoundsGeneratorService } from '../../services/tournament-game-sessions-generator.service';
import { MessageService } from 'primeng/api';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tournament',
  imports: [TorunamentPlayersListDumbComponent, BreadcrumbModule, MatButtonToggleModule,FormsModule ],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.scss',
})
export class TournamentComponent {
  private route = inject(ActivatedRoute);
  private tournamentRoundsGeneratorService = inject(TournamentRoundsGeneratorService);
  public store = inject(AppStore);
  private messageService = inject(MessageService);
  readonly selectedViews = signal<string[]>(['rounds']);
  isViewSelected(view: string, selectedViews: string[]): boolean {
    return selectedViews.includes(view) || false;
  }
  isRankingViewSelected = computed(() => this.isViewSelected('ranking', this.selectedViews()));
  isRoundsViewSelected = computed(() => this.isViewSelected('rounds', this.selectedViews()));
  isPlayersViewSelected = computed(() => this.isViewSelected('players', this.selectedViews()));

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


  $tournament = computed(() => {
    const groupId = this.$tournamentGroupId();
    const tournamentId = this.$tournamentId();
    if (!groupId || !tournamentId) {
      return null;
    }
    const group = this.store.$state()?.tournamentGroups?.find(g => g.id === groupId);
    return group?.tournaments?.find(t => t.id === tournamentId) || null;
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

  generateGameSessions() {
    const tournament = this.$tournament();
    const tournamentGroupId = this.$tournamentGroupId();
    const tournamentId = this.$tournamentId();
    if(!tournament || !tournamentGroupId || !tournamentId) {
      return;
    }

    const qualifierRounds = this.tournamentRoundsGeneratorService.generateGameSessions(tournament);
    if(qualifierRounds){
      this.store.setTournament(tournamentGroupId, tournamentId, {
        ...tournament,
        qualifierRounds
      });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Generation of the rounds failed.' });
    }

  }
}
