'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { Center } from '@/types';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

// Fix for default Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  centers: Center[];
}

function MapUpdater({ centers }: { centers: Center[] }) {
  const map = useMap();

  useEffect(() => {
    if (centers.length > 0) {
      // Find bounding box for all points
      const lats = centers.map(c => c.lat);
      const lngs = centers.map(c => c.lng);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
      // Adding a small padding
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [centers, map]);

  return null;
}

export default function Map({ centers }: MapProps) {
  // Default to Comunitat Valenciana center
  const defaultCenter: [number, number] = [39.4699, -0.3763];

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={8} 
        scrollWheelZoom={true} 
        className="h-full w-full rounded-xl shadow-inner z-0 premium-popup-container bg-gray-100 dark:bg-gray-950"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {centers.map(center => (
          <Marker key={center.id} position={[center.lat, center.lng]}>
            <Popup className="premium-popup-container" minWidth={280} maxWidth={340}>
              <div className="flex flex-col group/popup bg-white dark:bg-gray-900 w-full">
                {/* Decorative header */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary-700 via-primary-500 to-primary-300 dark:from-primary-600 dark:via-primary-500 dark:to-primary-400"></div>
                
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase border bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 block w-fit mb-1.5">
                        {center.type}
                      </span>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight group-hover/popup:text-primary-700 dark:group-hover/popup:text-primary-400 transition-colors">
                        {center.name}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-primary-700 dark:text-primary-400 mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed line-clamp-2">
                      <span className="block text-gray-900 dark:text-white font-medium">{center.municipality}</span>
                      {center.address && <span className="capitalize opacity-80">{center.address.toLowerCase()}</span>}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {center.levels.map(lvl => (
                      <span key={lvl} className="px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800/50 text-[10px] font-semibold rounded-md">
                        {lvl}
                      </span>
                    ))}
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-1">
                    <Link 
                      href={`/centro/${center.id}`}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-bold bg-primary-700 dark:bg-primary-600 text-white shadow-md shadow-primary-700/20 hover:shadow-primary-700/30 hover:bg-primary-800 dark:hover:bg-primary-500 transition-all"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapUpdater centers={centers} />
      </MapContainer>
    </div>
  );
}
