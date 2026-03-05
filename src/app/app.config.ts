import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { routes } from './app.routes';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { GeminiKeyInterceptor } from './interceptors/gemini/gemini-key.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_BASE_HREF, useValue: '/portal/dev/tasky' },
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GeminiKeyInterceptor,
      multi: true
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') }
    }
  ]
};
