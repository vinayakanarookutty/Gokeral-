import { Avatar, Button, Tabs } from "antd";
import {
  UserOutlined,
  CarOutlined,
  SettingOutlined,
  LogoutOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { TabKey, DriverData } from "./DriverProfile";

interface DriverSidebarProps {
  driverData: DriverData;
  activeTab: TabKey;
  handleTabChange: (key: TabKey) => void;
  handleLogout: () => void;
  sidebarOpen: boolean;
  windowWidth: number;
  toggleSidebar: () => void;
}

export const DriverSidebar = ({
  driverData,
  activeTab,
  handleTabChange,
  handleLogout,
  sidebarOpen,
  windowWidth,
  toggleSidebar,
}: DriverSidebarProps) => {
  const tabItems = [
    { key: "personal", label: "Personal Info", icon: <UserOutlined /> },
    { key: "bookings", label: "Bookings", icon: <CarOutlined /> },
    { key: "vehicle", label: "Vehicle", icon: <CarOutlined /> },
    { key: "settings", label: "Settings", icon: <SettingOutlined /> },
  ];

  return (
    <>
      <div
        className={`
          fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:shadow-none
        `}
      >
        <div className="p-4 h-full flex flex-col">
          {windowWidth <= 768 && (
            <Button
              type="text"
              icon={<CloseOutlined />}
              className="absolute top-4 right-4 md:hidden"
              onClick={toggleSidebar}
            />
          )}

          <div className="flex flex-col items-center space-y-2 mb-6 pt-16 md:pt-8">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"
              style={{
                width: "90px",
                height: "90px",
                boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
              }}
            >
              {driverData.imageUrl ? (
                <img
                  src={driverData.imageUrl}
                  alt="Driver avatar"
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

            <h3 className="font-semibold text-lg">{driverData.name}</h3>
            <p className="text-sm text-gray-500">Driver Account</p>
          </div>

          <div className="border-t my-4"></div>

          <Tabs
            activeKey={activeTab}
            onChange={(key) => handleTabChange(key as TabKey)}
            tabPosition="left"
            className="driver-profile-tabs flex"
            items={tabItems.map((tab) => ({
              key: tab.key,
              label: (
                <span className="flex items-center">
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </span>
              ),
            }))}
          />

          <div className="border-t my-4"></div>

          <Button
            type="primary"
            danger
            className="w-full flex items-center justify-center"
            onClick={handleLogout}
            icon={<LogoutOutlined />}
          >
            Logout
          </Button>
        </div>
      </div>

      {sidebarOpen && windowWidth <= 768 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};
