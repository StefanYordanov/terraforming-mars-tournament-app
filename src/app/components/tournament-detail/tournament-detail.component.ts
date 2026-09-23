import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './tournament-detail.component.html',
})
export class TournamentDetailComponent {
  private route = inject(ActivatedRoute);
  public groupId = Number(this.route.snapshot.paramMap.get('tournamentGroupId'));
  public tournamentId = Number(this.route.snapshot.paramMap.get('tournamentId'));
}
