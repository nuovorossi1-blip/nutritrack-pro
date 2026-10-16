"""Estrae solo calorie e macro dai download JSON ufficiali USDA (CC0).

Uso: python scripts/import-usda.py foundation.zip sr-legacy.zip
Fonti: https://fdc.nal.usda.gov/download-datasets/
Il file prodotto e' usato solo dal server; nessuna chiave API necessaria.
"""
import json
import math
from pathlib import Path
import sys
import zipfile

rows = {}
for archive in sys.argv[1:]:
    with zipfile.ZipFile(archive) as z:
        name = next(n for n in z.namelist() if n.endswith('.json'))
        data = json.loads(z.read(name))
        for food in next(iter(data.values())):
            if not food:
                continue
            nutrients = {n['nutrient']['id']: n.get('amount') for n in food.get('foodNutrients', [])}
            # 1008 = kcal, 2048/2047 = energia Atwater specifica/generale (kcal).
            energy = next((nutrients.get(n) for n in (1008, 2048, 2047) if nutrients.get(n) is not None), None)
            values = [energy, nutrients.get(1003), nutrients.get(1005), nutrients.get(1004)]
            if not all(isinstance(v, (int, float)) and math.isfinite(v) and v >= 0 for v in values):
                continue  # valori mancanti non diventano zeri
            rows[food['fdcId']] = [food['fdcId'], food['description'], *values, food['dataType']]

target = Path(__file__).resolve().parents[1] / 'server/data/usda.mjs'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text('// USDA FoodData Central, CC0. SR Legacy 2018-04; Foundation 2026-04.\n'
                  '// Rigenerare con scripts/import-usda.py e gli archivi ufficiali. Valori per 100 g.\n'
                  + 'export default ' + json.dumps(list(rows.values()), ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
print(f'{len(rows)} alimenti con calorie e macro completi; {target.stat().st_size} byte')
