// src/components/Layout.tsx
import { Outlet } from "react-router-dom";
import AIFloatingButton from "../ai/components/AIFloatingButton";
import { ToastContainer } from "../components/ui/toast/ToastContainer";

export default function Layout() {
  return (
    <>
      <Outlet />
      <AIFloatingButton />
      <ToastContainer />
    </>
  );
}