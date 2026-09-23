import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TournamentGroupComponent } from './components/tournament-group/tournament-group.component';
import { TournamentComponent } from './components/tournament/tournament.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'tournament-groups/:tournamentGroupId', component: TournamentGroupComponent },
  { path: 'tournament-groups/:tournamentGroupId/tournaments/:tournamentId', component: TournamentComponent },
];
