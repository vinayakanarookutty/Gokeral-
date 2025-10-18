import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Upload,  Tabs, Button, Row, Col, message } from "antd";
import {
  UploadOutlined,
  DollarOutlined,
  CarOutlined,
  CheckCircleOutlined,
  RightOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  DeleteOutlined
} from "@ant-design/icons";

const { TabPane } = Tabs;

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
  loading
}) => {
  const [form] = Form.useForm();
  const [fareForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [uploadedDocs, setUploadedDocs] = useState<DocumentLinks>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Track uploading states
  const [uploadingDocs, setUploadingDocs] = useState<{[key: string]: boolean}>({
    Driving_Licence: false,
    Vehicle_Insurance_Proof: false,
    Proof_Of_Address: false,
    Police_Clearance_Certificate: false
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Track file names for better UI display
  const [docFileNames, setDocFileNames] = useState<{[key: string]: string}>({});
  const [imageFileNames, setImageFileNames] = useState<string[]>([]);

  // Reset form and data when vehicle changes
  useEffect(() => {
    if (visible) {
      // Reset everything first
      form.resetFields();
      fareForm.resetFields();
      setUploadedDocs({});
      setUploadedImages([]);
      setDocFileNames({});
      setImageFileNames([]);
      setActiveTab('1');
      
      // If editing an existing vehicle, populate the forms
      if (vehicle && vehicle._id) {
        form.setFieldsValue({
          make: vehicle.make,
          vehicleModel: vehicle.vehicleModel,  // Fixed: changed from VehicleModal to vehicleModel
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          vehicleType: vehicle.vehicleType,
          seatsNo: vehicle.seatsNo,
          vehicleClass: vehicle.vehicleClass,
        });
        
        // Set fare form values
        if (vehicle.fareStructure) {
          fareForm.setFieldsValue({
            perKilometerRate: vehicle.fareStructure.perKilometerRate || 0,
            minimumFare: vehicle.fareStructure.minimumFare || 0,
            waitingChargePerMinute: vehicle.fareStructure.waitingChargePerMinute || 0,
            cancellationFee: vehicle.fareStructure.cancellationFee || 0,
          });
        }
        
        // Set uploaded documents and images if they exist
        if (vehicle.documents) {
          setUploadedDocs(vehicle.documents);
          
          // Set file names for display
          const fileNames: {[key: string]: string} = {};
          Object.entries(vehicle.documents).forEach(([key, url]) => {
            if (url) {
              fileNames[key] = url.split('/').pop() || 'Unknown file';
            }
          });
          setDocFileNames(fileNames);
        }
        
        if (vehicle.vehicleImages && vehicle.vehicleImages.length > 0) {
          setUploadedImages(vehicle.vehicleImages);
          setImageFileNames(vehicle.vehicleImages.map(url => url.split('/').pop() || 'Unknown file'));
        }
      }
    }
  }, [visible, vehicle, form, fareForm]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - i);
  // Move to the next tab
  const goToNextTab = async () => {
    try {
      // Validate the current form
      await form.validateFields();
      setActiveTab('2');
    } catch (error) {
      console.error("Form validation failed:", error);
      message.error("Please complete all required fields");
    }
  };

  // Submit the form data
  const handleSubmit = async () => {
    try {
      const generalValues = await form.validateFields();
      const fareValues = await fareForm.validateFields();
      
      // Prepare the vehicle data
      const vehicleData: Partial<Vehicle> = {
        ...generalValues,
        documents: uploadedDocs,
        vehicleImages: uploadedImages,
        fareStructure: {
          perKilometerRate: fareValues.perKilometerRate,
          minimumFare: fareValues.minimumFare,
          waitingChargePerMinute: fareValues.waitingChargePerMinute,
          cancellationFee: fareValues.cancellationFee,
        }
      };
      
      // Pass the data to the parent component
      await onSubmit(vehicleData);
      
    } catch (error) {
      console.error("Form validation failed:", error);
      message.error("Please complete all required fields");
    }
  };

  // Upload to S3 using presigned URL
  const uploadToS3 = async (file: File, folder: string): Promise<string | null> => {
    try {
      // Step 1: Get a presigned URL from your backend
      const presignedResponse = await fetch(`${import.meta.env.VITE_API_URL}/s3/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          folder: folder
        }),
      });

      if (!presignedResponse.ok) {
        throw new Error('Failed to get presigned URL');
      }

      const { url, key } = await presignedResponse.json();
      console.log(url,key)

      // Step 2: Upload file directly to S3 using the presigned URL
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload to S3 failed');
      }

      // Step 3: Construct the final S3 URL
      const fileUrl = `https://${import.meta.env.VITE_BUCKET_NAME}.s3.${import.meta.env.VITE_REGION}.amazonaws.com/${key}`;
      
      return fileUrl;
    } catch (error) {
      console.error('S3 upload error:', error);
      return null;
    }
  };

  const handleDocUpload = async (docType: keyof DocumentLinks, file: File) => {
    // Set specific doc type to uploading state
    setUploadingDocs(prev => ({ ...prev, [docType]: true }));
    
    try {
      // Upload the file to S3
      const fileUrl = await uploadToS3(file, `documents/${docType.toLowerCase()}`);
      
      if (fileUrl) {
        // Update state with the new document URL
        setUploadedDocs(prev => ({ ...prev, [docType]: fileUrl }));
        setDocFileNames(prev => ({ ...prev, [docType]: file.name }));
        
        message.success(`${file.name} uploaded successfully!`);
        console.log(`Document uploaded: ${docType} - ${file.name} - ${fileUrl}`);
      } else {
        message.error(`Failed to upload ${file.name}`);
      }
    } catch (error) {
      console.error("Document upload error:", error);
      message.error(`Failed to upload ${file.name}`);
    } finally {
      // Clear uploading state regardless of result
      setUploadingDocs(prev => ({ ...prev, [docType]: false }));
    }
    
    return false; // Prevent default upload behavior
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    
    try {
      // Upload the file to S3
      const fileUrl = await uploadToS3(file, "vehicle-images");
      
      if (fileUrl) {
        // Update state with the new image URL
        setUploadedImages(prev => [...prev, fileUrl]);
        setImageFileNames(prev => [...prev, file.name]);
        
        message.success(`${file.name} uploaded successfully!`);
        console.log(`Image uploaded: ${file.name} - ${fileUrl}`);
      } else {
        message.error(`Failed to upload ${file.name}`);
      }
    } catch (error) {
      console.error("Image upload error:", error);
      message.error(`Failed to upload ${file.name}`);
    } finally {
      setUploadingImage(false);
    }
    
    return false; // Prevent default upload behavior
  };

  // Delete image from the list
  const handleDeleteImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImageFileNames(prev => prev.filter((_, i) => i !== index));
  };
  
  // Delete document
  const handleDeleteDocument = (docType: keyof DocumentLinks) => {
    setUploadedDocs(prev => {
      const newDocs = { ...prev };
      delete newDocs[docType];
      return newDocs;
    });
    
    setDocFileNames(prev => {
      const newNames = { ...prev };
      delete newNames[docType];
      return newNames;
    });
  };

  // Document upload buttons with improved state handling and file details display
  const renderDocumentUploadButton = (docType: keyof DocumentLinks, label: string) => {
    const isUploading = uploadingDocs[docType];
    const isUploaded = !!uploadedDocs[docType];
    const fileName = docFileNames[docType];
    
    return (
      <div className="document-upload-container" style={{ marginBottom: '16px' }}>
        <Upload
          name={docType}
          beforeUpload={(file) => handleDocUpload(docType, file)}
          showUploadList={false}
          disabled={isUploading}
          accept=".pdf,.jpg,.jpeg,.png" // Limit file types
        >
          <Button 
            icon={isUploaded ? <CheckCircleOutlined /> : <UploadOutlined />} 
            loading={isUploading}
            type={isUploaded ? "default" : "primary"}
            style={{ width: '100%' }}
          >
            {isUploaded ? `Update ${label}` : `Upload ${label}`}
          </Button>
        </Upload>
        
        {isUploaded && fileName && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            backgroundColor: '#f6f6f6', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <FilePdfOutlined />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <Button 
                type="link" 
                size="small"
                onClick={() => window.open(uploadedDocs[docType], '_blank')}
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

  // Render vehicle image item with file details and preview
  const renderVehicleImageItem = (url: string, index: number) => {
    const fileName = imageFileNames[index] || url.split('/').pop() || `Image ${index + 1}`;
    const isImageFile = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName.toLowerCase());
    
    return (
      <div key={index} style={{ 
        marginTop: '8px', 
        padding: '8px', 
        backgroundColor: '#f6f6f6', 
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
          <FileImageOutlined />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {isImageFile && (
            <Button 
              type="link" 
              size="small"
              onClick={() => window.open(url, '_blank')}
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

  // Image preview component for thumbnails
  const renderImageThumbnail = (url: string) => {
    return (
      <div 
        style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '4px',
          backgroundImage: `url(${url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid #d9d9d9'
        }}
        onClick={() => window.open(url, '_blank')}
      />
    );
  };

  // If modal is closed, don't render the full content
  if (!visible) {
    return null;
  }

  // Custom footer with Next button for the first tab
  const modalFooter = activeTab === '1' ? (
    <div style={{ textAlign: 'right' }}>
      <Button onClick={onCancel}>Cancel</Button>
      <Button type="primary" onClick={goToNextTab} icon={<RightOutlined />}>
        Next: Fare Settings
      </Button>
    </div>
  ) : (
    <div style={{ textAlign: 'right' }}>
      <Button onClick={() => setActiveTab('1')}>Previous</Button>
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
        <TabPane tab={<span><CarOutlined />Vehicle Details</span>} key="1">
          <Form
            form={form}
            layout="vertical"
            name="vehicleForm"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="make"
                  label="Make"
                  rules={[{ required: true, message: 'Please enter vehicle make' }]}
                >
                  <Input placeholder="e.g. Toyota, Honda" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="vehicleModel"
                  label="Model"
                  rules={[{ required: true, message: 'Please enter vehicle model' }]}
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
                  rules={[{ required: true, message: 'Please enter number of seats' }]}
                >
                  <InputNumber min={1} max={50} style={{ width: '100%' }} placeholder="Seats" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="licensePlate"
                  label="License Plate"
                  rules={[{ required: true, message: 'Please enter license plate number' }]}
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
                  rules={[{ required: true, message: 'Please select vehicle type' }]}
                >
                  <Select placeholder="Select vehicle type">
                    <Select.Option value="Sedan">Sedan</Select.Option>
                    <Select.Option value="SUV">SUV</Select.Option>
                    <Select.Option value="Hatchback">Hatchback</Select.Option>
                    <Select.Option value="MPV">MPV</Select.Option>
                    <Select.Option value="Crossover">Crossover</Select.Option>
                    <Select.Option value="Convertible">Convertible</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="vehicleClass"
                  label="Vehicle Class"
                  rules={[{ required: true, message: 'Please select vehicle class' }]}
                >
                  <Select placeholder="Select vehicle class">
                    <Select.Option value="Premium">Premium</Select.Option>
                    <Select.Option value="Luxury">Luxury</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div style={{ marginBottom: 16, marginTop: 24 }}>
              <h3>Documents</h3>
              <Row gutter={16} style={{ marginTop: '16px' }}>
                <Col span={12}>
                  {renderDocumentUploadButton('Driving_Licence', 'License')}
                </Col>
                <Col span={12}>
                  {renderDocumentUploadButton('Vehicle_Insurance_Proof', 'Insurance')}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '8px' }}>
                <Col span={12}>
                  {renderDocumentUploadButton('Proof_Of_Address', 'Address Proof')}
                </Col>
                <Col span={12}>
                  {renderDocumentUploadButton('Police_Clearance_Certificate', 'Police Certificate')}
                </Col>
              </Row>
            </div>

            <div style={{ marginTop: 24 }}>
              <h3>Vehicle Images</h3>
              
              {/* Image upload button */}
              <Upload
                name="vehicleImages"
                beforeUpload={handleImageUpload}
                showUploadList={false}
                disabled={uploadingImage}
                accept="image/*" // Only accept image files
              >
                <Button 
                  icon={<UploadOutlined />} 
                  loading={uploadingImage}
                  type="primary"
                >
                  Upload Vehicle Image
                </Button>
              </Upload>

              {/* Display uploaded images */}
              {uploadedImages.length > 0 && (
                <div>
                  {/* Thumbnails row */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    marginTop: '16px', 
                    marginBottom: '16px' 
                  }}>
                    {uploadedImages.map((img, idx) => (
                      <div key={`thumb-${idx}`} style={{ position: 'relative' }}>
                        {renderImageThumbnail(img)}
                      </div>
                    ))}
                  </div>
                  
                  {/* Image list with details */}
                  <div>
                    {uploadedImages.map((img, index) => renderVehicleImageItem(img, index))}
                  </div>
                </div>
              )}
            </div>
          </Form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
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
        
        <TabPane tab={<span><DollarOutlined />Fare & Fees</span>} key="2">
          <Form
            form={fareForm}
            layout="vertical"
            name="fareForm"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="perKilometerRate"
                  label="Per Kilometer Rate (₹)"
                  rules={[{ required: true, message: 'Please enter per kilometer rate' }]}
                >
                  <InputNumber 
                    min={0} 
                    step={0.5} 
                    style={{ width: '100%' }} 
                    placeholder="Rate per kilometer"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="cancellationFee"
                  label="Cancellation Fee (₹)"
                  rules={[{ required: true, message: 'Please enter cancellation fee' }]}
                >
                  <InputNumber 
                    min={0} 
                    step={10} 
                    style={{ width: '100%' }} 
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
                  rules={[{ required: true, message: 'Please enter minimum fare' }]}
                >
                  <InputNumber 
                    min={0} 
                    step={10} 
                    style={{ width: '100%' }} 
                    placeholder="Minimum fare amount"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="waitingChargePerMinute"
                  label="Waiting Charge (₹/min)"
                  rules={[{ required: true, message: 'Please enter waiting charge per minute' }]}
                >
                  <InputNumber 
                    min={0} 
                    step={0.5} 
                    style={{ width: '100%' }} 
                    placeholder="Waiting charge"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="cancellationFee"
                  label="Cancellation Fee (₹)"
                  rules={[{ required: true, message: 'Please enter cancellation fee' }]}
                >
                  <InputNumber 
                    min={0} 
                    step={10} 
                    style={{ width: '100%' }} 
                    placeholder="Cancellation fee"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <div style={{ marginTop: 16, padding: 16, background: '#f9f9f9', borderRadius: '4px' }}>
              <h4 style={{ marginTop: 0 }}>Tips for setting fares:</h4>
              <ul>
                <li>Minimum fare is the starting fare for any ride</li>
                <li>Per kilometer rate should be competitive with other services in your area</li>
                <li>Minimum fare ensures you earn a minimum amount on short trips</li>
                <li>Waiting charges apply when the vehicle is stationary during a trip</li>
              </ul>
            </div>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default VehicleModal;