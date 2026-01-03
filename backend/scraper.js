import puppeteer from 'puppeteer';

const PLATFORMS = {
  mobile: {
    name: 'Mobile.de',
    baseUrl: 'https://www.mobile.de',
    buildUrl: (p) => {
      let url = 'https://www.mobile.de/auto/search.html?cn=DE&isSearchRequest=true';
      if (p.marke) url += `&ms=${encodeURIComponent(p.marke)};${encodeURIComponent(p.modell || '')};;;`;
      if (p.preisVon) url += `&minPrice=${p.preisVon}`;
      if (p.preisBis) url += `&maxPrice=${p.preisBis}`;
      if (p.kmBis) url += `&maxMileage=${p.kmBis}`;
      if (p.jahrVon) url += `&minFirstRegistrationDate=${p.jahrVon}-01`;
      if (p.jahrBis) url += `&maxFirstRegistrationDate=${p.jahrBis}-12`;
      if (p.leistungVon) url += `&minPowerAsArray=KW&minPower=${p.leistungVon}`;
      if (p.leistungBis) url += `&maxPowerAsArray=KW&maxPower=${p.leistungBis}`;
      if (p.kraftstoff) url += `&ft=${p.kraftstoff.toUpperCase()}`;
      if (p.getriebe === 'Schaltgetriebe') url += '&tr=MANUAL_GEAR';
      if (p.getriebe === 'Automatik') url += '&tr=AUTOMATIC_GEAR';
      if (p.plz) url += `&zipcode=${p.plz}&radius=${p.radius || 100}`;
      if (p.anbieter === 'Privat') url += '&scopeId=C';
      if (p.umweltplakette === 'Grün') url += '&eb=GREEN_BADGE';
      return url;
    }
  },
  autoscout: {
    name: 'AutoScout24',
    baseUrl: 'https://www.autoscout24.de',
    buildUrl: (p) => {
      let url = `https://www.autoscout24.de/lst/${encodeURIComponent((p.marke || '').toLowerCase())}/${encodeURIComponent((p.modell || '').toLowerCase())}?`;
      if (p.preisVon) url += `pricefrom=${p.preisVon}&`;
      if (p.preisBis) url += `priceto=${p.preisBis}&`;
      if (p.kmBis) url += `kmto=${p.kmBis}&`;
      if (p.jahrVon) url += `fregfrom=${p.jahrVon}&`;
      if (p.jahrBis) url += `fregto=${p.jahrBis}&`;
      if (p.leistungVon) url += `powerfrom=${p.leistungVon}&`;
      if (p.leistungBis) url += `powerto=${p.leistungBis}&`;
      if (p.kraftstoff) url += `fuel=${p.kraftstoff.toUpperCase()}&`;
      if (p.getriebe === 'Schaltgetriebe') url += 'gear=M&';
      if (p.getriebe === 'Automatik') url += 'gear=A&';
      if (p.plz) url += `zip=${p.plz}&zipr=${p.radius || 100}&`;
      if (p.anbieter === 'Privat') url += 'offer=U&';
      return url;
    }
  },
  ebay: {
    name: 'eBay Motors',
    baseUrl: 'https://www.ebay.de',
    buildUrl: (p) => {
      let url = `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent((p.marke || '') + ' ' + (p.modell || '') + ' ' + (p.kraftstoff || ''))}`;
      url += '&_sacat=9801'; // Autos Kategorie
      if (p.preisVon) url += `&_udlo=${p.preisVon}`;
      if (p.preisBis) url += `&_udhi=${p.preisBis}`;
      url += '&LH_ItemCondition=3000'; // Gebraucht
      return url;
    }
  },
  kleinanzeigen: {
    name: 'Kleinanzeigen',
    baseUrl: 'https://www.kleinanzeigen.de',
    buildUrl: (p) => {
      let url = 'https://www.kleinanzeigen.de/s-autos/';
      if (p.plz) url += `l${p.plz}r${p.radius || 100}/`;
      url += `c216+autos.marke_s:${encodeURIComponent(p.marke || '')}`;
      url += `+autos.model_s:${encodeURIComponent(p.modell || '')}`;
      if (p.preisVon) url += `+preis:${p.preisVon}:`;
      if (p.preisBis) url += `${p.preisBis}`;
      return url;
    }
  },
  uncle: {
    name: 'Uncle Auto',
    baseUrl: 'https://www.uncle-auto.de',
    buildUrl: (p) => {
      let url = 'https://www.uncle-auto.de/gebrauchtwagen?';
      if (p.marke) url += `make=${encodeURIComponent(p.marke)}&`;
      if (p.modell) url += `model=${encodeURIComponent(p.modell)}&`;
      if (p.preisVon) url += `minPrice=${p.preisVon}&`;
      if (p.preisBis) url += `maxPrice=${p.preisBis}&`;
      if (p.kmBis) url += `maxMileage=${p.kmBis}&`;
      if (p.jahrVon) url += `minYear=${p.jahrVon}&`;
      if (p.jahrBis) url += `maxYear=${p.jahrBis}&`;
      if (p.kraftstoff) url += `fuelType=${p.kraftstoff}&`;
      return url;
    }
  }
};

let browser = null;

async function getBrowser() {
  if (!browser) {
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    };
    
    // Für Railway/Cloud-Deployment: Chromium-Pfad aus Umgebungsvariable
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    
    browser = await puppeteer.launch(launchOptions);
  }
  return browser;
}

export async function scrapePlatform(platformId, searchParams) {
  const platform = PLATFORMS[platformId];
  if (!platform) {
    throw new Error(`Unbekannte Plattform: ${platformId}`);
  }
  
  const url = platform.buildUrl(searchParams);
  console.log(`🌐 Scrape ${platform.name}: ${url}`);
  
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    // User-Agent setzen
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Viewport setzen
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Cookie-Banner automatisch akzeptieren
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'de-DE,de;q=0.9'
    });
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Warte kurz, damit dynamischer Content lädt
    await page.waitForTimeout(2000);
    
    // Versuche Cookie-Banner zu schließen
    try {
      const cookieSelectors = [
        '[data-testid="uc-accept-all-button"]',
        '#onetrust-accept-btn-handler',
        '.cookie-banner-accept',
        '[id*="accept"]',
        'button[contains(text(), "Akzeptieren")]'
      ];
      
      for (const selector of cookieSelectors) {
        const button = await page.$(selector);
        if (button) {
          await button.click();
          await page.waitForTimeout(500);
          break;
        }
      }
    } catch (e) {
      // Cookie-Banner nicht gefunden, weitermachen
    }
    
    // Extrahiere den sichtbaren Text-Content
    const content = await page.evaluate(() => {
      // Entferne Scripts und Styles
      const scripts = document.querySelectorAll('script, style, noscript');
      scripts.forEach(s => s.remove());
      
      // Sammle alle sichtbaren Fahrzeug-Elemente
      const articles = document.querySelectorAll('article, [data-testid*="listing"], .listing-item, .result-item, .vehicle-card, .ad-listitem');
      
      if (articles.length > 0) {
        return Array.from(articles).slice(0, 20).map(a => a.innerText).join('\n\n---\n\n');
      }
      
      // Fallback: Gesamten Body-Text nehmen
      return document.body.innerText.slice(0, 50000);
    });
    
    await page.close();
    
    return {
      platform: platform.name,
      platformId,
      url,
      content,
      scrapedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Fehler beim Scrapen von ${platform.name}:`, error.message);
    return {
      platform: platform.name,
      platformId,
      url,
      content: '',
      error: error.message,
      scrapedAt: new Date().toISOString()
    };
  }
}

export async function scrapeAllPlatforms(searchParams, activePlatforms = ['mobile', 'autoscout', 'ebay', 'kleinanzeigen', 'uncle']) {
  const results = [];
  
  for (const platformId of activePlatforms) {
    if (PLATFORMS[platformId]) {
      const result = await scrapePlatform(platformId, searchParams);
      results.push(result);
    }
  }
  
  return results;
}

// Cleanup bei Prozessende
process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit();
});

process.on('SIGTERM', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit();
});
