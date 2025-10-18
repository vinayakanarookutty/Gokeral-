import {
  Card,
  Form,
  Input,
  Button,
  Skeleton,
  Typography,
  Row,
  Col,
  message,
  Upload,
  Modal,
  Tooltip,
  Select,
  DatePicker,
  Tag,
} from "antd";
import {
  UserOutlined,
 
  PhoneOutlined,
  IdcardOutlined,
  UploadOutlined,
  SaveOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { DriverData } from "../DriverProfile";
import type { UploadFile, RcFile, UploadProps } from "antd/es/upload/interface";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

interface DriverPersonalInfoTabProps {
  driverData: DriverData;
  loading: boolean;
  updateDriverData: (values: Partial<DriverData>) => Promise<void>;
}

export const DriverPersonalInfoTab = ({
  driverData,
  loading,
  updateDriverData,
}: DriverPersonalInfoTabProps) => {
  const [form] = Form.useForm();
  const [personalForm] = Form.useForm();
  const [saveLoading, setSaveLoading] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    driverData?.imageUrl || ""
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [_fileList, setFileList] = useState<UploadFile[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    form.setFieldsValue({
      name: driverData.name,
      email: driverData.email,
      phone: driverData.phone,
      drivinglicenseNo: driverData.drivinglicenseNo,
    });
    personalForm.setFieldsValue({
      ...driverData.personalInfo,
      dob: driverData.personalInfo?.dob
        ? dayjs(driverData.personalInfo.dob)
        : null,
    });
    setFormChanged(false);
    setImageUrl(driverData?.imageUrl || "");

    if (driverData?.imageUrl) {
      setFileList([
        {
          uid: "-1",
          name: "profile-picture.png",
          status: "done",
          url: driverData.imageUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [driverData, form, personalForm]);

  const onFinish = async (values: any) => {
    try {
      setSaveLoading(true);
      if (imageUrl) {
        values.imageUrl = imageUrl;
      }
      await updateDriverData(values);
      message.success("Profile updated successfully!");
      setFormChanged(false);
    } catch (error) {
      message.error("Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const updateDriverPersonalInfo = async (updatedInfo: any) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/updateDriverPersonalInfo`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token!,
        },
        body: JSON.stringify(updatedInfo),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update driver personal info");
    }

    return response.json();
  };

  const { mutate: submitDriverPersonalInfo } = useMutation({
    mutationFn: updateDriverPersonalInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driverDetails"] });
      message.success("Personal information updated successfully!");
    },
    onError: (error) => {
      message.error("Failed to update personal information. Please try again.");
      console.error("Error submitting form:", error);
    },
  });

const handlePersonalInfoFinish = (values: any) => {
  const emergencyContactName = values.emergencyContact?.name || '';
  const emergencyContactPhone = values.emergencyContact?.phone || '';

  const formattedValues = {
    ...values,
    dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
    emergencyContact: `${emergencyContactName} - ${emergencyContactPhone}`,
  };

  setIsModalVisible(false);
  submitDriverPersonalInfo(formattedValues);
  updateDriverData({ personalInfo: formattedValues });
};


  const handleFormChange = () => {
    const currentValues = form.getFieldsValue();
    const hasChanged =
      Object.keys(currentValues).some(
        (key) => currentValues[key] !== driverData[key as keyof DriverData]
      ) || imageUrl !== driverData?.imageUrl;
    setFormChanged(hasChanged);
  };

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = () => {
    setPreviewImage(imageUrl || "");
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      getBase64(newFileList[0].originFileObj as RcFile).then((url) => {
        setImageUrl(url);
        setFormChanged(true);
      });
    } else if (newFileList.length === 0) {
      setImageUrl(undefined);
      setFormChanged(true);
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG files!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const removeImage = () => {
    setImageUrl(undefined);
    setFileList([]);
    setFormChanged(true);
    message.success("Profile picture removed");
  };

  const showModal = () => {
    personalForm.setFieldsValue({
      ...driverData.personalInfo,
      dob: driverData.personalInfo?.dob
        ? dayjs(driverData.personalInfo.dob)
        : null,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Card className="shadow-lg">
      <Title level={4} className="!mb-2 text-xl sm:text-2xl">
        Personal Information
      </Title>
      <Paragraph className="text-gray-500 text-sm sm:text-base mb-6">
        Update your personal details
      </Paragraph>

      <Skeleton loading={loading} active>
        <div className="flex flex-col items-center mb-8">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-5 flex items-center justify-center"
            style={{
              width: "180px",
              height: "180px",
              boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Driver avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <UserOutlined style={{ fontSize: "64px", color: "white" }} />
            )}
          </div>

          <div className="flex justify-center items-center gap-3 mt-4">
            <Upload
              name="avatar"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              maxCount={1}
              accept="image/png, image/jpeg"
            >
              <Button
                type="primary"
                icon={<UploadOutlined />}
                className="flex items-center"
                size="large"
              >
                {imageUrl ? "Change Picture" : "Upload Picture"}
              </Button>
            </Upload>

            {imageUrl && (
              <>
                <Tooltip title="View Image">
                  <Button
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    className="flex items-center"
                    size="large"
                  />
                </Tooltip>

                <Tooltip title="Remove Image">
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={removeImage}
                    className="flex items-center"
                    size="large"
                  />
                </Tooltip>
              </>
            )}
          </div>
        </div>

        <Modal
          open={previewOpen}
          title="Profile Picture Preview"
          footer={null}
          onCancel={() => setPreviewOpen(false)}
          width={600}
        >
          <div className="flex justify-center">
            <img
              alt="Profile preview"
              style={{ maxWidth: "100%", maxHeight: "500px" }}
              src={previewImage}
            />
          </div>
        </Modal>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={driverData}
          className="w-full"
          onValuesChange={handleFormChange}
        >
          <Row gutter={[16, 16]}>
           


            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[
                  {
                    required: true,
                    message: "Please input your phone number!",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Your phone number"
                  type="number"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="drivinglicenseNo"
                label="Driving License Number"
                rules={[
                  {
                    required: true,
                    message: "Please input your driving license number!",
                  },
                ]}
              >
                <Input
                  prefix={<IdcardOutlined />}
                  placeholder="Your driving license number"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full mt-4"
              size="large"
              loading={saveLoading}
              disabled={!formChanged}
              icon={<SaveOutlined />}
            >
              {saveLoading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </Form.Item>
        </Form>

        {/* Personal Info Display and Modal */}
        <div className="mt-6">
          <div className="flex justify-center">
            <Button type="primary" onClick={showModal} icon={<EditOutlined />}>
              Edit Personal Info
            </Button>
          </div>
          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            <Col xs={24} sm={24} md={12}>
              <Card className="bg-gray-50" title="Personal Information">
                <p>
                  <Text strong>Date of Birth:</Text>{" "}
                  {driverData.personalInfo?.dob
                    ?.substring(0, 10)
                    .split("-")
                    .reverse()
                    .join("-") || "Not set"}
                </p>
                <p>
                  <Text strong>Blood Group:</Text>{" "}
                  {driverData.personalInfo?.bloodGroup || "Not set"}
                </p>
                <p>
                  <Text strong>Address:</Text>{" "}
                  {driverData.personalInfo?.address || "Not set"}
                </p>
                <p>
                  <Text strong>Emergency Contact:</Text>{" "}
                  {driverData.personalInfo?.emergencyContact || "Not set"}
                </p>
                <p>
                  <Text strong>Operating Area:</Text>{" "}
                  {driverData.personalInfo?.area || "Not set"}
                </p>
              </Card>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Card className="bg-gray-50" title="Languages & Certifications">
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Languages:</Text>
                  <br />
                  {driverData.personalInfo?.languages?.length > 0 ? (
                    driverData.personalInfo.languages.map((lang: string) => (
                      <Tag color="blue" key={lang} style={{ margin: "4px" }}>
                        {lang}
                      </Tag>
                    ))
                  ) : (
                    <Text>Not set</Text>
                  )}
                </div>
                <div>
                  <Text strong>Certifications:</Text>
                  <br />
                  {driverData.personalInfo?.certifications?.length > 0 ? (
                    driverData.personalInfo.certifications.map(
                      (cert: string) => (
                        <Tag color="green" key={cert} style={{ margin: "4px" }}>
                          {cert}
                        </Tag>
                      )
                    )
                  ) : (
                    <Text>Not set</Text>
                  )}
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
            <Form
              form={personalForm}
              layout="vertical"
              onFinish={handlePersonalInfoFinish}
            >
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
                  {
                    required: true,
                    message: "Please enter the driver's address!",
                  },
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
                    message: "Please enter the driver's qualifications!",
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
                  <Option value="First Aid Certified">
                    First Aid Certified
                  </Option>
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

           <Form.Item label="Emergency Contact" required>
  <Input.Group compact>
    <Form.Item
      name={['emergencyContact', 'name']}
      noStyle
      rules={[{ required: true, message: 'Please enter a name' }]}
    >
      <Input style={{ width: '50%' }} placeholder="Name" />
    </Form.Item>
    <Form.Item
      name={['emergencyContact', 'phone']}
      noStyle
      rules={[{ required: true, message: 'Please enter a phone number' }]}
    >
      <Input style={{ width: '50%' }} placeholder="Phone Number" />
    </Form.Item>
  </Input.Group>
</Form.Item>


              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Information
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Skeleton>
    </Card>
  );
};
