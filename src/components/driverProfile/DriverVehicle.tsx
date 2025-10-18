// DriverVehicle.tsx
import React, { useState, useEffect } from "react";
import { Table, Button, Row, Col, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";


import VehicleModal from './modal/DriverAddVehicleMoadl';

// Document Links Interface
interface DocumentLinks {
  Driving_Licence?: string;
  Vehicle_Insurance_Proof?: string;
  Proof_Of_Address?: string;
  Police_Clearance_Certificate?: string;
}

// Fare Structure Interface
interface FareStructure {
  perKilometerRate: number;
  minimumFare: number;
  waitingChargePerMinute: number;
  cancellationFee: number;
}

// Vehicle Interface
interface Vehicle {
  _id: string;
  make: string;
  vehicleModel: string;
  year: number;
  licensePlate: string;
  vehicleType: string;
  seatsNo: number;
  vehicleClass: string;
  documents?: DocumentLinks;
  vehicleImages?: string[];
  fareStructure?: FareStructure;
}

const DriverVehicle: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add Vehicle");
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(null);
  const [loading, setLoading] = useState(false);
  // Initialize vehicles as an empty array instead of undefined
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const {
    // data: vehicleListData,
    isLoading: isVehicleLoading,
  } = useQuery({
    queryKey: ["vehicleListByEmail"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vehicles/by-email`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch vehicle details by email");
      }
      
      const data = await response.json();
      setVehicles(data); // Update vehicles state with fetched data
      return data;
    },
  });

  useEffect(() => {
    // Fetch vehicles from database
    const fetchVehicles = async () => {
      try {
        // In a real app, you'd fetch from your database
        console.log("Vehicles would be fetched here");
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, []);

  const showModal = (record: Partial<Vehicle>) => {
    if (record._id) {
      // Edit mode
      setModalTitle("Edit Vehicle");
      setEditingVehicle(record);
    } else {
      // Add mode
      setModalTitle("Add Vehicle");
      setEditingVehicle(null);
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingVehicle(null);
  };

  const handleSubmit = async (vehicleData: Partial<Vehicle>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (editingVehicle && editingVehicle._id) {
        // Update existing vehicle
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vehicles/${editingVehicle._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token!,
          },
          body: JSON.stringify(vehicleData),
        });
        
        if (!response.ok) {
          throw new Error("Failed to update vehicle");
        }
        
        // Update local state
        setVehicles(prev => 
          prev.map(v => v._id === editingVehicle._id ? { ...v, ...vehicleData } as Vehicle : v)
        );
        message.success("Vehicle updated successfully");
      } else {
        // Create new vehicle
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vehicles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token!,
          },
          body: JSON.stringify(vehicleData),
        });
        
        if (!response.ok) {
          throw new Error("Failed to create vehicle");
        }
        
        const createdVehicle = await response.json();
        
        // Update local state with the new vehicle
        setVehicles(prev => [...prev, createdVehicle]);
        message.success("Vehicle added successfully");
      }

      setModalVisible(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error("Form submission failed:", error);
      message.error("Failed to save vehicle");
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Call API to delete the vehicle
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vehicles/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete vehicle");
      }
      
      // Remove from state after successful deletion
      setVehicles((prev) => prev.filter((v) => v._id !== id));
      message.success("Vehicle deleted successfully");
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      message.error("Failed to delete vehicle");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Vehicle> = [
    { title: "Make", dataIndex: "make", key: "make" },
    { title: "Model", dataIndex: "vehicleModel", key: "model" },
    { title: "Year", dataIndex: "year", key: "year" },
    { title: "License Plate", dataIndex: "licensePlate", key: "licensePlate" },
    { title: "Type", dataIndex: "vehicleType", key: "vehicleType" },
    { title: "Seats", dataIndex: "seatsNo", key: "seatsNo" },
    { title: "Class", dataIndex: "vehicleClass", key: "vehicleClass" },
    // Base Fare removed; using Minimum Fare instead where needed
    {
      title: "Per KM",
      dataIndex: ["fareStructure", "perKilometerRate"],
      key: "perKilometerRate",
      render: (text) => `₹${text || 0}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_text, record) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} type="link">
            Edit
          </Button>
          <Button icon={<DeleteOutlined />} onClick={() => deleteVehicle(record._id)} type="link">
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
    
        <Button icon={<PlusOutlined />} onClick={() => showModal({})} size="large" type="primary">
          Add Vehicle
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={vehicles}
        loading={isVehicleLoading || loading}
        rowKey="_id"
        scroll={{ x: true }}
        pagination={{
          responsive: true,
          defaultPageSize: 5,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '0 30px' }}>
              <h4>Details</h4>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  {/* <div>
                  <strong>Base Fare:</strong> ₹{record.fareStructure?.baseFare || 0}
                  </div> */}
                  <div>
                    <strong>Per Kilometer Rate:</strong> ₹{record.fareStructure?.perKilometerRate || 0}
                  </div>
                  <div>
                    <strong>Minimum Fare:</strong> ₹{record.fareStructure?.minimumFare || 0}
                  </div>
                  <div>
                    <strong>Waiting Charge (per minute):</strong> ₹{record.fareStructure?.waitingChargePerMinute || 0}
                  </div>
                  <div>
                    <strong>Cancellation Fee:</strong> ₹{record.fareStructure?.cancellationFee || 0}
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <strong>Documents:</strong>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {record.documents?.Driving_Licence && (
                        <li>Driving License: <a href={record.documents.Driving_Licence} target="_blank" rel="noopener noreferrer">View</a></li>
                      )}
                      {record.documents?.Vehicle_Insurance_Proof && (
                        <li>Vehicle Insurance: <a href={record.documents.Vehicle_Insurance_Proof} target="_blank" rel="noopener noreferrer">View</a></li>
                      )}
                      {record.documents?.Proof_Of_Address && (
                        <li>Address Proof: <a href={record.documents.Proof_Of_Address} target="_blank" rel="noopener noreferrer">View</a></li>
                      )}
                      {record.documents?.Police_Clearance_Certificate && (
                        <li>Police Certificate: <a href={record.documents.Police_Clearance_Certificate} target="_blank" rel="noopener noreferrer">View</a></li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <strong>Images:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {record.vehicleImages?.map((img, index) => (
                        <a key={index} href={img} target="_blank" rel="noopener noreferrer">
                          <Button size="small">Image {index + 1}</Button>
                        </a>
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )
        }}
      />

      {/* Vehicle Modal as separate component */}
      <VehicleModal
        visible={modalVisible}
        title={modalTitle}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        vehicle={editingVehicle}
        loading={loading}
      />
    </div>
  );
};

export default DriverVehicle;