// Lo que pedimos a GraphQL para cada tarjeta del listado (R1: 2+ atributos)
export interface MonsterSummary {
  index: string; // identificador único, ej. "aboleth"
  name: string;
  type: string; // ej. "aberration"
  size: string; // ej. "Large"
  challenge_rating: number; // A3: number también acepta decimales (0.25, 0.5)
  hit_points: number;
}

// Piezas reutilizables del detalle REST
export interface ArmorClass {
  type?: string; // en los datos 2024 suele venir solo value
  value: number;
}

export interface NamedDescription {
  name: string;
  desc: string;
}

// Lo que devuelve GET /api/2024/monsters/{index} (solo los campos que mostramos)
export interface MonsterDetail extends MonsterSummary {
  alignment: string;
  armor_class: ArmorClass[]; // es un ARREGLO, no un número
  hit_dice: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  languages: string;
  xp: number;
  special_abilities?: NamedDescription[];
  actions?: NamedDescription[];
  bonus_actions?: NamedDescription[];
  image?: string; // A4: "?" = opcional. Ruta relativa, ej. "/api/images/monsters/aboleth.png"
}

// Lo que guardamos en el dispositivo (R6): solo lo necesario para pintar la lista
export interface FavoriteMonster {
  index: string;
  name: string;
  type: string;
  challenge_rating: number;
}

// Envoltura genérica de cualquier respuesta GraphQL
export interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}
