import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-player-group-ranking-list',
  imports: [MatListModule, MatIconModule, InputTextModule, ButtonModule, DividerModule],
  templateUrl: './players-group-ranking-list.component.html',
  styleUrl: './players-group-ranking-list.component.scss',
})
export class PlayerGroupRankingListComponent {
  tournamentGroupId = input.required<number>();
}
