"use client";

import { Avatar, Card, Skeleton, Space, Button, Tag } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CarOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { TabKey, UserData } from "../UserProfile";
import type { BookingStatus } from "./BookingTab";

interface HomeTabProps {
  userData: UserData;
  loading: boolean;
  handleTabChange: (key: TabKey) => void;
}

export const HomeTab = ({
  userData,
  loading,
  handleTabChange,
}: HomeTabProps) => {
  // Sample recent bookings data
  const recentBookings = [
    {
      id: "BK-2023-001",
      vehicle: "Toyota Camry",
      startDate: "2023-04-10",
      endDate: "2023-04-15",
      status: "Completed" as BookingStatus,
    },
    {
      id: "BK-2023-002",
      vehicle: "Honda Civic",
      startDate: "2023-05-20",
      endDate: "2023-05-25",
      status: "Upcoming" as BookingStatus,
    },
  ];

  const accountSections = [
    {
      title: "Personal Information",
      desc: "Name, email, phone",
      tab: "personal" as TabKey,
    },
    {
      title: "Security Settings",
      desc: "Password settings",
      tab: "security" as TabKey,
    },
    {
      title: "Privacy Preferences",
      desc: "Notification settings",
      tab: "privacy" as TabKey,
    },
  ];

  const getStatusTag = (status: BookingStatus) => {
  const colors: Record<BookingStatus, string> = {
    Completed: "success",
    Upcoming: "processing",
    Cancelled: "error",
  };

  return <Tag color={colors[status]}>{status}</Tag>;
};

  return (
    <div className="space-y-6">
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <Skeleton loading={loading} active avatar>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"
              style={{
                width: "110px",
                height: "110px",
                boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
              }}
            >
              {userData.profileImage ? (
                <img
                  src={userData.profileImage}
                  alt="User avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500"
                />
              )}
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1 mt-4 sm:mt-0">
              <h3 className="text-xl sm:text-2xl font-bold">{userData.name}</h3>
              <Space direction="vertical" size={4} className="w-full">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <MailOutlined />
                  <span className="text-sm sm:text-base">{userData.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <PhoneOutlined />
                  <span className="text-sm sm:text-base">
                    {userData.phoneNumber}
                  </span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <EnvironmentOutlined />
                  <span className="text-sm sm:text-base">
                    {userData?.location}
                  </span>
                </div>
              </Space>
            </div>
          </div>
        </Skeleton>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title={<span className="text-base sm:text-lg">Recent Bookings</span>}
          className="shadow-md hover:shadow-lg transition-shadow"
          extra={
            <Button type="link" onClick={() => handleTabChange("bookings")}>
              View All
            </Button>
          }
        >
          <Skeleton loading={loading} active>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar icon={<CarOutlined />} className="bg-blue-500" />
                    <div>
                      <p className="font-medium">{booking.vehicle}</p>
                      <p className="text-xs text-gray-500">
                        {booking.startDate} to {booking.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="ml-10 sm:ml-0">
                    {getStatusTag(booking.status)}
                  </div>
                </div>
              ))}
            </div>
          </Skeleton>
        </Card>

        <Card
          title={<span className="text-base sm:text-lg">Account Overview</span>}
          className="shadow-md hover:shadow-lg transition-shadow"
        >
          <Skeleton loading={loading} active>
            <div className="space-y-4">
              {accountSections.map((section) => (
                <div
                  key={section.title}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-2"
                >
                  <div>
                    <p className="font-medium">{section.title}</p>
                    <p className="text-xs text-gray-500">{section.desc}</p>
                  </div>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleTabChange(section.tab)}
                    className="ml-0 pl-0 sm:ml-auto"
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </Skeleton>
        </Card>
      </div>
    </div>
  );
};
