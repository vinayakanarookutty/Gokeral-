import React, { useEffect, useState, useRef } from 'react';

// Define types for our component
interface RouteInfo {
  distance: string;
  duration: string;
  route: google.maps.DirectionsRoute;
}

interface Location {
  lat: number;
  lng: number;
}

const MapRouteSelector: React.FC = () => {
  // Refs for DOM elements
  const mapRef = useRef<HTMLDivElement>(null);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  
  // State variables
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [availableRoutes, setAvailableRoutes] = useState<RouteInfo[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);

  // Initialize the map
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (!mapRef.current) return;
      
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
        zoom: 12,
      });
      
      const directionsServiceInstance = new google.maps.DirectionsService();
      const directionsRendererInstance = new google.maps.DirectionsRenderer({
        map: mapInstance,
        draggable: true,
        hideRouteList: true,
      });
      
      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
      
      // Listen for route changes when user drags the route
      directionsRendererInstance.addListener('directions_changed', () => {
        const result = directionsRendererInstance.getDirections();
        if (result) {
          updateRouteInfo(result);
        }
      });
    };
    
    // Load map if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      loadGoogleMaps();
    } else {
      console.error("Google Maps API not loaded");
    }
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!map || !originInputRef.current || !destinationInputRef.current) return;
    
    // Setup origin autocomplete
    const originAutocomplete = new google.maps.places.Autocomplete(originInputRef.current);
    originAutocomplete.bindTo('bounds', map);
    originAutocomplete.addListener('place_changed', () => {
      const place = originAutocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;
      
      setOrigin({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });
    
    // Setup destination autocomplete
    const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInputRef.current);
    destinationAutocomplete.bindTo('bounds', map);
    destinationAutocomplete.addListener('place_changed', () => {
      const place = destinationAutocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;
      
      setDestination({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });
  }, [map]);

  // Calculate route whenever origin or destination changes
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin || !destination) return;
    
    const request: google.maps.DirectionsRequest = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
    };
    
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRenderer.setDirections(result);
        updateRouteInfo(result);
      }
    });
  }, [origin, destination, directionsService, directionsRenderer]);

  // Update route info when directions change
  const updateRouteInfo = (result: google.maps.DirectionsResult) => {
    if (!result.routes || result.routes.length === 0) return;
    
    const routes: RouteInfo[] = result.routes.map(route => {
      const leg = route.legs[0];
      return {
        distance: leg.distance?.text || 'Unknown',
        duration: leg.duration?.text || 'Unknown',
        route: route,
      };
    });
    
    setAvailableRoutes(routes);
    setSelectedRouteIndex(0);
  };

  // Handle route selection
  const handleRouteChange = (index: number) => {
    if (!directionsRenderer || index >= availableRoutes.length) return;
    
    setSelectedRouteIndex(index);
    
    // Update the rendered route
    const directions = directionsRenderer.getDirections();
    if (directions && directions.routes) {
      const newDirections = { ...directions };
      newDirections.routes = [directions.routes[index]];
      directionsRenderer.setDirections(newDirections);
      directionsRenderer.setRouteIndex(0);
    }
  };

  return (
    
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <label htmlFor="origin" className="block mb-1 font-medium">Origin</label>
          <input
            id="origin"
            ref={originInputRef}
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter origin location"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="destination" className="block mb-1 font-medium">Destination</label>
          <input
            id="destination"
            ref={destinationInputRef}
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter destination location"
          />
        </div>
      </div>

      {/* Map container */}
      <div ref={mapRef} className="w-full h-96 bg-gray-100 rounded"></div>

      {/* Route information */}
      {availableRoutes.length > 0 && (
        <div className="mt-4 p-4 border border-gray-200 rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Available Routes</h3>
          
          <div className="space-y-2">
            {availableRoutes.map((routeInfo, index) => (
              <div 
                key={index}
                className={`p-3 border rounded cursor-pointer ${
                  selectedRouteIndex === index 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'bg-white border-gray-200'
                }`}
                onClick={() => handleRouteChange(index)}
              >
                <div className="flex justify-between">
                  <span className="font-medium">Route {index + 1}</span>
                  <span className="text-gray-600">{routeInfo.duration} ({routeInfo.distance})</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-white border border-gray-200 rounded">
            <h4 className="font-medium">Selected Route Details</h4>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Distance:</span>
                <span className="ml-2 font-medium">{availableRoutes[selectedRouteIndex]?.distance}</span>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <span className="ml-2 font-medium">{availableRoutes[selectedRouteIndex]?.duration}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapRouteSelector;