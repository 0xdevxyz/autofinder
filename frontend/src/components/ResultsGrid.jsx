import { ExternalLink, Trash2, MapPin, Calendar, Gauge, Fuel, Settings2, User, Shield, Sparkles } from 'lucide-react';

const PLATFORM_STYLES = {
  'Mobile.de': 'platform-mobile',
  'AutoScout24': 'platform-autoscout',
  'eBay Motors': 'platform-ebay',
  'Kleinanzeigen': 'platform-kleinanzeigen',
  'Uncle Auto': 'platform-uncle'
};

export default function ResultsGrid({ vehicles, onClear }) {
  if (vehicles.length === 0) {
    return (
      <div className="bg-carbon-900/30 rounded-2xl border border-carbon-800 p-12 text-center">
        <div className="w-16 h-16 bg-carbon-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-carbon-600" />
        </div>
        <h3 className="text-xl font-medium text-carbon-400 mb-2">Noch keine Fahrzeuge</h3>
        <p className="text-carbon-600">
          Starte eine Suche oder importiere Fahrzeuge über den JSON-Import
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold text-white">
          Gefundene Fahrzeuge 
          <span className="text-accent ml-2">({vehicles.length})</span>
        </h2>
        <button
          onClick={onClear}
          className="px-4 py-2 bg-carbon-800 hover:bg-red-900/50 text-carbon-400 hover:text-red-400 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Liste leeren
        </button>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle, index) => (
          <VehicleCard key={vehicle.id || index} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}

function VehicleCard({ vehicle }) {
  const platformStyle = PLATFORM_STYLES[vehicle.plattform] || 'bg-carbon-700';
  
  return (
    <div className={`bg-carbon-900/50 rounded-xl border border-carbon-800 overflow-hidden hover:border-accent/50 transition-all group ${vehicle.isNew ? 'new-listing ring-2 ring-accent/30' : ''}`}>
      {/* Header mit Plattform Badge */}
      <div className="px-4 py-3 border-b border-carbon-800 flex items-start justify-between gap-2">
        <h3 className="font-medium text-white text-sm leading-tight line-clamp-2 flex-1">
          {vehicle.titel || 'Unbekanntes Fahrzeug'}
        </h3>
        <span className={`${platformStyle} px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap`}>
          {vehicle.plattform}
        </span>
      </div>
      
      {/* Preis */}
      <div className="px-4 py-3 bg-carbon-800/50">
        <div className="text-2xl font-bold text-accent">
          {vehicle.preis || 'Preis auf Anfrage'}
        </div>
        {vehicle.isNew && (
          <span className="inline-flex items-center gap-1 text-xs text-accent mt-1">
            <Sparkles className="w-3 h-3" />
            Neu gefunden
          </span>
        )}
      </div>
      
      {/* Details */}
      <div className="p-4 space-y-2">
        {vehicle.km && (
          <div className="flex items-center gap-2 text-sm">
            <Gauge className="w-4 h-4 text-carbon-500" />
            <span className="text-carbon-400">Kilometer:</span>
            <span className="text-white ml-auto">{vehicle.km}</span>
          </div>
        )}
        
        {vehicle.jahr && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-carbon-500" />
            <span className="text-carbon-400">Erstzulassung:</span>
            <span className="text-white ml-auto">{vehicle.jahr}</span>
          </div>
        )}
        
        {vehicle.leistung && (
          <div className="flex items-center gap-2 text-sm">
            <Settings2 className="w-4 h-4 text-carbon-500" />
            <span className="text-carbon-400">Leistung:</span>
            <span className="text-white ml-auto">{vehicle.leistung}</span>
          </div>
        )}
        
        {vehicle.kraftstoff && (
          <div className="flex items-center gap-2 text-sm">
            <Fuel className="w-4 h-4 text-carbon-500" />
            <span className="text-carbon-400">Kraftstoff:</span>
            <span className="text-white ml-auto">{vehicle.kraftstoff}</span>
          </div>
        )}
        
        {vehicle.getriebe && (
          <div className="flex items-center gap-2 text-sm">
            <Settings2 className="w-4 h-4 text-carbon-500" />
            <span className="text-carbon-400">Getriebe:</span>
            <span className="text-white ml-auto">{vehicle.getriebe}</span>
          </div>
        )}
        
        {vehicle.ort && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-carbon-500" />
            <span className="text-carbon-400">Standort:</span>
            <span className="text-white ml-auto truncate max-w-[150px]">{vehicle.ort}</span>
          </div>
        )}
        
        {vehicle.anbieter && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-carbon-500" />
            <span className="text-carbon-400">Anbieter:</span>
            <span className={`ml-auto ${vehicle.anbieter === 'Privat' ? 'text-green-400' : 'text-blue-400'}`}>
              {vehicle.anbieter}
            </span>
          </div>
        )}
        
        {vehicle.tuev && (
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-carbon-500" />
            <span className="text-carbon-400">TÜV:</span>
            <span className="text-white ml-auto">{vehicle.tuev}</span>
          </div>
        )}
        
        {vehicle.highlights && (
          <div className="mt-3 pt-3 border-t border-carbon-800">
            <p className="text-xs text-carbon-400">{vehicle.highlights}</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 pb-4">
        {vehicle.gefundenAm && (
          <p className="text-xs text-carbon-600 mb-3">
            Gefunden: {new Date(vehicle.gefundenAm).toLocaleString('de-DE')}
          </p>
        )}
        
        {vehicle.link ? (
          <a
            href={vehicle.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-accent hover:bg-accent-400 text-carbon-950 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Inserat öffnen
          </a>
        ) : (
          <div className="w-full py-2.5 bg-carbon-800 text-carbon-500 font-medium rounded-lg text-center">
            Kein Link verfügbar
          </div>
        )}
      </div>
    </div>
  );
}
