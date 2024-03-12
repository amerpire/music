import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./playlists.page').then(m => m.PlaylistsPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./detail/detail.page').then(m => m.DetailPage),
  },
];
