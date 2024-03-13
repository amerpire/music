import { provideHttpClient } from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouteReuseStrategy, withComponentInputBinding } from '@angular/router';
import { AppComponent } from '@app/app.component';
import { routes } from '@app/app.routes';
import { environment } from '@environments/environment';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { Media } from '@awesome-cordova-plugins/media/ngx';

if (!environment.development) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(),
    provideRouter(routes, withComponentInputBinding()),
    Media,
  ],
}).then();
