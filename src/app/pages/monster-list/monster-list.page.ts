import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  IonText,
  InfiniteScrollCustomEvent,
  SearchbarCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart } from 'ionicons/icons';

import { DndApiService } from '../../services/dnd-api.service';
import { MonsterSummary } from '../../models/monster';

@Component({
  selector: 'app-monster-list',
  templateUrl: './monster-list.page.html',
  styleUrls: ['./monster-list.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
    IonText,
  ],
})
export class MonsterListPage implements OnInit {
  private api = inject(DndApiService);

  monsters = signal<MonsterSummary[]>([]);
  hasMore = signal(true);
  loading = signal(false);
  error = signal<string | null>(null);
  pageError = signal<string | null>(null);

  query = '';
  private skip = 0;
  private loadingMore = false;
  private requestId = 0;

  constructor() {
    addIcons({ heart }); // en standalone cada ícono se registra
  }

  ngOnInit(): void {
    this.loadFirstPage();
  }

  /** Primera página: se usa al abrir la app y en cada búsqueda nueva. */
  async loadFirstPage(): Promise<void> {
    const myRequest = ++this.requestId; // esta búsqueda pasa a ser "la vigente"

    // A8: reinicio completo del estado
    this.monsters.set([]);
    this.skip = 0;
    this.hasMore.set(true);
    this.error.set(null);
    this.pageError.set(null);
    this.loading.set(true);

    try {
      const page = await firstValueFrom(this.api.getMonsters(0, this.query));
      if (myRequest !== this.requestId) return; // llegó tarde: el usuario ya buscó otra cosa

      this.monsters.set(page); // REEMPLAZAR: es la primera página
      this.skip = page.length;
      this.hasMore.set(page.length === this.api.PAGE_SIZE);
    } catch {
      if (myRequest !== this.requestId) return;
      this.error.set('No se pudo conectar con la API. Revisa tu conexión.');
    } finally {
      if (myRequest === this.requestId) this.loading.set(false);
    }
  }

  /** Evento (ionInfinite): el usuario llegó al final de la lista. */
  async loadMore(event: InfiniteScrollCustomEvent): Promise<void> {
    try {
      await this.fetchNextPage();
    } finally {
      // A9: siempre avisar a Ionic que terminó, incluso si hubo error
      await event.target.complete();
    }
  }

  /** Botón "Reintentar" cuando falló una página intermedia (ej. la 3). */
  retryNextPage(): void {
    this.pageError.set(null);
    this.fetchNextPage();
  }

  private async fetchNextPage(): Promise<void> {
    // Candado: si ya hay una petición en curso o no hay más datos, no hacemos nada
    if (this.loadingMore || !this.hasMore()) return;
    this.loadingMore = true;
    const myRequest = this.requestId;

    try {
      const page = await firstValueFrom(this.api.getMonsters(this.skip, this.query));
      if (myRequest !== this.requestId) return;

      // Evitar duplicados: descartamos los index que ya están en la lista
      const known = new Set(this.monsters().map((m) => m.index));
      const fresh = page.filter((m) => !known.has(m.index));

      // A10: CONCATENAR lo anterior con lo nuevo
      this.monsters.update((list) => [...list, ...fresh]);

      // A11: skip avanza según lo que devolvió el servidor
      this.skip += page.length;

      // A12: página llena = puede haber más; incompleta = fin
      this.hasMore.set(page.length === this.api.PAGE_SIZE);
    } catch {
      if (myRequest !== this.requestId) return;
      this.pageError.set('Falló la carga de más monstruos.');
    } finally {
      this.loadingMore = false;
    }
  }

  /** Evento (ionInput) del buscador, con debounce en el HTML. */
  onSearch(event: SearchbarCustomEvent): void {
    this.query = event.detail.value ?? '';
    // A13: una búsqueda nueva empieza desde cero
    this.loadFirstPage();
  }
}
