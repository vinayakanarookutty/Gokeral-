import { createBrowserRouter } from "react-router-dom";
import { routePaths } from "../config";

import DriverLogin from "../pages/driverLogin";

import Maps from "../pages/maps";
import { UserLogin } from "../pages/user-pages/UserLogin";
import { UserRegister } from "../pages/user-pages/UserRegister";
import { UserDashboard } from "../components/user-components/UserDashboard";
import { UserProfile } from "../components/user-components/UserProfile";
import DriverRegistration from "../pages/driverRegistration";
import HomePage from "../pages/home/home";
import { DriverProfile } from "../components/driver-profile-components/DriverProfile";
import AboutPage from "../pages/about";
import ContactPage from "../pages/contact";

export const router = createBrowserRouter([
  {
    path: routePaths.driverRegistration,
    element: <DriverRegistration />,
  },
  {
    path: routePaths.home,
    element: <HomePage />,
  },
  {
    path: routePaths.driverProfile,
    element: <DriverProfile />,
  },
  {
    path: routePaths.driverLogin,
    element: <DriverLogin />,
  },
  {
    path: routePaths.maps,
    element: <Maps />,
  },
  {
    path: routePaths.userLogin,
    element: <UserLogin />,
  },
  {
    path: routePaths.userRegister,
    element: <UserRegister />,
  },
  {
    path: routePaths.userDashboard,
    element: <UserDashboard />,
  },
  {
    path: routePaths.userProfile,
    element: <UserProfile />,
  },
  {
    path: routePaths.about,
    element: <AboutPage />,
  }, {
    
    path: routePaths.contact,
    element: <ContactPage />,
  },
  
]);
