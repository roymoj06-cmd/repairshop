import { Typography, Grid2 as Grid, Paper, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FC } from "react";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
  height: "100%",
}));

const Dashboard: FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Item>
          <Typography variant="h6" gutterBottom>
            تعداد خودروها
          </Typography>
          <Typography variant="h3">42</Typography>
        </Item>
      </Grid>

      <Grid size={12}>
        <Item>
          <Typography variant="h6" gutterBottom>
            تعمیرات جاری
          </Typography>
          <Typography variant="h3">12</Typography>
        </Item>
      </Grid>

      <Grid size={12}>
        <Item>
          <Typography variant="h6" gutterBottom>
            تعمیرات انجام شده
          </Typography>
          <Typography variant="h3">84</Typography>
        </Item>
      </Grid>

      <Grid size={12}>
        <Item>
          <Typography variant="h6" gutterBottom>
            درآمد ماه جاری
          </Typography>
          <Typography variant="h3">32M</Typography>
        </Item>
      </Grid>

      <Grid size={12}>
        <Item>
          <Box sx={{ p: 3, pb: 1 }}>
            <Typography variant="h6">تعمیرات اخیر</Typography>
          </Box>
          <Box sx={{ p: 3, pt: 0 }}>
            <Typography variant="body1">
              نمودار تعمیرات اخیر اینجا نمایش داده می‌شود.
            </Typography>
          </Box>
        </Item>
      </Grid>

      <Grid size={12}>
        <Item>
          <Box sx={{ p: 3, pb: 1 }}>
            <Typography variant="h6">وضعیت فعلی</Typography>
          </Box>
          <Box sx={{ p: 3, pt: 0 }}>
            <Typography variant="body1">
              نمودار وضعیت خودروها اینجا نمایش داده می‌شود.
            </Typography>
          </Box>
        </Item>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
