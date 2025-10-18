import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');

  const handleSendOtp = async (values: any) => {
    try {
      await axios.post('http://localhost:5000/send-otp', { email: values.email });
      message.success('OTP sent to your email');
      setEmail(values.email);
      setStep('otp');
    } catch (err) {
      message.error('Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (values: any) => {
    try {
      await axios.post('http://localhost:5000/verify-otp', {
        email,
        otp: values.otp,
      });
      message.success('OTP verified');
      setStep('reset');
    } catch (err) {
      message.error('Invalid OTP');
    }
  };

  const handleResetPassword = async () => {
    try {
      // You'd usually call your actual reset password endpoint here
      message.success('Password reset successful');
      setStep('email');
      form.resetFields();
    } catch (err) {
      message.error('Failed to reset password');
    }
  };

  return (
    <Card >
      <Form form={form} layout="vertical" onFinish={
        step === 'email' ? handleSendOtp :
        step === 'otp' ? handleVerifyOtp :
        handleResetPassword
      }>
        {step === 'email' && (
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
        )}

        {step === 'otp' && (
          <Form.Item
            label="Enter OTP"
            name="otp"
            rules={[{ required: true, len: 6, message: 'Enter 6-digit OTP' }]}
          >
            <Input placeholder="6-digit OTP" />
          </Form.Item>
        )}

        {step === 'reset' && (
          <>
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[{ required: true, min: 6, message: 'Min 6 characters' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Passwords do not match!');
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {step === 'email' && 'Send OTP'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'reset' && 'Reset Password'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ForgotPassword;
