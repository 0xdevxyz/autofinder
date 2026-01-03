import { Bell, X, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';

export default function AlertPanel({ alerts, onClear }) {
  if (alerts.length === 0) return null;
  
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };
  
  const getStyle = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-800 bg-green-900/20';
      case 'error':
        return 'border-red-800 bg-red-900/20';
      default:
        return 'border-blue-800 bg-blue-900/20';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-medium text-carbon-300">
            Benachrichtigungen ({alerts.length})
          </h3>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-carbon-500 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Alle löschen
        </button>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {alerts.slice(0, 5).map(alert => (
          <div
            key={alert.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${getStyle(alert.type)}`}
          >
            {getIcon(alert.type)}
            <span className="text-sm text-carbon-200 flex-1">{alert.message}</span>
            <span className="text-xs text-carbon-500">
              {new Date(alert.timestamp).toLocaleTimeString('de-DE')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
