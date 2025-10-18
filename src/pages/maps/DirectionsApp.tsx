// import React, { useEffect, useRef, useState } from "react";
// import { Input, Button, Card, Typography, List, Space } from "antd";
// import { RouteModal } from "./RouteModal";
// import { Place, Route } from "../../types/directions";
// import { MapPin, Navigation2, Navigation, Clock } from "lucide-react";

// // Add this type definition for Google Maps
// declare global {
//   interface Window {
//     google: typeof google;
//   }
// }

// const DirectionsApp: React.FC = () => {

//   const [origin, setOrigin] = useState<string>("");
//   const [destination, setDestination] = useState<string>("");
//   const [originSuggestions, setOriginSuggestions] = useState<Place[]>([]);
//   const [destinationSuggestions, setDestinationSuggestions] = useState<Place[]>(
//     []
//   );
//   const [selectedOrigin, setSelectedOrigin] = useState<Place | null>(null);
//   const [selectedDestination, setSelectedDestination] = useState<Place | null>(
//     null
//   );
//   const [routes, setRoutes] = useState<Route[]>([]);
//   const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
//   const [map, setMap] = useState<google.maps.Map | null>(null);
//   const [directionsRenderer, setDirectionsRenderer] =
//     useState<google.maps.DirectionsRenderer | null>(null);
//   const [autocompleteService, setAutocompleteService] =
//     useState<google.maps.places.AutocompleteService | null>(null);
//   const [directionsService, setDirectionsService] =
//     useState<google.maps.DirectionsService | null>(null);
//   const [modalOpen, setModalOpen] = useState<boolean>(false);

//   const mapRef = useRef<HTMLDivElement>(null);

//   // Initialize Google Maps services
//   useEffect(() => {
//     const loadGoogleMapsServices = () => {
//       if (window.google && window.google.maps) {
//         // Initialize the map
//         const mapInstance = new google.maps.Map(mapRef.current!, {
//           center: { lat:9.12, lng:  76.34 }, 
//           zoom: 12,
//         });
//         setMap(mapInstance);

//         // Initialize Google Maps services
//         setAutocompleteService(new google.maps.places.AutocompleteService());
//         setDirectionsService(new google.maps.DirectionsService());

//         // Initialize DirectionsRenderer
//         const renderer = new google.maps.DirectionsRenderer({
//           map: mapInstance,
//         });
//         renderer.setMap(mapInstance);
//         setDirectionsRenderer(renderer);
//       }
//     };

//     // Load script only if it's not already loaded
//     if (!window.google) {
//       const script = document.createElement("script");
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${
//         import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY
//       }&libraries=places`;
//       script.async = true;
//       script.defer = true;
//       script.onload = loadGoogleMapsServices;
//       document.head.appendChild(script);
//     } else {
//       loadGoogleMapsServices();
//     }
//   }, []);

//   // Handle search for locations
//   const handleOriginChange = (value: string) => {
//     setOrigin(value);
//     fetchPlaceSuggestions(value, setOriginSuggestions);
//   };

//   const handleDestinationChange = (value: string) => {
//     setDestination(value);
//     fetchPlaceSuggestions(value, setDestinationSuggestions);
//   };

//   // Fetch place suggestions using Google's Autocomplete service
//   const fetchPlaceSuggestions = (
//     input: string,
//     setSuggestions: React.Dispatch<React.SetStateAction<Place[]>>
//   ) => {
//     if (input.length > 2 && autocompleteService) {
//       autocompleteService.getPlacePredictions(
//         { input },
//         (predictions, status) => {
//           if (
//             status === google.maps.places.PlacesServiceStatus.OK &&
//             predictions
//           ) {
//             setSuggestions(predictions);
//           } else {
//             setSuggestions([]);
//           }
//         }
//       );
//     } else {
//       setSuggestions([]);
//     }
//   };

//   // Handle selection of a place from suggestions
//   const handleSelectOrigin = (place: Place) => {
//     setSelectedOrigin(place);
//     setOrigin(place.description);
//     setOriginSuggestions([]);
//   };

//   const handleSelectDestination = (place: Place) => {
//     setSelectedDestination(place);
//     setDestination(place.description);
//     setDestinationSuggestions([]);
//   };

//   // Calculate and display directions
//   const calculateDirections = () => {
//     if (
//       !directionsService ||
//       !directionsRenderer ||
//       !selectedOrigin ||
//       !selectedDestination
//     ) {
//       return;
//     }

//     directionsService.route(
//       {
//         origin: { placeId: selectedOrigin.place_id },
//         destination: { placeId: selectedDestination.place_id },
//         travelMode: google.maps.TravelMode.DRIVING,
//         provideRouteAlternatives: true,
//       },
//       (response, status) => {
//         if (status === google.maps.DirectionsStatus.OK && response) {
//           // Store all routes
//           setRoutes(response.routes);

//           // Display the first route by default
//           setSelectedRouteIndex(0);
//           directionsRenderer.setDirections(response);
//           directionsRenderer.setRouteIndex(0);
//         } else {
//           console.error("Directions request failed due to " + status);
//         }
//       }
//     );
//   };

//   // Handle route selection and open modal
//   const selectRoute = (index: number) => {
//     if (directionsRenderer && routes.length > index) {
//       setSelectedRouteIndex(index);
//       directionsRenderer.setRouteIndex(index);
//       setModalOpen(true);
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen">
//       <div className="m-5 p-4 rounded-lg bg-white shadow-md">
//         <Space direction="vertical" size="large" className="w-full">
//           <Space align="center">
//             <Navigation2 className="h-6 w-6 text-blue-500" />
//             <Typography.Title level={3} style={{ margin: 0 }}>
//               Go Keral
//             </Typography.Title>
//           </Space>

//           <div className="grid gap-4 md:grid-cols-2">
//             {/* Origin Input */}
//             <div className="relative">
//               <Space direction="vertical" className="w-full">
//                 <Space>
//                   <MapPin className="h-4 w-4 text-blue-500" />
//                   <Typography.Text strong>Origin</Typography.Text>
//                 </Space>
//                 <Input
//                   value={origin}
//                   onChange={(e) => handleOriginChange(e.target.value)}
//                   placeholder="Enter origin location"
//                 />
//               </Space>
//               {originSuggestions.length > 0 && (
//                 <div className="absolute z-10 bg-white shadow-lg rounded mt-1 w-full max-h-64 overflow-y-auto">
//                   <List
//                     size="small"
//                     dataSource={originSuggestions}
//                     renderItem={(place) => (
//                       <List.Item
//                         className="cursor-pointer hover:bg-gray-50"
//                         onClick={() => handleSelectOrigin(place)}
//                       >
//                         {place.description}
//                       </List.Item>
//                     )}
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Destination Input */}
//             <div className="relative">
//               <Space direction="vertical" className="w-full">
//                 <Space>
//                   <MapPin className="h-4 w-4 text-blue-500" />
//                   <Typography.Text strong>Destination</Typography.Text>
//                 </Space>
//                 <Input
//                   value={destination}
//                   onChange={(e) => handleDestinationChange(e.target.value)}
//                   placeholder="Enter destination location"
//                 />
//               </Space>
//               {destinationSuggestions.length > 0 && (
//                 <div className="absolute z-10 bg-white shadow-lg rounded mt-1 w-full max-h-64 overflow-y-auto">
//                   <List
//                     size="small"
//                     dataSource={destinationSuggestions}
//                     renderItem={(place) => (
//                       <List.Item
//                         className="cursor-pointer hover:bg-gray-50"
//                         onClick={() => handleSelectDestination(place)}
//                       >
//                         {place.description}
//                       </List.Item>
//                     )}
//                   />
//                 </div>
//               )}
//             </div>
//           </div>

//           <Button
//             type="primary"
//             onClick={calculateDirections}
//             disabled={!selectedOrigin || !selectedDestination}
//             className="w-full sm:w-auto"
//           >
//             Get Directions
//           </Button>
//         </Space>
//       </div>

//       {/* Map and Routes Container */}
//       <div className="flex flex-1 relative m-5 rounded-lg">
//         <div ref={mapRef} className="flex-1 rounded-lg" />

//         {/* Routes sidebar */}
//         {routes.length > 0 && (
//           <Card className="w-80 absolute right-4 top-4 bottom-4">
//             <Typography.Title
//               level={5}
//               className="mb-4 flex items-center gap-2"
//             >
//               <Navigation className="h-4 w-4" />
//               Available Routes
//             </Typography.Title>
//             <List
//               dataSource={routes}
//               renderItem={(route, index) => {
//                 const leg = route.legs[0];
//                 return (
//                   <List.Item
//                     className={`cursor-pointer rounded-lg transition-colors p-3 ${
//                       selectedRouteIndex === index
//                         ? "bg-blue-50 border-blue-200"
//                         : "hover:bg-gray-50"
//                     }`}
//                     onClick={() => selectRoute(index)}
//                   >
//                     <Space direction="vertical">
//                       <Typography.Text strong>{route.summary}</Typography.Text>
//                       <Space size="large">
//                         <Space>
//                           <Navigation className="h-3 w-3" />
//                           <Typography.Text type="secondary">
//                             {leg.distance.text}
//                           </Typography.Text>
//                         </Space>
//                         <Space>
//                           <Clock className="h-3 w-3" />
//                           <Typography.Text type="secondary">
//                             {leg.duration.text}
//                           </Typography.Text>
//                         </Space>
//                       </Space>
//                     </Space>
//                   </List.Item>
//                 );
//               }}
//             />
//           </Card>
//         )}
//       </div>

//       <RouteModal
//         isOpen={modalOpen}
//         onClose={() => setModalOpen(false)}
//         route={routes[selectedRouteIndex] || null}
//       />
//     </div>
//   );
// };

// export default DirectionsApp;
