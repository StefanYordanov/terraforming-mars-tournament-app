import { Component, computed, inject } from '@angular/core';
import { TournamentsListComponent } from '../tournaments-list/tournaments-list.component';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import { PlayerGroupRankingListComponent } from '../players-group-ranking-list/players-group-ranking-list.component';
import { AppStore } from '../../+store/app.store';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
  selector: 'app-home',
  imports: [TournamentsListComponent, PlayerGroupRankingListComponent, BreadcrumbModule],
  templateUrl: './tournament-group.component.html',
  styleUrl: './tournament-group.component.scss',
})
export class TournamentGroupComponent {
  private route = inject(ActivatedRoute);
  public store = inject(AppStore);
  $tournamentGroupId = toSignal(this.route.params.pipe(
    map(params => Number(params['tournamentGroupId']))))

  $tournamentGroup = computed(() => {
    const groupId = this.$tournamentGroupId();
    if (!groupId) {
      return null;
    }
    const group = this.store.$state()?.tournamentGroups?.find(g => g.id === groupId);
    return group || null;
  });
  $breadcrumbItems = computed(() => {
    const group = this.$tournamentGroup();
    if (!group) {
      return [];
    }
    return [
      { icon: 'pi pi-home', label: 'Home', routerLink: ['/home'] },
      { label: group.title, routerLink: [`/tournament-groups/${group.id}`] }
    ];
  })
}
