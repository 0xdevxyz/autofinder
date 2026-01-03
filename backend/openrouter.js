import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function analyzeWithClaude(scrapedData, searchParams) {
  if (!OPENROUTER_API_KEY) {
    console.warn('⚠️ OPENROUTER_API_KEY nicht gesetzt - überspringe KI-Analyse');
    return [];
  }
  
  // Kombiniere alle gescrapten Daten
  const combinedContent = scrapedData
    .filter(d => d.content && !d.error)
    .map(d => `=== ${d.platform} ===\n${d.content}`)
    .join('\n\n');
  
  if (!combinedContent.trim()) {
    console.warn('⚠️ Kein Content zum Analysieren');
    return [];
  }
  
  const prompt = `Du bist ein Experte für Gebrauchtwagen-Analyse. Analysiere die folgenden Fahrzeuginserate und extrahiere alle passenden Fahrzeuge.

SUCHKRITERIEN:
- Marke: ${searchParams.marke || 'Alle'}
- Modell: ${searchParams.modell || 'Alle'}
- Fahrzeugtyp: ${searchParams.fahrzeugtyp || 'Alle'}
- Preis: ${searchParams.preisVon || '0'}€ - ${searchParams.preisBis || 'unbegrenzt'}€
- Kilometerstand: ${searchParams.kmVon || '0'} - ${searchParams.kmBis || 'unbegrenzt'} km
- Erstzulassung: ${searchParams.jahrVon || '1990'} - ${searchParams.jahrBis || '2025'}
- Leistung: ${searchParams.leistungVon || '0'} - ${searchParams.leistungBis || 'unbegrenzt'} kW
- Kraftstoff: ${searchParams.kraftstoff || 'Alle'}
- Getriebe: ${searchParams.getriebe || 'Alle'}
- Anbieter: ${searchParams.anbieter || 'Alle'}
- TÜV: mindestens ${searchParams.tuev || '0'} Monate
- Umweltplakette: ${searchParams.umweltplakette || 'Alle'}

INSERATDATEN:
${combinedContent.slice(0, 80000)}

Extrahiere ALLE Fahrzeuge, die den Kriterien entsprechen. Gib NUR ein valides JSON-Array zurück, KEIN zusätzlicher Text:

[
  {
    "id": "eindeutige-id-oder-inserat-nummer",
    "titel": "vollständiger Fahrzeugtitel",
    "preis": "5.900 €",
    "km": "125.000 km",
    "jahr": "2015",
    "leistung": "81 kW (110 PS)",
    "kraftstoff": "Diesel",
    "getriebe": "Schaltgetriebe",
    "ort": "12345 Musterstadt",
    "anbieter": "Privat",
    "tuev": "06/2025",
    "plattform": "Mobile.de",
    "link": "https://...",
    "highlights": "kurze Stichpunkte zu Besonderheiten"
  }
]

Falls keine passenden Fahrzeuge gefunden wurden, gib ein leeres Array [] zurück.`;

  try {
    console.log('🤖 Sende Anfrage an Claude via OpenRouter...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Fahrzeug-Scanner'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-20250514',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.1
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API Fehler: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Extrahiere JSON aus der Antwort
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const vehicles = JSON.parse(jsonMatch[0]);
      console.log(`✅ ${vehicles.length} Fahrzeuge von Claude analysiert`);
      
      return vehicles.map(v => ({
        ...v,
        analyzedAt: new Date().toISOString()
      }));
    }
    
    console.warn('⚠️ Keine JSON-Daten in Claude-Antwort gefunden');
    return [];
    
  } catch (error) {
    console.error('❌ Fehler bei Claude-Analyse:', error.message);
    return [];
  }
}

// Funktion zum direkten Analysieren von manuell eingegebenem Content
export async function analyzeManualContent(content, searchParams) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY nicht konfiguriert');
  }
  
  return analyzeWithClaude([{ platform: 'Manual', content }], searchParams);
}
