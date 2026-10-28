import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
} from '@ionic/angular/standalone';
import { FavoritesService } from '../../services/favorites.service';
import { FavoriteMonster } from '../../models/monster';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
  ],
})
export class FavoritesPage {
  private favs = inject(FavoritesService);
  favorites = signal<FavoriteMonster[]>([]);

  // A20: hook de Ionic que corre CADA vez que la página va a mostrarse
  async ionViewWillEnter(): Promise<void> {
    this.favorites.set(await this.favs.getAll());
  }

  async remove(index: string): Promise<void> {
    await this.favs.remove(index);
    this.favorites.set(await this.favs.getAll());
  }
}
