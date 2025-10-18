import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Typography,
  Spin,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Tabs,
  Row,
  Col,
} from "antd";
import {
  CarOutlined,
  DollarOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  RightOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import carSample from "../../../assets/car.jpg";
import PaymentModal from "../PaymentModal";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface DocumentLinks {
  Driving_Licence?: string;
  Vehicle_Insurance_Proof?: string;
  Proof_Of_Address?: string;
  Police_Clearance_Certificate?: string;
}

interface FareStructure {
  perKilometerRate: number;
  minimumFare: number;
  waitingChargePerMinute: number;
  cancellationFee: number;
}

interface Vehicle {
  _id: string;
  make: string;
  driverId: string;
  vehicleModel: string;
  year: number;
  seatsNo: number;
  licensePlate: string;
  vehicleClass: string;
  vehicleType: string;
  vehicleImages: string[];
  documents: DocumentLinks;
  fareStructure: FareStructure;
}

interface VehicleModalProps {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onSubmit: (vehicleData: Partial<Vehicle>) => Promise<void>;
  vehicle: Partial<Vehicle> | null;
  loading: boolean;
}

const VehicleModal: React.FC<VehicleModalProps> = ({
  visible,
  title,
  onCancel,
  onSubmit,
  vehicle,
  loading,
}) => {
  const [form] = Form.useForm();
  const [fareForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");
  const [uploadedDocs, setUploadedDocs] = useState<DocumentLinks>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingDocs, setUploadingDocs] = useState<{
    [key: string]: boolean;
  }>({
    Driving_Licence: false,
    Vehicle_Insurance_Proof: false,
    Proof_Of_Address: false,
    Police_Clearance_Certificate: false,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [docFileNames, setDocFileNames] = useState<{ [key: string]: string }>(
    {}
  );
  const [imageFileNames, setImageFileNames] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      fareForm.resetFields();
      setUploadedDocs({});
      setUploadedImages([]);
      setDocFileNames({});
      setImageFileNames([]);
      setActiveTab("1");

      if (vehicle && vehicle._id) {
        form.setFieldsValue({
          make: vehicle.make,
          vehicleModel: vehicle.vehicleModel,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          vehicleType: vehicle.vehicleType,
          seatsNo: vehicle.seatsNo,
          vehicleClass: vehicle.vehicleClass,
        });

        if (vehicle.fareStructure) {
          fareForm.setFieldsValue({
            perKilometerRate: vehicle.fareStructure.perKilometerRate || 0,
            minimumFare: vehicle.fareStructure.minimumFare || 0,
            waitingChargePerMinute:
              vehicle.fareStructure.waitingChargePerMinute || 0,
            cancellationFee: vehicle.fareStructure.cancellationFee || 0,
          });
        }

        if (vehicle.documents) {
          setUploadedDocs(vehicle.documents);
          const fileNames: { [key: string]: string } = {};
          Object.entries(vehicle.documents).forEach(([key, url]) => {
            if (url) {
              fileNames[key] = url.split("/").pop() || "Unknown file";
            }
          });
          setDocFileNames(fileNames);
        }

        if (vehicle.vehicleImages && vehicle.vehicleImages.length > 0) {
          setUploadedImages(vehicle.vehicleImages);
          setImageFileNames(
            vehicle.vehicleImages.map(
              (url) => url.split("/").pop() || "Unknown file"
            )
          );
        }
      }
    }
  }, [visible, vehicle, form, fareForm]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const goToNextTab = async () => {
    try {
      await form.validateFields();
      setActiveTab("2");
    } catch (error) {
      console.error("Form validation failed:", error);
      message.error("Please complete all required fields");
    }
  };

  const handleSubmit = async () => {
    try {
      const generalValues = await form.validateFields();
      const fareValues = await fareForm.validateFields();

      const vehicleData: Partial<Vehicle> = {
        ...generalValues,
        documents: uploadedDocs,
        vehicleImages: uploadedImages,
        fareStructure: {
          perKilometerRate: fareValues.perKilometerRate,
          minimumFare: fareValues.minimumFare,
          waitingChargePerMinute: fareValues.waitingChargePerMinute,
          cancellationFee: fareValues.cancellationFee,
        },
      };

      await onSubmit(vehicleData);
    } catch (error) {
      console.error("Form validation failed:", error);
      message.error("Please complete all required fields");
    }
  };
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - i);
  const uploadToS3 = async (
    file: File,
    folder: string
  ): Promise<string | null> => {
    try {
      const presignedResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/s3/presigned-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            folder: folder,
          }),
        }
      );

      if (!presignedResponse.ok) {
        throw new Error("Failed to get presigned URL");
      }

      const { url, key } = await presignedResponse.json();
      const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload to S3 failed");
      }

      const fileUrl = `https://${import.meta.env.VITE_BUCKET_NAME}.s3.${import.meta.env.VITE_REGION
        }.amazonaws.com/${key}`;
      return fileUrl;
    } catch (error) {
      console.error("S3 upload error:", error);
      return null;
    }
  };

  const handleDocUpload = async (docType: keyof DocumentLinks, file: File) => {
    setUploadingDocs((prev) => ({ ...prev, [docType]: true }));
    try {
      const fileUrl = await uploadToS3(
        file,
        `documents/${docType.toLowerCase()}`
      );
      if (fileUrl) {
        setUploadedDocs((prev) => ({ ...prev, [docType]: fileUrl }));
        setDocFileNames((prev) => ({ ...prev, [docType]: file.name }));
        message.success(`${file.name} uploaded successfully!`);
      } else {
        message.error(`Failed to upload ${file.name}`);
      }
    } catch (error) {
      console.error("Document upload error:", error);
      message.error(`Failed to upload ${file.name}`);
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [docType]: false }));
    }
    return false;
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const fileUrl = await uploadToS3(file, "vehicle-images");
      if (fileUrl) {
        setUploadedImages((prev) => [...prev, fileUrl]);
        setImageFileNames((prev) => [...prev, file.name]);
        message.success(`${file.name} uploaded successfully!`);
      } else {
        message.error(`Failed to upload ${file.name}`);
      }
    } catch (error) {
      console.error("Image upload error:", error);
      message.error(`Failed to upload ${file.name}`);
    } finally {
      setUploadingImage(false);
    }
    return false;
  };

  const handleDeleteImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImageFileNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteDocument = (docType: keyof DocumentLinks) => {
    setUploadedDocs((prev) => {
      const newDocs = { ...prev };
      delete newDocs[docType];
      return newDocs;
    });
    setDocFileNames((prev) => {
      const newNames = { ...prev };
      delete newNames[docType];
      return newNames;
    });
  };

  const renderDocumentUploadButton = (
    docType: keyof DocumentLinks,
    label: string
  ) => {
    const isUploading = uploadingDocs[docType];
    const isUploaded = !!uploadedDocs[docType];
    const fileName = docFileNames[docType];

    return (
      <div
        className="document-upload-container"
        style={{ marginBottom: "16px" }}
      >
        <Upload
          name={docType}
          beforeUpload={(file) => handleDocUpload(docType, file)}
          showUploadList={false}
          disabled={isUploading}
          accept=".pdf,.jpg,.jpeg,.png"
        >
          <Button
            icon={isUploaded ? <CheckCircleOutlined /> : <UploadOutlined />}
            loading={isUploading}
            type={isUploaded ? "default" : "primary"}
            style={{ width: "100%" }}
          >
            {isUploaded ? `Update ${label}` : `Upload ${label}`}
          </Button>
        </Upload>
        {isUploaded && fileName && (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              backgroundColor: "#f6f6f6",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                overflow: "hidden",
              }}
            >
              <FilePdfOutlined />
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {fileName}
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <Button
                type="link"
                size="small"
                onClick={() => window.open(uploadedDocs[docType], "_blank")}
              >
                View
              </Button>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDocument(docType);
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVehicleImageItem = (url: string, index: number) => {
    const fileName =
      imageFileNames[index] || url.split("/").pop() || `Image ${index + 1}`;
    const isImageFile = /\.(jpg|jpeg|png|gif|webp)$/i.test(
      fileName.toLowerCase()
    );

    return (
      <div
        key={index}
        style={{
          marginTop: "8px",
          padding: "8px",
          backgroundColor: "#f6f6f6",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflow: "hidden",
            flex: 1,
          }}
        >
          <FileImageOutlined />
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {fileName}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          {isImageFile && (
            <Button
              type="link"
              size="small"
              onClick={() => window.open(url, "_blank")}
            >
              Preview
            </Button>
          )}
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteImage(index)}
          />
        </div>
      </div>
    );
  };

  const renderImageThumbnail = (url: string) => {
    return (
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "4px",
          backgroundImage: `url(${url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "1px solid #d9d9d9",
        }}
        onClick={() => window.open(url, "_blank")}
      />
    );
  };

  if (!visible) {
    return null;
  }

  const modalFooter =
    activeTab === "1" ? (
      <div style={{ textAlign: "right" }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" onClick={goToNextTab} icon={<RightOutlined />}>
          Next: Fare Settings
        </Button>
      </div>
    ) : (
      <div style={{ textAlign: "right" }}>
        <Button onClick={() => setActiveTab("1")}>Previous</Button>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" loading={loading} onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    );

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={modalFooter}
      width={800}
      maskClosable={false}
    >
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane
          tab={
            <span>
              <CarOutlined />
              Vehicle Details
            </span>
          }
          key="1"
        >
          <Form form={form} layout="vertical" name="vehicleForm">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="make"
                  label="Make"
                  rules={[
                    { required: true, message: "Please enter vehicle make" },
                  ]}
                >
                  <Input placeholder="e.g. Toyota, Honda" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="vehicleModel"
                  label="Model"
                  rules={[
                    { required: true, message: "Please enter vehicle model" },
                  ]}
                >
                  <Input placeholder="e.g. Innova, Civic" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="year"
                  label="Year"
                  rules={[{ required: true, message: 'Please select manufacture year' }]}
                >
                  <Select placeholder="Select Year">
                    {yearOptions.map((year) => (
                      <Select.Option key={year} value={year}>
                        {year}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="seatsNo"
                  label="Seats"
                  rules={[
                    { required: true, message: "Please enter number of seats" },
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={50}
                    style={{ width: "100%" }}
                    placeholder="Seats"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="licensePlate"
                  label="License Plate"
                  rules={[
                    {
                      required: true,
                      message: "Please enter license plate number",
                    },
                  ]}
                >
                  <Input placeholder="e.g. KL-07-AB-1234" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="vehicleType"
                  label="Vehicle Type"
                  rules={[
                    { required: true, message: "Please select vehicle type" },
                  ]}
                >
                  <Select placeholder="Select vehicle type">
                    <Option value="Auto Rickshaw">Auto Rickshaw (₹1/day)</Option>
                    <Option value="Bike/Scooter">Bike/Scooter (₹1/day)</Option>
                    <Option value="Hatchback">Hatchback (₹2/day)</Option>
                    <Option value="Sedan">Sedan (₹3/day)</Option>
                    <Option value="SUV">SUV (₹4/day)</Option>
                    <Option value="MUV/MPV">MUV/MPV (₹4/day)</Option>
                    <Option value="Crossover">Crossover (₹3/day)</Option>
                    <Option value="Van">Van (₹3/day)</Option>
                    <Option value="MiniVan">MiniVan (₹3/day)</Option>
                    <Option value="Tempo Traveller">Tempo Traveller (₹5/day)</Option>
                    <Option value="Mini Truck">Mini Truck (₹4/day)</Option>
                    <Option value="Luxury Sedan">Luxury Sedan (₹5/day)</Option>
                    <Option value="Luxury SUV">Luxury SUV (₹5/day)</Option>
                    <Option value="Convertible">Convertible (₹5/day)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="vehicleClass"
                  label="Vehicle Class"
                  rules={[
                    { required: true, message: "Please select vehicle class" },
                  ]}
                >
                  <Select placeholder="Select vehicle class">

                    <Option value="Premium">Premium</Option>
                    <Option value="Luxury">Luxury</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <div style={{ marginBottom: 16, marginTop: 24 }}>
              <h3>Documents</h3>
              <Row gutter={16} style={{ marginTop: "16px" }}>
                <Col span={12}>
                  {renderDocumentUploadButton("Driving_Licence", "License")}
                </Col>
                <Col span={12}>
                  {renderDocumentUploadButton(
                    "Vehicle_Insurance_Proof",
                    "Insurance"
                  )}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: "8px" }}>
                <Col span={12}>
                  {renderDocumentUploadButton(
                    "Proof_Of_Address",
                    "Address Proof"
                  )}
                </Col>
                <Col span={12}>
                  {renderDocumentUploadButton(
                    "Police_Clearance_Certificate",
                    "Police Certificate"
                  )}
                </Col>
              </Row>
            </div>
            <div style={{ marginTop: 24 }}>
              <h3>Vehicle Images</h3>

              {/* Sample Image Section */}
              <div style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#f0f8ff",
                borderRadius: "6px",
                border: "1px dashed #40a9ff"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src={carSample}
                    alt="Sample vehicle photo"
                    style={{
                      width: "80px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      border: "2px solid #40a9ff"
                    }}
                  />
                  <div>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#1890ff",
                      marginBottom: "4px"
                    }}>
                      📸 Upload a clear photo like this sample
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#666",
                      lineHeight: "1.4"
                    }}>
                      • Take photo from the side angle<br />
                      • Ensure good lighting and full vehicle visibility<br />
                      • Keep background clean and uncluttered
                    </div>
                  </div>
                </div>
              </div>

              <Upload
                name="vehicleImages"
                beforeUpload={handleImageUpload}
                showUploadList={false}
                disabled={uploadingImage}
                accept="image/*"
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploadingImage}
                  type="primary"
                >
                  Upload Vehicle Image
                </Button>
              </Upload>
              {uploadedImages.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    {uploadedImages.map((img, idx) => (
                      <div
                        key={`thumb-${idx}`}
                        style={{ position: "relative" }}
                      >
                        {renderImageThumbnail(img)}
                      </div>
                    ))}
                  </div>
                  <div>
                    {uploadedImages.map((img, index) =>
                      renderVehicleImageItem(img, index)
                    )}
                  </div>
                </div>
              )}
            </div>
          </Form>
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Button
              type="primary"
              size="large"
              onClick={goToNextTab}
              icon={<RightOutlined />}
            >
              Continue to Fare Settings
            </Button>
          </div>
        </TabPane>
        <TabPane
          tab={
            <span>
              <DollarOutlined />
              Fare & Fees
            </span>
          }
          key="2"
        >
          <Form form={fareForm} layout="vertical" name="fareForm">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="perKilometerRate"
                  label="Per Kilometer Rate (₹)"
                  rules={[
                    {
                      required: true,
                      message: "Please enter per kilometer rate",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    step={0.5}
                    style={{ width: "100%" }}
                    placeholder="Rate per kilometer"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="cancellationFee"
                  label="Cancellation Fee (₹)"
                  rules={[{ required: true, message: "Please enter cancellation fee" }]}
                >
                  <InputNumber
                    min={0}
                    step={1}
                    style={{ width: "100%" }}
                    placeholder="Cancellation fee"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="minimumFare"
                  label="Minimum Fare (₹)"
                  rules={[
                    { required: true, message: "Please enter minimum fare" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    step={10}
                    style={{ width: "100%" }}
                    placeholder="Minimum fare amount"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="waitingChargePerMinute"
                  label="Waiting Charge (₹/Hours)"
                  rules={[
                    {
                      required: true,
                      message: "Please enter waiting charge per minute",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    step={0.5}
                    style={{ width: "100%" }}
                    placeholder="Waiting charge"
                  />
                </Form.Item>
              </Col>

            </Row>
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: "#f9f9f9",
                borderRadius: "4px",
              }}
            >
              <h4 style={{ marginTop: 0 }}>Tips for setting fares:</h4>
              <ul>
                <li>Minimum fare is the starting fare for any ride</li>
                <li>
                  Per kilometer rate should be competitive with other services
                  in your area
                </li>
                <li>
                  Minimum fare ensures you earn a minimum amount on short trips
                </li>
                <li>
                  Waiting charges apply when the vehicle is stationary during a
                  trip
                </li>
              </ul>
            </div>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

interface VehicleTabProps {
  loading: boolean;
}

export const VehicleTab = ({ loading: parentLoading }: VehicleTabProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add Vehicle");
  const [selectedVehicle, setSelectedVehicle] =
    useState<Partial<Vehicle> | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  // Payment modal expects a VehicleInfo-like shape: { name, perDay, yearly }
  interface VehicleInfoForPayment {
    name: string;
    perDay: number;
    yearly: number;
  }

  const [paymentVehicle, setPaymentVehicle] = useState<
    VehicleInfoForPayment | null
  >(null);

  // Map known vehicleType labels to per-day rates (₹/day). These mirror the options in the form.
  const vehicleTypeRates: Record<string, number> = {
    "Auto Rickshaw": 1,
    "Bike/Scooter": 1,
    Hatchback: 2,
    Sedan: 3,
    SUV: 4,
    "MUV/MPV": 4,
    Crossover: 3,
    Van: 3,
    MiniVan: 3,
    "Tempo Traveller": 5,
    "Mini Truck": 4,
    "Luxury Sedan": 5,
    "Luxury SUV": 5,
    Convertible: 5,
  };

  const getVehicleInfoForPayment = (
    v: Partial<Vehicle>
  ): VehicleInfoForPayment => {
    const nameFromMakeModel = v.make
      ? `${v.make}${v.vehicleModel ? ` ${v.vehicleModel}` : ""}`.trim()
      : undefined;
    const name = v.vehicleType || nameFromMakeModel || "Normal";
    const perDay = vehicleTypeRates[v.vehicleType as string] ?? 1;
    return { name, perDay, yearly: perDay * 365 };
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/vehicles/by-email`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          params: {
            id: localStorage.getItem("driverEmail"),
          },
        }
      );
      setVehicles(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error("Failed to fetch vehicles. Please try again.");
      console.error("Error fetching vehicles:", error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = () => {
    setModalTitle("Add Vehicle");
    setSelectedVehicle(null);
    setModalVisible(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setModalTitle("Edit Vehicle");
    setSelectedVehicle(vehicle);
    setModalVisible(true);
  };

  const handleModalSubmit = async (vehicleData: Partial<Vehicle>) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem("token");
      if (selectedVehicle?._id) {
        // Update existing vehicle
        await axios.post(
          `${import.meta.env.VITE_API_URL}/vehicles/${selectedVehicle._id}`,
          vehicleData,
          {
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
          }
        );
        message.success("Vehicle updated successfully!");
      } else {
        // Create new vehicle
        const createResp = await axios.post(
          `${import.meta.env.VITE_API_URL}/vehicles`,
          vehicleData,
          {
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
          }
        );
        const createdVehicle: Partial<Vehicle> = createResp?.data || vehicleData;
        message.success("Vehicle added successfully!");
        // Show payment modal for newly added vehicle using the created vehicle details
        setPaymentVehicle(getVehicleInfoForPayment(createdVehicle));
        setPaymentModalVisible(true);
      }
      setModalVisible(false);
      fetchVehicles();
    } catch (error) {
      message.error("Failed to save vehicle. Please try again.");
      console.error("Error saving vehicle:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      title: "Make",
      dataIndex: "make",
      key: "make",
    },
    {
      title: "Model",
      dataIndex: "vehicleModel",
      key: "vehicleModel",
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "License Plate",
      dataIndex: "licensePlate",
      key: "licensePlate",
    },
    {
      title: "Type",
      dataIndex: "vehicleType",
      key: "vehicleType",
    },
    {
      title: "Class",
      dataIndex: "vehicleClass",
      key: "vehicleClass",
    },
    {
      title: "Seats",
      dataIndex: "seatsNo",
      key: "seatsNo",
    },
    {
      title: "Documents",
      key: "documents",
      render: (record: Vehicle) => {
        const docs = record.documents || {};
        return (
          <div>
            {Object.keys(docs).map(
              (key) =>
                docs[key as keyof DocumentLinks] && (
                  <Tag key={key} color="blue">
                    {key.replace(/_/g, " ")}
                  </Tag>
                )
            )}
          </div>
        );
      },
    },
    {
      title: "Images",
      key: "vehicleImages",
      render: (record: Vehicle) => (
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {record.vehicleImages?.slice(0, 3).map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt="Vehicle"
              style={{
                width: "40px",
                height: "40px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          ))}
          {record.vehicleImages?.length > 3 && (
            <Tag>+{record.vehicleImages.length - 3}</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Vehicle) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEditVehicle(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  if (loading || parentLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Title level={4} className="!mb-2 text-xl sm:text-2xl">
            Your Vehicles
          </Title>
          <Paragraph className="text-gray-500 text-sm sm:text-base">
            Manage your registered vehicles
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddVehicle}
        >
          Add Vehicle
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-8">
          <Paragraph className="text-gray-500">
            No vehicles registered.
          </Paragraph>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={vehicles}
          rowKey="_id"
          pagination={false}
          className="overflow-x-auto"
        />
      )}

      <VehicleModal
        visible={modalVisible}
        title={modalTitle}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
        vehicle={selectedVehicle}
        loading={modalLoading}
      />
      <PaymentModal
        visible={paymentModalVisible}
        vehicle={paymentVehicle}
        onClose={() => {
          setPaymentModalVisible(false);
          setPaymentVehicle(null);
        }}
      />
    </Card>
  );
};