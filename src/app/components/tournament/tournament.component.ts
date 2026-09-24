import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { AppStore } from '../../+store/app.store';
import { TorunamentPlayersListDumbComponent } from "../tournament-players-list-dumb/tournament-players-list-dumb.component";

@Component({
  selector: 'app-tournament',
  imports: [TorunamentPlayersListDumbComponent, BreadcrumbModule ],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.scss',
})
export class TournamentComponent {
  private route = inject(ActivatedRoute);
  public store = inject(AppStore);
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
}
