import { Typography, Box, useMediaQuery } from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { Phone, Lock, Key } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
  getResetPasswordCode,
  resetPasswordTwoFactor,
} from "@/service/users/users.service";
import { Button, EnhancedInput } from "@/components";
import { useTheme } from "@/context/ThemeContext";

enum ResetPasswordStep {
  PHONE_INPUT = 1,
  CODE_AND_PASSWORD = 2,
}

interface PhoneInputForm {
  username: string;
}

interface CodeAndPasswordForm {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [currentStep, setCurrentStep] = useState<ResetPasswordStep>(
    ResetPasswordStep.PHONE_INPUT
  );
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();
  const { mode } = useTheme();

  // Form for step 1 - Phone input
  const { handleSubmit: handlePhoneSubmit, control: phoneControl } =
    useForm<PhoneInputForm>();

  // Form for step 2 - Code and password
  const {
    handleSubmit: handleCodeSubmit,
    control: codeControl,
    watch,
    reset: resetCodeForm,
  } = useForm<CodeAndPasswordForm>();

  const newPassword = watch("newPassword");

  // Mutation for sending reset code
  const sendCodeMutation = useMutation({
    mutationFn: getResetPasswordCode,
    onSuccess: () => {
      toast.success("کد تایید با موفقیت ارسال شد");
      // Reset فرم دوم قبل از رفتن به مرحله بعد
      resetCodeForm({
        code: "",
        newPassword: "",
        confirmPassword: "",
      });
      setCurrentStep(ResetPasswordStep.CODE_AND_PASSWORD);
    },
    onError: (error: any) => {
      console.error("Error sending reset code:", error);
      toast.error("خطا در ارسال کد تایید. لطفاً دوباره تلاش کنید.");
    },
  });

  // Mutation for resetting password
  const resetPasswordMutation = useMutation({
    mutationFn: resetPasswordTwoFactor,
    onSuccess: () => {
      toast.success("رمز عبور با موفقیت تغییر کرد");
      navigate("/login");
    },
    onError: (error: any) => {
      console.error("Error resetting password:", error);
      toast.error("خطا در تغییر رمز عبور. لطفاً دوباره تلاش کنید.");
    },
  });

  const onPhoneSubmit: SubmitHandler<PhoneInputForm> = (data) => {
    setUsername(data.username);
    sendCodeMutation.mutate(data.username);
  };

  const onCodeSubmit: SubmitHandler<CodeAndPasswordForm> = (data) => {
    resetPasswordMutation.mutate({
      username,
      code: data.code,
      newPassword: data.newPassword,
    });
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const handleBackToPhoneInput = () => {
    // Reset فرم دوم وقتی برمی‌گردیم به مرحله اول
    resetCodeForm({
      code: "",
      newPassword: "",
      confirmPassword: "",
    });
    setCurrentStep(ResetPasswordStep.PHONE_INPUT);
  };

  return (
    <div
      className="flex w-full h-screen overflow-hidden"
      style={{ backgroundColor: mode === "dark" ? "#19212c" : "#f5f7fa" }}
    >
      <div
        className={`${
          isMobile ? "w-full" : "w-1/2"
        } flex items-center justify-center`}
      >
        <div
          className="w-full max-w-md p-6 rounded-2xl relative z-10"
          style={{
            background: "transparent !important",
            backgroundColor: "transparent !important",
            boxShadow: "none",
          }}
        >
          <Box className="text-center mb-8 relative">
            <Typography
              variant="h4"
              component="h1"
              color="primary"
              style={{
                fontWeight: "bold",
                marginTop: "20px",
                marginBottom: "8px",
              }}
            >
              {currentStep === ResetPasswordStep.PHONE_INPUT
                ? "فراموشی رمز عبور"
                : "تایید و تعیین رمز جدید"}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              style={{ marginBottom: "20px" }}
            >
              {currentStep === ResetPasswordStep.PHONE_INPUT
                ? "شماره تماس خود را وارد کنید"
                : "کد تایید و رمز عبور جدید را وارد کنید"}
            </Typography>
          </Box>

          {currentStep === ResetPasswordStep.PHONE_INPUT ? (
            <form
              onSubmit={handlePhoneSubmit(onPhoneSubmit)}
              className="space-y-6"
            >
              <EnhancedInput
                rules={{
                  required: "شماره تماس الزامی است",
                }}
                containerClassName="mb-5"
                label="شماره تماس"
                control={phoneControl}
                icon={<Phone />}
                name="username"
                type="text"
              />

              <Button
                loading={sendCodeMutation.isPending}
                color="secondary"
                className="py-3 mt-8"
                type="submit"
                fullWidth
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 14px rgba(170, 140, 120, 0.4)",
                }}
              >
                ارسال کد تایید
              </Button>

              <Box className="flex justify-center mt-4">
                <Typography
                  color="primary"
                  variant="body2"
                  onClick={handleBackToLogin}
                  style={{
                    cursor: "pointer",
                    transition: "color 0.3s ease",
                    fontWeight: "500",
                  }}
                >
                  بازگشت به ورود
                </Typography>
              </Box>
            </form>
          ) : (
            <form
              key={`code-form-${currentStep}`}
              onSubmit={handleCodeSubmit(onCodeSubmit)}
              className="space-y-6"
            >
              <EnhancedInput
                rules={{
                  required: "کد تایید الزامی است",
                }}
                containerClassName="mb-5"
                label="کد تایید"
                control={codeControl}
                icon={<Key />}
                name="code"
                type="text"
                autoComplete="off"
              />

              <EnhancedInput
                rules={{
                  required: "رمز عبور جدید الزامی است",
                  minLength: {
                    value: 6,
                    message: "رمز عبور باید حداقل 6 کاراکتر باشد",
                  },
                }}
                containerClassName="mb-5"
                label="رمز عبور جدید"
                control={codeControl}
                icon={<Lock />}
                name="newPassword"
                type="password"
                autoComplete="new-password"
              />

              <EnhancedInput
                rules={{
                  required: "تایید رمز عبور الزامی است",
                  validate: (value: string) =>
                    value === newPassword || "رمز عبور و تایید آن یکسان نیست",
                }}
                containerClassName="mb-5"
                label="تایید رمز عبور جدید"
                control={codeControl}
                icon={<Lock />}
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
              />

              <Button
                loading={resetPasswordMutation.isPending}
                color="secondary"
                className="py-3 mt-8"
                type="submit"
                fullWidth
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 14px rgba(170, 140, 120, 0.4)",
                }}
              >
                تعیین رمز عبور جدید
              </Button>

              <Box className="flex justify-center mt-4">
                <Typography
                  color="primary"
                  variant="body2"
                  onClick={handleBackToPhoneInput}
                  style={{
                    cursor: "pointer",
                    transition: "color 0.3s ease",
                    fontWeight: "500",
                    marginLeft: "16px",
                  }}
                >
                  بازگشت به مرحله قبل
                </Typography>
                <Typography
                  color="primary"
                  variant="body2"
                  onClick={handleBackToLogin}
                  style={{
                    cursor: "pointer",
                    transition: "color 0.3s ease",
                    fontWeight: "500",
                  }}
                >
                  بازگشت به ورود
                </Typography>
              </Box>
            </form>
          )}
        </div>
      </div>

      {/* Image Section (Left Side) */}
      <div
        className={`${isMobile ? "hidden" : "flex"} w-1/2 h-full relative`}
        style={{
          borderRadius: "0 15rem 15rem 0",
          backgroundImage: "url(/images/servicing-workshop.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
        }}
      >
        <div className="absolute inset-0" style={{ opacity: 0.8 }}></div>
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <Box
            className="text-white text-center z-10 max-w-md p-8 rounded-xl"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(3px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              style={{
                fontWeight: "bold",
                marginBottom: "1.5rem",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
              }}
            >
              سیستم مدیریت تعمیرگاه
            </Typography>
            <div
              className="w-20 h-1 mx-auto mb-6 rounded"
              style={{ background: "#aa8c78" }}
            ></div>
            <Typography
              variant="body1"
              style={{
                fontSize: "1.1rem",
                lineHeight: "1.8",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
              }}
            >
              خوش آمدید! سیستم مدیریت تعمیرگاه به شما امکان می‌دهد به راحتی و با
              دقت بالا، فرآیندهای تعمیراتی خود را مدیریت کنید.
            </Typography>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
