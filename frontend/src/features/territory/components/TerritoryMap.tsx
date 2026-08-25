import React from 'react';

// Abstracción requerida por la Regla 11 (MapProvider)
// Esto permite cambiar entre Google Maps, Mapbox o Leaflet sin afectar al módulo.
interface MapProviderProps {
  markers: Array<{ id: string; lat: number; lng: number; title: string; coverageState: 'COMPLETO' | 'PARCIAL' | 'SIN_COBERTURA' }>;
  center: { lat: number; lng: number };
  zoom: number;
  onMarkerClick: (id: string) => void;
}

export const TerritoryMap: React.FC<MapProviderProps> = ({ markers, center, zoom, onMarkerClick }) => {
  // Lógica de renderizado abstracta (Ej: usando react-leaflet)
  return (
    <div className="w-full h-[500px] bg-slate-100 rounded-lg border border-slate-200 relative flex items-center justify-center">
      {/* Placeholder visual del mapa para cumplir Regla 10 y 11 */}
      <span className="text-slate-400 font-medium">🗺️ Capa del Mapa (MapProvider)</span>
      
      {markers.map(marker => (
        <div 
          key={marker.id} 
          onClick={() => onMarkerClick(marker.id)}
          className={`absolute cursor-pointer w-6 h-6 rounded-full border-2 border-white shadow-md
            ${marker.coverageState === 'COMPLETO' ? 'bg-success' : 
              marker.coverageState === 'PARCIAL' ? 'bg-warning' : 'bg-error'}`}
          style={{
            // Posicionamiento simulado para demostración
            top: `${50 + (marker.lat - center.lat) * 10}%`,
            left: `${50 + (marker.lng - center.lng) * 10}%`
          }}
          title={marker.title}
        />
      ))}
    </div>
  );
};
