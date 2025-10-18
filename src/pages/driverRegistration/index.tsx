/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Button, Checkbox, notification } from "antd";
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { Car } from "lucide-react";
import { useState } from "react";
import { authUtils } from "../../utils/auth";
// import { useUserStore } from "../../store/user";
// import Logo from "../../../public/gokeral.png";
import backgroundImage from "../../assets/backg2.png";
import { keralaLicenseValidator, formatKeralaLicense } from "../../validation";

interface RegistrationFormData {
    name: string;
    email: string;
    phone: string;
    drivinglicenseNo: string;
    password: string;
    confirmpassword: string;
    agreement: boolean;
}

interface RegistrationResponse {
    status: number;
    message?: string;
    user?: {
        email: string;
        name: string;
    };
}

type NotificationType = "success" | "info" | "warning" | "error";

const DriverRegistration = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [api, contextHolder] = notification.useNotification();
    // const login = useUserStore((state: any) => state?.loginUser);

    const openNotificationWithIcon = (
        type: NotificationType,
        message: string,
        description?: string,
    ) => {
        api[type]({
            message: message,
            description: description,
            placement: "topRight",
            duration: 4.5,
        });
    };

    const onFinish = async (values: RegistrationFormData) => {
        console.log("Registration data:", JSON.stringify({ email: values.email, name: values.name }, null, 2));
        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/driversignup`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: RegistrationResponse = await response.json();

            console.log("Registration success:", JSON.stringify({ status: data.status, message: data.message }, null, 2));

            if (data.status === 201) {
                openNotificationWithIcon(
                    "success",
                    "Registration successful!",
                    "Welcome to our driver network! You will be redirected to the login page.",
                );

                // Navigate after a brief delay to show success message
                setTimeout(() => {
                    navigate("/driverLogin");
                }, 1000);
            } else {
                handleRegistrationError(data.message || "Registration failed");
            }
        } catch (error: any) {
            console.error("Registration error:", error.message || 'Unknown error');
            
            if (error.message.includes('409')) {
                openNotificationWithIcon(
                    "error",
                    "Email Already Exists",
                    "An account with this email already exists.",
                );
                form.setFields([{ name: "email", errors: ["Email already registered"] }]);
            } else if (error.message.includes('500')) {
                openNotificationWithIcon(
                    "error",
                    "Server Error",
                    "Error creating driver account. Please try again.",
                );
            } else {
                openNotificationWithIcon(
                    "error",
                    "Network Error",
                    "Please check your connection and try again.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrationError = (errorMessage: string) => {
        switch (errorMessage) {
            case "Email already exists":
                openNotificationWithIcon(
                    "error",
                    "Email already registered",
                    "An account with this email already exists. Please use a different email or try logging in.",
                );
                form.setFields([
                    {
                        name: "email",
                        errors: ["Email already exists"],
                    },
                ]);
                break;
            default:
                openNotificationWithIcon(
                    "error",
                    "Registration failed",
                    "Please check your information and try again.",
                );
        }
    };

    const onFinishFailed = (errorInfo: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.log("Form validation failed:", JSON.stringify(errorInfo, null, 2));
        openNotificationWithIcon(
            "error",
            "Validation Error",
            "Please check all required fields and correct any errors.",
        );
    };

    return (
        <main className="min-h-screen relative grid place-items-center bg-gradient-to-br from-green-50 to-blue-50">
            {contextHolder}

            {/* Background overlay */}
            <div className="min-h-screen absolute top-0 left-0 w-full bg-gradient-to-r from-green-50/50 to-blue-50/50 backdrop-blur-sm"></div>

            {/* Main content card */}
            <section className="z-10 bg-white/95 backdrop-blur-md sm:w-[90vw] lg:w-[70vw] xl:w-[60vw] min-h-[70vh] rounded-3xl shadow-2xl p-6 grid md:grid-cols-[1fr,40%] gap-6 border border-white/20">
                <Form
                    form={form}
                    name="driver_registration"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    layout="vertical"
                    className="p-5 relative z-10"
                    autoComplete="off"
                    size="large"
                >
                    {/* title */}
                    <div className="text-2xl sm:text-3xl font-extrabold mb-6">
                        <h1 className="text-gray-800">Partner with Us</h1>
                        <h1 className="text-base sm:text-lg font-bold text-green-600">
                            Join our professional driver network
                        </h1>
                    </div>

                    {/* form inputs  */}
                    <div className="grid gap-3">
                        <Form.Item
                            className="mb-4"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your full name!",
                                },
                                {
                                    min: 2,
                                    message:
                                        "Name must be at least 2 characters long!",
                                },
                            ]}
                        >
                            <Input
                                prefix={
                                    <UserOutlined className="text-green-500" />
                                }
                                placeholder="Full Name"
                                className="h-12 rounded-xl border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                                autoComplete="name"
                            />
                        </Form.Item>

                        {/* email and phone  */}
                        <div className="grid sm:grid-cols-2 gap-5">
                            <Form.Item
                                className="mb-4"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please input your email!",
                                    },
                                    {
                                        type: "email",
                                        message:
                                            "Please enter a valid email address!",
                                    },
                                ]}
                            >
                                <Input
                                    prefix={
                                        <MailOutlined className="text-green-500" />
                                    }
                                    placeholder="Email Address"
                                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                                    autoComplete="email"
                                />
                            </Form.Item>

                            <Form.Item
                                className="mb-4"
                                name="phone"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please input your phone number!",
                                    },
                                    {
                                        pattern: /^[0-9]{10}$/,
                                        message:
                                            "Please enter a valid 10-digit phone number!",
                                    },
                                ]}
                            >
                                <Input
                                    prefix={
                                        <PhoneOutlined className="text-green-500" />
                                    }
                                    placeholder="Phone Number"
                                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                                    maxLength={10}
                                    autoComplete="tel"
                                />
                            </Form.Item>
                        </div>

                        <Form.Item
                            className="mb-4"
                            name="drivinglicenseNo"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Please input your driving license number!",
                                },
                                {
                                    validator: keralaLicenseValidator,
                                },
                            ]}
                            extra="Format: KL-DD-YYYY-NNNNNNN (e.g., KL-07-2023-1234567) where DD is district code (01-14)"
                        >
                            <Input
                                prefix={
                                    <Car className="text-green-500" size={16} />
                                }
                                placeholder="KL-07-2023-1234567"
                                className="h-12 rounded-xl border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                                onBlur={(e) => {
                                    const formatted = formatKeralaLicense(e.target.value);
                                    if (formatted !== e.target.value) {
                                        form.setFieldsValue({ drivinglicenseNo: formatted });
                                    }
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            className="mb-4"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your password!",
                                },
                                {
                                    min: 6,
                                    message:
                                        "Password must be at least 6 characters long!",
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={
                                    <LockOutlined className="text-green-500" />
                                }
                                placeholder="Password"
                                className="h-12 rounded-xl border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                                autoComplete="new-password"
                            />
                        </Form.Item>

                        <Form.Item
                            className="mb-4"
                            name="confirmpassword"
                            rules={[
                                {
                                    required: true,
                                    message: "Please confirm your password!",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (
                                            !value ||
                                            getFieldValue("password") === value
                                        ) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error(
                                                "The two passwords do not match!",
                                            ),
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={
                                    <LockOutlined className="text-green-500" />
                                }
                                placeholder="Confirm Password"
                                className="h-12 rounded-xl border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                                autoComplete="new-password"
                            />
                        </Form.Item>

                        <Form.Item
                            className="mb-6"
                            name="agreement"
                            valuePropName="checked"
                            rules={[
                                {
                                    validator: (_, value) =>
                                        value
                                            ? Promise.resolve()
                                            : Promise.reject(
                                                  "Please accept the agreement",
                                              ),
                                },
                            ]}
                        >
                            <Checkbox className="text-gray-600">
                                I agree to the{" "}
                                <Link
                                    to="/terms"
                                    className="text-green-600 hover:text-green-800 font-medium"
                                >
                                    Terms and Conditions
                                </Link>
                            </Checkbox>
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-semibold text-base"
                        >
                            {loading ? "Registering..." : "Join Our Team"}
                        </Button>

                        <div className="text-center mt-4">
                            <p className="text-gray-600">
                                Already have an account?{" "}
                                <Link
                                    to="/driverLogin"
                                    className="font-semibold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent hover:from-green-500 hover:to-green-600 transition-all duration-200"
                                >
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>
                </Form>

                {/* Image Section */}
                <div className="hidden md:flex items-center justify-center">
                    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl">
                        <img
                            src={backgroundImage}
                            alt="Professional driver registration illustration"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent"></div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default DriverRegistration;
