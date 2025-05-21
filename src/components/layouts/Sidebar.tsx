import { useLocation, Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { useEffect } from "react";
import {
  DirectionsCar as DirectionsCarIcon,
  Dashboard as DashboardIcon,
  CarRepair as CarRepairIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  ListItem,
  Divider,
  Drawer,
  Avatar,
  List,
  Box,
} from "@mui/material";

import { useTheme } from "@/context/ThemeContext";
import { useStore } from "@/Store/useStore";
import { ThemeToggle } from "@/components";
import dir from "@/Router/dir";

interface NavItemProps {
  icon: React.ReactNode;
  info?: React.ReactNode;
  title: string;
  path: string;
  guid: string;
}
const navConfig: NavItemProps[] = [
  {
    title: "داشبورد",
    path: dir.dashboard,
    icon: <DashboardIcon />,
    guid: "",
  },
  {
    title: "گاراژ من",
    path: dir.vehicles,
    icon: <DirectionsCarIcon />,
    guid: "326a7ebf-780b-4db0-9ca3-76b04fdc02f3",
  },
  {
    title: "پذیرش",
    path: dir.serviceAdmission,
    icon: <CarRepairIcon />,
    guid: "5bf10848-d436-4a83-b97b-e282237fa09a",
  },
  {
    title: "مدیریت خودرو ها",
    path: dir.carsManagement,
    icon: <CarRepairIcon />,
    guid: "",
  },
];
const StyledAccount = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "16px",
  borderRadius: "12px",
  margin: "0 12px 0px 12px",
  justifyContent: "space-between",
  background: "#aa8c78",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0px 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
      : "0px 4px 20px rgba(31, 31, 31, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    background:
      "linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0))",
    borderRadius: "12px 12px 0 0",
  },
}));
const StyledLogo = styled(Box)({
  padding: "0 20px 20px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "0 0 16px 0",
});
interface SidebarProps {
  open: boolean;
  onClose: () => void;
}
const SIDEBAR_WIDTH = 280;
export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { pathname } = useLocation();
  const { logout, userAccesses, user } = useStore();
  const { mode, toggleTheme } = useTheme();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <>
      <StyledLogo>
        <Typography
          variant="h5"
          sx={{
            fontSize: "1.65rem",
            fontWeight: "bold",
            background:
              mode === "dark"
                ? "linear-gradient(45deg, #ffffff 15%, #cccccc 85%)"
                : "linear-gradient(45deg, #1d1d1d 15%, #505050 85%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "1px",
            textShadow:
              mode === "dark"
                ? "0 1px 2px rgba(0,0,0,0.2)"
                : "0 1px 2px rgba(255,255,255,0.1)",
            position: "relative",
            textAlign: "center",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-6px",
              left: "30%",
              right: "30%",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, #aa8c78, transparent)",
              borderRadius: "2px",
            },
          }}
        >
          تعمیرگاه ایسوزو
        </Typography>
      </StyledLogo>
      <StyledAccount>
        <Avatar
          src="/images/user-unknown.jpg"
          sx={{
            bgcolor: "#1d1d1d",
            margin: "0 !important",
            mr: 2,
            width: 52,
            height: 52,
            border: "2px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          IS
        </Avatar>
        <Box className="flex flex-col justify-start items-start gap-1">
          <Typography
            variant="subtitle1"
            sx={{
              color: "#fff",
              fontWeight: "bold",
              textShadow: "0 1px 1px rgba(0,0,0,0.2)",
              whiteSpace: "normal",
              wordBreak: "break-word",
              textAlign: "start",
              paddingLeft: "8px",
              lineHeight: 1.4,
            }}
          >
            {user?.fullName}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#fff",
              opacity: 0.9,
              fontSize: "0.78rem",
              textAlign: "start",
              paddingLeft: "8px",
            }}
          >
            مدیر
          </Typography>
        </Box>
      </StyledAccount>

      <List sx={{ px: 1.5, py: 1 }}>
        {navConfig.map((item) => {
          if (!item.guid || userAccesses?.includes(item.guid)) {
            return (
              <ListItem key={item.title} disablePadding sx={{ mb: 0.8 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={pathname === item.path}
                  sx={{
                    minHeight: 50,
                    px: 2.5,
                    borderRadius: "10px",
                    transition: "all 0.25s ease",
                    position: "relative",
                    overflow: "hidden",
                    ...(pathname === item.path && {
                      color: mode === "dark" ? "#ffffff" : "#1d1d1d",
                      bgcolor:
                        mode === "dark"
                          ? "rgba(170, 140, 120, 0.25)"
                          : "rgba(170, 140, 120, 0.15)",
                      fontWeight: "fontWeightBold",
                      boxShadow:
                        mode === "dark"
                          ? "0 2px 8px rgba(0, 0, 0, 0.15)"
                          : "0 2px 8px rgba(31, 31, 31, 0.08)",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: "3px",
                        background:
                          "linear-gradient(0deg, #98877b 0%, #aa8c78 100%)",
                        borderRadius: "0 4px 4px 0",
                      },
                    }),
                    "&:hover": {
                      bgcolor:
                        mode === "dark"
                          ? pathname === item.path
                            ? "rgba(170, 140, 120, 0.3)"
                            : "rgba(255, 255, 255, 0.05)"
                          : pathname === item.path
                          ? "rgba(170, 140, 120, 0.2)"
                          : "rgba(244, 244, 244, 0.7)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      ml: 2,
                      color:
                        pathname === item.path
                          ? "#aa8c78"
                          : mode === "dark"
                          ? "#cccccc"
                          : "#666666",
                      transition: "transform 0.2s ease",
                      "& svg": {
                        fontSize: 22,
                        transition: "all 0.2s ease",
                      },
                      ...(pathname === item.path && {
                        "& svg": {
                          transform: "scale(1.15)",
                        },
                      }),
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    sx={{
                      fontWeight: pathname === item.path ? "bold" : "medium",
                      transition: "all 0.2s ease",
                      textAlign: "start",
                      fontSize: 15,
                      color:
                        mode === "dark" && pathname !== item.path
                          ? "rgba(255, 255, 255, 0.8)"
                          : undefined,
                    }}
                    style={{
                      paddingRight: "1rem",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          }
          return null;
        })}
      </List>

      <Divider
        sx={{
          mt: "auto",
          mx: 3,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(152, 135, 123, 0.3), transparent)",
        }}
      />

      <List sx={{ px: 1.5 }}>
        <ListItem onClick={() => toggleTheme()} disablePadding sx={{ mb: 0.8 }}>
          <ListItemButton
            sx={{
              minHeight: 50,
              px: 2.5,
              borderRadius: "10px",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: mode === "dark" ? "#222e3c" : "#fff",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                ml: 1,
                pl: 0,
                color: mode === "dark" ? "#cccccc" : "#666666",
                "& svg": {
                  fontSize: 22,
                },
              }}
            >
              <ThemeToggle />
            </ListItemIcon>
            <ListItemText
              primary="حالت نمایش"
              sx={{
                ml: 0,
                p: 0,
                fontSize: 15,
                textAlign: "start",
                color: mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => logout()}
            sx={{
              minHeight: 50,
              px: 2.5,
              borderRadius: "10px",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor:
                  mode === "dark"
                    ? "rgba(255, 87, 87, 0.15)"
                    : "rgba(255, 87, 87, 0.08)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                ml: 2,
                color: "#ff5b5b",
                "& svg": {
                  fontSize: 22,
                },
              }}
            >
              <LogoutIcon className="me-3" />
            </ListItemIcon>
            <ListItemText
              primary="خروج"
              sx={{
                color: "#ff5b5b",
                fontSize: 15,
                textAlign: "start",
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: SIDEBAR_WIDTH },
        zIndex: 1200,
      }}
    >
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            width: SIDEBAR_WIDTH,
            bgcolor: mode === "dark" ? "rgb(31, 41, 55)" : "background.paper",
            color: mode === "dark" ? "white" : "text.primary",
          },
        }}
      >
        <Box sx={{ height: "100%", p: 2 }}>{renderContent}</Box>
      </Drawer>

      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            height: "100%",
            backgroundColor: mode === "dark" ? "#222e3c" : "background.paper",
            borderLeft: "1px solid rgba(152, 135, 123, 0.15)",
            borderRight: "none",
          },
        }}
        open
      >
        <Box sx={{ height: "100%", p: 2 }}>{renderContent}</Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
