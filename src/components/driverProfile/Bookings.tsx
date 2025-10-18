import { useState, useRef, useEffect } from "react";
import { Table, Button, Modal, Card, Typography, Tag, Descriptions, Space } from "antd";
import { useQuery } from "@tanstack/react-query";
import { CarOutlined, EnvironmentOutlined, ClockCircleOutlined, DollarOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

// Add this type definition for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

// Define interfaces for our data structures
interface Location {
  lat: number;
  lng: number;
}

interface AddressLocation {
  address: string;
  location: Location;
}

interface Distance {
  text: string;
  value: number;
}

interface Waypoint {
  type?: string;
  instruction?: string;
  distance?: Distance;
  duration?: Distance;
  location?:any;
}

interface Route {
  summary: string;
  polyline: string;
  waypoints: Waypoint[];
}

interface Price {
  minimumFare?: number;
  bookingFee: number;
  total: number;
}

interface VehicleDetails {
  _id: string;
  make: string;
  vehicleModel: string;
  year: number;
  seatsNo: number;
  licensePlate: string;
  vehicleClass: string;
  vehicleType: string;
  vehicleImages: string[];
  // Other properties omitted for brevity
}

interface DriverDetails {
  _id: string;
  name: string;
  imageUrl: string;
  email: string;
  phone: number;
  // Other properties omitted for brevity
}

interface Vehicle {
  id: string;
  details: VehicleDetails;
}

interface Driver {
  id: string;
  details: DriverDetails;
}

interface Booking {
  _id: string;
  bookingId: string;
  origin: AddressLocation;
  destination: AddressLocation;
  distance: Distance;
  duration: Distance;
  route: Route;
  price: Price;
  vehicle: Vehicle;
  driver: Driver;
  timestamp: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingResponse {
  booking: Booking[];
}

interface BookingsProps {
  bookings?: Booking[];
  loading: boolean;
}

const Bookings: React.FC<BookingsProps> = ({ loading }) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);

  const {
    data: bookingDetails,
    isLoading: isBookingsLoading,
  } = useQuery<BookingResponse>({
    queryKey: ["bookingDetails"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/bookingDetails`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch booking details");
      }
      return response.json();
    },
  });

  // Initialize Google Maps services when modal opens with a selected booking
  useEffect(() => {
    if (modalVisible && selectedBooking && mapRef.current) {
      const loadGoogleMapsServices = () => {
        if (window.google && window.google.maps) {
          // Calculate midpoint for better map centering
          const midLat = (selectedBooking.origin.location.lat + selectedBooking.destination.location.lat) / 2;
          const midLng = (selectedBooking.origin.location.lng + selectedBooking.destination.location.lng) / 2;
          
          // Initialize the map centered at the midpoint
          const mapInstance = new google.maps.Map(mapRef.current!, {
            center: { lat: midLat, lng: midLng },
            zoom: 11, // Slightly zoomed out to fit both markers
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

          // Add custom markers for origin and destination
          // Origin marker (green)
          const originMarker = new google.maps.Marker({
            position: { 
              lat: selectedBooking.origin.location.lat, 
              lng: selectedBooking.origin.location.lng 
            },
            map: mapInstance,
            title: "Origin: " + selectedBooking.origin.address,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#4CAF50",
              fillOpacity: 1,
              strokeWeight: 0,
              scale: 10
            },
            zIndex: 2
          });
          
          // Add info window for origin
          const originInfoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 8px;"><strong>Origin:</strong> ${selectedBooking.origin.address}</div>`
          });
          
          originMarker.addListener("click", () => {
            originInfoWindow.open(mapInstance, originMarker);
          });
          
          // Destination marker (red)
          const destinationMarker = new google.maps.Marker({
            position: { 
              lat: selectedBooking.destination.location.lat, 
              lng: selectedBooking.destination.location.lng 
            },
            map: mapInstance,
            title: "Destination: " + selectedBooking.destination.address,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#F44336",
              fillOpacity: 1,
              strokeWeight: 0,
              scale: 10
            },
            zIndex: 2
          });
          
          // Add info window for destination
          const destinationInfoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 8px;"><strong>Destination:</strong> ${selectedBooking.destination.address}</div>`
          });
          
          destinationMarker.addListener("click", () => {
            destinationInfoWindow.open(mapInstance, destinationMarker);
          });

          // Initialize DirectionsService
          setDirectionsService(new google.maps.DirectionsService());

          // Initialize DirectionsRenderer with custom styles
          const renderer = new google.maps.DirectionsRenderer({
            map: mapInstance,
            polylineOptions: {
              strokeColor: '#4285F4',
              strokeWeight: 5,
              strokeOpacity: 0.8
            },
            suppressMarkers: true // Hide default markers since we have custom ones
          });
          renderer.setMap(mapInstance);
          setDirectionsRenderer(renderer);

          // Display the route
          displayRoute();
        }
      };

      // Check if Google Maps API is already loaded
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
    }
  }, [modalVisible, selectedBooking]);

  // Function to display route on the map
  const displayRoute = () => {
    if (!directionsService || !directionsRenderer || !selectedBooking || !map) {
      return;
    }

    // Fit bounds to include both origin and destination
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(
      selectedBooking.origin.location.lat,
      selectedBooking.origin.location.lng
    ));
    bounds.extend(new google.maps.LatLng(
      selectedBooking.destination.location.lat,
      selectedBooking.destination.location.lng
    ));
    map.fitBounds(bounds);
    
    // Add some padding to the bounds
    const padding = { top: 50, right: 50, bottom: 50, left: 50 };
    map.fitBounds(bounds, padding);

    // Request directions
    directionsService.route(
      {
        origin: { 
          lat: selectedBooking.origin.location.lat, 
          lng: selectedBooking.origin.location.lng 
        },
        destination: { 
          lat: selectedBooking.destination.location.lat, 
          lng: selectedBooking.destination.location.lng 
        },
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      },
      (response, status) => {
        if (status === google.maps.DirectionsStatus.OK && response) {
          directionsRenderer.setDirections(response);
          
          // Add waypoints as markers if they exist in the booking data
          if (selectedBooking.route?.waypoints && selectedBooking.route.waypoints.length > 0) {
            selectedBooking.route.waypoints.forEach((waypoint, index) => {
              // Only add markers for waypoints that have location data
              if (waypoint.type === 'waypoint' && waypoint.location) {
                new google.maps.Marker({
                  position: { 
                    lat: waypoint.location.lat, 
                    lng: waypoint.location.lng 
                  },
                  map: map,
                  title: waypoint.instruction || `Waypoint ${index + 1}`,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "#FF9800",
                    fillOpacity: 1,
                    strokeWeight: 0,
                    scale: 7
                  }
                });
              }
            });
          }
        } else {
          console.error("Directions request failed due to " + status);
          
          // If directions service fails, fall back to simple polyline
          new google.maps.Polyline({
            path: [
              { 
                lat: selectedBooking.origin.location.lat, 
                lng: selectedBooking.origin.location.lng 
              },
              { 
                lat: selectedBooking.destination.location.lat, 
                lng: selectedBooking.destination.location.lng 
              }
            ],
            geodesic: true,
            strokeColor: '#4285F4',
            strokeOpacity: 1.0,
            strokeWeight: 3,
            map: map
          });
        }
      }
    );
  };

  const handleStartTrip = (record: Booking) => {
    setSelectedBooking(record);
    setModalVisible(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusTag = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "orange",
      completed: "green",
      cancelled: "red",
      inProgress: "blue",
    };
    return <Tag color={statusColors[status] || "default"}>{status.toUpperCase()}</Tag>;
  };

  // Define columns for the table
  const columns = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Origin",
      key: "origin",
      render: (record: Booking) => record.origin?.address || "N/A",
      ellipsis: true,
    },
    {
      title: "Destination",
      key: "destination",
      render: (record: Booking) => record.destination?.address || "N/A",
      ellipsis: true,
    },
    {
      title: "Distance",
      key: "distance",
      render: (record: Booking) => record.distance?.text || "N/A",
    },
    {
      title: "Duration",
      key: "duration",
      render: (record: Booking) => record.duration?.text || "N/A",
    },
    {
      title: "Date",
      key: "date",
      render: (record: Booking) => formatDate(record.timestamp),
    },
    {
      title: "Status",
      key: "status",
      render: (record: Booking) => getStatusTag(record.status),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Booking) => (
        <Button 
          type="primary" 
          onClick={() => handleStartTrip(record)} 
          disabled={record.status !== "pending"}
        >
          {record.status === "pending" ? "Start Trip" : "View Details"}
        </Button>
      ),
    },
  ];

  // Extract the booking array from the response
  const dataSource = bookingDetails?.booking && Array.isArray(bookingDetails.booking)
    ? bookingDetails.booking
    : [];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: true }}
        className="custom-table"
        pagination={{
          responsive: true,
          defaultPageSize: 5,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        loading={loading || isBookingsLoading}
        rowKey="_id"
      />

      {selectedBooking && (
        <Modal
          title={`Trip Details - ${selectedBooking.bookingId}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setModalVisible(false)}>
              Close
            </Button>,
            <Button 
              key="start" 
              type="primary" 
              disabled={selectedBooking.status !== "pending"}
              onClick={() => {
                // Here you would add logic to start the trip
                console.log("Starting trip:", selectedBooking.bookingId);
                setModalVisible(false);
              }}
            >
              Start Trip
            </Button>
          ]}
          width={1000}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card>
              <Descriptions title="Trip Information" bordered>
                <Descriptions.Item label="Origin" span={3}>
                  <Space>
                    <EnvironmentOutlined />
                    {selectedBooking.origin?.address}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Destination" span={3}>
                  <Space>
                    <EnvironmentOutlined />
                    {selectedBooking.destination?.address}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Distance">
                  <Space>
                    <EnvironmentOutlined />
                    {selectedBooking.distance?.text}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  <Space>
                    <ClockCircleOutlined />
                    {selectedBooking.duration?.text}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {getStatusTag(selectedBooking.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Price" span={3}>
                  <Space>
                    <DollarOutlined />
                    ₹{selectedBooking.price?.total} (Min Fare: ₹{selectedBooking.price?.minimumFare ?? selectedBooking.price?.total}, Booking Fee: ₹{selectedBooking.price?.bookingFee})
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 300px" }}>
                  <Title level={5}>Driver Information</Title>
                  {selectedBooking.driver?.details ? (
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Name">
                        <Space>
                          <UserOutlined />
                          {selectedBooking.driver.details.name}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Phone">
                        {selectedBooking.driver.details.phone}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {selectedBooking.driver.details.email}
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <Text>No driver information available</Text>
                  )}
                </div>

                <div style={{ flex: "1 1 300px" }}>
                  <Title level={5}>Vehicle Information</Title>
                  {selectedBooking.vehicle?.details ? (
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Model">
                        <Space>
                          <CarOutlined />
                          {selectedBooking.vehicle.details.make} {selectedBooking.vehicle.details.vehicleModel}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Year">
                        {selectedBooking.vehicle.details.year}
                      </Descriptions.Item>
                      <Descriptions.Item label="License">
                        {selectedBooking.vehicle.details.licensePlate}
                      </Descriptions.Item>
                      <Descriptions.Item label="Type">
                        {selectedBooking.vehicle.details.vehicleClass} - {selectedBooking.vehicle.details.vehicleType}
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <Text>No vehicle information available</Text>
                  )}
                </div>
              </div>
            </Card>

            <Card 
              title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Route Map</span>
                  <Space>
                    <Tag color="green">Origin</Tag>
                    <Tag color="red">Destination</Tag>
                    {selectedBooking.route?.waypoints && selectedBooking.route.waypoints.some(wp => wp.type === 'waypoint') && (
                      <Tag color="orange">Waypoint</Tag>
                    )}
                  </Space>
                </div>
              }
            >
              <div ref={mapRef} style={{ height: "400px", width: "100%", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}></div>

              {selectedBooking.route?.waypoints && selectedBooking.route.waypoints.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <Title level={5}>Route Instructions</Title>
                  <div style={{ maxHeight: "200px", overflowY: "auto", padding: "8px", border: "1px solid #f0f0f0", borderRadius: "4px" }}>
                    <ol style={{ paddingLeft: "20px" }}>
                      {selectedBooking.route.waypoints.map((waypoint, index) => (
                        waypoint.instruction && (
                          <li key={index} style={{ marginBottom: "8px" }}>
                            <div dangerouslySetInnerHTML={{ __html: waypoint.instruction }} />
                            {waypoint.distance && (
                              <small style={{ color: "#888", marginLeft: "8px" }}>
                                {waypoint.distance.text}
                                {waypoint.duration && ` (${waypoint.duration.text})`}
                              </small>
                            )}
                          </li>
                        )
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Bookings;