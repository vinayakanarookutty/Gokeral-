// import { useState, useEffect } from "react";
// import {
//   Button,
//   Card,
//   Checkbox,
//   Col,
//   Form,
//   Row,
//   Select,
//   Typography,
//   Spin,
//   message,
// } from "antd";
// import { SaveOutlined } from "@ant-design/icons";
// import axios from "axios";

// const { Title, Paragraph } = Typography;

// interface DriverSettings {
//   notifications: {
//     email: boolean;
//     sms: boolean;
//     push: boolean;
//   };
//   language: string;
//   timeZone: string;
// }

// interface SettingsTabProps {
//   loading: boolean;
// }

// export const SettingsTab = ({ loading: parentLoading }: SettingsTabProps) => {
//   const [form] = Form.useForm();
//   const [settings, setSettings] = useState<DriverSettings | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [saveLoading, setSaveLoading] = useState(false);
//   const [formChanged, setFormChanged] = useState(false);

//   const fetchSettings = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `${import.meta.env.VITE_API_URL}/driver/settings`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "x-auth-token": token,
//           },
//           params: {
//             id: localStorage.getItem("driverEmail"),
//           },
//         }
//       );
//       const data = response.data;
//       setSettings(data);
//       form.setFieldsValue({
//         notifications: Object.keys(data.notifications || {}).filter(
//           (key) => data.notifications[key]
//         ),
//         language: data.language || "english",
//         timeZone: data.timeZone || "utc",
//       });
//       setLoading(false);
//     } catch (error) {
//       setLoading(false);
//       message.error("Failed to fetch settings. Please try again.");
//       console.error("Error fetching settings:", error);
//     }
//   };

//   useEffect(() => {
//     fetchSettings();
//   }, []);

//   const handleSaveSettings = async (values: any) => {
//     try {
//       setSaveLoading(true);
//       const token = localStorage.getItem("token");
//       const updatedSettings: DriverSettings = {
//         notifications: {
//           email: values.notifications.includes("email"),
//           sms: values.notifications.includes("sms"),
//           push: values.notifications.includes("push"),
//         },
//         language: values.language,
//         timeZone: values.timeZone,
//       };
//       await axios.patch(
//         `${import.meta.env.VITE_API_URL}/driver/settings`,
//         updatedSettings,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "x-auth-token": token,
//           },
//         }
//       );
//       setSettings(updatedSettings);
//       setFormChanged(false);
//       message.success("Settings saved successfully!");
//     } catch (error) {
//       message.error("Failed to save settings. Please try again.");
//       console.error("Error saving settings:", error);
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   const handleFormChange = () => {
//     if (!settings) {
//       return;
//     }
//     const currentValues = form.getFieldsValue();
//     const currentNotifications = currentValues.notifications || [];
//     const initialNotifications = Object.keys(settings.notifications)
//       .filter(
//         (key) =>
//           settings.notifications[key as keyof typeof settings.notifications]
//       )
//       .sort()
//       .join();
//     const hasChanged =
//       currentNotifications.sort().join() !== initialNotifications ||
//       currentValues.language !== (settings.language || "english") ||
//       currentValues.timeZone !== (settings.timeZone || "utc");
//     setFormChanged(hasChanged);
//   };

//   if (loading || parentLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-64">
//         <Spin size="large" />
//       </div>
//     );
//   }

//   return (
//     <Card className="shadow-lg">
//       <Title level={4} className="!mb-2 text-xl sm:text-2xl">
//         Settings
//       </Title>
//       <Paragraph className="text-gray-500 text-sm sm:text-base mb-6">
//         Customize your notification and account preferences
//       </Paragraph>

//       <Form
//         form={form}
//         layout="vertical"
//         onFinish={handleSaveSettings}
//         onValuesChange={handleFormChange}
//       >
//         <Row gutter={[24, 24]}>
//           <Col xs={24} md={12}>
//             <Card
//               title="Notification Settings"
//               className="h-full shadow-sm hover:shadow-md transition-shadow bg-gray-50"
//             >
//               <Form.Item name="notifications">
//                 <Checkbox.Group className="flex flex-col gap-3">
//                   <Checkbox value="email">Email Notifications</Checkbox>
//                   <Checkbox value="sms">SMS Notifications</Checkbox>
//                   <Checkbox value="push">Push Notifications</Checkbox>
//                 </Checkbox.Group>
//               </Form.Item>
//             </Card>
//           </Col>
//           <Col xs={24} md={12}>
//             <Card
//               title="Account Settings"
//               className="h-full shadow-sm hover:shadow-md transition-shadow bg-gray-50"
//             >
//               <Form.Item
//                 name="language"
//                 label="Language"
//                 rules={[
//                   { required: true, message: "Please select a language" },
//                 ]}
//               >
//                 <Select
//                   size="large"
//                   placeholder="Select language"
//                   options={[
//                     { value: "english", label: "English" },
//                     { value: "spanish", label: "Spanish" },
//                     { value: "french", label: "French" },
//                   ]}
//                 />
//               </Form.Item>
//               <Form.Item
//                 name="timeZone"
//                 label="Time Zone"
//                 rules={[
//                   { required: true, message: "Please select a time zone" },
//                 ]}
//               >
//                 <Select
//                   size="large"
//                   placeholder="Select time zone"
//                   options={[
//                     { value: "utc", label: "UTC (GMT+0)" },
//                     { value: "est", label: "EST (GMT-5)" },
//                     { value: "pst", label: "PST (GMT-8)" },
//                   ]}
//                 />
//               </Form.Item>
//             </Card>
//           </Col>
//           <Col xs={24}>
//             <Button
//               type="primary"
//               size="large"
//               htmlType="submit"
//               loading={saveLoading}
//               disabled={!formChanged}
//               icon={<SaveOutlined />}
//             >
//               Save Settings
//             </Button>
//           </Col>
//         </Row>
//       </Form>
//     </Card>
//   );
// };

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Row,
  Select,
  Typography,
  Spin,
  message,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";


const { Title, Paragraph } = Typography;

interface DriverSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
  timeZone: string;
}

interface SettingsTabProps {
  loading: boolean;
}

export const SettingsTab = ({ loading: parentLoading }: SettingsTabProps) => {
  const [form] = Form.useForm();
  const [settings, setSettings] = useState<DriverSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  // Dummy data to simulate backend response
  const dummySettings: DriverSettings = {
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    language: "english",
    timeZone: "utc",
  };

  // Placeholder for future API implementation
  // const fetchSettings = async () => {
  //   try {
  //     setLoading(true);
  //     const token = localStorage.getItem("token");
  //     const response = await axios.get(
  //       `${import.meta.env.VITE_API_URL}/driver/settings`,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           "x-auth-token": token,
  //         },
  //         params: {
  //           id: localStorage.getItem("driverEmail"),
  //         },
  //       }
  //     );
  //     const data = response.data;
  //     setSettings(data);
  //     form.setFieldsValue({
  //       notifications: Object.keys(data.notifications || {}).filter(
  //         (key) => data.notifications[key]
  //       ),
  //       language: data.language || "english",
  //       timeZone: data.timeZone || "utc",
  //     });
  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);
  //     message.error("Failed to fetch settings. Please try again.");
  //     console.error("Error fetching settings:", error);
  //   }
  // };

  // Initialize with dummy data
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setSettings(dummySettings);
      form.setFieldsValue({
        notifications: Object.keys(dummySettings.notifications).filter(
          (key) =>
            dummySettings.notifications[
              key as keyof typeof dummySettings.notifications
            ]
        ),
        language: dummySettings.language,
        timeZone: dummySettings.timeZone,
      });
      setLoading(false);
    }, 500);
  }, []);

  // Placeholder for future API implementation
  // const handleSaveSettings = async (values: any) => {
  //   try {
  //     setSaveLoading(true);
  //     const token = localStorage.getItem("token");
  //     const updatedSettings: DriverSettings = {
  //       notifications: {
  //         email: values.notifications.includes("email"),
  //         sms: values.notifications.includes("sms"),
  //         push: values.notifications.includes("push"),
  //       },
  //       language: values.language,
  //       timeZone: values.timeZone,
  //     };
  //     await axios.patch(
  //       `${import.meta.env.VITE_API_URL}/driver/settings`,
  //       updatedSettings,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           "x-auth-token": token,
  //         },
  //       }
  //     );
  //     setSettings(updatedSettings);
  //     setFormChanged(false);
  //     message.success("Settings saved successfully!");
  //   } catch (error) {
  //     message.error("Failed to save settings. Please try again.");
  //     console.error("Error saving settings:", error);
  //   } finally {
  //     setSaveLoading(false);
  //   }
  // };

  // Simulate saving settings with dummy data
  const handleSaveDummySettings = (values: any) => {
    setSaveLoading(true);
    setTimeout(() => {
      const updatedSettings: DriverSettings = {
        notifications: {
          email: values.notifications.includes("email"),
          sms: values.notifications.includes("sms"),
          push: values.notifications.includes("push"),
        },
        language: values.language,
        timeZone: values.timeZone,
      };
      setSettings(updatedSettings);
      setFormChanged(false);
      message.success("Settings saved successfully!");
      setSaveLoading(false);
    }, 500);
  };

  const handleFormChange = () => {
    if (!settings) {
      return;
    }
    const currentValues = form.getFieldsValue();
    const currentNotifications = currentValues.notifications || [];
    const initialNotifications = Object.keys(settings.notifications)
      .filter(
        (key) =>
          settings.notifications[key as keyof typeof settings.notifications]
      )
      .sort()
      .join();
    const hasChanged =
      currentNotifications.sort().join() !== initialNotifications ||
      currentValues.language !== (settings.language || "english") ||
      currentValues.timeZone !== (settings.timeZone || "utc");
    setFormChanged(hasChanged);
  };

  if (loading || parentLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <Title level={4} className="!mb-2 text-xl sm:text-2xl">
        Settings
      </Title>
      <Paragraph className="text-gray-500 text-sm sm:text-base mb-6">
        Customize your notification and account preferences
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveDummySettings}
        onValuesChange={handleFormChange}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card
              title="Notification Settings"
              className="h-full shadow-sm hover:shadow-md transition-shadow bg-gray-50"
            >
              <Form.Item name="notifications">
                <Checkbox.Group className="flex flex-col gap-3">
                  <Checkbox value="email">Email Notifications</Checkbox>
                  <Checkbox value="sms">SMS Notifications</Checkbox>
                  <Checkbox value="push">Push Notifications</Checkbox>
                </Checkbox.Group>
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Account Settings"
              className="h-full shadow-sm hover:shadow-md transition-shadow bg-gray-50"
            >
              <Form.Item
                name="language"
                label="Language"
                rules={[
                  { required: true, message: "Please select a language" },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Select language"
                  options={[
                    { value: "english", label: "English" },
                    { value: "spanish", label: "Spanish" },
                    { value: "french", label: "French" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="timeZone"
                label="Time Zone"
                rules={[
                  { required: true, message: "Please select a time zone" },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Select time zone"
                  options={[
                    { value: "utc", label: "UTC (GMT+0)" },
                    { value: "est", label: "EST (GMT-5)" },
                    { value: "pst", label: "PST (GMT-8)" },
                  ]}
                />
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24}>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={saveLoading}
              disabled={!formChanged}
              icon={<SaveOutlined />}
            >
              Save Settings
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};
