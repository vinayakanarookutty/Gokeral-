// src/components/ui/toast/ToastContainer.tsx
import React from "react";
import { notification } from "antd";

export const ToastContainer: React.FC = () => {
  console.log("ToastContainer rendered");
  return <>{notification.config({})}</>;
};