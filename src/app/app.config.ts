import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { AppStore } from './+store/app.store';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    AppStore,
    MessageService,
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
};
