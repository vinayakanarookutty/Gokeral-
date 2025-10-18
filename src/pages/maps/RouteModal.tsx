import { Modal, Typography, Divider, List, Space } from "antd";
import { Navigation, Clock } from "lucide-react";
import { type Route as RouteType } from "../../types/directions";

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteType | null;
}

export const RouteModal: React.FC<RouteModalProps> = ({
  isOpen,
  onClose,
  route,
}) => {
  if (!route) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      title={
        <Space>
          {/* <Environment className="h-5 w-5" /> */}
          <Typography.Text strong>{route.summary}</Typography.Text>
        </Space>
      }
    >
      <div className="space-y-6">
        <div className="flex gap-8 justify-center p-4 bg-gray-50 rounded-lg">
          <Space>
            <Navigation className="h-4 w-4 text-blue-500" />
            <Typography.Text strong>
              {route.legs[0].distance.text}
            </Typography.Text>
          </Space>
          <Divider type="vertical" />
          <Space>
            <Clock className="h-4 w-4 text-blue-500" />
            <Typography.Text strong>
              {route.legs[0].duration.text}
            </Typography.Text>
          </Space>
        </div>

        <div>
          <Typography.Title level={5} className="mb-4">
            <Space>
              <Navigation className="h-4 w-4" />
              Turn-by-Turn Directions
            </Space>
          </Typography.Title>

          <List
            dataSource={route.legs[0].steps}
            renderItem={(step, index) => (
              <List.Item>
                <div className="flex gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <div
                      dangerouslySetInnerHTML={{ __html: step.instructions }}
                    />
                    <Typography.Text type="secondary">
                      {step.distance.text} · {step.duration.text}
                    </Typography.Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>
    </Modal>
  );
};