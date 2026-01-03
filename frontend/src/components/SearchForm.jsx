import { useState } from 'react';
import { Search, Save, ChevronDown, ChevronUp, ExternalLink, Filter } from 'lucide-react';

const PLATFORMS = [
  { id: 'mobile', name: 'Mobile.de', color: 'platform-mobile' },
  { id: 'autoscout', name: 'AutoScout24', color: 'platform-autoscout' },
  { id: 'ebay', name: 'eBay Motors', color: 'platform-ebay' },
  { id: 'kleinanzeigen', name: 'Kleinanzeigen', color: 'platform-kleinanzeigen' },
  { id: 'uncle', name: 'Uncle Auto', color: 'platform-uncle' }
];

const KRAFTSTOFF_OPTIONS = ['Diesel', 'Benzin', 'Elektro', 'Hybrid', 'Alle'];
const GETRIEBE_OPTIONS = ['Schaltgetriebe', 'Automatik', 'Alle'];
const ANBIETER_OPTIONS = ['Privat', 'Händler', 'Alle'];
const UMWELT_OPTIONS = ['Grün', 'Gelb', 'Alle'];
const TUEV_OPTIONS = [
  { value: '0', label: 'Egal' },
  { value: '3', label: 'Mind. 3 Monate' },
  { value: '6', label: 'Mind. 6 Monate' },
  { value: '12', label: 'Mind. 12 Monate' }
];
const RADIUS_OPTIONS = ['25', '50', '100', '150', '200', '300'];

export default function SearchForm({
  searchParams,
  setSearchParams,
  selectedPlatforms,
  setSelectedPlatforms,
  onSearch,
  onSave,
  loading,
  lastScan
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const updateParam = (key, value) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };
  
  const togglePlatform = (id) => {
    setSelectedPlatforms(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const openDirectSearch = (platformId) => {
    const urls = generateUrls();
    if (urls[platformId]) {
      window.open(urls[platformId], '_blank');
    }
  };
  
  const generateUrls = () => {
    const p = searchParams;
    const urls = {};
    
    // Mobile.de
    let mobileUrl = 'https://www.mobile.de/auto/search.html?cn=DE&isSearchRequest=true';
    if (p.marke) mobileUrl += `&ms=${encodeURIComponent(p.marke)};${encodeURIComponent(p.modell || '')};;;`;
    if (p.preisVon) mobileUrl += `&minPrice=${p.preisVon}`;
    if (p.preisBis) mobileUrl += `&maxPrice=${p.preisBis}`;
    if (p.kmBis) mobileUrl += `&maxMileage=${p.kmBis}`;
    if (p.jahrVon) mobileUrl += `&minFirstRegistrationDate=${p.jahrVon}-01`;
    if (p.jahrBis) mobileUrl += `&maxFirstRegistrationDate=${p.jahrBis}-12`;
    if (p.kraftstoff && p.kraftstoff !== 'Alle') mobileUrl += `&ft=${p.kraftstoff.toUpperCase()}`;
    if (p.getriebe === 'Schaltgetriebe') mobileUrl += '&tr=MANUAL_GEAR';
    if (p.getriebe === 'Automatik') mobileUrl += '&tr=AUTOMATIC_GEAR';
    if (p.anbieter === 'Privat') mobileUrl += '&scopeId=C';
    urls.mobile = mobileUrl;
    
    // AutoScout24
    let asUrl = `https://www.autoscout24.de/lst/${encodeURIComponent((p.marke || '').toLowerCase())}/${encodeURIComponent((p.modell || '').toLowerCase())}?`;
    if (p.preisVon) asUrl += `pricefrom=${p.preisVon}&`;
    if (p.preisBis) asUrl += `priceto=${p.preisBis}&`;
    if (p.kmBis) asUrl += `kmto=${p.kmBis}&`;
    if (p.jahrVon) asUrl += `fregfrom=${p.jahrVon}&`;
    if (p.jahrBis) asUrl += `fregto=${p.jahrBis}&`;
    if (p.kraftstoff && p.kraftstoff !== 'Alle') asUrl += `fuel=${p.kraftstoff.toUpperCase()}&`;
    if (p.getriebe === 'Schaltgetriebe') asUrl += 'gear=M&';
    if (p.anbieter === 'Privat') asUrl += 'offer=U&';
    urls.autoscout = asUrl;
    
    // eBay
    let ebayUrl = `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent((p.marke || '') + ' ' + (p.modell || ''))}&_sacat=9801`;
    if (p.preisVon) ebayUrl += `&_udlo=${p.preisVon}`;
    if (p.preisBis) ebayUrl += `&_udhi=${p.preisBis}`;
    urls.ebay = ebayUrl;
    
    // Kleinanzeigen
    urls.kleinanzeigen = `https://www.kleinanzeigen.de/s-autos/c216?q=${encodeURIComponent((p.marke || '') + ' ' + (p.modell || ''))}`;
    
    // Uncle Auto
    let uncleUrl = `https://www.uncle-auto.de/gebrauchtwagen?make=${encodeURIComponent(p.marke || '')}&model=${encodeURIComponent(p.modell || '')}`;
    if (p.preisVon) uncleUrl += `&minPrice=${p.preisVon}`;
    if (p.preisBis) uncleUrl += `&maxPrice=${p.preisBis}`;
    urls.uncle = uncleUrl;
    
    return urls;
  };

  return (
    <div className="bg-carbon-900/50 backdrop-blur-xl rounded-2xl border border-carbon-800 p-6 mb-6">
      {/* Plattformen */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-carbon-400 mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Plattformen
        </h3>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(platform => (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedPlatforms[platform.id]
                  ? `${platform.color} text-white shadow-lg`
                  : 'bg-carbon-800 text-carbon-400 hover:bg-carbon-700'
              }`}
            >
              <span>{platform.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDirectSearch(platform.id);
                }}
                className="p-1 hover:bg-white/20 rounded"
                title="Direkt öffnen"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
      </div>
      
      {/* Basis-Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm text-carbon-400 mb-1">Marke</label>
          <input
            type="text"
            value={searchParams.marke}
            onChange={(e) => updateParam('marke', e.target.value)}
            placeholder="z.B. Volkswagen"
            className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-500 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-carbon-400 mb-1">Modell</label>
          <input
            type="text"
            value={searchParams.modell}
            onChange={(e) => updateParam('modell', e.target.value)}
            placeholder="z.B. Golf"
            className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-500 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-carbon-400 mb-1">Fahrzeugtyp</label>
          <input
            type="text"
            value={searchParams.fahrzeugtyp}
            onChange={(e) => updateParam('fahrzeugtyp', e.target.value)}
            placeholder="z.B. Limousine"
            className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-500 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
      </div>
      
      {/* Preis & Kilometer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm text-carbon-400 mb-1">Preis von €</label>
          <input
            type="number"
            value={searchParams.preisVon}
            onChange={(e) => updateParam('preisVon', e.target.value)}
            placeholder="Min"
            className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-500 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-carbon-400 mb-1">Preis bis €</label>
          <input
            type="number"
            value={searchParams.preisBis}
            onChange={(e) => updateParam('preisBis', e.target.value)}
            placeholder="Max"
            className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-500 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-carbon-400 mb-1">KM von</label>
          <input
            type="number"
            value={searchParams.kmVon}
            onChange={(e) => updateParam('kmVon', e.target.value)}
            placeholder="Min"
            className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-500 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-carbon-400 mb-1">KM bis</label>
          <input
            type="number"
            value={searchParams.kmBis}
            onChange={(e) => updateParam('kmBis', e.target.value)}
            placeholder="Max"
            className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-500 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
      </div>
      
      {/* Erweiterte Filter Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-accent hover:text-accent-400 transition-colors mb-4"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        <span className="text-sm font-medium">Erweiterte Filter {showAdvanced ? 'ausblenden' : 'einblenden'}</span>
      </button>
      
      {/* Erweiterte Filter */}
      {showAdvanced && (
        <div className="space-y-6 mb-6 pt-4 border-t border-carbon-800">
          {/* Baujahr & Leistung */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-carbon-400 mb-1">Baujahr von</label>
              <input
                type="number"
                value={searchParams.jahrVon}
                onChange={(e) => updateParam('jahrVon', e.target.value)}
                placeholder="2010"
                className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-500 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-carbon-400 mb-1">Baujahr bis</label>
              <input
                type="number"
                value={searchParams.jahrBis}
                onChange={(e) => updateParam('jahrBis', e.target.value)}
                placeholder="2020"
                className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-500 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-carbon-400 mb-1">Leistung von (kW)</label>
              <input
                type="number"
                value={searchParams.leistungVon}
                onChange={(e) => updateParam('leistungVon', e.target.value)}
                placeholder="50"
                className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-500 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-carbon-400 mb-1">Leistung bis (kW)</label>
              <input
                type="number"
                value={searchParams.leistungBis}
                onChange={(e) => updateParam('leistungBis', e.target.value)}
                placeholder="150"
                className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-500 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
          </div>
          
          {/* Kraftstoff, Getriebe, Anbieter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-carbon-400 mb-1">Kraftstoff</label>
              <select
                value={searchParams.kraftstoff}
                onChange={(e) => updateParam('kraftstoff', e.target.value)}
                className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              >
                {KRAFTSTOFF_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-carbon-400 mb-1">Getriebe</label>
              <select
                value={searchParams.getriebe}
                onChange={(e) => updateParam('getriebe', e.target.value)}
                className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              >
                {GETRIEBE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-carbon-400 mb-1">Anbieter</label>
              <select
                value={searchParams.anbieter}
                onChange={(e) => updateParam('anbieter', e.target.value)}
                className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              >
                {ANBIETER_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Standort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-carbon-400 mb-1">PLZ</label>
              <input
                type="text"
                value={searchParams.plz}
                onChange={(e) => updateParam('plz', e.target.value)}
                placeholder="z.B. 01067"
                className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-500 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-carbon-400 mb-1">Umkreis</label>
              <select
                value={searchParams.radius}
                onChange={(e) => updateParam('radius', e.target.value)}
                className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              >
                {RADIUS_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt} km</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* TÜV & Umweltplakette */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-carbon-400 mb-1">TÜV</label>
              <select
                value={searchParams.tuev}
                onChange={(e) => updateParam('tuev', e.target.value)}
                className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              >
                {TUEV_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-carbon-400 mb-1">Umweltplakette</label>
              <select
                value={searchParams.umweltplakette}
                onChange={(e) => updateParam('umweltplakette', e.target.value)}
                className="w-full px-4 py-2.5 bg-carbon-800 border border-carbon-700 rounded-lg text-white focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              >
                {UMWELT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onSearch}
          disabled={loading}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-accent to-accent-600 hover:from-accent-400 hover:to-accent-500 disabled:from-carbon-600 disabled:to-carbon-700 text-carbon-950 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:shadow-none"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-carbon-950 border-t-transparent rounded-full animate-spin" />
              Suche läuft...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Fahrzeuge suchen
            </>
          )}
        </button>
        
        <button
          onClick={onSave}
          className="py-3 px-6 bg-carbon-800 hover:bg-carbon-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Suche speichern
        </button>
      </div>
      
      {lastScan && (
        <p className="text-center text-carbon-500 text-sm mt-3">
          Letzter Scan: {lastScan.toLocaleString('de-DE')}
        </p>
      )}
    </div>
  );
}
