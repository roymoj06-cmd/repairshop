import { Box, Typography, Button, Paper, Container } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowBackOutlined,
  LockOutlined,
  HomeOutlined,
} from "@mui/icons-material";
import { FC } from "react";

import dir from "@/Router/dir";

interface AccessDeniedState {
  fallback?: string;
  from?: string;
}

const AccessDenied: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as AccessDeniedState;

  const handleGoHome = () => {
    navigate(dir.vehicles, { replace: true });
  };

  const handleGoBack = () => {
    const fallbackPath = state?.fallback || dir.vehicles;
    navigate(fallbackPath, { replace: true });
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 2,
          maxWidth: 500,
          width: "100%",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <LockOutlined
            sx={{
              fontSize: 80,
              color: "error.main",
              mb: 2,
            }}
          />

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "error.main",
            }}
          >
            دسترسی محدود
          </Typography>

          <Typography
            variant="h6"
            component="p"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            شما مجوز دسترسی به این صفحه را ندارید
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            برای دسترسی به این بخش، با مدیر سیستم تماس بگیرید یا به صفحه اصلی
            بازگردید.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<HomeOutlined />}
            onClick={handleGoHome}
            size="large"
          >
            بازگشت به گاراژ من
          </Button>

          {state?.fallback && state.fallback !== dir.vehicles && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBackOutlined />}
              onClick={handleGoBack}
              size="large"
            >
              بازگشت
            </Button>
          )}
        </Box>

        {state?.from && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              mt: 3,
              display: "block",
              fontSize: "0.75rem",
            }}
          >
            مسیر درخواستی: {state.from}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default AccessDenied;
