import { Typography, Box, useMediaQuery } from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { Person, Lock } from "@mui/icons-material";
import { useState } from "react";

import { Button, EnhancedInput } from "@/components";
import { useTheme } from "@/context/ThemeContext";
import { useStore } from "@/Store/useStore";

interface LoginFormInputs {
  username: string;
  password: string;
}

const LoginForm = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [isLoading, setIsLoading] = useState(false);
  const login = useStore((state) => state.login);
  const { mode } = useTheme();

  const {
    handleSubmit,
    control,
  } = useForm<LoginFormInputs>();
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      setIsLoading(true);
      localStorage.setItem("theme", mode);
      await login(data.username, data.password);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex w-full h-screen overflow-hidden"
      style={{ backgroundColor: mode === "dark" ? "#19212c" : "#f5f7fa" }}
    >
      {/* Form Section (Right Side) */}
      <div
        className={`${isMobile ? "w-full" : "w-1/2"
          } h-full flex items-center justify-center p-6 relative`}
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
              ورود به سیستم
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              style={{ marginBottom: "20px" }}
            >
              لطفا اطلاعات خود را وارد کنید
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <EnhancedInput
              rules={{
                required: "نام کاربری الزامی است",
              }}
              containerClassName="mb-5"
              label="نام کاربری"
              control={control}
              icon={<Person />}
              name="username"
              type="text"
            />

            <EnhancedInput
              rules={{
                required: "رمز عبور الزامی است",
              }}
              containerClassName="mb-5"
              control={control}
              label="رمز عبور"
              name="password"
              icon={<Lock />}
              type="password"
            />

            <Box className="flex justify-start">
              <Typography
                color="primary"
                variant="body2"
                style={{
                  cursor: "pointer",
                  transition: "color 0.3s ease",
                  fontWeight: "500",
                }}
              >
                رمز عبور خود را فراموش کردید؟
              </Typography>
            </Box>

            <Button
              loading={isLoading}
              color="secondary"
              className="py-3 mt-8"
              type="submit"
              fullWidth
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 14px rgba(170, 140, 120, 0.4)",
              }}
            >
              ورود به سیستم
            </Button>
          </form>
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

export default LoginForm;
