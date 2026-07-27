import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// HEYLA-OS country names (as they appear in the world-atlas topology)
const HEYLA_COUNTRIES = new Set([
  'Kenya', 'Nigeria', 'South Africa', 'Ghana', 'Tanzania', 'Uganda',
  'Rwanda', 'Ethiopia', 'Egypt', 'United States of America',
  'United Kingdom', 'Germany', 'France', 'India', 'United Arab Emirates',
  'Brazil', 'China', 'Japan', 'Australia', 'Canada',
]);

// Capital city coordinates for markers on highlighted countries
const COUNTRY_MARKERS: { name: string; coordinates: [number, number]; code: string }[] = [
  { name: 'Kenya', coordinates: [37.9062, -0.0236], code: 'KE' },
  { name: 'Nigeria', coordinates: [7.4891, 9.0820], code: 'NG' },
  { name: 'South Africa', coordinates: [25.5732, -28.8166], code: 'ZA' },
  { name: 'Ghana', coordinates: [-0.1869, 5.6037], code: 'GH' },
  { name: 'Tanzania', coordinates: [35.7382, -6.7924], code: 'TZ' },
  { name: 'Uganda', coordinates: [32.2903, 1.3733], code: 'UG' },
  { name: 'Rwanda', coordinates: [30.0619, -1.9403], code: 'RW' },
  { name: 'Ethiopia', coordinates: [38.7468, 9.0320], code: 'ET' },
  { name: 'Egypt', coordinates: [31.2357, 30.0444], code: 'EG' },
  { name: 'United States of America', coordinates: [-98.5795, 39.8283], code: 'US' },
  { name: 'United Kingdom', coordinates: [-3.4360, 55.3781], code: 'GB' },
  { name: 'Germany', coordinates: [10.4515, 51.1657], code: 'DE' },
  { name: 'France', coordinates: [2.2137, 46.6034], code: 'FR' },
  { name: 'India', coordinates: [78.9629, 20.5937], code: 'IN' },
  { name: 'United Arab Emirates', coordinates: [54.3773, 24.4539], code: 'AE' },
  { name: 'Brazil', coordinates: [-51.9253, -14.2350], code: 'BR' },
  { name: 'China', coordinates: [104.1954, 35.8617], code: 'CN' },
  { name: 'Japan', coordinates: [138.2529, 36.2048], code: 'JP' },
  { name: 'Australia', coordinates: [133.7751, -25.2744], code: 'AU' },
  { name: 'Canada', coordinates: [-106.3468, 56.1304], code: 'CA' },
];

interface WorldMapProps {
  highlightColor?: string;
  className?: string;
}

export function WorldMap({ highlightColor = '#2563eb', className }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<{ name: string; code: string } | null>(null);

  return (
    <div className={`relative w-full ${className || ''}`}>
      <ComposableMap
        projectionConfig={{ scale: 147 }}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isHeyla = HEYLA_COUNTRIES.has(geo.properties.name);
              const marker = COUNTRY_MARKERS.find(m => m.name === geo.properties.name);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isHeyla ? highlightColor : '#e2e8f0'}
                  stroke={isHeyla ? '#ffffff' : '#cbd5e1'}
                  strokeWidth={isHeyla ? 0.8 : 0.4}
                  style={{
                    default: { outline: 'none', transition: 'all 0.2s' },
                    hover: { fill: isHeyla ? '#1d4ed8' : '#f1f5f9', outline: 'none', cursor: isHeyla ? 'pointer' : 'default' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={() => { if (marker) setTooltip({ name: marker.name, code: marker.code }); }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          }
        </Geographies>

        {/* Dot markers for each HEYLA country */}
        {COUNTRY_MARKERS.map((m) => (
          <Marker key={m.code} coordinates={m.coordinates}>
            <circle r={4} fill={highlightColor} stroke="#ffffff" strokeWidth={1.5} />
          </Marker>
        ))}
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute top-2 left-2 bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-medium shadow-md pointer-events-none z-10">
          {tooltip.name} <span className="text-muted-foreground">({tooltip.code})</span>
        </div>
      )}
    </div>
  );
}
