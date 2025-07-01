import { Box, Typography } from "@mui/material";
import { FC } from "react";

interface EmptyListProps {
  message?: string;
  icon?: React.ReactNode;
}

const EmptyList: FC<EmptyListProps> = ({
  message = "هیچ آیتمی یافت نشد",
  icon,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        minHeight: 200,
      }}
    >
      {icon && <Box sx={{ mb: 2, color: "text.secondary" }}>{icon}</Box>}
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ textAlign: "center" }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default EmptyList;
