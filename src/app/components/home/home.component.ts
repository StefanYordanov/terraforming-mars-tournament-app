import { Component } from '@angular/core';
import { TournamentGroupsListComponent } from '../tournament-groups-list/tournament-groups-list.component';
import { PlayersListComponent } from "../players-list/players-list.component";

@Component({
  selector: 'app-home',
  imports: [TournamentGroupsListComponent, PlayersListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
