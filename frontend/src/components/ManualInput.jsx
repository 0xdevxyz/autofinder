import { useState } from 'react';
import { X, FileJson, Copy, Check, AlertCircle } from 'lucide-react';

export default function ManualInput({ onImport, onClose, searchParams }) {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  const handleImport = () => {
    setError('');
    
    if (!jsonInput.trim()) {
      setError('Bitte JSON-Daten eingeben');
      return;
    }
    
    try {
      // Versuche JSON zu parsen
      const data = JSON.parse(jsonInput);
      
      if (!Array.isArray(data)) {
        setError('JSON muss ein Array sein');
        return;
      }
      
      onImport(jsonInput);
    } catch (err) {
      setError(`Ungültiges JSON: ${err.message}`);
    }
  };
  
  const promptTemplate = `Analysiere diese Fahrzeuginserate und extrahiere die Daten.

SUCHKRITERIEN:
- Marke: ${searchParams.marke || 'Alle'}
- Modell: ${searchParams.modell || 'Alle'}
- Preis: ${searchParams.preisVon || '0'}€ - ${searchParams.preisBis || 'unbegrenzt'}€
- Kilometerstand: bis ${searchParams.kmBis || 'unbegrenzt'} km
- Erstzulassung: ${searchParams.jahrVon || '1990'} - ${searchParams.jahrBis || '2025'}
- Kraftstoff: ${searchParams.kraftstoff || 'Alle'}
- Getriebe: ${searchParams.getriebe || 'Alle'}
- Anbieter: ${searchParams.anbieter || 'Alle'}

Gib NUR ein JSON-Array zurück:
[
  {
    "id": "eindeutige-id",
    "titel": "Fahrzeugtitel",
    "preis": "5.900 €",
    "km": "125.000 km",
    "jahr": "2015",
    "leistung": "81 kW (110 PS)",
    "kraftstoff": "Diesel",
    "getriebe": "Schaltgetriebe",
    "ort": "12345 Stadt",
    "anbieter": "Privat",
    "tuev": "06/2025",
    "plattform": "Mobile.de",
    "link": "https://...",
    "highlights": "Besonderheiten"
  }
]`;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopieren fehlgeschlagen:', err);
    }
  };
  
  const exampleJson = `[
  {
    "id": "12345",
    "titel": "VW Golf 1.6 TDI Comfortline",
    "preis": "5.900 €",
    "km": "125.000 km",
    "jahr": "2014",
    "leistung": "77 kW (105 PS)",
    "kraftstoff": "Diesel",
    "getriebe": "Schaltgetriebe",
    "ort": "01067 Dresden",
    "anbieter": "Privat",
    "tuev": "08/2025",
    "plattform": "Mobile.de",
    "link": "https://www.mobile.de/...",
    "highlights": "Scheckheftgepflegt, Nichtraucher"
  }
]`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-carbon-900 rounded-2xl border border-carbon-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-carbon-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <FileJson className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">JSON Import</h2>
              <p className="text-sm text-carbon-400">Fahrzeuge manuell aus Claude-Output importieren</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-carbon-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-carbon-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Prompt Template */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-carbon-300">Claude Prompt-Vorlage</h3>
              <button
                onClick={copyPrompt}
                className="px-3 py-1.5 bg-carbon-800 hover:bg-carbon-700 text-carbon-300 rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Kopiert!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Kopieren
                  </>
                )}
              </button>
            </div>
            <div className="bg-carbon-950 rounded-lg p-4 border border-carbon-800">
              <pre className="text-xs text-carbon-400 whitespace-pre-wrap font-mono">
                {promptTemplate}
              </pre>
            </div>
          </div>
          
          {/* JSON Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-carbon-300">JSON-Daten einfügen</h3>
              <button
                onClick={() => setJsonInput(exampleJson)}
                className="text-xs text-accent hover:text-accent-400 transition-colors"
              >
                Beispiel laden
              </button>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setError('');
              }}
              placeholder="Claude JSON-Antwort hier einfügen..."
              className="w-full h-64 px-4 py-3 bg-carbon-950 border border-carbon-700 rounded-lg text-white placeholder-carbon-600 font-mono text-sm focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
            />
          </div>
          
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-carbon-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-carbon-800 hover:bg-carbon-700 text-white rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleImport}
            className="px-6 py-2 bg-accent hover:bg-accent-400 text-carbon-950 font-medium rounded-lg transition-colors"
          >
            Importieren
          </button>
        </div>
      </div>
    </div>
  );
}
