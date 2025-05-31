import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import { FC, useState } from "react";
import {
  Typography,
  IconButton,
  MenuItem,
  Toolbar,
  AppBar,
  Avatar,
  Button,
  Stack,
  Menu,
  Box,
} from "@mui/material";

import { convertGeorginaToJalaliWithoutTime } from "@/utils";
import { useTheme } from "@/context/ThemeContext";
import { useStore } from "@/Store/useStore";
import { ThemeToggle } from "@/components";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: FC<HeaderProps> = ({ onMenuClick }) => {
  const { logout } = useStore();
  const { mode } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const isMenuOpen = Boolean(anchorEl);
  const persianDate = convertGeorginaToJalaliWithoutTime(
    new Date().toISOString()
  );

  return (
    <AppBar
      className="Header-root"
      sx={{
        bgcolor: "#ffffff",
        color: mode === "dark" ? "white" : "text.primary",
      }}
    >
      <Toolbar
        className="Header-toolbar"
        sx={{ justifyContent: "space-between" }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            onClick={onMenuClick}
            sx={{ display: { xs: "flex", lg: "none" } }}
            className="Header-menuButton dark:text-white"
          >
            <MenuIcon />
          </IconButton>
          <img style={{ height: "30px" }} src="/images/baaz.svg" alt="logo" />
        </Stack>
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            textAlign: "right",
          }}
        >
          <Button
            startIcon={<CalendarTodayIcon sx={{ ml: 1, fontSize: 16 }} />}
            disableRipple
            className="Header-dateButton dark:text-gray-200"
            sx={{ color: mode === "dark" ? "white" : "inherit" }}
          >
            {persianDate}
          </Button>
        </Box>
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
          <ThemeToggle />
          <IconButton
            onClick={handleProfileMenuOpen}
            className="Header-avatarButton"
          >
            <Avatar
              className="Header-avatar"
              style={{ backgroundColor: "#aa8c78" }}
            >
              <PersonIcon />
            </Avatar>
          </IconButton>
        </Stack>
      </Toolbar>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
        className="Header-menu"
        PaperProps={{
          className: "dark:bg-gray-800",
          sx: { bgcolor: mode === "dark" ? "#1e1e1e" : "white" },
        }}
      >
        <MenuItem
          onClick={handleMenuClose}
          className="Header-menuItem dark:text-white"
        >
          <Typography variant="body2" className="dark:text-white">
            پروفایل
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => logout()}
          className="Header-logoutMenuItem dark:text-white"
        >
          <Typography variant="body2" className="dark:text-white">
            خروج
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
