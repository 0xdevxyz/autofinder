# AutoFinder - Multi-Plattform Fahrzeug-Scanner

Ein leistungsstarker Fahrzeug-Scanner für Auto-Flipping, der automatisch 5 große Plattformen durchsucht und neue Inserate per Telegram meldet.

## Features

- **5 Plattformen**: Mobile.de, AutoScout24, eBay Motors, Kleinanzeigen, Uncle Auto
- **KI-Analyse**: Claude (via OpenRouter) analysiert Inserate und filtert nach deinen Kriterien
- **Telegram Alerts**: Sofortige Benachrichtigung bei neuen passenden Fahrzeugen
- **Sound-Alerts**: Akustische Benachrichtigung im Browser
- **Manuelle JSON-Import**: Externe Claude-Ergebnisse direkt importieren
- **Gespeicherte Suchen**: Suchprofile speichern und laden

## Installation

### 1. Repository klonen & Dependencies installieren

```bash
# Backend
cd backend
npm install
copy env.example .env  # Dann .env mit deinen Keys ausfüllen

# Frontend
cd ../frontend
npm install
```

### 2. API-Keys konfigurieren

Erstelle `backend/.env` mit:

```env
# OpenRouter API Key - https://openrouter.ai
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx

# Telegram Bot - via @BotFather erstellen
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

PORT=3001
```

### 3. Telegram Bot einrichten

1. Öffne Telegram und suche nach `@BotFather`
2. Sende `/newbot` und folge den Anweisungen
3. Kopiere den Bot-Token in deine `.env`
4. Starte den Bot mit `/start`
5. Öffne `https://api.telegram.org/bot<DEIN_TOKEN>/getUpdates`
6. Finde deine `chat.id` und kopiere sie in die `.env`

## Starten

```bash
# Terminal 1: Backend starten
cd backend
npm install
npm run dev

# Terminal 2: Frontend starten  
cd frontend
npm install
npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Nutzung

### Automatische Suche (mit Backend)

1. Filter einstellen (Marke, Modell, Preis, etc.)
2. Plattformen auswählen
3. "Fahrzeuge suchen" klicken
4. Das Backend scraped die Plattformen und analysiert mit Claude

### Manuelle JSON-Import

Falls das automatische Scraping blockiert wird:

1. Klicke auf "JSON Import"
2. Kopiere den Prompt-Template
3. Öffne die Plattform manuell und kopiere die Suchergebnisse
4. Füge sie zusammen mit dem Prompt in Claude ein
5. Kopiere Claudes JSON-Antwort in den Import-Dialog

### Direkte Links

Jede Plattform hat einen "Öffnen" Button, der die Suche direkt auf der Plattform öffnet.

## API Endpoints

```
POST /api/search     - Alle Plattformen durchsuchen
POST /api/scrape/:id - Einzelne Plattform scrapen
POST /api/import     - Manuell JSON importieren
POST /api/urls       - Such-URLs generieren
POST /api/reset      - Fahrzeug-Cache leeren
GET  /api/health     - Health Check
```

## Suchkriterien (VW Golf Diesel Beispiel)

- **Marke**: Volkswagen
- **Modell**: Golf
- **Fahrzeugtyp**: Limousine
- **Preis**: 3.500€ - 6.500€
- **Kilometerstand**: bis 150.000 km
- **Erstzulassung**: 2013 - 2017
- **Leistung**: 75 - 110 kW
- **Kraftstoff**: Diesel
- **Getriebe**: Schaltgetriebe
- **Anbieter**: Privat
- **TÜV**: mindestens 3 Monate
- **Umweltplakette**: Grün

## Technologie-Stack

- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons
- **Backend**: Node.js, Express, Puppeteer
- **KI**: OpenRouter (Claude Sonnet)
- **Alerts**: Web Audio API, node-telegram-bot-api

## Hinweise

- Scraping kann durch Anti-Bot-Maßnahmen blockiert werden
- Bei Problemen den manuellen JSON-Import nutzen
- Telegram-Alerts funktionieren auch ohne Scraping (nur bei Import)

## Lizenz

MIT
