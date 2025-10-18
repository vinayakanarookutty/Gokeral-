
import { useState } from "react";
import backgroundImage from "../../assets/back3.png";
import {
    LockOutlined,
    MailOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
} from "@ant-design/icons";
import { Form, Input, Button, notification, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { authUtils } from "../../utils/auth";

interface LoginFormData {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
    token?: string;
    user?: {
        email: string;
        name: string;
    };
}

type NotificationType = "success" | "info" | "warning" | "error";

const DriverLogin = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [api, contextHolder] = notification.useNotification();

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

    const onFinish = async (values: LoginFormData) => {
        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/driverlogin`,
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

            const data: LoginResponse = await response.json();

            if (data.message === "Login Successful" && data.token) {
                openNotificationWithIcon(
                    "success",
                    "Login successful!",
                    "Welcome back!",
                );
                authUtils.setToken(data.token);
                localStorage.setItem("token", data.token);
                // Store user data if available
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                }

                // Navigate after a brief delay to show success message
                setTimeout(() => {
                    navigate("/driverProfile");
                }, 1000);
            } else {
                openNotificationWithIcon(
                    "error",
                    "Login failed",
                    "Please check your credentials and try again.",
                );
            }
        } catch (error: any) {
            console.error("Login error:", error.message || 'Unknown error');
            
            if (error.message.includes('404')) {
                openNotificationWithIcon(
                    "error",
                    "Account Not Found",
                    "No driver account exists with this email address.",
                );
                form.setFields([{ name: "email", errors: ["Account not found"] }]);
            } else if (error.message.includes('401')) {
                openNotificationWithIcon(
                    "error",
                    "Invalid Password",
                    "Please check your password and try again.",
                );
                form.setFields([{ name: "password", errors: ["Invalid password"] }]);
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



    const onFinishFailed = (errorInfo: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.log("Form validation failed:", JSON.stringify(errorInfo, null, 2));
        openNotificationWithIcon(
            "error",
            "Validation Error",
            "Please check all required fields.",
        );
    };

    return (
        <main className="min-h-screen relative grid place-items-center bg-gradient-to-br from-green-50 to-blue-50">
            {contextHolder}

            {/* Background overlay */}
            <div className="min-h-screen absolute top-0 left-0 w-full bg-gradient-to-r from-green-50/50 to-blue-50/50 backdrop-blur-sm"></div>

            {/* Main content card */}
            <section className="z-10 bg-white/95 backdrop-blur-md sm:w-[90vw] lg:w-[70vw] xl:w-[60vw] min-h-[60vh] rounded-3xl shadow-2xl p-6 grid md:grid-cols-[1fr,50%] gap-6 border border-white/20">
                {/* Login Form */}
                <div className="flex flex-col justify-center order-2 md:order-1">
                    <div className="mb-8">
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-green-600 mb-2">
                            Driver Login
                        </h1>
                        <p className="text-lg font-medium text-gray-600">
                            Access your professional driver account
                        </p>
                    </div>

                    <Form
                        form={form}
                        name="driver_login"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        layout="vertical"
                        autoComplete="off"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your email address",
                                },
                                {
                                    type: "email",
                                    message:
                                        "Please enter a valid email address",
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
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your password",
                                },
                                {
                                    min: 6,
                                    message:
                                        "Password must be at least 6 characters",
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={
                                    <LockOutlined className="text-green-500" />
                                }
                                placeholder="Password"
                                className="h-12 rounded-xl border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                                iconRender={(visible) =>
                                    visible ? (
                                        <EyeTwoTone />
                                    ) : (
                                        <EyeInvisibleOutlined />
                                    )
                                }
                                autoComplete="current-password"
                            />
                        </Form.Item>

                        <Form.Item className="mb-6">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-semibold text-base"
                            >
                                {loading ? (
                                    <>
                                        <Spin size="small" className="mr-2" />
                                        Signing In...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </Form.Item>

                        <div className="text-center">
                            <p className="text-gray-600">
                                Don't have an account?{" "}
                                <Link
                                    to="/driverRegistration"
                                    className="font-semibold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent hover:from-green-500 hover:to-green-600 transition-all duration-200"
                                >
                                    Register here
                                </Link>
                            </p>

                            <Link
                                to="/forgot-password"
                                className="inline-block mt-3 text-sm text-gray-500 hover:text-green-600 transition-colors duration-200"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </Form>
                </div>

                {/* Image Section */}
                <div className="hidden md:flex items-center justify-center order-1 md:order-2">
                    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl">
                        <img
                            src={backgroundImage}
                            alt="Professional driver illustration"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent"></div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default DriverLogin;
