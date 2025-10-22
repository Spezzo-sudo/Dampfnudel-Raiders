# Äther-Imperium: Chroniken des Dampfs

Ein Vite + React Prototyp für die Steampunk-Raiders Verwaltungssimulation.

## Voraussetzungen

- Node.js 18+
- npm 9+

## Lokale Entwicklung

1. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
2. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```
3. Production-Build prüfen:
   ```bash
   npm run build
   ```

## Projektstruktur

```
.
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── components/
    ├── constants.ts
    ├── hooks/
    ├── lib/
    ├── main.tsx
    ├── store/
    └── types.ts
```

- `src/` enthält den kompletten Anwendungscode.
- Der `@`-Alias verweist auf `src/` und verhindert tiefe Relative-Imports.
- Jede exportierte Funktion besitzt eine kurze JSDoc-Beschreibung.

## Umgebungsvariablen

Die API-Schlüssel werden über `GEMINI_API_KEY` aus einer `.env` Datei geladen. Lokale Builds funktionieren auch ohne Schlüssel,
solange keine API-Aufrufe ausgelöst werden.
