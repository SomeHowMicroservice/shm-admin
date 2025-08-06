"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { CiLock, CiUser } from "react-icons/ci";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/auth";
import { Spin } from "antd";
import { toast } from "react-toastify";

const LoginForm = () => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  interface LoginFormValues {
    username: string;
    password: string;
  }

  const onFinish = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await loginUser(values);
      toast.success(res.data.message);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="mx-auto space-y-4 md:w-1/2 w-full"
    >
      <h2 className="md:text-2xl text-lg text-black font-bold mb-2 text-center">
        ĐĂNG NHẬP CHO NHÀ QUẢN TRỊ
      </h2>
      <Form.Item
        name="username"
        rules={[
          { required: true, message: "Số điện thoại không được để trống" },
          { min: 3, message: "Số điện thoại phải ít nhất 3 ký tự" },
        ]}
      >
        <Input
          size="large"
          placeholder="Tên đăng nhập"
          prefix={<CiUser className="text-[#757575]" size={20} />}
          className="bg-[#ebebeb]"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: "Mật khẩu không được để trống" },
          { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự" },
        ]}
      >
        <Input.Password
          size="large"
          placeholder="Mật khẩu"
          prefix={<CiLock className="text-[#757575]" size={20} />}
          className="bg-[#ebebeb]"
        />
      </Form.Item>

      <Spin spinning={isSubmitting}>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-3 font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
          </Button>
        </Form.Item>
      </Spin>
    </Form>
  );
};

export default LoginForm;
