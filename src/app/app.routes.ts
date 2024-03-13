import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'songs',
    loadComponent: () => import('./songs/songs.page').then(m => m.SongsPage),
  },
  {
    path: 'playlists',
    loadChildren: () => import('./playlists/playlists.routes').then(m => m.routes),
  },
  {
    path: '',
    redirectTo: 'songs',
    pathMatch: 'full',
  },
];
