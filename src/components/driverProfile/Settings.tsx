import { Button, Card, Checkbox, Col, Form, Row, Select } from "antd";

const Settings = () => {
  return (
    <Form layout="vertical">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            title="Notification Settings"
            className="h-full shadow-sm hover:shadow-md transition-shadow bg-gray-50"
          >
            <Form.Item>
              <Checkbox.Group className="flex flex-col gap-3">
                <Checkbox value="email">Email Notifications</Checkbox>
                <Checkbox value="sms">SMS Notifications</Checkbox>
                <Checkbox value="push">Push Notifications</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Account Settings"
            className="h-full shadow-sm hover:shadow-md transition-shadow bg-gray-50"
          >
            <Form.Item label="Language">
              <Select
                size="large"
                defaultValue="english"
                options={[
                  { value: "english", label: "English" },
                  { value: "spanish", label: "Spanish" },
                  { value: "french", label: "French" },
                ]}
              />
            </Form.Item>
            <Form.Item label="Time Zone">
              <Select
                size="large"
                defaultValue="utc"
                options={[
                  { value: "utc", label: "UTC (GMT+0)" },
                  { value: "est", label: "EST (GMT-5)" },
                  { value: "pst", label: "PST (GMT-8)" },
                ]}
              />
            </Form.Item>
          </Card>
        </Col>
        <Col xs={24}>
          <Button size="large">
            Save Settings
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default Settings;
