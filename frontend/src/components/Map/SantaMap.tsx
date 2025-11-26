import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom Santa marker
const santaIcon = L.divIcon({
  className: 'santa-marker',
  html: '<div style="font-size: 40px; text-align: center;">🎅</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Custom cookie marker
const cookieIcon = L.divIcon({
  className: 'cookie-marker',
  html: '<div style="font-size: 30px; text-align: center;">🍪</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

interface SantaMapProps {
  santaLocation: { lat: number; lng: number } | null;
  families: Array<{
    id: string;
    streetNumber: string;
    streetName: string;
    familyName: string;
    latitude?: number;
    longitude?: number;
    visited?: boolean;
  }>;
  onSantaClick?: () => void;
}

function CenterOnSanta({ location }: { location: { lat: number; lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], map.getZoom());
    }
  }, [location, map]);

  return null;
}

export default function SantaMap({
  santaLocation,
  families,
  onSantaClick,
}: SantaMapProps) {
  // Geocode addresses to get coordinates (simplified - in production, use a geocoding service)
  // For now, we'll use a mock approach - families would need lat/lng stored
  const familiesWithCoords = families.filter(f => f.latitude && f.longitude);

  const defaultCenter: [number, number] = santaLocation
    ? [santaLocation.lat, santaLocation.lng]
    : [39.8283, -98.5795]; // Center of USA as fallback

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border-4 border-holiday-gold shadow-xl">
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Santa marker */}
        {santaLocation && (
          <Marker
            position={[santaLocation.lat, santaLocation.lng]}
            icon={santaIcon}
            eventHandlers={{
              click: () => {
                if (onSantaClick) {
                  onSantaClick();
                }
              },
            }}
          />
        )}

        {/* Cookie markers for families */}
        {familiesWithCoords.map((family) => {
          if (family.visited) return null;
          return (
            <Marker
              key={family.id}
              position={[family.latitude!, family.longitude!]}
              icon={cookieIcon}
            >
              <Tooltip permanent={false} direction="top" offset={[0, -10]}>
                {family.familyName}
              </Tooltip>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-lg">{family.familyName}</p>
                  <p className="text-sm text-gray-600">
                    {family.streetNumber} {family.streetName}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <CenterOnSanta location={santaLocation} />
      </MapContainer>
    </div>
  );
}

