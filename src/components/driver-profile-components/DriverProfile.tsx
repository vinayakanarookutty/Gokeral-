import { useState, useEffect } from "react";
import { DriverHeader } from "./DriverHeader"; // Reusing UserHeader as design is same
import { DriverSidebar } from "./DriverSidebar"; // Will modify sidebar content
import { DriverPersonalInfoTab } from "./tabs/DriverPersonalInfoTab"; // New component
import { BookingsTab } from "./tabs/BookingsTab"; // Placeholder, to be discussed later
import { VehicleTab } from "./tabs/VehicleTab"; // Placeholder, to be discussed later
import { SettingsTab } from "./tabs/SettingsTab"; // Placeholder, to be discussed later
import { Button, Spin } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import type { JSX } from "react/jsx-runtime";
import "../styles/UserProfile.css"; // Same styles
import axios from "axios";

export type TabKey = "personal" | "bookings" | "vehicle" | "settings";

export type DriverData = {
  imageUrl: string;
  name: string;
  email: string;
  phone: number;
  drivinglicenseNo: string;
  personalInfo: Record<string, any>;
};

export const DriverProfile = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("personal");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [loading, setLoading] = useState(true);
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  async function getDriverDetails() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/driverDetails`, // Updated endpoint
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          params: {
            id: localStorage.getItem("driverEmail"), // Updated to driverEmail
          },
        }
      );

      setDriverData(response.data.userData);
      console.log(response.data)
      setLoading(false);
      setTimeout(() => setFadeIn(true), 100);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching driver data:", error);
    }
  }

  useEffect(() => {
    getDriverDetails();
  }, []);

  const navigate = (path: string) => {
    console.log(`Navigating to: ${path}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("driverEmail"); // Updated to driverEmail
    localStorage.removeItem("userType");
    localStorage.removeItem("token");
    window.location.href = "/driverLogin";
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
        setSidebarOpen(window.innerWidth > 768);
      };

      window.addEventListener("resize", handleResize);
      handleResize();

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  const handleTabChange = (key: TabKey) => {
    setFadeIn(false);
    setTimeout(() => {
      setActiveTab(key);
      if (windowWidth <= 768) setSidebarOpen(false);
      setTimeout(() => setFadeIn(true), 100);
    }, 200);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

 const updateDriverData = async (values: Partial<DriverData>) => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    console.log(values);

    await axios.post(
      `${import.meta.env.VITE_API_URL}/updateDriver`,
      { ...values }, // send updated fields in body
      {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      }
    );

    getDriverDetails();
    setDriverData((prev) => (prev ? { ...prev, ...values } : null));
    setLoading(false);
  } catch (error) {
    setLoading(false);
    console.error("Error updating driver data:", error);
  }
};


  if (loading && !driverData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!driverData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-500 mb-2">
            Unable to load profile
          </h2>
          <p className="text-gray-600 mb-4">
            We couldn't retrieve your profile information. Please try again
            later.
          </p>
          <Button type="primary" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const tabContent: Record<TabKey, JSX.Element> = {
    personal: (
      <DriverPersonalInfoTab
        driverData={driverData}
        loading={loading}
        updateDriverData={updateDriverData}
      />
    ),
    bookings: <BookingsTab loading={loading} />, // Placeholder
    vehicle: <VehicleTab loading={loading} />, // Placeholder
    settings: <SettingsTab loading={loading} />, // Placeholder
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <DriverHeader
        navigate={navigate}
        handleLogout={handleLogout}
        username={driverData.name}
      />

      <div className="flex relative container mx-auto">
        <Button
          type="default"
          icon={<MenuOutlined />}
          className={`md:hidden fixed top-20 left-4 z-30 bg-white shadow-md
            hover:bg-blue-50 transition-all duration-300 ${
              sidebarOpen ? "rotate-90" : ""
            }`}
          onClick={toggleSidebar}
          size="middle"
        />

        <DriverSidebar
          driverData={driverData} // Using driverData
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          handleLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          windowWidth={windowWidth}
          toggleSidebar={toggleSidebar}
        />

        <div className="flex-1 p-4 md:p-6 pt-24 md:pt-24 min-h-screen w-full transition-all duration-300 ease-in-out">
          <div
            className={`max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-6
              transition-opacity duration-300 ease-in-out
              ${fadeIn ? "opacity-100" : "opacity-0"}`}
          >
            {loading ? (
              <div className="flex justify-center items-center min-h-64">
                <Spin size="large" />
              </div>
            ) : (
              tabContent[activeTab]
            )}
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm py-4">
            <p>
              © {new Date().getFullYear()} Your Company. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
