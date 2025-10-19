import { useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';

interface GoogleMapLocationProps {
  address: string;
  businessName: string;
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

// Default center (will be replaced by geocoded location)
const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

export const GoogleMapLocation = ({ address, businessName }: GoogleMapLocationProps) => {
  const [center, setCenter] = useState(defaultCenter);
  const [mapError, setMapError] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    // Geocode the address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const newCenter = {
          lat: location.lat(),
          lng: location.lng()
        };
        setCenter(newCenter);
        map.setCenter(newCenter);
      } else {
        console.error('Geocoding failed:', status);
        setMapError(true);
      }
    });
  }, [address]);

  if (loadError || mapError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{address}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Map temporarily unavailable
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{address}</span>
        </div>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={15}
          onLoad={onLoad}
          options={{
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          }}
        >
          <Marker 
            position={center}
            title={businessName}
          />
        </GoogleMap>
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline inline-block"
        >
          Open in Google Maps →
        </a>
      </CardContent>
    </Card>
  );
};
