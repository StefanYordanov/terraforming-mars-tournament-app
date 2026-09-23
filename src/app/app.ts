import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { AppStore } from './+store/app.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, ToastModule, RouterModule],
  providers: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  public store = inject(AppStore);
  protected readonly title = signal('terraforming-mars-tournament-app');
  ngOnInit(): void {
    this.store.init();
  }
}
