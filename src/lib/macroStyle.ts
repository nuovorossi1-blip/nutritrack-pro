import type { Macros } from '../types';

export const MACRO_COLORS: Record<keyof Macros,string> = {
  kcal: 'bg-green-500', carbs: 'bg-sky-400', pro: 'bg-orange-400', fats: 'bg-yellow-400',
};
export function progressColor(key: keyof Macros, value: number, goal: number): string {
  return goal > 0 && value > goal ? 'bg-red-500' : goal > 0 && value === goal ? 'bg-emerald-400' : MACRO_COLORS[key];
}
