import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserHeader } from "./UserHeader";
import Maps from "../../pages/maps";

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const username = "User";

  useEffect(() => {
    // Handle window resize if needed in future
    const handleResize = () => {};
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 to-indigo-50">
      <UserHeader
        navigate={navigate}
        handleLogout={handleLogout}
        username={username}
      />

      <div className="flex-1 p-4">
        <Maps />
      </div>
    </div>
  );
};
