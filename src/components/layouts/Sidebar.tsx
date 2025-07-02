import {
  Build,
  CalendarMonth,
  CarRepair,
  DirectionsCar,
  Logout,
  Person,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { ThemeToggle } from "@/components";
import { useTheme } from "@/context/ThemeContext";
import dir from "@/Router/dir";
import { useStore } from "@/Store/useStore";

interface NavItemProps {
  info?: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  path: string;
  guid: string;
}
const navConfig: NavItemProps[] = [
  // {
  //   title: "داشبورد",
  //   path: dir.dashboard,
  //   icon: <Dashboard />,
  //   guid: "",
  // },
  {
    title: "گاراژ من",
    path: dir.vehicles,
    icon: <DirectionsCar />,
    guid: "",
  },
  {
    title: "پذیرش",
    path: dir.addServiceAdmission,
    icon: <CarRepair />,
    guid: "",
  },
  {
    title: "مدیریت خودرو ها",
    path: dir.carsManagement,
    icon: <CarRepair />,
    guid: "",
  },
  {
    title: "مدیریت اجرت ها",
    path: dir.serviceManagement,
    icon: <Build />,
    guid: "",
  },
  {
    title: "مدیریت مکانیک ها",
    path: dir.mechanicsManagement,
    icon: <Person />,
    guid: "",
  },
  {
    title: "مدیریت مرخصی ها",
    path: dir.leaveManagement,
    icon: <CalendarMonth />,
    guid: "",
  },
];

interface SidebarProps {
  onClose: () => void;
  open: boolean;
}
export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { logout, userAccesses, user } = useStore();
  const { mode, toggleTheme } = useTheme();
  const { pathname } = useLocation();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <>
      <Box className="sidebar__logo">
        <Box className="sidebar__logo-container">
          <img
            src={
              mode === "dark"
                ? "/images/logo-baaz-dark.webp"
                : "/images/logo-baaz-light.webp"
            }
            alt="BAAZ Logo"
            className="sidebar__logo-image"
            onError={(e) => {
              e.currentTarget.src = "/images/baaz.png";
            }}
          />
          <Typography
            variant="body2"
            className={`sidebar__logo-text sidebar__logo-text--${mode}`}
          >
            تعمیرگاه ایسوزو
          </Typography>
        </Box>
      </Box>
      <Box className={`sidebar__account sidebar__account--${mode}`}>
        <Avatar src="/images/user-unknown.jpg" className="sidebar__avatar">
          IS
        </Avatar>
        <Box className="sidebar__user-info">
          <Typography variant="subtitle1" className="sidebar__user-name">
            {user?.fullName}
          </Typography>
          <Typography variant="body2" className="sidebar__user-role">
            مدیر
          </Typography>
        </Box>
      </Box>
      <List className="sidebar__nav-list">
        {navConfig.map((item) => {
          if (!item.guid || userAccesses?.includes(item.guid)) {
            const isActive = pathname === item.path;
            return (
              <ListItem
                key={item.title}
                disablePadding
                className="sidebar__nav-item"
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive}
                  className={`sidebar__nav-button sidebar__nav-button--${mode} ${
                    isActive
                      ? `sidebar__nav-button--active sidebar__nav-button--active--${mode}`
                      : ""
                  }`}
                >
                  <ListItemIcon
                    className={`sidebar__nav-icon ${
                      isActive
                        ? "sidebar__nav-icon--active"
                        : `sidebar__nav-icon--${mode}`
                    }`}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    className={`sidebar__nav-text ${
                      isActive ? "sidebar__nav-text--active" : ""
                    } ${
                      mode === "dark" && !isActive
                        ? "sidebar__nav-text--dark"
                        : ""
                    }`}
                  />
                </ListItemButton>
              </ListItem>
            );
          }
          return null;
        })}
      </List>
      <Divider className="sidebar__divider" />
      <List className="sidebar__bottom-list">
        <ListItem disablePadding className="sidebar__theme-item">
          <ListItemButton
            onClick={() => toggleTheme()}
            className={`sidebar__theme-button sidebar__theme-button--${mode}`}
          >
            <ListItemIcon
              onClick={() => toggleTheme()}
              className={`sidebar__theme-icon sidebar__theme-icon--${mode}`}
            >
              <ThemeToggle />
            </ListItemIcon>
            <ListItemText
              primary="حالت نمایش"
              className={`sidebar__theme-text ${
                mode === "dark" ? "sidebar__theme-text--dark" : ""
              }`}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => logout()}
            className={`sidebar__logout-button sidebar__logout-button--${mode}`}
          >
            <ListItemIcon className="sidebar__logout-icon">
              <Logout className="me-3" />
            </ListItemIcon>
            <ListItemText primary="خروج" className="sidebar__logout-text" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box component="nav" className="sidebar__container">
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          className: `sidebar__drawer-paper sidebar__drawer-paper--${mode}`,
        }}
        className="sidebar__drawer-temporary"
      >
        <Box className="sidebar__content">{renderContent}</Box>
      </Drawer>

      <Drawer
        variant="permanent"
        anchor="left"
        className="sidebar__drawer-permanent"
        PaperProps={{
          className: `sidebar__drawer-permanent-paper sidebar__drawer-permanent-paper--${mode}`,
        }}
        open
      >
        <Box className="sidebar__content">{renderContent}</Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
