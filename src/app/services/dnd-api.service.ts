import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { GraphQLResponse, MonsterDetail, MonsterSummary } from '../models/monster';

@Injectable({ providedIn: 'root' }) // una sola instancia para toda la app
export class DndApiService {
  private http = inject(HttpClient);

  private readonly BASE = 'https://www.dnd5eapi.co';
  private readonly GRAPHQL_URL = `${this.BASE}/graphql/2024`;
  private readonly REST_URL = `${this.BASE}/api/2024`;
  readonly PAGE_SIZE = 20; // la API acepta hasta 100

  // En 2024 la consulta se llama monsters2024 (en 2014 era monsters).
  private readonly MONSTERS_QUERY = `
    query Monsters($skip: Int, $limit: Int, $name: String) {
      monsters2024(skip: $skip, limit: $limit, name: $name) {
        index
        name
        type
        size
        challenge_rating
        hit_points
      }
    }`;

  /** Una página del listado. skip = cuántos monstruos ya tengo. */
  getMonsters(skip: number, name: string): Observable<MonsterSummary[]> {
    // A5: el tamaño de página sale de una sola constante
    const variables: Record<string, unknown> = { skip, limit: this.PAGE_SIZE };

    // Solo mandamos name si hay texto: así una búsqueda vacía trae todo.
    const term = name.trim();
    if (term) {
      variables['name'] = term;
    }

    return this.http
      // A6: GraphQL viaja por POST con { query, variables } en el body
      .post<GraphQLResponse<{ monsters2024: MonsterSummary[] }>>(this.GRAPHQL_URL, {
        query: this.MONSTERS_QUERY,
        variables,
      })
      .pipe(
        map((res) => {
          // GraphQL puede responder HTTP 200 y aun así traer errores
          if (res.errors?.length) {
            throw new Error(res.errors[0].message);
          }
          // A21: la clave de data se llama igual que la consulta
          return res.data?.monsters2024 ?? [];
        }),
      );
  }

  /** Detalle completo de un monstruo (REST). */
  getMonster(index: string): Observable<MonsterDetail> {
    // A7: ruta REST del detalle por index
    return this.http.get<MonsterDetail>(`${this.REST_URL}/monsters/${index}`);
  }

  /** La API da la imagen como ruta relativa; la convertimos en URL completa. */
  imageUrl(path?: string): string | null {
    return path ? `${this.BASE}${path}` : null;
  }
}
