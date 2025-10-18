import { message, Upload, Card } from "antd";
// import { UserDetails } from "../../pages/driverprofile";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { useState } from "react";
import Title from "antd/es/typography/Title";
import DriverPersonalModal from "./modal/DriverPersonalModal";
import {  useQueryClient } from "@tanstack/react-query";

const PersonalInfo = ({
  userDetails,
  imageUrl,
  
  token,
  
}: {
  userDetails: any;
  imageUrl: string | undefined;
  
  token: string;
 
}) => {
  const [loading, setLoading] = useState(true);

  type FileType = File;

  // const getBase64 = (img: FileType, callback: (url: string) => void) => {
  //   const reader = new FileReader();
  //   reader.addEventListener("load", () => callback(reader.result as string));
  //   reader.readAsDataURL(img);
  // };

  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };
  const queryClient = useQueryClient();
  const handleChange = async (info: any) => {
    const file = info.file.originFileObj as File;
    const folder = "driver-profile"; // You can set this dynamically if needed
  
    if (!file) return;
  
    setLoading(true);
  
    try {
      // 1. Get pre-signed URL from your backend
      const presignedResponse = await fetch(`${import.meta.env.VITE_API_URL}/s3/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          folder: folder,
        }),
      });
  
      if (!presignedResponse.ok) throw new Error("Failed to get presigned URL");
  
      const { url, key } = await presignedResponse.json();
  
      // 2. Upload file to S3 using the presigned URL
      const uploadResult = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });
  
      if (!uploadResult.ok) throw new Error("Failed to upload file to S3");
     const imageUrl=`https://${import.meta.env.VITE_BUCKET_NAME}.s3.${import.meta.env.VITE_REGION}.amazonaws.com/${key}`
      // 3. Update the driver's profile with new image URL
      const updateResponse = await fetch(`${import.meta.env.VITE_API_URL}/updateDriver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ imageUrl}),
      });
  
      if (!updateResponse.ok) throw new Error("Failed to update driver image URL");
    queryClient.invalidateQueries({
  queryKey: ["driverDetails"]
});
      message.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      message.error("Failed to update profile picture");
    } finally {
      setLoading(false);
    }
  };
  
  
  const uploadButton = (
    <button className="bg-gray-200 w-[150px] h-[150px] rounded-full flex flex-col items-center justify-center border border-gray-400 hover:bg-gray-300 transition">
      {loading ? <LoadingOutlined style={{ fontSize: 24 }} /> : <PlusOutlined style={{ fontSize: 24 }} />}
      <div className="text-sm text-gray-600 mt-2">Upload</div>
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Profile Picture Upload */}
      <Upload
        name="avatar"
        className="avatar-uploader cursor-pointer"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Profile"
            className="w-[150px] h-[150px] rounded-full object-cover border border-gray-400 hover:brightness-75 transition"
          />
        ) : (
          uploadButton
        )}
      </Upload>

      {/* User Info Card */}
      <Card className="w-full max-w-md shadow-lg rounded-lg border border-gray-200">
        <div className="text-center">
          <Title level={3} className="!mb-0">
            {userDetails?.name || "Driver Name"}
          </Title>
          <p className="text-gray-500 text-sm">{userDetails?.email || "driver@example.com"}</p>
          <p className="text-gray-600 text-base font-medium mt-2">
            <span className="font-semibold text-gray-700">License No: </span>
            {userDetails?.drivinglicenseNo|| "Not Available"}
          </p>
        </div>
      </Card>

      {/* User Details Modal (If Needed) */}
      <DriverPersonalModal personalInfo={userDetails?.personalInfo} />
    </div>
  );
};

export default PersonalInfo;
