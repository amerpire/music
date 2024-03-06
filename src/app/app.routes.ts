import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'songs',
    loadComponent: () => import('./songs/songs.page').then(m => m.SongsPage),
  },
  {
    path: 'playlists',
    loadComponent: () => import('./playlists/playlists.page').then(m => m.PlaylistsPage),
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.page').then(m => m.AboutPage),
  },
  {
    path: '',
    redirectTo: 'songs',
    pathMatch: 'full',
  },
];
