import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  CalendarMonth,
  DirectionsCar,
  AccessTime,
  CarRepair,
  Dashboard,
  Inventory,
  BarChart,
  Logout,
  Person,
  Build,
  Task,
} from "@mui/icons-material";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  ListItem,
  Divider,
  Avatar,
  Drawer,
  List,
  Box,
} from "@mui/material";

import { useTheme } from "@/context/ThemeContext";
import { useStore } from "@/Store/useStore";
import { ThemeToggle } from "@/components";
import dir from "@/Router/dir";

interface NavItemProps {
  info?: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  path: string;
  guid: string;
}
const navConfig: NavItemProps[] = [
  {
    title: "داشبورد",
    path: dir.dashboard,
    icon: <Dashboard />,
    guid: "73f370c9-dd32-4045-83b1-6ca2b0d39b58",
  },
  {
    title: "گاراژ من",
    path: dir.vehicles,
    icon: <DirectionsCar />,
    guid: "2f326128-473e-4d6e-9d78-efed1eca42c0",
  },
  {
    title: "پذیرش",
    path: dir.addServiceAdmission,
    icon: <CarRepair />,
    guid: "431dbdc6-5e47-4d2c-9c97-8a23162648b8",
  },
  {
    title: "مدیریت خودرو ها",
    path: dir.carsManagement,
    icon: <CarRepair />,
    guid: "53d81fbe-7fff-4956-a957-6f0fd520325c",
  },
  {
    title: "مدیریت اجرت ها",
    path: dir.serviceManagement,
    icon: <Build />,
    guid: "3362fe9b-5b43-436e-a440-aefc0d1d00d8",
  },
  {
    title: "مدیریت تعمیرکاران",
    path: dir.mechanicsManagement,
    icon: <Person />,
    guid: "b33b23a8-9d34-4375-a05c-94c5b18450b7",
  },
  {
    title: "حضور و غیاب کارکنان",
    path: dir.mechanicAttendance,
    icon: <AccessTime />,
    guid: "9bf86168-cb18-47f3-a886-90cb6d47663c",
  },
  {
    title: "مدیریت مرخصی ها",
    path: dir.leaveManagement,
    icon: <CalendarMonth />,
    guid: "c1b563f4-9299-4865-97ba-fe56db6c5d3b",
  },
  {
    title: "مدیریت تسک ها",
    path: dir.taskManagement,
    icon: <Task />,
    guid: "ec4b9e05-a95e-4551-82ef-46377f11a6fc",
  },
  {
    title: "گزارش عملکرد",
    path: dir.mechanicPerformance,
    icon: <BarChart />,
    guid: "8a374872-ee31-4ece-b2bb-342edbe45bc2",
  },
  {
    title: "کسری کالا",
    path: dir.productRequests,
    icon: <Inventory />,
    guid: "6328008c-de7c-4d26-84be-0b42793c61d8",
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
        </Box>
      </Box>
      <List className="sidebar__nav-list">
        {navConfig
          .filter((item) => {
            // اگر کاربر مشتری است، فقط "گاراژ من" را نمایش بده
            if (!user?.isDinawinEmployee) {
              return item.path === dir.vehicles; // فقط گاراژ من
            }
            // اگر کارمند دیناوین است، همه آیتم‌هایی که دسترسی دارد را نمایش بده
            return !item.guid || userAccesses?.includes(item.guid);
          })
          .map((item) => {
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
