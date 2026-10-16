import type { Food } from '../types';

// Alimenti di base del prototipo (valori per 100 g, a crudo dove c'e' cookedFactor).
// Verranno sostituiti dai dati ufficiali CIQUAL nella fase 2.
export const BASE_FOODS: Food[] = [
  { id: 'f_egg', name: 'Uovo intero medio', kcal: 143, pro: 13, carbs: 0.8, fats: 9.9, pieceWeight: 60, unitName: 'uovo', unitPlural: 'uova', source: 'base' },
  { id: 'f_white', name: "Albume d'uovo", kcal: 52, pro: 11, carbs: 0.7, fats: 0.2, pieceWeight: 35, unitName: 'albume', unitPlural: 'albumi', source: 'base' },
  { id: 'f_yolk', name: "Tuorlo d'uovo", kcal: 317, pro: 16, carbs: 3.6, fats: 27, pieceWeight: 18, unitName: 'tuorlo', unitPlural: 'tuorli', source: 'base' },
  { id: 'f3', name: 'Petto di pollo', kcal: 110, pro: 23.1, carbs: 0, fats: 1.2, pieceWeight: 150, unitName: 'fetta', unitPlural: 'fette', cookedFactor: 0.74, cookNote: 'La carne perde circa il 26% di acqua in cottura', source: 'base' },
  { id: 'f4', name: 'Petto / fesa di tacchino (carne fresca, cruda)', kcal: 104, pro: 24, carbs: 0, fats: 0.9, pieceWeight: 150, unitName: 'fetta', unitPlural: 'fette', cookedFactor: 0.74, cookNote: 'Il tacchino perde circa il 26% di acqua in cottura', source: 'base' },
  { id: 'f5', name: 'Macinato magro di manzo', kcal: 136, pro: 21, carbs: 0, fats: 5.5, pieceWeight: 150, unitName: 'porzione', unitPlural: 'porzioni', cookedFactor: 0.74, cookNote: 'Il manzo perde circa il 26% di acqua in cottura', source: 'base' },
  { id: 'f6', name: 'Salmone fresco', kcal: 182, pro: 20, carbs: 0, fats: 11, pieceWeight: 180, unitName: 'trancio', unitPlural: 'tranci', cookedFactor: 0.78, cookNote: 'Il salmone perde circa il 22% di peso in cottura', source: 'base' },
  { id: 'f7', name: 'Filetto di merluzzo / nasello', kcal: 82, pro: 18, carbs: 0, fats: 0.7, pieceWeight: 200, unitName: 'filetto', unitPlural: 'filetti', cookedFactor: 0.75, cookNote: 'Il merluzzo perde circa il 25% di acqua in cottura', source: 'base' },
  { id: 'f8', name: 'Tonno al naturale sgocciolato', kcal: 101, pro: 24, carbs: 0, fats: 0.6, pieceWeight: 80, unitName: 'scatoletta', unitPlural: 'scatolette', source: 'base' },
  { id: 'f11', name: 'Riso bianco / basmati', kcal: 355, pro: 7, carbs: 78, fats: 0.9, pieceWeight: 80, unitName: 'porzione', unitPlural: 'porzioni', cookedFactor: 2.7, cookNote: 'Il riso assorbe acqua e quasi triplica il peso', source: 'base' },
  { id: 'f12', name: 'Pasta di semola', kcal: 357, pro: 12.5, carbs: 72, fats: 1.5, pieceWeight: 80, unitName: 'porzione', unitPlural: 'porzioni', cookedFactor: 2.1, cookNote: 'La pasta assorbe acqua e raddoppia il peso', source: 'base' },
  { id: 'f14', name: "Fiocchi d'avena integrali", kcal: 375, pro: 13.5, carbs: 60, fats: 7, pieceWeight: 50, unitName: 'porzione', unitPlural: 'porzioni', source: 'base' },
  { id: 'f16', name: 'Pane integrale / segale', kcal: 235, pro: 8.5, carbs: 45, fats: 1.5, pieceWeight: 30, unitName: 'fetta', unitPlural: 'fette', source: 'base' },
  { id: 'f17', name: 'Patate', kcal: 86, pro: 2, carbs: 18.5, fats: 0.1, pieceWeight: 150, unitName: 'patata', unitPlural: 'patate', source: 'base' },
  { id: 'f21', name: "Olio extravergine d'oliva", kcal: 884, pro: 0, carbs: 0, fats: 100, pieceWeight: 10, unitName: 'cucchiaio', unitPlural: 'cucchiai', source: 'base' },
  { id: 'f22', name: "Burro d'arachidi 100%", kcal: 588, pro: 25, carbs: 13, fats: 50, pieceWeight: 15, unitName: 'cucchiaino', unitPlural: 'cucchiaini', source: 'base' },
  { id: 'f23', name: 'Mandorle / noci sgusciate', kcal: 600, pro: 21, carbs: 4, fats: 53, pieceWeight: 30, unitName: 'manciata', unitPlural: 'manciate', source: 'base' },
  { id: 'f26', name: 'Yogurt greco 0%', kcal: 56, pro: 10.3, carbs: 3.8, fats: 0, pieceWeight: 150, unitName: 'vasetto', unitPlural: 'vasetti', source: 'base' },
  { id: 'f27', name: 'Latte parzialmente scremato', kcal: 46, pro: 3.3, carbs: 4.9, fats: 1.5, pieceWeight: 200, unitName: 'tazza', unitPlural: 'tazze', source: 'base' },
  { id: 'f28', name: 'Mela', kcal: 52, pro: 0.3, carbs: 12, fats: 0.2, pieceWeight: 160, unitName: 'mela', unitPlural: 'mele', source: 'base' },
  { id: 'f29', name: 'Banana', kcal: 89, pro: 1.1, carbs: 22, fats: 0.3, pieceWeight: 150, unitName: 'banana', unitPlural: 'banane', source: 'base' },
];
