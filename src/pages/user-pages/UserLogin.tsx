import { useState } from "react";
import {
    LockOutlined,
    MailOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
} from "@ant-design/icons";
import { Form, Input, Button, notification, Spin, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../../assets/back3.png";
import axios, { AxiosError } from "axios";
import ForgotPassword from "../../components/mailhelper";
import { authUtils } from "../../utils/auth";

interface LoginFormData {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
    token: string;
    user: {
        email: string;
        name?: string;
        id?: string;
    };
}

interface ErrorResponse {
    message: string;
    error?: string;
}

type NotificationType = "success" | "info" | "warning" | "error";

export const UserLogin = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [api, contextHolder] = notification.useNotification();
    const [open, setOpen] = useState(false);
    const showModal = () => {
        setOpen(true);
    };



    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
    };
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
            style: {
                borderRadius: "12px",
            },
        });
    };

    const onFinish = async (values: LoginFormData) => {
        setLoading(true);

        try {
            const response = await axios.post<LoginResponse>(
                `${import.meta.env.VITE_API_URL}/login`,
                values,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            const data = response.data;
            console.log("Login response:", JSON.stringify(data, null, 2));

            // Check if backend returned an HttpException object (backend bug)
            if (data.statusCode || data.message?.includes('NOT FOUND') || data.message?.includes('INCORRECT PASSWORD') || data.message?.includes('USER NOT FOUND')) {
                handleBackendErrorResponse(data);
                return;
            }

            // Show success notification
            openNotificationWithIcon(
                "success",
                "Welcome back!",
                "You have been successfully logged in.",
            );

            // Store JWT token and user data
            authUtils.setToken(data.token);
            localStorage.setItem("userEmail", data.user.email);
            
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            // Navigate after a brief delay to show success message
            setTimeout(() => {
                navigate("/userDashboard");
            }, 1000);
        } catch (error) {
            console.error("Login error:", error);
            
            // Check if it's an axios error with response data
            if (error.response?.data) {
                console.log("Error response data:", JSON.stringify(error.response.data, null, 2));
                
                // Check if the error response contains our expected error messages
                const errorData = error.response.data;
                if (errorData.message?.includes('USER NOT FOUND') || errorData.message?.includes('INCORRECT PASSWORD')) {
                    handleBackendErrorResponse(errorData);
                    return;
                }
            }
            
            handleLoginError(error as AxiosError<ErrorResponse>);
        } finally {
            setLoading(false);
        }
    };

    const handleBackendErrorResponse = (data: any) => {
        console.log("Backend error response:", JSON.stringify(data, null, 2));
        
        if (data.message?.includes('USER NOT FOUND') || data.message?.includes('NOT FOUND') || data.statusCode === 404) {
            openNotificationWithIcon(
                "error",
                "Account Not Found",
                "No account exists with this email address.",
            );
            form.setFields([{ name: "email", errors: ["Account not found"] }]);
        } else if (data.message?.includes('INCORRECT PASSWORD') || data.statusCode === 401) {
            openNotificationWithIcon(
                "error",
                "Invalid Password",
                "Please check your password and try again.",
            );
            form.setFields([{ name: "password", errors: ["Invalid password"] }]);
        } else {
            openNotificationWithIcon(
                "error",
                "Login Failed",
                data.message || "An unexpected error occurred.",
            );
        }
    };

    const handleLoginError = (error: AxiosError<ErrorResponse>) => {
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    openNotificationWithIcon(
                        "error",
                        "Invalid Credentials",
                        "Please check your email and password.",
                    );
                    form.setFields([
                        { name: "email", errors: ["Invalid credentials"] },
                        { name: "password", errors: ["Invalid credentials"] },
                    ]);
                    break;
                case 404:
                    openNotificationWithIcon(
                        "error",
                        "Account Not Found",
                        "No account exists with this email address.",
                    );
                    form.setFields([{ name: "email", errors: ["Account not found"] }]);
                    break;
                case 409:
                    openNotificationWithIcon(
                        "error",
                        "Conflict",
                        "Email already exists or account conflict.",
                    );
                    break;
                case 500:
                    openNotificationWithIcon(
                        "error",
                        "Server Error",
                        "Something went wrong on our end. Please try again later.",
                    );
                    break;
                default:
                    openNotificationWithIcon(
                        "error",
                        "Login Failed",
                        data?.message || "An unexpected error occurred.",
                    );
            }
        } else if (error.request) {
            openNotificationWithIcon(
                "error",
                "Connection Error",
                "Unable to connect to the server. Please check your internet connection.",
            );
        } else {
            openNotificationWithIcon(
                "error",
                "Login Failed",
                "An unexpected error occurred. Please try again.",
            );
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log("Form validation failed:", JSON.stringify(errorInfo, null, 2));
        openNotificationWithIcon(
            "warning",
            "Validation Error",
            "Please check all required fields and try again.",
        );
    };

    return (
        <main className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
            {contextHolder}

            {/* Background */}
            <div className="min-h-screen absolute top-0 left-0 w-full bg-gradient-to-r from-green-50/50 to-blue-50/50 backdrop-blur-sm"></div>

            {/* Content */}
            <section className="z-10 bg-white/95 backdrop-blur-md w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20">
                {/* Image - Left side on desktop, top on mobile */}
                <div className="w-full md:w-1/2 order-1">
                    <div className="relative h-40 sm:h-56 md:h-full min-h-[300px]">
                        <img
                            src={backgroundImage}
                            alt="User login illustration"
                            className="absolute w-full h-full object-cover"
                        />
                        {/* Overlay for better text visibility on small screens */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent md:bg-gradient-to-r md:from-green-900/20 md:to-transparent"></div>
                    </div>
                </div>

                {/* Form - Right side on desktop, bottom on mobile */}
                <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 order-2 flex flex-col justify-center">
                    <Form
                        form={form}
                        name="user_login"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        layout="vertical"
                        autoComplete="off"
                        size="large"
                        className="flex flex-col justify-center h-full"
                    >
                        {/* Title */}
                        <div className="mb-8">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                                Welcome Back
                            </h1>
                            <p className="text-lg font-medium text-green-600">
                                Sign in to your account
                            </p>
                        </div>

                        {/* Form inputs */}
                        <div className="space-y-5">
                            <Form.Item
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please enter your email address",
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
                                        <MailOutlined className="text-green-600" />
                                    }
                                    placeholder="Email Address"
                                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-green-400 focus:border-green-600 transition-all duration-200"
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
                                        <LockOutlined className="text-green-600" />
                                    }
                                    placeholder="Password"
                                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-green-400 focus:border-green-600 transition-all duration-200"
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
                            <div className="flex justify-end">
                                <span
                                    onClick={showModal}
                                    className="cursor-pointer text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200"
                                >
                                    Forgot Password
                                </span>
                            </div>



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
                                            <Spin
                                                size="small"
                                                className="mr-2"
                                            />
                                            Signing In...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </Form.Item>

                            <div className="space-y-3 text-center">
                                <p className="text-gray-600">
                                    Don't have an account?{" "}
                                    <Link
                                        to="/register"
                                        className="font-semibold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent hover:from-green-500 hover:to-green-600 transition-all duration-200"
                                    >
                                        Register here
                                    </Link>
                                </p>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-gray-500">
                                            or
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    to="/driverLogin"
                                    className="inline-flex items-center justify-center w-full h-11 px-4 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                                >
                                    Login as a Driver
                                </Link>
                            </div>
                        </div>
                    </Form>

                    <Modal
                        title="Forgot Password"
                        open={open}

                        onCancel={handleCancel}
                        footer={null} // Hides default OK/Cancel buttons
                    >
                        <ForgotPassword />
                    </Modal>
                </div>
            </section>
        </main>
    );
};
