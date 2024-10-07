import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./channels.page').then(m => m.ChannelsPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./detail/detail.page').then(m => m.DetailPage),
  },
];
