import {
  Box,
  CircularProgress,
  CircularProgressProps,
  Typography,
} from "@mui/material";

const CircularProgressWithLabel: React.FC<
  CircularProgressProps & { value: number }
> = ({ value, ...props }) => {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress value={value} variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: "text.secondary" }}
        >{`${Math.round(value)}%`}</Typography>
      </Box>
    </Box>
  );
};

export default CircularProgressWithLabel;
