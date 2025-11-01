import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bar } from '@/data/bars';

interface MapViewProps {
  bars: Bar[];
  selectedBar: Bar | null;
  onBarSelect: (bar: Bar) => void;
  favorites: Set<string>;
}

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapView = ({ bars, selectedBar, onBarSelect, favorites }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current, {
      center: [60.391505, 5.321170],
      zoom: 16,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles (no API key needed!)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when bars or favorites change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each bar
    bars.forEach((bar) => {
      // Create custom icon with bar image
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-pin" style="
            width: 40px;
            height: 40px;
            background-image: url('${bar.image}');
            background-size: cover;
            background-position: center;
            border-radius: 50%;
            border: 3px solid ${favorites.has(bar.id) ? 'hsl(32, 95%, 58%)' : 'white'};
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transition: transform 0.2s ease-in-out;
          "></div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([bar.coordinates[1], bar.coordinates[0]], {
        icon: customIcon,
      }).addTo(map.current!);

      marker.on('click', () => {
        onBarSelect(bar);
      });

      // Add hover effect to the inner pin element, not the marker container
      const markerElement = marker.getElement();
      if (markerElement) {
        const pinElement = markerElement.querySelector('.marker-pin') as HTMLElement;
        if (pinElement) {
          markerElement.addEventListener('mouseenter', () => {
            pinElement.style.transform = 'scale(1.2)';
          });

          markerElement.addEventListener('mouseleave', () => {
            pinElement.style.transform = 'scale(1)';
          });
        }
      }

      markersRef.current.push(marker);
    });
  }, [bars, favorites, onBarSelect]);

  // Fly to selected bar
  useEffect(() => {
    if (selectedBar && map.current) {
      map.current.flyTo([selectedBar.coordinates[1], selectedBar.coordinates[0]], 16, {
        duration: 1,
      });
    }
  }, [selectedBar]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden" />
      <style>{`
        .leaflet-container {
          background: hsl(220, 20%, 8%);
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .marker-pin {
          transition: transform 0.2s ease-in-out;
          transform-origin: center center;
        }
      `}</style>
    </div>
  );
};

export default MapView;
