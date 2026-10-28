# Bestiario D&D — API Explorer


## API utilizada

| Uso | Método | Endpoint |
| --- | --- | --- |
| Listado, búsqueda y paginación | `POST` (GraphQL, consulta `monsters2024`) | `https://www.dnd5eapi.co/graphql/2024` |
| Detalle de un monstruo | `GET` (REST) | `https://www.dnd5eapi.co/api/2024/monsters/{index}` |
| Imagen del monstruo | `GET` | `https://www.dnd5eapi.co` + campo `image` |

- Documentación oficial: https://docs.dnd5eapi.co
- No requiere API key, es de solo lectura y permite CORS desde el navegador.

Consulta GraphQL del listado:

```graphql
query Monsters($skip: Int, $limit: Int, $name: String) {
  monsters2024(skip: $skip, limit: $limit, name: $name) {
    index
    name
    type
    size
    challenge_rating
    hit_points
  }
}
```

## Instalación y ejecución

Requisitos: Node.js LTS, Ionic CLI (`npm install -g @ionic/cli`) y, para Android, Android Studio.

```bash
git clone https://github.com/chico20200/dndApp.git
cd dndApp
npm install
ionic serve
```

Generar APK de Android:

```bash
ionic build
npx cap sync android
npx cap open android   # luego en Android Studio: Build > Build APK(s)
```

## Decisiones de paginación

- El listado REST `/api/2024/monsters` devuelve **todos** los registros de una vez y no admite `limit`/`offset`. Por eso no sirve para un infinite scroll real.
- Se usa la consulta GraphQL `monsters2024(skip, limit, name)`, con paginación **offset/limit** de 20 elementos por página.
- **Fin de datos:** si una página trae menos de 20 elementos, `hasMore = false` y se deshabilita `ion-infinite-scroll`.
- **Duplicados:** antes de concatenar se filtran los elementos cuyo `index` ya está en la lista.
- **Solicitudes simultáneas:** un candado (`loadingMore`) impide pedir otra página mientras hay una en curso. `complete()` se llama siempre en un `finally`.
- **Búsqueda:** al cambiar el texto se reinician la lista, `skip` y `hasMore`. Un `requestId` descarta las respuestas tardías de búsquedas anteriores.
- **Errores:** si falla una página intermedia, la lista cargada se conserva y aparece un botón "Reintentar".

## Estructura del código

```text
src/app/
├── models/monster.ts             → interfaces TypeScript
├── services/dnd-api.service.ts   → acceso a la API (GraphQL + REST)
├── services/favorites.service.ts → favoritos con Capacitor Preferences
├── pages/monster-list/           → listado, búsqueda e infinite scroll
├── pages/monster-detail/         → detalle por parámetro de ruta :index
└── pages/favorites/              → favoritos guardados
```

## Capturas



## Autor

Andrés Chico — Desarrollo de Software, ESFOT

