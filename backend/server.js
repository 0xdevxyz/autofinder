import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scrapeAllPlatforms, scrapePlatform } from './scraper.js';
import { analyzeWithClaude } from './openrouter.js';
import { sendTelegramAlert, initTelegram } from './telegram.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Speicher für bekannte Fahrzeuge (für Alert-Vergleich)
let knownVehicles = new Map();

// Telegram Bot initialisieren
initTelegram();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Suche auf allen Plattformen
app.post('/api/search', async (req, res) => {
  try {
    const { searchParams, platforms } = req.body;
    
    console.log('🔍 Starte Suche mit Parametern:', searchParams);
    console.log('📱 Aktive Plattformen:', platforms);
    
    // Scrape alle aktiven Plattformen
    const scrapedData = await scrapeAllPlatforms(searchParams, platforms);
    
    // Analysiere mit Claude
    const vehicles = await analyzeWithClaude(scrapedData, searchParams);
    
    // Prüfe auf neue Fahrzeuge
    const newVehicles = [];
    for (const vehicle of vehicles) {
      const vehicleKey = `${vehicle.plattform}-${vehicle.id || vehicle.titel}`;
      if (!knownVehicles.has(vehicleKey)) {
        knownVehicles.set(vehicleKey, vehicle);
        vehicle.isNew = true;
        newVehicles.push(vehicle);
      }
    }
    
    // Sende Telegram-Benachrichtigung für neue Fahrzeuge
    if (newVehicles.length > 0) {
      await sendTelegramAlert(newVehicles, searchParams);
    }
    
    res.json({
      success: true,
      vehicles,
      newCount: newVehicles.length,
      totalCount: vehicles.length
    });
    
  } catch (error) {
    console.error('❌ Fehler bei der Suche:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Einzelne Plattform scrapen
app.post('/api/scrape/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { searchParams } = req.body;
    
    console.log(`🔍 Scrape ${platform}...`);
    
    const data = await scrapePlatform(platform, searchParams);
    const vehicles = await analyzeWithClaude([{ platform, data }], searchParams);
    
    res.json({
      success: true,
      vehicles,
      platform
    });
    
  } catch (error) {
    console.error(`❌ Fehler bei ${req.params.platform}:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Manuelle Fahrzeuge importieren (von extern generiertem JSON)
app.post('/api/import', async (req, res) => {
  try {
    const { vehicles } = req.body;
    
    if (!Array.isArray(vehicles)) {
      return res.status(400).json({ 
        success: false, 
        error: 'vehicles muss ein Array sein' 
      });
    }
    
    const newVehicles = [];
    const importedVehicles = vehicles.map(vehicle => {
      const vehicleKey = `${vehicle.plattform || 'manual'}-${vehicle.id || vehicle.titel}`;
      const isNew = !knownVehicles.has(vehicleKey);
      
      if (isNew) {
        knownVehicles.set(vehicleKey, vehicle);
        newVehicles.push(vehicle);
      }
      
      return {
        ...vehicle,
        isNew,
        importedAt: new Date().toISOString()
      };
    });
    
    // Telegram Alert für neue Fahrzeuge
    if (newVehicles.length > 0) {
      await sendTelegramAlert(newVehicles, { marke: 'Import', modell: '' });
    }
    
    res.json({
      success: true,
      vehicles: importedVehicles,
      newCount: newVehicles.length,
      totalCount: importedVehicles.length
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Import:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Bekannte Fahrzeuge zurücksetzen
app.post('/api/reset', (req, res) => {
  knownVehicles.clear();
  res.json({ success: true, message: 'Fahrzeug-Cache geleert' });
});

// Such-URLs generieren (ohne zu scrapen)
app.post('/api/urls', (req, res) => {
  const { searchParams } = req.body;
  const urls = generateSearchUrls(searchParams);
  res.json({ success: true, urls });
});

function generateSearchUrls(p) {
  const urls = {};
  
  // Mobile.de
  let mobileUrl = 'https://www.mobile.de/auto/search.html?cn=DE&isSearchRequest=true';
  if (p.marke) mobileUrl += `&ms=${encodeURIComponent(p.marke)};${encodeURIComponent(p.modell || '')};;;`;
  if (p.preisVon) mobileUrl += `&minPrice=${p.preisVon}`;
  if (p.preisBis) mobileUrl += `&maxPrice=${p.preisBis}`;
  if (p.kmBis) mobileUrl += `&maxMileage=${p.kmBis}`;
  if (p.jahrVon) mobileUrl += `&minFirstRegistrationDate=${p.jahrVon}-01`;
  if (p.jahrBis) mobileUrl += `&maxFirstRegistrationDate=${p.jahrBis}-12`;
  if (p.kraftstoff) mobileUrl += `&ft=${p.kraftstoff.toUpperCase()}`;
  if (p.getriebe === 'Schaltgetriebe') mobileUrl += '&tr=MANUAL_GEAR';
  if (p.anbieter === 'Privat') mobileUrl += '&scopeId=C';
  urls.mobile = mobileUrl;
  
  // AutoScout24
  let asUrl = `https://www.autoscout24.de/lst/${encodeURIComponent((p.marke || '').toLowerCase())}/${encodeURIComponent((p.modell || '').toLowerCase())}?`;
  if (p.preisVon) asUrl += `pricefrom=${p.preisVon}&`;
  if (p.preisBis) asUrl += `priceto=${p.preisBis}&`;
  if (p.kmBis) asUrl += `kmto=${p.kmBis}&`;
  if (p.jahrVon) asUrl += `fregfrom=${p.jahrVon}&`;
  if (p.jahrBis) asUrl += `fregto=${p.jahrBis}&`;
  if (p.kraftstoff) asUrl += `fuel=${p.kraftstoff.toUpperCase()}&`;
  if (p.getriebe === 'Schaltgetriebe') asUrl += 'gear=M&';
  if (p.anbieter === 'Privat') asUrl += 'offer=U&';
  urls.autoscout = asUrl;
  
  // eBay
  let ebayUrl = `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent((p.marke || '') + ' ' + (p.modell || ''))}&_sacat=9801`;
  if (p.preisVon) ebayUrl += `&_udlo=${p.preisVon}`;
  if (p.preisBis) ebayUrl += `&_udhi=${p.preisBis}`;
  urls.ebay = ebayUrl;
  
  // Kleinanzeigen
  let kaUrl = `https://www.kleinanzeigen.de/s-autos/c216?q=${encodeURIComponent((p.marke || '') + ' ' + (p.modell || ''))}`;
  urls.kleinanzeigen = kaUrl;
  
  // Uncle Auto
  let uncleUrl = `https://www.uncle-auto.de/gebrauchtwagen?make=${encodeURIComponent(p.marke || '')}&model=${encodeURIComponent(p.modell || '')}`;
  if (p.preisVon) uncleUrl += `&minPrice=${p.preisVon}`;
  if (p.preisBis) uncleUrl += `&maxPrice=${p.preisBis}`;
  urls.uncle = uncleUrl;
  
  return urls;
}

app.listen(PORT, () => {
  console.log(`
🚗 Fahrzeug-Scanner Backend läuft auf Port ${PORT}
📡 API Endpoints:
   POST /api/search     - Alle Plattformen durchsuchen
   POST /api/scrape/:id - Einzelne Plattform scrapen
   POST /api/import     - Manuell JSON importieren
   POST /api/urls       - Such-URLs generieren
   POST /api/reset      - Cache leeren
   GET  /api/health     - Health Check
  `);
});
