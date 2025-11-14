import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { Bar } from '@/data/bars';

interface MapViewProps {
  bars: Bar[];
  selectedBar: Bar | null;
  onBarSelect: (bar: Bar) => void;
  favorites: Set<string>;
  userLocation: { latitude: number; longitude: number } | null;
  onLocationChange?: (coordinates: { latitude: number; longitude: number }) => void;
  radius?: number; // radius in meters
  routeToBar?: Bar | null; // Bar to show route to
  onRouteClose?: () => void; // Callback when route is cleared
}

// Fix for default marker icons in Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapView = ({ bars, selectedBar, onBarSelect, favorites, userLocation, onLocationChange, radius = 500, routeToBar, onRouteClose }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Use user location if available, otherwise default to Bergen
    const initialCenter: [number, number] = userLocation 
      ? [userLocation.latitude, userLocation.longitude]
      : [60.391505, 5.321170];

    // Initialize map
    map.current = L.map(mapContainer.current, {
      center: initialCenter,
      zoom: 15,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when bars or favorites change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing bar markers
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

  // Add/update user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Remove existing radius circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }

    // Add radius circle with dynamic radius
    radiusCircleRef.current = L.circle(
      [userLocation.latitude, userLocation.longitude],
      {
        radius: radius, // Use the dynamic radius prop
        color: 'hsl(189, 94%, 58%)',
        fillColor: 'hsl(189, 94%, 58%)',
        fillOpacity: 0.1,
        weight: 2,
        opacity: 0.5,
        dashArray: '10, 10',
      }
    ).addTo(map.current);

    // Create user location marker with pulsing blue dot
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div class="location-pin" style="
          width: 24px;
          height: 24px;
          background: hsl(189, 94%, 58%);
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7), 0 2px 8px rgba(0,0,0,0.3);
          animation: pulse 2s infinite;
          cursor: move;
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add user marker with draggable option
    userMarkerRef.current = L.marker(
      [userLocation.latitude, userLocation.longitude],
      { 
        icon: userIcon,
        draggable: true, // Make it draggable!
      }
    ).addTo(map.current);

    // Handle drag event (update circle while dragging)
    userMarkerRef.current.on('drag', () => {
      if (userMarkerRef.current && radiusCircleRef.current) {
        const newPos = userMarkerRef.current.getLatLng();
        radiusCircleRef.current.setLatLng(newPos);
      }
    });

    // Handle drag end event
    userMarkerRef.current.on('dragend', () => {
      if (userMarkerRef.current && onLocationChange) {
        const newPos = userMarkerRef.current.getLatLng();
        onLocationChange({
          latitude: newPos.lat,
          longitude: newPos.lng,
        });
      }
    });

    // Add tooltip to indicate it's draggable
    userMarkerRef.current.bindTooltip('Drag to move search location', {
      permanent: false,
      direction: 'top',
      offset: [0, -15],
    });

    // Center map on user location
    map.current.setView([userLocation.latitude, userLocation.longitude], 15);
  }, [userLocation, onLocationChange, radius]);

  // Fly to selected bar
  useEffect(() => {
    if (selectedBar && map.current) {
      map.current.flyTo([selectedBar.coordinates[1], selectedBar.coordinates[0]], 16, {
        duration: 1,
      });
    }
  }, [selectedBar]);

  // Handle routing to a bar
  useEffect(() => {
    if (!map.current) return;

    // Remove existing route if any
    if (routingControlRef.current) {
      map.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Add new route if requested
    if (routeToBar && userLocation) {
      const [barLng, barLat] = routeToBar.coordinates;
      
      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(userLocation.latitude, userLocation.longitude),
          L.latLng(barLat, barLng)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: '#38bdf8', opacity: 0.8, weight: 5 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        show: true,
        collapsible: true,
        // Hide the default waypoint markers - we use our own
        createMarker: function() {
          return null;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router: (L.Routing as any).osrmv1({
          serviceUrl: 'https://routing.openstreetmap.de/routed-foot/route/v1',
          // German OSRM server with foot profile for walking directions
        })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any).addTo(map.current);

      // Customize the instructions panel to match app design
      const container = routingControlRef.current.getContainer();
      if (container) {
        // Apply dark mode styling to match the app
        container.style.backgroundColor = 'hsl(var(--card))';
        container.style.backdropFilter = 'blur(10px)';
        container.style.border = '1px solid hsl(var(--primary) / 0.2)';
        container.style.borderRadius = '0.5rem';
        container.style.color = 'hsl(var(--foreground))';
        container.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        
        // Style the route summary
        const summary = container.querySelector('.leaflet-routing-container');
        if (summary) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (summary as any).style.color = 'hsl(var(--foreground))';
        }
        
        // Style all route instructions
        const instructions = container.querySelectorAll('.leaflet-routing-alt');
        instructions.forEach((instruction) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (instruction as any).style.backgroundColor = 'transparent';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (instruction as any).style.color = 'hsl(var(--foreground))';
        });
        
        // Style the collapse button
        const collapseBtn = container.querySelector('.leaflet-routing-collapse-btn');
        if (collapseBtn) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (collapseBtn as any).style.color = 'hsl(var(--primary))';
        }
      }
    }

    return () => {
      if (routingControlRef.current && map.current) {
        map.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [routeToBar, userLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden" />
      
      {/* Close route button */}
      {routeToBar && onRouteClose && (
        <div className="absolute top-4 right-4 z-[1000]">
          <button
            onClick={onRouteClose}
            className="bg-card/90 backdrop-blur-sm border border-primary/20 rounded-lg px-4 py-2 shadow-lg hover:bg-card transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Close Route
          </button>
        </div>
      )}
      
      {/* Instruction overlay */}
      {userLocation && !routeToBar && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-none">
          <div className="bg-card/90 backdrop-blur-sm border border-primary/20 rounded-lg px-4 py-2 shadow-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
              Drag the blue pin • 0.5km radius
            </p>
          </div>
        </div>
      )}
      
      <style>{`
        .leaflet-container {
          background: hsl(220, 20%, 8%);
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .user-location-marker {
          background: transparent;
          border: none;
        }
        .user-location-marker.leaflet-drag-target {
          cursor: grabbing !important;
        }
        .location-pin {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          transform-origin: center center;
        }
        .user-location-marker:hover .location-pin {
          transform: scale(1.15);
        }
        .user-location-marker.leaflet-drag-target .location-pin {
          transform: scale(1.25);
          box-shadow: 0 0 0 8px rgba(56, 189, 248, 0.3), 0 4px 12px rgba(0,0,0,0.5) !important;
          animation: none !important;
        }
        .marker-pin {
          transition: transform 0.2s ease-in-out;
          transform-origin: center center;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(56, 189, 248, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0);
          }
        }
        
        /* Routing panel styles */
        .leaflet-routing-container {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border: 1px solid hsl(var(--primary) / 0.2) !important;
          border-radius: 0.5rem !important;
        }
        
        .leaflet-routing-container h2 {
          color: hsl(var(--foreground)) !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
          padding: 0.75rem 1rem !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
          background: hsl(var(--muted) / 0.3) !important;
        }
        
        .leaflet-routing-container h3 {
          color: hsl(var(--primary)) !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
        }
        
        .leaflet-routing-alt {
          background: transparent !important;
          border: none !important;
          padding: 0.5rem 1rem !important;
        }
        
        .leaflet-routing-alt table {
          color: hsl(var(--muted-foreground)) !important;
        }
        
        .leaflet-routing-alt tr:hover {
          background: hsl(var(--muted) / 0.5) !important;
        }
        
        .leaflet-routing-collapse-btn {
          background: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
          border-radius: 0.375rem !important;
          padding: 0.25rem 0.5rem !important;
          font-size: 0.75rem !important;
          margin: 0.5rem !important;
        }
        
        .leaflet-routing-collapse-btn:hover {
          background: hsl(var(--primary) / 0.9) !important;
        }
        
        .leaflet-routing-geocoders {
          display: none !important; /* Hide the input fields since we're using pre-defined waypoints */
        }
      `}</style>
    </div>
  );
};

export default MapView;
