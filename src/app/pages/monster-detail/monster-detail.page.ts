import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';

import { DndApiService } from '../../services/dnd-api.service';
import { FavoritesService } from '../../services/favorites.service';
import { MonsterDetail } from '../../models/monster';

@Component({
  selector: 'app-monster-detail',
  templateUrl: './monster-detail.page.html',
  styleUrls: ['./monster-detail.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText,
    IonList,
    IonItem,
    IonLabel,
  ],
})
export class MonsterDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  api = inject(DndApiService); // público: el HTML usa api.imageUrl()
  private favs = inject(FavoritesService);

  monster = signal<MonsterDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  isFav = signal(false);
  private index = '';

  constructor() {
    addIcons({ heart, heartOutline });
  }

  ngOnInit(): void {
    // A16: mismo nombre que ":index" en app.routes.ts
    this.index = this.route.snapshot.paramMap.get('index') ?? '';
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.api.getMonster(this.index));
      this.monster.set(data);
      this.isFav.set(await this.favs.isFavorite(this.index));
    } catch (e) {
      // Distinguir "no existe" de "sin conexión"
      if (e instanceof HttpErrorResponse && e.status === 404) {
        this.error.set('Ese monstruo no existe.');
      } else {
        this.error.set('No se pudo cargar el detalle. Revisa tu conexión.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  async toggleFavorite(): Promise<void> {
    const m = this.monster();
    if (!m) return;
    // Guardamos SOLO lo necesario para pintar la lista de favoritos
    const nowFav = await this.favs.toggle({
      index: m.index,
      name: m.name,
      type: m.type,
      challenge_rating: m.challenge_rating,
    });
    this.isFav.set(nowFav);
  }
}
