export type MealKey = 'colazione' | 'pranzo' | 'cena' | 'spuntini';

export const MEALS: { key: MealKey; label: string; emoji: string }[] = [
  { key: 'colazione', label: 'Colazione', emoji: '☕' },
  { key: 'pranzo', label: 'Pranzo', emoji: '🍝' },
  { key: 'cena', label: 'Cena', emoji: '🌙' },
  { key: 'spuntini', label: 'Spuntini / Extra', emoji: '🍎' },
];

export type FoodSource = 'base' | 'off' | 'personale' | 'ai' | 'usda';

/** Valori per 100 g (a crudo per gli alimenti con cookedFactor). */
export interface Food {
  id: string;
  name: string;
  brand?: string;
  kcal: number;
  pro: number;
  carbs: number;
  fats: number;
  /** Peso di un pezzo/porzione in grammi (uovo, vasetto, fetta...). */
  pieceWeight?: number;
  unitName?: string;
  unitPlural?: string;
  /** Peso cotto / peso crudo (pasta 2.1, carne 0.74). */
  cookedFactor?: number;
  cookNote?: string;
  source: FoodSource;
  barcode?: string;
  aliases?: string[];
  usda?: { fdcId: number; description: string; dataType: string; url: string };
}

export interface Macros {
  kcal: number;
  pro: number;
  carbs: number;
  fats: number;
}

export type QtyMode = 'grams' | 'pieces';

/** Voce di un pasto: conserva nome e valori calcolati, cosi' lo storico non cambia se l'alimento viene modificato. */
export interface MealItem extends Macros {
  id: string;
  foodId: string;
  name: string;
  /** Grammi a crudo (o grammi del prodotto se non si cuoce). */
  grams: number;
  mode: QtyMode;
  /** Quantita' inserita: grammi o numero di pezzi. */
  qty: number;
  /** true se la quantita' e' stata pesata da cotto. */
  cooked: boolean;
  label: string;
  addedAt: string;
}

export type DayLog = Record<MealKey, MealItem[]>;

export type Sex = 'M' | 'F';
export type ActivityKey = 'sedentario' | 'leggero' | 'moderato' | 'intenso' | 'atleta' | 'altro';
export type Plan = 'mantenimento' | 'dieta' | 'massa';
export type MacroKey = 'pro' | 'carbs' | 'fats';

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  /** Data locale AAAA-MM-GG; age resta per i profili precedenti. */
  birthDate?: string;
  weight: number;
  height: number;
  activity: ActivityKey;
  /** Solo con attivita' 'altro': mantenimento scritto a mano dall'utente. */
  customTdee?: number;
}

export interface Goals extends Macros {
  plan?: Plan;
  /** Macro calcolato dalle kcal e dagli altri due. */
  auto?: MacroKey;
}

export interface AppData {
  version: 1;
  goals: Goals;
  /** Chiave: giorno locale AAAA-MM-GG. */
  days: Record<string, DayLog>;
  /** Alimenti salvati dall'utente (personali e da Open Food Facts). */
  foods: Food[];
  dark: boolean;
  /** Tema stile PronoBlast gia' applicato (scuro di partenza, una volta sola). */
  themeV2?: boolean;
  profile?: Profile;
}
