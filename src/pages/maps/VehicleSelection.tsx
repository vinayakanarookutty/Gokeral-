import { useState } from 'react';
import { Card, Avatar, Typography, Row, Col, Badge, Divider } from 'antd';

interface VehicleSelectionProps {
  driverData: any[];
  onVehicleSelect: (vehicleId: string, driverId: string, fareInfo: any) => void;
}

const VehicleSelection = ({ driverData, onVehicleSelect }: VehicleSelectionProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  
  // Function to display fare information
  const displayFare = (vehicle: any) => {
    if (!vehicle || !vehicle.fareStructure) return "Fare not available";

    const { perKilometerRate, minimumFare } = vehicle.fareStructure;
    return `Per KM: ₹${perKilometerRate} | Min Fare: ₹${minimumFare}`;
  };
  
  // Handle vehicle selection
  const handleVehicleSelect = (vehicle: any, driverId: string) => {
    setSelectedVehicle(vehicle._id);
    setSelectedDriver(driverId);
    // Pass the selected vehicle data to parent component
    onVehicleSelect(
      vehicle._id, 
      driverId,
      vehicle.fareStructure
    );
  };

  // If no drivers with vehicles are available
  if (!driverData || driverData.length === 0) {
    return <Typography.Text>No drivers with vehicles available</Typography.Text>;
  }
  
  // Filter drivers who have vehicles
  const driversWithVehicles = driverData.filter((driver: any) => 
    driver.vehicles && driver.vehicles.length > 0
  );
  
  if (driversWithVehicles.length === 0) {
    return <Typography.Text>No vehicles available</Typography.Text>;
  }

  return (
    <div className="space-y-6">
      <Typography.Title level={4} className="mb-4">Available Drivers & Vehicles</Typography.Title>
      
      {driversWithVehicles.map((driver: any, driverIndex: number) => (
        <div key={driver._id || driverIndex} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          {/* Driver info section */}
          <div className="flex items-center justify-between flex-wrap bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex items-center">
              <Avatar size="large" src={driver.imageUrl} />
              <div className="ml-3">
                <Typography.Text strong className="text-lg">{driver.name}</Typography.Text>
                <div className="text-sm text-gray-500">{driver.personalInfo?.area || 'N/A'}</div>
                <div className="text-xs text-gray-400">Driver ID: {driver._id}</div>
              </div>
            </div>
            <div className="text-right mt-1 sm:mt-0">
              <div className="text-sm"> {driver.phone}</div>
              <div className="text-xs text-gray-500">
                {driver.vehicles.length} vehicle{driver.vehicles.length > 1 ? 's' : ''} available
              </div>
              {driver.rating && (
                <div className="text-xs text-yellow-600">⭐ {driver.rating}/5</div>
              )}
            </div>
          </div>
          
          {/* Vehicle selection section for this driver */}
          <Typography.Title level={5} className="mb-3">
            Choose from {driver.name}'s Vehicles
          </Typography.Title>
          
          {/* Horizontal scrollable vehicle cards */}
          <div className="overflow-x-auto pb-2 -mx-2 px-2">
            <div className="flex space-x-3">
              {driver.vehicles.map((vehicle: any) => (
                <div 
                  key={vehicle._id}
                  className="flex-shrink-0 w-64 transition-all"
                  onClick={() => handleVehicleSelect(vehicle, driver.email)}
                >
                  <Badge.Ribbon 
                    text={vehicle.vehicleClass} 
                    color={selectedVehicle === vehicle._id ? "blue" : "grey"}
                    style={{ opacity: selectedVehicle === vehicle._id ? 1 : 0.7 }}
                  >
                    <Card 
                      className={`cursor-pointer h-full transition-all ${
                        selectedVehicle === vehicle._id && selectedDriver === driver._id 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      bodyStyle={{ padding: '12px' }}
                      hoverable
                    >
                      {vehicle.vehicleImages && vehicle.vehicleImages.length > 0 ? (
                        <img 
                          src={vehicle.vehicleImages[0]} 
                          alt="Vehicle" 
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                          <span className="text-gray-500">🚗 No image</span>
                        </div>
                      )}
                      
                      <div>
                        <div className="flex justify-between items-center">
                          <Typography.Text strong className="text-lg">{vehicle.make}</Typography.Text>
                          <Typography.Text className="text-sm text-gray-500">{vehicle.year}</Typography.Text>
                        </div>
                        <div className="text-sm my-1 space-y-1">
                          <div>Type: {vehicle.vehicleType}</div>
                          <div>Seats: {vehicle.seatsNo}</div>
                          <div className="truncate">Plate: {vehicle.licensePlate}</div>
                        </div>
                        
                        {selectedVehicle === vehicle._id && selectedDriver === driver._id && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <Typography.Text strong className="text-sm"> Fare Structure:</Typography.Text>
                            <div className="bg-blue-50 p-2 rounded mt-1 text-xs">
                              {displayFare(vehicle)}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Badge.Ribbon>
                </div>
              ))}
            </div>
          </div>
          
          {/* Add divider between drivers except for the last one */}
          {driverIndex < driversWithVehicles.length - 1 && (
            <Divider className="my-6" />
          )}
        </div>
      ))}
      
      {/* Selected vehicle details section */}
      {selectedVehicle && selectedDriver && (
        <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
          <Typography.Title level={5} className="text-blue-800 mb-3">
            🎯 Selected Booking Details
          </Typography.Title>
          {(() => {
            const selectedDriverData = driversWithVehicles.find((d: any) => d._id === selectedDriver);
            const selectedVehicleData = selectedDriverData?.vehicles.find((v: any) => v._id === selectedVehicle);
            
            if (!selectedDriverData || !selectedVehicleData) return null;
            
            return (
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="bg-white p-3 rounded border">
                    <Typography.Text strong className="text-gray-700">👨‍✈️ Driver:</Typography.Text>
                    <div className="mt-1">
                      <div className="font-medium">{selectedDriverData.name}</div>
                      <div className="text-sm text-gray-500">📞 {selectedDriverData.phone}</div>
                      <div className="text-sm text-gray-500">📍 {selectedDriverData.personalInfo?.area || 'N/A'}</div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="bg-white p-3 rounded border">
                    <Typography.Text strong className="text-gray-700">🚗 Vehicle:</Typography.Text>
                    <div className="mt-1">
                      <div className="font-medium">{selectedVehicleData.make} ({selectedVehicleData.vehicleClass})</div>
                      <div className="text-sm text-gray-500">Type: {selectedVehicleData.vehicleType}</div>
                      <div className="text-sm text-gray-500">Seats: {selectedVehicleData.seatsNo}</div>
                      <div className="text-sm text-gray-500">Plate: {selectedVehicleData.licensePlate}</div>
                    </div>
                  </div>
                </Col>
                <Col span={24}>
                  <div className="bg-white p-3 rounded border">
                    <Typography.Text strong className="text-gray-700">💰 Pricing Details:</Typography.Text>
                    <div className="mt-2 text-sm">
                      <div className="flex justify-between py-1">
                        <span>Minimum Fare:</span>
                        <span>₹{selectedVehicleData.fareStructure?.minimumFare || 0}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Per Kilometer:</span>
                        <span>₹{selectedVehicleData.fareStructure?.perKilometerRate || 0}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Minimum Fare:</span>
                        <span>₹{selectedVehicleData.fareStructure?.minimumFare || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-t pt-1 mt-1">
                        <span>Waiting Charge:</span>
                        <span>₹{selectedVehicleData.fareStructure?.waitingChargePerMinute || 0}/min</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Cancellation Fee:</span>
                        <span>₹{selectedVehicleData.fareStructure?.cancellationFee || 0}</span>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default VehicleSelection;