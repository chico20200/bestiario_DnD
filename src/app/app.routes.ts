import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'monsters', pathMatch: 'full' },
  {
    path: 'monsters',
    loadComponent: () =>
      import('./pages/monster-list/monster-list.page').then((m) => m.MonsterListPage),
  },
  {
    // A1: ":index" declara un parámetro de ruta (ej. /monsters/aboleth)
    path: 'monsters/:index',
    loadComponent: () =>
      import('./pages/monster-detail/monster-detail.page').then((m) => m.MonsterDetailPage),
  },
  {
    path: 'favorites',
    loadComponent: () => import('./pages/favorites/favorites.page').then((m) => m.FavoritesPage),
  },
  { path: '**', redirectTo: 'monsters' },
];
