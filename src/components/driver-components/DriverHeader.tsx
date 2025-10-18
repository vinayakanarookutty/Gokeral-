import React, { useState, useEffect } from "react";
import { Typography, Button, Badge, Avatar, Dropdown, Drawer } from "antd";
import {
  BellOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
  CarOutlined,
  DollarOutlined,
  ScheduleOutlined,
  SettingOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { MenuProps } from "antd";

const { Title } = Typography;

// Define prop types for the DriverHeader component
interface DriverHeaderProps {
  navigate: (path: string) => void;
  logoutUser: () => void;
  driverName?: string;
  logoSrc: string;
  tripCount?: number;
  notificationCount?: number;
}

export const DriverHeader: React.FC<DriverHeaderProps> = ({
  navigate,
  logoutUser,
  driverName = "Driver",
  logoSrc,
  tripCount = 0,
  notificationCount = 0,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [screenSize, setScreenSize] = useState<string>("md");

  // More granular screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setScreenSize("xs");
      } else if (width < 640) {
        setScreenSize("sm");
      } else if (width < 768) {
        setScreenSize("md");
      } else if (width < 1024) {
        setScreenSize("lg");
      } else {
        setScreenSize("xl");
      }
    };

    // Set initial state
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const isMobile = screenSize === "xs" || screenSize === "sm";
  const isSmallScreen = screenSize === "xs";

  // Driver-specific menu items
  const driverMenuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      onClick: () => navigate("/driver/dashboard"),
    },
    {
      key: "profile",
      label: "My Profile",
      icon: <UserOutlined />,
      onClick: () => navigate("/driver/profile"),
    },
    {
      key: "trips",
      label: "My Trips",
      icon: <CarOutlined />,
      onClick: () => navigate("/driver/trips"),
    },
    {
      key: "schedule",
      label: "My Schedule",
      icon: <ScheduleOutlined />,
      onClick: () => navigate("/driver/schedule"),
    },
    {
      key: "earnings",
      label: "Earnings",
      icon: <DollarOutlined />,
      onClick: () => navigate("/driver/earnings"),
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
      onClick: () => navigate("/driver/settings"),
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: () => {
        logoutUser();
        navigate("/driverLogin");
      },
    },
  ];

  // Convert to Ant Design menu props format
  const menuProps: MenuProps = {
    items: driverMenuItems.map((item) => ({
      key: item.key,
      label: item.label,
      icon: item.icon,
      onClick: item.onClick,
    })),
  };

  // Function to handle safe navigation and menu closing
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="py-2 px-2 sm:py-3 sm:px-3 md:py-4 md:px-6 lg:px-10 border-b-2 border-black/10 flex items-center justify-between bg-white sticky top-0 z-50 shadow-sm">
      {/* Logo section - Adaptive sizing */}
      <div className="flex items-center">
        <img
          src={logoSrc}
          alt="Go Kerala Logo"
          className="h-8 w-auto xs:h-9 sm:h-10 md:h-12 lg:h-16 xl:h-20 transition-all duration-200"
        />
        <Title
          level={isSmallScreen ? 5 : isMobile ? 4 : 3}
          className="!mb-0 hidden xs:block ml-1 xs:ml-2 truncate max-w-[80px] sm:max-w-[120px] md:max-w-full"
          style={{
            fontSize: isSmallScreen ? "16px" : isMobile ? "18px" : undefined,
          }}
        >
          Go Kerala
        </Title>
      </div>

      {/* Center section - Quick Actions for drivers (visible on md+ screens) */}
      <div className="hidden md:flex items-center gap-2 lg:gap-4">
        <Button
          type="primary"
          onClick={() => navigate("/driver/new-trips")}
          className="bg-green-500 px-2 lg:px-4 text-xs lg:text-sm"
          size={isMobile ? "small" : "middle"}
        >
          Available Trips {tripCount > 0 && `(${tripCount})`}
        </Button>
        <Button
          onClick={() => navigate("/driver/trips")}
          className="px-2 lg:px-4 text-xs lg:text-sm"
          size={isMobile ? "small" : "middle"}
        >
          My Trips
        </Button>
      </div>

      {/* Right section - Driver Actions */}
      <div className="flex items-center gap-1 xs:gap-2 md:gap-4">
        {/* Notifications */}
        <Badge
          count={notificationCount}
          size={isSmallScreen ? "small" : undefined}
        >
          <Button
            type="text"
            icon={<BellOutlined />}
            onClick={() => navigate("/driver/notifications")}
            size={isSmallScreen ? "small" : "middle"}
            className="flex items-center justify-center"
            style={{ padding: isSmallScreen ? "4px 8px" : undefined }}
          />
        </Badge>

        {/* Driver dropdown - visible on medium+ screens */}
        <div className="hidden md:block">
          <Dropdown menu={menuProps} placement="bottomRight">
            <Button type="text" className="flex items-center gap-1 lg:gap-2">
              <Avatar
                size={isSmallScreen ? "small" : "default"}
                icon={<UserOutlined />}
              />
              <span className="hidden lg:inline-block truncate max-w-[80px] xl:max-w-[120px]">
                {driverName}
              </span>
            </Button>
          </Dropdown>
        </div>

        {/* Logout button - visible on medium+ screens */}
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={() => {
            logoutUser();
            navigate("/driverLogin");
          }}
          className="hidden md:flex"
          size={isSmallScreen ? "small" : "middle"}
        />

        {/* Mobile Menu Button */}
        <Button
          className="md:hidden flex items-center justify-center"
          size={isSmallScreen ? "small" : "middle"}
          onClick={() => setIsMenuOpen(true)}
          style={{ padding: isSmallScreen ? "4px 8px" : undefined }}
        >
          <MenuOutlined />
        </Button>
      </div>

      {/* Mobile drawer menu with adaptive width */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <Avatar
              size={isSmallScreen ? "small" : "default"}
              icon={<UserOutlined />}
            />
            <span className="truncate max-w-[180px]">{driverName}</span>
          </div>
        }
        placement="right"
        onClose={() => setIsMenuOpen(false)}
        open={isMenuOpen}
        width={isSmallScreen ? "85%" : isMobile ? "75%" : "280px"}
        bodyStyle={{ padding: isSmallScreen ? "12px" : "16px" }}
        headerStyle={{ padding: isSmallScreen ? "8px 12px" : "12px 16px" }}
      >
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Quick action buttons in drawer */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mb-2">
            <Button
              type="primary"
              onClick={() => handleNavigation("/driver/new-trips")}
              className="bg-green-500"
              size={isSmallScreen ? "small" : "middle"}
            >
              Available Trips {tripCount > 0 && `(${tripCount})`}
            </Button>
            <Button
              onClick={() => handleNavigation("/driver/trips")}
              size={isSmallScreen ? "small" : "middle"}
            >
              My Trips
            </Button>
          </div>

          {/* Divider for visual separation */}
          <div className="border-t border-gray-200 my-1"></div>

          {/* Menu items */}
          {driverMenuItems.map((item) => (
            <Button
              key={item.key}
              block
              icon={item.icon}
              onClick={() => {
                item.onClick();
                setIsMenuOpen(false);
              }}
              size={isSmallScreen ? "small" : "middle"}
              className={item.key === "logout" ? "mt-2" : ""}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </Drawer>
    </header>
  );
};
