import { useEffect, useState } from "react";
import { Typography, Button, message } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  CloseOutlined,
  BookOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../../../public/gokeral.png";

const { Title } = Typography;

import { useUserStore } from "../../store/user";
import { useQuery, } from "@tanstack/react-query";
import PersonalInfo from "../../components/driverProfile/PersonalInfo";
import Bookings from "../../components/driverProfile/Bookings";
import Settings from "../../components/driverProfile/Settings";
import DriverVehicle from "../../components/driverProfile/DriverVehicle";
import { DriverHeader } from "../../components/driver-components/DriverHeader";

interface UserDetails {
  email?: string;
  personalInformation?: any;
  imageUrl?: string;
}

interface Booking {
  user: any;
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  driverName: string;
  vehicleName: string;
  _id: string;
}

const NavLink = ({ icon, text, onClick, isActive }: any) => {
  return (
    <button
      className={`w-full flex items-center gap-2 py-3 px-5 sm:p-5 rounded-3xl ${
        isActive ? "bg-blue-500 text-white" : "bg-gray-100"
      }`}
      onClick={onClick}
    >
      {icon}
      {text}
    </button>
  );
};

const navLinks = [
  { text: "Personal Info", icon: <UserOutlined /> },
  { text: "Bookings", icon: <BookOutlined /> },
  { text: "Vehicle", icon: <CarOutlined /> },
  { text: "Settings", icon: <SettingOutlined /> },
];

export default function DriverProfile() {
  // const [userDetails, setUserDetails] = useState<UserDetails>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState(navLinks[0]);
  const [notificationCount, setNotificationCount] = useState(0);

  const navigate = useNavigate();
  const user = useUserStore((state: any) => state?.userDetails);
  const logoutUser = useUserStore((state: any) => state?.logoutUser);

  useEffect(() => {
    fetchBookings();
    setNotificationCount(5)
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/bookings`
      );
      const filteredBookings = user?.email
        ? response.data.filter(
            (booking: Booking) => booking?.user === user?.email
          )
        : response.data;
      setBookings(filteredBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };
  const token = localStorage.getItem("token");

  // useEffect(() => {
  //   const fetchUserDetails = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       console.log(token)
  //       if (!token) {
  //         console.error("No token found, please log in.");
  //         return;
  //       }

  //       const response = await fetch(
  //         `${import.meta.env.VITE_API_URL}/driverDetails`,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //             "x-auth-token": token, // Include auth token
  //           },
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error(`Error: ${response.status} ${response.statusText}`);
  //       }

  //       const data = await response.json();
  //       setUserDetails(data);
  //       setImageUrl(data.imageUrl);

  //       // You could also fetch notifications count here
  //       // For now, using a placeholder value
  //       setNotificationCount(2);
  //     } catch (error) {
  //       console.error("Error fetching user details:", error);
  //     }
  //   };

  //   fetchUserDetails();
  // }, [invalidation]); // Runs once when component mounts

  const {
    data: userDetails,
    // isLoading: isUserLoading,
    // isError,
  } = useQuery<UserDetails>({
    queryKey: ["driverDetails"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/driverDetails`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
      });
      
      if (!response.ok) {
        
        throw new Error("Failed to fetch user details");
      }
      return response.json();
    },
  });
  

  return (
    <main className="min-h-screen grid grid-rows-[min-content,1fr] max-w-screen overflow-x-hidden">
      {/* New Driver Header */}
      <DriverHeader
        navigate={navigate}
        logoutUser={logoutUser}
        driverName={userDetails?.personalInformation?.name || "Driver"}
        logoSrc={Logo}
        tripCount={bookings.length}
        notificationCount={notificationCount}
      />

      {/* main section  */}
      <section className="grid md:grid-cols-[30%,1fr] xl:grid-cols-[20%,1fr] h-full">
        {/* sidebar section  */}
        <section
          className={`transition-all duration-500 fixed right-0 top-0 h-full min-w-[70vw] md:static md:min-w-fit bg-white z-[50] py-5 sm:py-10 border-r-2 border-black/10 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          }`}
        >
          {/* close button  */}
          <div className="md:hidden flex justify-end py-2 px-4">
            <Button onClick={() => setIsMenuOpen(false)}>
              <CloseOutlined />
            </Button>
          </div>

          {/* user profile  */}
          <div className="flex flex-col items-center w-full">
            <div className="rounded-full overflow-hidden">
              {userDetails?.imageUrl ? (
                <img
                  src={userDetails?.imageUrl}
                  alt="Profile Picture"
                  className="aspect-square w-[150px]"
                />
              ) : (
                <div className="bg-gray-200 aspect-square w-[150px] grid place-items-center text-gray-400">
                  No Profile
                </div>
              )}
            </div>
            <Title level={4} className="!mb-0 mt-2">
              {userDetails?.personalInformation?.name}
            </Title>
            <p className="text-gray-500 text-sm">{userDetails?.email}</p>
          </div>

          {/* navigation  */}
          <nav className="px-5 w-full mt-10 grid gap-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.text}
                icon={link.icon}
                text={link.text}
                isActive={activeNav.text === link.text}
                onClick={() => {
                  setActiveNav(link);
                  setIsMenuOpen(false);
                }}
              />
            ))}

            {/* logout button  */}
            <button
              className="w-full flex items-center gap-2 py-3 px-5 sm:hidden rounded-3xl bg-red-200 hover:bg-red-500 hover:text-white"
              onClick={() => {
                logoutUser();
                navigate("/driverLogin");
              }}
            >
              <LogoutOutlined />
              <span>LogOut</span>
            </button>
          </nav>
        </section>

        {/* main content  */}
        <section className="py-5 px-4 sm:py-8 sm:px-6 md:py-10 md:px-10 w-screen md:w-full overflow-x-hidden">
          {(() => {
            switch (activeNav.text) {
              case "Personal Info":
                return (
                  <>
                    <PersonalInfo
                      userDetails={userDetails}
                      imageUrl={userDetails?.imageUrl}
                      token={token!}
                      
                    />
                  </>
                );
              case "Bookings":
                return (
                  <>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold pb-3 sm:pb-5">
                      Bookings
                    </h1>
                    <Bookings  loading={loading} />
                  </>
                );

              case "Vehicle":
                return (
                  <>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold pb-3 sm:pb-5">
                      Vehicles
                    </h1>
                    <DriverVehicle />
                  </>
                );

              case "Settings":
                return (
                  <>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold pb-3 sm:pb-5">
                      Settings
                    </h1>
                    <Settings />
                  </>
                );
              default:
                return null;
            }
          })()}
        </section>
      </section>
    </main>
  );
}
