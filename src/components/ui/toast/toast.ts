// src/utils/toast.ts
import { notification, NotificationArgsProps } from "antd";

type ToastOptions = {
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

export const toast = ({ title, description, variant = "default" }: ToastOptions) => {
  console.log("TOAST CALLED:", { title, description, variant });
  const type = variant === "destructive" ? "error" : "success";

  notification[type]({
    message: title,
    description,
    placement: "bottomRight",
    duration: 4.5,
  } as NotificationArgsProps);
};