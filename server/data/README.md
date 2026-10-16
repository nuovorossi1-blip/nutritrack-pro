# Catalogo USDA FoodData Central

Fonte ufficiale: https://fdc.nal.usda.gov/download-datasets/

Archivi usati:

- `FoodData_Central_sr_legacy_food_json_2018-04.zip` (SR Legacy, versione finale aprile 2018).
- `FoodData_Central_foundation_food_json_2026-04-30.zip` (Foundation, aprile 2026).

Licenza CC0: https://fdc.nal.usda.gov/api-guide/#bkmk-9

`usda.mjs` contiene 8.104 voci con calorie, proteine, carboidrati e grassi
presenti. Sono esclusi record null e record incompleti: un valore mancante non
viene mai convertito in zero. Per ogni voce si conservano ID FDC, descrizione
originale, valori per 100 g e tipo di dataset.

Nutrienti: 1003 proteine (g), 1005 carboidrati (g), 1004 grassi (g).
Energia (kcal): 1008, oppure 2048/2047 (Atwater) se 1008 manca. Il client
arrotonda le calorie all'intero e i macro a un decimale. I carboidrati sono
quelli riportati da USDA; non vengono ricalcolati come carboidrati netti.

Rigenerazione da archivi ufficiali scaricati sul PC:

```text
python scripts/import-usda.py percorso/sr-legacy.zip percorso/foundation.zip
```

Il catalogo resta sul server. La ricerca usa la copia ufficiale inclusa nel
deploy; non interroga il sito USDA a ogni richiesta e non richiede API key.
La traduzione automatica riguarda solo query e nomi. I valori vengono sempre
letti dal record locale corrispondente all'ID FDC validato.

Aggiornare il catalogo richiede scaricare una nuova versione, rigenerare il
file e pubblicare: non dichiarare aggiornamenti in tempo reale.
