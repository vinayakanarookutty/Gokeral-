import React, { useEffect, useRef, useState } from "react";
import { Input, Button, Card, Typography, List, Space, Badge, Avatar, message } from "antd";
import { RouteModal } from "./RouteModal";
import { Place, Route } from "../../types/directions";
import { MapPin, Navigation2, Navigation, Clock, ChevronRight, Crosshair } from "lucide-react";
import BookingConfirmationModal from "./bookingConfiramtionModall";

// Add this type definition for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

const Maps: React.FC = () => {
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [originSuggestions, setOriginSuggestions] = useState<Place[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Place[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<Place | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Place | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [_map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [directionsService, setDirectionsService] = useState<any | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRoutesCardCollapsed, setIsRoutesCardCollapsed] = useState<boolean>(false);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);

  const mapRef = useRef<HTMLDivElement>(null);

  // Initialize Google Maps services
  useEffect(() => {
    const loadGoogleMapsServices = () => {
      if (window.google && window.google.maps) {
        // Initialize the map
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: { lat: 10.044815, lng: 76.327541 },  // Default to Kochi, Kerala
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
            },
            {
              featureType: "road.highway",
              elementType: "geometry.fill",
              stylers: [{ color: "#ffffff" }, { lightness: 17 }]
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }]
            },
            {
              featureType: "road.arterial",
              elementType: "geometry",
              stylers: [{ color: "#ffffff" }, { lightness: 18 }]
            },
            {
              featureType: "poi",
              elementType: "geometry",
              stylers: [{ color: "#f5f5f5" }, { lightness: 21 }]
            },
          ]
        });
        setMap(mapInstance);

        // Initialize Google Maps services
        setAutocompleteService(new google.maps.places.AutocompleteService());
        setDirectionsService(new google.maps.DirectionsService());
        setGeocoder(new google.maps.Geocoder());

        // Initialize DirectionsRenderer with custom styles
        const renderer = new google.maps.DirectionsRenderer({
          map: mapInstance,
          polylineOptions: {
            strokeColor: '#4285F4',
            strokeWeight: 5,
            strokeOpacity: 0.8
          },
          suppressMarkers: false
        });
        renderer.setMap(mapInstance);
        setDirectionsRenderer(renderer);
      }
    };

    // Load script only if it's not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY
      }&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = loadGoogleMapsServices;
      document.head.appendChild(script);
    } else {
      loadGoogleMapsServices();
    }
  }, []);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.error("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Use Geocoder to get address from coordinates
        if (geocoder) {
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              setIsGettingLocation(false);
              if (status === "OK" && results && results[0]) {
                const address = results[0].formatted_address;
                
                // Check if the location is in Kerala
                if (address.toLowerCase().includes('kerala') || address.toLowerCase().includes('kochi') || 
                    address.toLowerCase().includes('trivandrum') || address.toLowerCase().includes('calicut') ||
                    address.toLowerCase().includes('thrissur') || address.toLowerCase().includes('kollam') ||
                    address.toLowerCase().includes('malappuram') || address.toLowerCase().includes('palakkad') ||
                    address.toLowerCase().includes('kannur') || address.toLowerCase().includes('kasaragod') ||
                    address.toLowerCase().includes('alappuzha') || address.toLowerCase().includes('pathanamthitta') ||
                    address.toLowerCase().includes('idukki') || address.toLowerCase().includes('wayanad')) {
                  
                  setOrigin(address);
                  setSelectedOrigin({
                    description: address,
                    place_id: results[0].place_id || '',
                    matched_substrings: [],
                    structured_formatting: {
                      main_text: address.split(',')[0],
                      secondary_text: address.split(',').slice(1).join(',')
                    },
                    terms: [],
                    types: []
                  });
                  
                  // Update map center to current location
                  if (_map) {
                    _map.setCenter({ lat: latitude, lng: longitude });
                    _map.setZoom(15);
                  }
                  
                  message.success("Current location set as origin!");
                } else {
                  message.warning("Your current location appears to be outside Kerala. Please select a location within Kerala.");
                }
              } else {
                message.error("Could not retrieve address for your location.");
              }
            }
          );
        }
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message.error("Location access denied by user.");
            break;
          case error.POSITION_UNAVAILABLE:
            message.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            message.error("Location request timed out.");
            break;
          default:
            message.error("An unknown error occurred while retrieving location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Filter function to check if place is in Kerala
  const isPlaceInKerala = (place: Place): boolean => {
    const description = place.description.toLowerCase();
    const keralaKeywords = [
      'kerala', 'kochi', 'cochin', 'trivandrum', 'thiruvananthapuram', 'calicut', 'kozhikode',
      'thrissur', 'kollam', 'malappuram', 'palakkad', 'kannur', 'kasaragod', 'alappuzha',
      'alleppey', 'pathanamthitta', 'idukki', 'wayanad', 'ernakulam', 'kottayam'
    ];
    
    return keralaKeywords.some(keyword => description.includes(keyword));
  };

  // Handle search for locations
  const handleOriginChange = (value: string) => {
    setOrigin(value);
    fetchPlaceSuggestions(value, setOriginSuggestions);
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    fetchPlaceSuggestions(value, setDestinationSuggestions);
  };

  // Fetch place suggestions using Google's Autocomplete service (filtered for Kerala)
  const fetchPlaceSuggestions = (
    input: string,
    setSuggestions: React.Dispatch<React.SetStateAction<Place[]>>
  ) => {
    if (input.length > 2 && autocompleteService) {
      autocompleteService.getPlacePredictions(
        { 
          input,
          componentRestrictions: { country: 'IN' }, // Restrict to India
          bounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(8.2, 74.8), // Southwest corner of Kerala
            new google.maps.LatLng(12.8, 77.4)  // Northeast corner of Kerala
          )
        },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            // Filter predictions to show only places in Kerala
            const keralaPlaces = predictions.filter(isPlaceInKerala);
            setSuggestions(keralaPlaces);
          } else {
            setSuggestions([]);
          }
        }
      );
    } else {
      setSuggestions([]);
    }
  };

  // Handle selection of a place from suggestions
  const handleSelectOrigin = (place: Place) => {
    setSelectedOrigin(place);
    setOrigin(place.description);
    setOriginSuggestions([]);
  };

  const handleSelectDestination = (place: Place) => {
    setSelectedDestination(place);
    setDestination(place.description);
    setDestinationSuggestions([]);
  };

  // Calculate and display directions
  const calculateDirections = () => {
    if (
      !directionsService ||
      !directionsRenderer ||
      !selectedOrigin ||
      !selectedDestination
    ) {
      return;
    }

    setIsLoading(true);

    directionsService.route(
      {
        origin: { placeId: selectedOrigin.place_id },
        destination: { placeId: selectedDestination.place_id },
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      },
      (response: any, status: any) => {
        setIsLoading(false);
        if (status === google.maps.DirectionsStatus.OK && response) {
          // Store all routes
          console.log(response.routes)
          setRoutes(response.routes);

          // Display the first route by default
          setSelectedRouteIndex(0);
          directionsRenderer.setDirections(response);
          directionsRenderer.setRouteIndex(0);
        } else {
          console.error("Directions request failed due to " + status);
        }
      }
    );
  };

  // Handle route selection and open modal
  const selectRoute = (index: number) => {
    if (directionsRenderer && routes.length > index) {
      setSelectedRouteIndex(index);
      directionsRenderer.setRouteIndex(index);
      setBookingModalOpen(true);
    }
  };

  const getRouteTypeIcon = (index: number) => {
    switch (index % 3) {
      case 0:
        return <Badge status="success" text="Fastest" className="mb-2" />;
      case 1:
        return <Badge status="processing" text="Eco-friendly" className="mb-2" />;
      case 2:
        return <Badge status="warning" text="Least traffic" className="mb-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="m-3 md:m-5 p-4 rounded-xl bg-white shadow-lg">
        <Space direction="vertical" size="large" className="w-full">
          <Space align="center">
            <Navigation2 className="h-7 w-7 text-blue-600" />
            <Typography.Title level={3} style={{ margin: 0 }}>
              Select Place
            </Typography.Title>
          </Space>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Origin Input */}
            <div className="relative">
              <Space direction="vertical" className="w-full">
                <div className="flex justify-between items-center">
                  <Space>
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <Typography.Text strong>Origin</Typography.Text>
                  </Space>
                  <Button
                    type="link"
                    size="small"
                    icon={<Crosshair className="h-4 w-4" />}
                    loading={isGettingLocation}
                    onClick={getCurrentLocation}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Use Current Location
                  </Button>
                </div>
                <Input
                  value={origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  placeholder="Enter origin location in Kerala"
                  size="large"
                  prefix={<MapPin className="h-4 w-4 text-gray-400" />}
                  className="rounded-lg"
                />
              </Space>
              {originSuggestions.length > 0 && (
                <div className="absolute z-10 bg-white shadow-lg rounded-lg mt-1 w-full max-h-64 overflow-y-auto border border-gray-100">
                  <List
                    size="small"
                    dataSource={originSuggestions}
                    renderItem={(place) => (
                      <List.Item
                        className="cursor-pointer px-4 hover:bg-blue-50"
                        onClick={() => handleSelectOrigin(place)}
                      >
                        <Space>
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{place.description}</span>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Destination Input */}
            <div className="relative">
              <Space direction="vertical" className="w-full">
                <Space>
                  <MapPin className="h-4 w-4 text-red-500" />
                  <Typography.Text strong>Destination</Typography.Text>
                </Space>
                <Input
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  placeholder="Enter destination location in Kerala"
                  size="large"
                  prefix={<MapPin className="h-4 w-4 text-gray-400" />}
                  className="rounded-lg"
                />
              </Space>
              {destinationSuggestions.length > 0 && (
                <div className="absolute z-10 bg-white shadow-lg rounded-lg mt-1 w-full max-h-64 overflow-y-auto border border-gray-100">
                  <List
                    size="small"
                    dataSource={destinationSuggestions}
                    renderItem={(place) => (
                      <List.Item
                        className="cursor-pointer px-4 hover:bg-blue-50"
                        onClick={() => handleSelectDestination(place)}
                      >
                        <Space>
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{place.description}</span>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          <Button
            type="primary"
            onClick={calculateDirections}
            disabled={!selectedOrigin || !selectedDestination}
            loading={isLoading}
            size="large"
            className="w-full md:w-auto rounded-lg"
            style={{ background: "#1890ff", borderColor: "#1890ff" }}
          >
            Find Routes
          </Button>
        </Space>
      </div>

      {/* Map and Routes Container */}
      <div className="flex flex-1 relative m-3 md:m-5 rounded-xl">
        <div ref={mapRef} className="flex-1 rounded-xl shadow-md" />

        {/* Routes sidebar - responsive */}
        {routes.length > 0 && (
          <div className={`transition-all duration-300 ${
            isRoutesCardCollapsed 
              ? "w-12 md:w-16" 
              : "w-full md:w-80"
            } absolute ${
              isRoutesCardCollapsed ? "right-4" : "right-0 left-0 md:left-auto md:right-4"
            } top-4 bottom-4 md:top-4 md:bottom-4 flex flex-col`}
          >
            {/* Toggle button for mobile view */}
            <Button 
              type="primary"
              shape="circle"
              icon={<ChevronRight className={`h-4 w-4 transition-transform ${isRoutesCardCollapsed ? "" : "rotate-180"}`} />}
              className="absolute -left-3 top-8 z-10 shadow-md md:hidden"
              onClick={() => setIsRoutesCardCollapsed(!isRoutesCardCollapsed)}
            />
            
            {/* Main card content */}
            <Card 
              className={`h-full flex-1 overflow-hidden transition-opacity ${isRoutesCardCollapsed ? "opacity-0 md:opacity-100" : "opacity-100"}`}
              bodyStyle={{ padding: isRoutesCardCollapsed ? 0 : 16, height: "100%", display: "flex", flexDirection: "column" }}
            >
              <div className="flex justify-between items-center mb-4">
                <Typography.Title level={5} className="mb-0 flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-blue-500" />
                  Available Routes
                </Typography.Title>
                {/* Toggle button for desktop view */}
                <Button 
                  type="text"
                  shape="circle"
                  icon={<ChevronRight className={`h-4 w-4 transition-transform ${isRoutesCardCollapsed ? "" : "rotate-180"}`} />}
                  className="hidden md:inline-flex"
                  onClick={() => setIsRoutesCardCollapsed(!isRoutesCardCollapsed)}
                />
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <List
                  dataSource={routes}
                  renderItem={(route, index) => {
                    const leg = route.legs[0];
                    return (
                      <List.Item
                        className={`cursor-pointer rounded-lg transition-colors p-4 mb-3 border ${
                          selectedRouteIndex === index
                            ? "bg-blue-50 border-blue-300"
                            : "hover:bg-gray-50 border-gray-100"
                        }`}
                        onClick={() => selectRoute(index)}
                      >
                        <div className="w-full">
                          {getRouteTypeIcon(index)}
                          <div className="flex items-start justify-between">
                            <Typography.Text strong className="text-lg">
                              {route.summary || "Route " + (index + 1)}
                            </Typography.Text>
                            <Avatar 
                              size="small" 
                              style={{ 
                                background: selectedRouteIndex === index ? "#1890ff" : "#f0f0f0",
                                color: selectedRouteIndex === index ? "white" : "#999" 
                              }}
                            >
                              {index + 1}
                            </Avatar>
                          </div>
                          <div className="flex justify-between mt-2">
                            <Space>
                              <Navigation className="h-4 w-4 text-blue-500" />
                              <Typography.Text>
                                {leg.distance.text}
                              </Typography.Text>
                            </Space>
                            <Space>
                              <Clock className="h-4 w-4 text-red-500" />
                              <Typography.Text>
                                {leg.duration.text}
                              </Typography.Text>
                            </Space>
                          </div>
                          <Button 
                            type="primary" 
                            size="small" 
                            className="mt-3 w-full rounded-lg"
                            ghost={selectedRouteIndex !== index}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectRoute(index);
                            }}
                          >
                            Select Route
                          </Button>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </div>
            </Card>

            {/* Minimized view */}
            {isRoutesCardCollapsed && (
              <div className="absolute right-0 top-0 h-full w-12 md:w-16 bg-white rounded-lg shadow-md flex flex-col items-center pt-4 gap-4">
                {routes.map((_, index) => (
                  <Avatar 
                    key={index}
                    size="large"
                    className="cursor-pointer"
                    style={{ 
                      background: selectedRouteIndex === index ? "#1890ff" : "#f0f0f0",
                      color: selectedRouteIndex === index ? "white" : "#999" 
                    }}
                    onClick={() => selectRoute(index)}
                  >
                    {index + 1}
                  </Avatar>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Route Details Modal */}
      <RouteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        route={routes[selectedRouteIndex] || null}
      />

      {/* Booking Confirmation Modal */}
      {routes.length > 0 && routes[selectedRouteIndex] && (
        <BookingConfirmationModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          route={routes[selectedRouteIndex]}
          origin={origin}
          destination={destination}
        />
      )}
    </div>
  );
};

export default Maps;