import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { IconButton, Tooltip } from "@mui/material";
import { FC } from "react";

import { useTheme } from "@/context/ThemeContext";

const ThemeToggle: FC = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={mode === "light" ? "حالت تاریک" : "حالت روشن"}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label="toggle theme"
        className="transition-all"
      >
        {mode === "light" ? (
          <DarkModeIcon className="me-3 pl-0" />
        ) : (
          <LightModeIcon className="me-3" />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
