import React, { useEffect, useRef, useState } from 'react';
import { Card, Typography, Space, Spin } from 'antd';
import { MapPin, Navigation, Clock } from 'lucide-react';

const { Title, Text } = Typography;

interface RouteViewerProps {
  origin: { address: string; lat?: number; lng?: number };
  destination: { address: string; lat?: number; lng?: number };
  routeData?: any;
  height?: string;
}

const RouteViewer: React.FC<RouteViewerProps> = ({ 
  origin, 
  destination, 
  routeData,
  height = "400px" 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState<any>(null);

  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 10.044815, lng: 76.327541 }, // Default to Kochi, Kerala
        zoom: 12,
        styles: [
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
          }
        ]
      });

      const directionsServiceInstance = new google.maps.DirectionsService();
      const directionsRendererInstance = new google.maps.DirectionsRenderer({
        map: mapInstance,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
          strokeOpacity: 0.8
        },
        suppressMarkers: false
      });

      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
    };

    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY
      }&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin.address || !destination.address) {
      return;
    }

    setLoading(true);

    const request: google.maps.DirectionsRequest = {
      origin: origin.address,
      destination: destination.address,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      setLoading(false);
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRenderer.setDirections(result);
        
        // Extract route information
        const route = result.routes[0];
        if (route && route.legs[0]) {
          const leg = route.legs[0];
          setRouteInfo({
            distance: leg.distance?.text || 'Unknown',
            duration: leg.duration?.text || 'Unknown',
            summary: route.summary || 'Route'
          });
        }
      } else {
        console.error("Directions request failed due to " + status);
      }
    });
  }, [directionsService, directionsRenderer, origin.address, destination.address]);

  return (
    <Card className="shadow-lg">
      <Space direction="vertical" className="w-full">
        <Title level={5} className="mb-2 flex items-center gap-2">
          <Navigation className="h-4 w-4 text-blue-500" />
          Route Details
        </Title>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-500" />
            <div>
              <Text strong>Origin:</Text>
              <br />
              <Text className="text-sm text-gray-600">{origin.address}</Text>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-500" />
            <div>
              <Text strong>Destination:</Text>
              <br />
              <Text className="text-sm text-gray-600">{destination.address}</Text>
            </div>
          </div>
        </div>

        {routeInfo && (
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg mb-4">
            <Space>
              <Navigation className="h-4 w-4 text-blue-500" />
              <Text strong>{routeInfo.distance}</Text>
            </Space>
            <Space>
              <Clock className="h-4 w-4 text-orange-500" />
              <Text strong>{routeInfo.duration}</Text>
            </Space>
          </div>
        )}

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <Spin size="large" />
            </div>
          )}
          <div 
            ref={mapRef} 
            style={{ height, width: '100%' }}
            className="route-viewer-map rounded-lg border border-gray-200"
          />
        </div>
      </Space>
    </Card>
  );
};

export default RouteViewer;