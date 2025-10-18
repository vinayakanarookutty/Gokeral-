import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { UserHeader } from "./UserHeader";

import Maps from "../../pages/maps";
// import DirectionsApp from "../../pages/maps";


export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [username] = useState<string>("User");
  const [windowWidth, setWindowWidth] = useState<any>(window.innerWidth);

  useEffect(() => {
    // Check if user is logged in
    // const token = localStorage.getItem("token");
    // if (!token) {
    //   navigate("/login");
    // }

    // You can fetch and set the actual username here
    // Example: setUsername(localStorage.getItem("username") || "User");

    // Handle window resize for responsive adjustments
    const handleResize = () => {
      setWindowWidth(windowWidth.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    navigate("/login");
  };



  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 to-indigo-50">
      {/* Header Component */}
      <UserHeader
        navigate={navigate}
        handleLogout={handleLogout}
        username={username}
      />
      {/* <DirectionsApp/>  */}
      {/* <DirectionsApp /> */}
    <Maps/>
{/* <Map/> */}
      {/* Main Content */}
    </div>
  );
};
