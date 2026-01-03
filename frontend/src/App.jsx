import { useState, useEffect, useCallback } from 'react';
import SearchForm from './components/SearchForm';
import ResultsGrid from './components/ResultsGrid';
import ManualInput from './components/ManualInput';
import AlertPanel from './components/AlertPanel';
import SavedSearches from './components/SavedSearches';
import { Car, Zap, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function App() {
  const [searchParams, setSearchParams] = useState({
    marke: 'Volkswagen',
    modell: 'Golf',
    fahrzeugtyp: 'Limousine',
    preisVon: '3500',
    preisBis: '6500',
    kmVon: '',
    kmBis: '150000',
    jahrVon: '2013',
    jahrBis: '2017',
    leistungVon: '75',
    leistungBis: '110',
    kraftstoff: 'Diesel',
    getriebe: 'Schaltgetriebe',
    plz: '',
    radius: '100',
    anbieter: 'Privat',
    tuev: '3',
    umweltplakette: 'Grün'
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState({
    mobile: true,
    autoscout: true,
    ebay: true,
    kleinanzeigen: true,
    uncle: true
  });

  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastScan, setLastScan] = useState(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Lade gespeicherte Daten beim Start
  useEffect(() => {
    const stored = localStorage.getItem('autofinder_searches');
    if (stored) setSavedSearches(JSON.parse(stored));
    
    const storedAlerts = localStorage.getItem('autofinder_alerts');
    if (storedAlerts) setAlerts(JSON.parse(storedAlerts));
    
    const storedVehicles = localStorage.getItem('autofinder_vehicles');
    if (storedVehicles) setVehicles(JSON.parse(storedVehicles));
    
    // Backend-Status prüfen
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  // Speichere Fahrzeuge bei Änderungen
  useEffect(() => {
    if (vehicles.length > 0) {
      localStorage.setItem('autofinder_vehicles', JSON.stringify(vehicles));
    }
  }, [vehicles]);

  // Speichere Alerts
  useEffect(() => {
    localStorage.setItem('autofinder_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    
    const activePlatforms = Object.entries(selectedPlatforms)
      .filter(([, active]) => active)
      .map(([id]) => id);
    
    try {
      const response = await fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchParams,
          platforms: activePlatforms
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const newVehicles = data.vehicles.map(v => ({
          ...v,
          gefundenAm: new Date().toISOString()
        }));
        
        setVehicles(prev => {
          const existingIds = new Set(prev.map(v => v.id));
          const onlyNew = newVehicles.filter(v => !existingIds.has(v.id));
          return [...onlyNew, ...prev];
        });
        
        if (data.newCount > 0) {
          addAlert(`${data.newCount} neue Fahrzeuge gefunden!`, 'success');
          playAlertSound();
        }
        
        setLastScan(new Date());
      } else {
        setError(data.error || 'Unbekannter Fehler');
      }
    } catch (err) {
      setError(`Backend nicht erreichbar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualImport = async (jsonData) => {
    try {
      const vehicles = JSON.parse(jsonData);
      
      if (!Array.isArray(vehicles)) {
        throw new Error('JSON muss ein Array sein');
      }
      
      const response = await fetch(`${API_URL}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicles })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setVehicles(prev => [...data.vehicles, ...prev]);
        addAlert(`${data.newCount} neue Fahrzeuge importiert!`, 'success');
        if (data.newCount > 0) playAlertSound();
        setShowManualInput(false);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      addAlert(`Import fehlgeschlagen: ${err.message}`, 'error');
    }
  };

  const addAlert = (message, type = 'info') => {
    const newAlert = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 20));
  };

  const playAlertSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio nicht verfügbar');
    }
  };

  const saveCurrentSearch = () => {
    const search = {
      id: Date.now(),
      name: `${searchParams.marke} ${searchParams.modell}`,
      params: { ...searchParams },
      platforms: { ...selectedPlatforms },
      savedAt: new Date().toISOString()
    };
    
    const updated = [search, ...savedSearches].slice(0, 10);
    setSavedSearches(updated);
    localStorage.setItem('autofinder_searches', JSON.stringify(updated));
    addAlert('Suche gespeichert!', 'success');
  };

  const loadSearch = (search) => {
    setSearchParams(search.params);
    setSelectedPlatforms(search.platforms);
    addAlert(`Suche "${search.name}" geladen`, 'info');
  };

  const deleteSearch = (id) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('autofinder_searches', JSON.stringify(updated));
  };

  const clearVehicles = () => {
    setVehicles([]);
    localStorage.removeItem('autofinder_vehicles');
    addAlert('Fahrzeugliste geleert', 'info');
  };

  return (
    <div className="min-h-screen bg-carbon-950 text-white">
      {/* Header */}
      <header className="bg-carbon-900/80 backdrop-blur-xl border-b border-carbon-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-600 rounded-xl flex items-center justify-center">
                <Car className="w-7 h-7 text-carbon-950" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-white to-carbon-400 bg-clip-text text-transparent">
                  AutoFinder
                </h1>
                <p className="text-sm text-carbon-500">Multi-Plattform Scanner</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Backend Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-carbon-800">
                {backendStatus === 'connected' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span className="text-sm text-carbon-300">Backend verbunden</span>
                  </>
                ) : backendStatus === 'checking' ? (
                  <>
                    <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                    <span className="text-sm text-carbon-300">Prüfe...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-carbon-300">Offline</span>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="px-4 py-2 bg-carbon-800 hover:bg-carbon-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                JSON Import
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Alerts */}
        <AlertPanel alerts={alerts} onClear={() => setAlerts([])} />
        
        {/* Manual Input Modal */}
        {showManualInput && (
          <ManualInput
            onImport={handleManualImport}
            onClose={() => setShowManualInput(false)}
            searchParams={searchParams}
          />
        )}
        
        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <SavedSearches
            searches={savedSearches}
            onLoad={loadSearch}
            onDelete={deleteSearch}
          />
        )}
        
        {/* Search Form */}
        <SearchForm
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          selectedPlatforms={selectedPlatforms}
          setSelectedPlatforms={setSelectedPlatforms}
          onSearch={handleSearch}
          onSave={saveCurrentSearch}
          loading={loading}
          lastScan={lastScan}
        />
        
        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Results */}
        <ResultsGrid
          vehicles={vehicles}
          onClear={clearVehicles}
        />
      </main>
      
      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-carbon-800 text-center text-carbon-600 text-sm">
        <p>AutoFinder Scanner • Alle Plattformen auf einen Blick</p>
      </footer>
    </div>
  );
}

export default App;
