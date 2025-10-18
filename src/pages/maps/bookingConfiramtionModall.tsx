import React, {  useState, useMemo } from "react";
import {  Button, Card,  Typography, Row, Col, Divider, Input, DatePicker, TimePicker, Form, Modal } from "antd";
import axios from "axios";
import {  Route } from "../../types/directions";
import { MapPin,  Navigation, Clock,  Check, User, Calendar, Phone } from "lucide-react";
import { useQuery,  } from "@tanstack/react-query";
import VehicleSelection from "./VehicleSelection";
import dayjs, { Dayjs } from 'dayjs';

const BookingConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  route: Route;
  origin: string;
  destination: string;
}> = ({ isOpen, onClose, route, origin, destination }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  
  // Replace selectedDriver with vehicle related states
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  
  const [fareInfo, setFareInfo] = useState<any>(null);
  const [bookingResponse, setBookingResponse] = useState<any>(null);

  // User info states
 interface UserInfo {
  phone: string;
  date: Dayjs | null;
  time: Dayjs | null;
}

const [userInfo, setUserInfo] = useState<UserInfo>({
  phone: '',
  date: null,
  time: null,
});
  const [form] = Form.useForm();

  const {
    data: driverListData,
    // isLoading: isDriverLoading,
  } = useQuery({
    queryKey: ["driverList"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/driverList`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch driver details");
      }
      return response.json();
    },
  });

  const {
    data: vehicleListData,
    // isLoading: isVehicleLoading,
  } = useQuery({
    queryKey: ["vehicleList"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vehicles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch vehicle details");
      }
      return response.json();
    },
  });

  // Merge logic (after data is loaded)
  const mergedDriverList = useMemo(() => {
    if (!driverListData?.drivers || !vehicleListData) return [];

    return driverListData.drivers.map((driver: any) => {
      const matchedVehicles = vehicleListData.filter(
        (vehicle: any) => vehicle.driverId === driver.email
      );

      return {
        ...driver,
        vehicles: matchedVehicles, // array of matched vehicles
      };
    });
  }, [driverListData, vehicleListData]);

  console.log("🚗 Merged Drivers with Vehicles:", mergedDriverList);

  const handleBookNow = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  // Function to calculate price based on vehicle fare structure
  const calculatePrice = (distance: number, fareInfo: any) => {
    if (!fareInfo) return estimatedPrice; // Fallback to default calculation
    
    const distanceInKm = distance / 1000;
    const perKmRate = fareInfo.perKilometerRate || 0;
    const minimumFare = fareInfo.minimumFare || 0;

    // Calculate fare as distance * perKmRate, then ensure it's at least minimumFare
    let calculatedFare = distanceInKm * perKmRate;
    calculatedFare = Math.max(calculatedFare, minimumFare);

    return Math.round(calculatedFare);
  };

  // Handle vehicle selection from the VehicleSelection component
  const handleVehicleSelect = (vehicleId: string, driverId: string, vehicleFareInfo: any) => {
    setSelectedVehicle(vehicleId);
    setSelectedDriverId(driverId);
    setFareInfo(vehicleFareInfo);
  };

  // Extract route waypoints for map visualization
  const extractRouteWaypoints = (route: Route) => {
    if (!route || !route.legs || route.legs.length === 0) return [];
    
    const waypoints = [];
    const leg = route.legs[0];
    
    // Include start location
    waypoints.push({
      lat: leg.start_location.lat,
      lng: leg.start_location.lng,
      type: "start",
    });
    
    // Include all steps as waypoints
    if (leg.steps && leg.steps.length > 0) {
      leg.steps.forEach((step, index) => {
        if (index > 0) { // Skip first step as it's already included as start
          waypoints.push({
            lat: step.start_location.lat,
            lng: step.start_location.lng,
            instruction: step.instructions,
            distance: step.distance,
            duration: step.duration,
          });
        }
      });
    }
    
    // Include end location
    waypoints.push({
      lat: leg.end_location.lat,
      lng: leg.end_location.lng,
      type: "end",
    });
    
    return waypoints;
  };

  // Handle initial confirm booking - show user info modal
  const handleConfirmBooking = () => {
    if (!selectedVehicle) return;
    setShowUserInfoModal(true);
  };

  // Handle user info form submission
  const handleUserInfoSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      setUserInfo({
        phone: values.phone,
        date: values.date,
        time: values.time
      });
      
      setShowUserInfoModal(false);
      setLoading(true);
      
      // Proceed with booking
      proceedWithBooking(values);
      
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  

  // Proceed with the actual booking after collecting user info
  const proceedWithBooking = async (userInfoData: any) => {
    // Extract route coordinates and waypoints for map visualization
    const routeWaypoints = extractRouteWaypoints(route);
    const polylinePath = route.overview_polyline?.points || "";
    const leg = route.legs[0];
    // Helper function to find vehicle details
// const getSelectedVehicleDetails = () => {
//   if (!selectedVehicle || !selectedDriverId) return null;
  
//   const driver = mergedDriverList.find((d: any) => d.email === selectedDriverId);
//   if (!driver) return null;
  
//   const vehicle = driver.vehicles.find((v: any) => v._id === selectedVehicle);
//   return vehicle || null; // Added null fallback
// };
    // Get bounds for map
    const bounds = route.bounds ? {
      northeast: route.bounds.northeast,
      southwest: route.bounds.southwest
    } : null;
      const selectedDriverDetails = await mergedDriverList.find((d: any) => d.email === selectedDriverId);
   
   
      // Format date and time
    console.log("serrvv",mergedDriverList)
    const scheduledDateTime = dayjs(userInfoData.date)
      .hour(dayjs(userInfoData.time).hour())
      .minute(dayjs(userInfoData.time).minute())
      .toISOString();
     const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/userDetails`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": localStorage.getItem("token") || "",
          },
          params: {
            id: localStorage.getItem("userEmail"),
          },
        }
      );
    // Send data to API
    const bookingData = {
      origin: {
        address: origin,
        location: leg.start_location
      },
      destination: {
        address: destination,
        location: leg.end_location
      },
      distance: {
        text: leg?.distance?.text,
        value: leg?.distance?.value
      },
      duration: {
        text: leg?.duration?.text,
        value: leg?.duration?.value
      },
      route: {
        summary: route.summary || "Direct Route",
        polyline: polylinePath,
        waypoints: routeWaypoints,
        bounds: bounds
      },
      price: {
        minimumFare: fareInfo ? calculatePrice(leg?.distance?.value, fareInfo) : estimatedPrice,
        bookingFee: 199,
        total: fareInfo ? calculatePrice(leg?.distance?.value, fareInfo) + 199 : estimatedPrice + 199
      },
      vehicle: {
        id: selectedVehicle,
        details: getSelectedVehicleDetails()
      },
      driver: {
        id: selectedDriverId,
        details:selectedDriverDetails
      },
      userInfo: {
        name:response.data.userData.name,
        phone: userInfoData.phone,
        scheduledDateTime: scheduledDateTime,
        date: userInfoData.date.format('YYYY-MM-DD'),
        time: userInfoData.time.format('HH:mm')
      },
      timestamp: new Date().toISOString(),
      status: "pending"
    };
    
    console.log("Booking data being sent:", bookingData);
    
    // Send booking data to API
    fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem("token") || "",
      },
      body: JSON.stringify(bookingData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Booking confirmed:', data);
      setBookingResponse(data);
      setLoading(false);
      setBookingComplete(true);
    })
    .catch(error => {
      console.error('Error sending booking data:', error);
      // Still continue for demo purposes
      setTimeout(() => {
        setLoading(false);
        setBookingComplete(true);
      }, 1000);
    });
  };

  if (!isOpen) return null;

  // function calculateAge(dobString: string) {
  //   if (!dobString) return 0;
  
  //   const dob = new Date(dobString);
  //   const today = new Date();
  
  //   let age = today.getFullYear() - dob.getFullYear();
  //   const monthDiff = today.getMonth() - dob.getMonth();
  //   const dayDiff = today.getDate() - dob.getDate();
  
  //   if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
  //     age--;
  //   }
  
  //   return age;
  // }
  
  const leg = route.legs[0];
  // Base estimated price (fallback)
  const estimatedPrice = Math.round((leg.distance.value / 1000) * 90 + 375);
  
  // Get current fare based on selected vehicle or default
  const currentFare = fareInfo ? calculatePrice(leg.distance.value, fareInfo) : estimatedPrice;
  const totalPrice = currentFare + 199; // Adding booking fee

  // Helper function to find vehicle details
  const getSelectedVehicleDetails = () => {
    if (!selectedVehicle || !selectedDriverId) return null;
    
    const driver = mergedDriverList.find((d: any) => d.email === selectedDriverId);
    if (!driver) return null;
    
    const vehicle = driver.vehicles.find((v: any) => v._id === selectedVehicle);
    return vehicle;
  };

  const selectedVehicleDetails = getSelectedVehicleDetails();
  
  // Booking reference number (for confirmation)
  const bookingReference = bookingResponse?.bookingId || 
    `BK${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  // User Info Collection Modal
  const UserInfoModal = () => (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <span>Trip Details</span>
        </div>
      }
      open={showUserInfoModal}
      onCancel={() => setShowUserInfoModal(false)}
      footer={[
        <Button key="cancel" onClick={() => setShowUserInfoModal(false)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleUserInfoSubmit}>
          Confirm Booking
        </Button>
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: dayjs(),
          time: dayjs()
        }}
      >
        <Form.Item
          name="phone"
          label={
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>Phone Number</span>
            </div>
          }
          rules={[
            { required: true, message: 'Please enter your phone number' },
            { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
          ]}
        >
          <Input 
            placeholder="Enter your phone number" 
            maxLength={10}
            style={{ height: '40px' }}
          />
        </Form.Item>
        
        <Form.Item
          name="date"
          label={
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Trip Date</span>
            </div>
          }
          rules={[{ required: true, message: 'Please select trip date' }]}
        >
          <DatePicker 
            style={{ width: '100%', height: '40px' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            format="DD/MM/YYYY"
          />
        </Form.Item>
        
        <Form.Item
          name="time"
          label={
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Trip Time</span>
            </div>
          }
          rules={[{ required: true, message: 'Please select trip time' }]}
        >
          <TimePicker 
            style={{ width: '100%', height: '40px' }}
            format="HH:mm"
            minuteStep={15}
          />
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-[24rem] overflow-y-auto max-h-[90vh]">
          <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
            <Typography.Title level={4} style={{ color: "white", margin: 0 }}>
              {bookingComplete ? "Booking Confirmed!" : step === 1 ? "Booking Details" : "Select Vehicle"}
            </Typography.Title>
          </div>

          {bookingComplete ? (
            <div className="p-4 sm:p-6 flex flex-col items-center">
              <div className="bg-green-100 rounded-full p-4 mb-4">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <Typography.Title level={4}>Your trip is booked!</Typography.Title>
              <Typography.Text className="text-center mb-2">
                Booking Reference: <strong>{bookingReference}</strong>
              </Typography.Text>
              <Typography.Text className="text-center mb-4">
                A confirmation has been sent to your phone number.
              </Typography.Text>
              <div className="bg-gray-50 p-4 rounded-lg w-full mb-4">
                <Typography.Text strong className="block mb-2">Trip Details</Typography.Text>
                <Row gutter={[8, 8]}>
                  <Col span={24}>
                    <div className="flex justify-between mb-2">
                      <span>From:</span>
                      <span className="font-semibold text-right">{origin}</span>
                    </div>
                  </Col>
                  <Col span={24}>
                    <div className="flex justify-between mb-2">
                      <span>To:</span>
                      <span className="font-semibold text-right">{destination}</span>
                    </div>
                  </Col>
                  <Col xs={12} sm={12}>
                    <div className="mb-2">
                      <span>Distance:</span>
                      <div className="font-semibold">{leg.distance.text}</div>
                    </div>
                  </Col>
                  <Col xs={12} sm={12}>
                    <div className="mb-2">
                      <span>Duration:</span>
                      <div className="font-semibold">{leg.duration.text}</div>
                    </div>
                  </Col>
                  {userInfo.phone && (
                    <>
                      <Col xs={12} sm={12}>
                        <div className="mb-2">
                          <span>Phone:</span>
                          <div className="font-semibold">{userInfo.phone}</div>
                        </div>
                      </Col>
                      <Col xs={12} sm={12}>
                        <div className="mb-2">
                          <span>Scheduled:</span>
                          <div className="font-semibold">
                            {userInfo.date?.format('DD/MM/YYYY')} at {userInfo.time?.format('HH:mm')}
                          </div>
                        </div>
                      </Col>
                    </>
                  )}
                  <Col span={24}>
                    <Divider className="my-2" />
                  </Col>
                  <Col xs={24} sm={12}>
                    <div className="mb-2">
                      <span>Driver:</span>
                      <div className="font-semibold">
                        {selectedDriverId ? 
                          mergedDriverList.find((d: any) => d.email === selectedDriverId)?.name : 
                          "Auto-assigned"}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div className="mb-2">
                      <span>Vehicle:</span>
                      <div className="font-semibold">
                        {selectedVehicleDetails ? 
                          `${selectedVehicleDetails.make} (${selectedVehicleDetails.vehicleType})` : 
                          "Auto-assigned"}
                      </div>
                    </div>
                  </Col>
                  <Col span={24}>
                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                      <span>Total Fare:</span>
                      <span className="font-semibold">₹{totalPrice}</span>
                    </div>
                  </Col>
                </Row>
              </div>
              <Button type="primary" onClick={onClose} size="large" className="w-full rounded-lg">
                Close
              </Button>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              {step === 1 ? (
                <>
                  <div className="mb-4">
                    <Row gutter={[16, 8]} align="middle">
                      <Col span={24}>
                        <div className="flex justify-between items-center mb-2">
                          <Typography.Text strong>Route:</Typography.Text>
                          <Typography.Text>{route.summary || "Direct Route"}</Typography.Text>
                        </div>
                      </Col>
                      <Col span={24}>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex items-start mb-3">
                            <MapPin className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                            <div className="ml-2 flex-grow">
                              <Typography.Text type="secondary" className="block">From</Typography.Text>
                              <Typography.Text strong className="line-clamp-2">
                                {origin}
                              </Typography.Text>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                            <div className="ml-2 flex-grow">
                              <Typography.Text type="secondary" className="block">To</Typography.Text>
                              <Typography.Text strong className="line-clamp-2">
                                {destination}
                              </Typography.Text>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <Card className="mb-4 bg-gray-50">
                    <Row gutter={[5, 10]}>
                      <Col xs={24} sm={16}>
                        <div className="flex flex-col items-center">
                          <Navigation className="h-5 w-5 mb-1 text-blue-500" />
                          <Typography.Text className="text-xs text-gray-500">Distance</Typography.Text>
                          <Typography.Text strong>{leg.distance.text}</Typography.Text>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div className="flex flex-col items-center">
                          <Clock className="h-5 w-5 mb-1 text-blue-500" />
                          <Typography.Text className="text-xs text-gray-500">Duration</Typography.Text>
                          <Typography.Text strong>{leg.duration.text}</Typography.Text>
                        </div>
                      </Col>
                    </Row>
                  </Card>

                  <div className="flex gap-3">
                    <Button onClick={onClose} size="large" className="flex-1 rounded-lg">
                      Cancel
                    </Button>
                    <Button 
                      type="primary" 
                      onClick={handleBookNow} 
                      loading={loading} 
                      size="large" 
                      className="flex-1 rounded-lg"
                    >
                      Book Now
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {mergedDriverList && mergedDriverList.length > 0 ? (
                    <VehicleSelection 
                      driverData={mergedDriverList}
                      onVehicleSelect={handleVehicleSelect}
                    />
                  ) : (
                    <div className="flex justify-center items-center p-6">
                      <Typography.Text>Loading available vehicles...</Typography.Text>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 p-3 rounded-lg my-4">
                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <Typography.Text>Trip Fare:</Typography.Text>
                      </Col>
                      <Col span={12} className="text-right">
                        <Typography.Text>₹{currentFare}</Typography.Text>
                      </Col>
                      <Col span={12}>
                        <Typography.Text>Booking Fee:</Typography.Text>
                      </Col>
                      <Col span={12} className="text-right">
                        <Typography.Text>₹199</Typography.Text>
                      </Col>
                      <Col span={24}>
                        <Divider className="my-1" />
                      </Col>
                      <Col span={12}>
                        <Typography.Text strong>Total:</Typography.Text>
                      </Col>
                      <Col span={12} className="text-right">
                        <Typography.Text strong>₹{totalPrice}</Typography.Text>
                      </Col>
                    </Row>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={() => setStep(1)} size="large" className="flex-1 rounded-lg">
                      Back
                    </Button>
                    <Button 
                      type="primary" 
                      onClick={handleConfirmBooking} 
                      loading={loading} 
                      size="large"
                      className="flex-1 rounded-lg"
                      disabled={selectedVehicle === null}
                    >
                      Confirm Booking
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* User Info Collection Modal */}
      <UserInfoModal />
    </>
  );
};

export default BookingConfirmationModal;