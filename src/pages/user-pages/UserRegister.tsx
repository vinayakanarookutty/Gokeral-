
import { useState } from "react";
import {
    LockOutlined,
    MailOutlined,
    UserOutlined,
    PhoneOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
} from "@ant-design/icons";
import { Form, Input, Button, notification, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../../assets/backg2.png";
import axios, { AxiosError } from "axios";


interface RegisterFormData {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

interface RegisterResponse {
    status: number;
    message: string;
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

interface ErrorResponse {
    message: string;
    errors?: {
        [key: string]: string[];
    };
}

type NotificationType = "success" | "info" | "warning" | "error";

export const UserRegister = () => {
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
            style: {
                borderRadius: "12px",
            },
        });
    };

    const onFinish = async (values: RegisterFormData) => {
        setLoading(true);

        try {
            console.log("Registration data:", JSON.stringify({ email: values.email, name: values.name }, null, 2));

            const response = await axios.post<RegisterResponse>(
                `${import.meta.env.VITE_API_URL}/signup`,
                values,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            const data = response.data;
            console.log("Registration success:", JSON.stringify({ status: data.status, message: data.message }, null, 2));

            // Check for backend error responses that come with 200 status
            if (data.statusCode && data.statusCode !== 201) {
                handleRegistrationError({ response: { status: data.statusCode, data } } as AxiosError<ErrorResponse>);
                return;
            }

            if (data.status === 201) {
                openNotificationWithIcon(
                    "success",
                    "Registration Successful!",
                    "Your account has been created. Please login to continue.",
                );

                form.resetFields();
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            } else {
                openNotificationWithIcon(
                    "error",
                    "Registration Failed",
                    data.message || "Something went wrong during registration.",
                );
            }
        } catch (error) {
            console.error("Registration error:", error.message || 'Unknown error');
            handleRegistrationError(error as AxiosError<ErrorResponse>);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrationError = (error: AxiosError<ErrorResponse>) => {
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    // Bad request - validation errors
                    if (data?.errors) {
                        // Handle field-specific validation errors
                        const fieldErrors = Object.entries(data.errors).map(
                            ([field, messages]) => ({
                                name: field,
                                errors: messages,
                            }),
                        );
                        form.setFields(fieldErrors);

                        openNotificationWithIcon(
                            "error",
                            "Validation Error",
                            "Please check the highlighted fields and try again.",
                        );
                    } else {
                        openNotificationWithIcon(
                            "error",
                            "Invalid Data",
                            data?.message ||
                                "Please check your input and try again.",
                        );
                    }
                    break;
                case 409:
                    // Conflict - email already exists
                    openNotificationWithIcon(
                        "error",
                        "Email Already Exists",
                        "An account with this email address already exists.",
                    );
                    form.setFields([
                        {
                            name: "email",
                            errors: ["This email is already registered"],
                        },
                    ]);
                    break;
                case 422:
                    // Unprocessable entity - validation failed
                    openNotificationWithIcon(
                        "error",
                        "Validation Failed",
                        data?.message || "Please check your input data.",
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
                        "Registration Failed",
                        data?.message || "An unexpected error occurred.",
                    );
            }
        } else if (error.request) {
            // Network error
            openNotificationWithIcon(
                "error",
                "Connection Error",
                "Unable to connect to the server. Please check your internet connection.",
            );
        } else {
            // Other error
            openNotificationWithIcon(
                "error",
                "Registration Failed",
                "An unexpected error occurred. Please try again.",
            );
        }
    };

    const onFinishFailed = (errorInfo: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.log("Form validation failed:", JSON.stringify(errorInfo, null, 2));
        openNotificationWithIcon(
            "warning",
            "Validation Error",
            "Please check all required fields and try again.",
        );
    };

    return (
        <main className="min-h-screen relative grid place-items-center w-full px-4 py-8 bg-gradient-to-br from-green-50 to-blue-50">
            {contextHolder}

            {/* Background */}
            <div className="min-h-screen absolute top-0 left-0 w-full bg-gradient-to-r from-green-50/50 to-blue-50/50 backdrop-blur-sm"></div>

            {/* Content */}
            <section className="z-10 bg-white/95 backdrop-blur-md w-full max-w-6xl min-h-[70vh] rounded-3xl shadow-2xl grid md:grid-cols-2 border border-white/20 overflow-hidden">
                {/* Form - Left side */}
                <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center order-1">
                    <Form
                        form={form}
                        name="user_registration"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        layout="vertical"
                        autoComplete="off"
                        size="large"
                        className="w-full"
                    >
                        {/* Title */}
                        <div className="mb-8">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
                                Create Account
                            </h1>
                            <p className="text-lg font-medium text-green-600">
                                Join our platform today
                            </p>
                        </div>

                        {/* Form inputs */}
                        <div className="space-y-4">
                            <Form.Item
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter your full name",
                                    },
                                    {
                                        min: 2,
                                        message:
                                            "Name must be at least 2 characters long",
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
                                        <MailOutlined className="text-green-500" />
                                    }
                                    placeholder="Email Address"
                                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                                    autoComplete="email"
                                />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please enter your phone number",
                                    },
                                    {
                                        pattern: /^[0-9]{10}$/,
                                        message:
                                            "Please enter a valid 10-digit phone number",
                                    },
                                ]}
                            >
                                <Input
                                    prefix={
                                        <PhoneOutlined className="text-green-500" />
                                    }
                                    placeholder="Phone Number (10 digits)"
                                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                                    autoComplete="tel"
                                    maxLength={10}
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
                                            "Password must be at least 6 characters long",
                                    },
                                    {
                                        pattern:
                                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message:
                                            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                                    },
                                ]}
                                hasFeedback
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
                                    autoComplete="new-password"
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                dependencies={["password"]}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please confirm your password",
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (
                                                !value ||
                                                getFieldValue("password") ===
                                                    value
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
                                hasFeedback
                            >
                                <Input.Password
                                    prefix={
                                        <LockOutlined className="text-green-500" />
                                    }
                                    placeholder="Confirm Password"
                                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                                    iconRender={(visible) =>
                                        visible ? (
                                            <EyeTwoTone />
                                        ) : (
                                            <EyeInvisibleOutlined />
                                        )
                                    }
                                    autoComplete="new-password"
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
                                            <Spin
                                                size="small"
                                                className="mr-2"
                                            />
                                            Creating Account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </Form.Item>

                            <div className="space-y-3 text-center">
                                <p className="text-gray-600">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="font-semibold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent hover:from-green-500 hover:to-green-600 transition-all duration-200"
                                    >
                                        Login here
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
                                    className="inline-flex items-center justify-center w-full h-11 px-4 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 hover:text-green-800 transition-all duration-200"
                                >
                                    Register as a Driver
                                </Link>
                            </div>
                        </div>
                    </Form>
                </div>

                {/* Image - Right side */}
                <div className="hidden md:block order-2 relative">
                    <div className="h-full w-full overflow-hidden">
                        <img
                            src={backgroundImage}
                            alt="User registration illustration"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-green-900/20 to-transparent"></div>
                    </div>
                </div>
            </section>
        </main>
    );
};