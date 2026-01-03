import { Bookmark, X, Clock } from 'lucide-react';

export default function SavedSearches({ searches, onLoad, onDelete }) {
  if (searches.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Bookmark className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-medium text-carbon-300">Gespeicherte Suchen</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {searches.map(search => (
          <div
            key={search.id}
            className="group flex items-center gap-2 px-3 py-2 bg-carbon-800/50 hover:bg-carbon-800 border border-carbon-700 rounded-lg transition-colors"
          >
            <button
              onClick={() => onLoad(search)}
              className="text-sm text-white hover:text-accent transition-colors"
            >
              {search.name}
            </button>
            <span className="text-xs text-carbon-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(search.savedAt).toLocaleDateString('de-DE')}
            </span>
            <button
              onClick={() => onDelete(search.id)}
              className="p-1 text-carbon-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
