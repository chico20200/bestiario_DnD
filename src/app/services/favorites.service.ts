import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { FavoriteMonster } from '../models/monster';

const KEY = 'favorite_monsters';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  async getAll(): Promise<FavoriteMonster[]> {
    const { value } = await Preferences.get({ key: KEY });
    // A18: Preferences devuelve texto (o null) → lo convertimos en arreglo
    return value ? (JSON.parse(value) as FavoriteMonster[]) : [];
  }

  private async saveAll(list: FavoriteMonster[]): Promise<void> {
    // A19: Preferences solo guarda strings → convertimos el arreglo a texto JSON
    await Preferences.set({ key: KEY, value: JSON.stringify(list) });
  }

  async isFavorite(index: string): Promise<boolean> {
    const list = await this.getAll();
    return list.some((f) => f.index === index);
  }

  /** Agrega si no está, quita si está. Devuelve el nuevo estado (true = es favorito). */
  async toggle(monster: FavoriteMonster): Promise<boolean> {
    const list = await this.getAll();
    const exists = list.some((f) => f.index === monster.index);
    const next = exists ? list.filter((f) => f.index !== monster.index) : [...list, monster];
    await this.saveAll(next);
    return !exists;
  }

  async remove(index: string): Promise<void> {
    const list = await this.getAll();
    await this.saveAll(list.filter((f) => f.index !== index));
  }
}
