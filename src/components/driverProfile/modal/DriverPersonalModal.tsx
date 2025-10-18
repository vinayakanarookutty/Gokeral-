import { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { Edit } from "lucide-react";


const { Option } = Select;
const { Text } = Typography;
import { useMutation, useQueryClient } from "@tanstack/react-query";
function DriverPersonalModal({  personalInfo }:any) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();


  // const [driverInfo, setDriverInfo] = useState(personalInfo);

  const showModal = () => {
    // Populate the form with the existing personalInfo data
    form.setFieldsValue({
      ...personalInfo,
      dob: dayjs(personalInfo?.dob), // Set dob as a dayjs object for DatePicker
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  

  const updateDriverInfo = async (updatedInfo: any) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${import.meta.env.VITE_API_URL}/updateDriverPersonalInfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token!,
      },
      body: JSON.stringify(updatedInfo),
    });
  
    if (!response.ok) {
      throw new Error("Failed to update driver info");
    }
  
    return response.json();
  };
  
  const { mutate: submitDriverInfo } = useMutation({
    mutationFn: updateDriverInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({
  queryKey: ["driverDetails"]
});
    },
    onError: (error) => {
      console.error("Error submitting form:", error);
    },
  });
  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      dob: values.dob, // you can also do .format("YYYY-MM-DD") if needed
    };
  
    console.log("Updated Driver Information:", formattedValues);
    setIsModalVisible(false);
    submitDriverInfo(formattedValues);
  };
  

  return (
    <div className="mt-2">
      <div className="flex justify-center">
        <Button className="mt-3" onClick={showModal}>
          <Edit size={16} /> Edit
        </Button>
      </div>
      {/* Display Driver Information */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} sm={24} md={12}>
          <Card className="bg-gray-50" title="Personal Information">
            <p>
              <Text strong>Date of Birth:</Text>{" "}
              {personalInfo?.dob
                ?.substring(0, 10)
                .split("-")
                .reverse()
                .join("-")}
            </p>
            <p>
              <Text strong>Blood Group:</Text> {personalInfo?.bloodGroup}
            </p>
            <p>
              <Text strong>Address:</Text> {personalInfo?.address}
            </p>
            <p>
              <Text strong>Emergency Contact:</Text>{" "}
              {personalInfo?.emergencyContact}
            </p>
            <p>
              <Text strong>Operating Area:</Text> {personalInfo?.area}
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={12}>
          <Card className="bg-gray-50" title="Languages & Certifications">
            <div style={{ marginBottom: 16 }}>
              <Text strong>Languages:</Text>
              <br />
              {personalInfo?.languages?.map((lang: any) => (
                <Tag color="blue" key={lang} style={{ margin: "4px" }}>
                  {lang}
                </Tag>
              ))}
            </div>
            <div>
              <Text strong>Certifications:</Text>
              <br />
              {personalInfo?.certifications?.map((cert: any) => (
                <Tag color="green" key={cert} style={{ margin: "4px" }}>
                  {cert}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Driver Personal Information"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Date of Birth"
            name="dob"
            rules={[
              {
                required: true,
                message: "Please enter the driver's date of birth!",
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Blood Group"
            name="bloodGroup"
            rules={[
              {
                required: true,
                message: "Please select the driver's blood group!",
              },
            ]}
          >
            <Select placeholder="Select blood group">
              <Option value="A+">A+</Option>
              <Option value="A-">A-</Option>
              <Option value="B+">B+</Option>
              <Option value="B-">B-</Option>
              <Option value="AB+">AB+</Option>
              <Option value="AB-">AB-</Option>
              <Option value="O+">O+</Option>
              <Option value="O-">O-</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[
              { required: true, message: "Please enter the driver's address!" },
            ]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            label="Languages Spoken"
            name="languages"
            rules={[
              {
                required: true,
                message: "Please enter the languages spoken by the driver!",
              },
            ]}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Select or enter languages"
            >
              <Option value="English">English</Option>
              <Option value="Spanish">Spanish</Option>
              <Option value="French">French</Option>
              <Option value="German">German</Option>
              <Option value="Hindi">Hindi</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Your Place"
            name="area"
            rules={[
              {
                required: true,
                message: "Please enter the driver's operating area!",
              },
            ]}
          >
            <Input placeholder="E.g., Downtown, Suburban" />
          </Form.Item>

          <Form.Item
            label="Certifications"
            name="certifications"
            rules={[
              {
                required: true,
                message: "Please enter the driver's certifications!",
              },
            ]}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Select or enter certifications"
            >
              <Option value="Defensive Driving Certified">
                Defensive Driving Certified
              </Option>
              <Option value="First Aid Certified">First Aid Certified</Option>
              <Option value="Hazardous Materials Endorsement">
                Hazardous Materials Endorsement
              </Option>
              <Option value="Commercial Driving License">
                Commercial Driving License
              </Option>
              <Option value="Customer Service Training">
                Customer Service Training
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Emergency Contact"
            name="emergencyContact"
            rules={[
              { required: true, message: "Please enter an emergency contact!" },
            ]}
          >
            <Input placeholder="Name - Phone Number" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Information
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default DriverPersonalModal;
