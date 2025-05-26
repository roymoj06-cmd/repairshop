import { Edit, Delete } from "@mui/icons-material";
import { FC } from "react";
import {
  Grid2 as Grid,
  Typography,
  IconButton,
  Paper,
  Box,
} from "@mui/material";

import { PlateNumberDisplay } from "@/components";

interface CarCardProps {
  car: {
    plateSection1: string;
    plateSection2: string;
    plateSection3: string;
    plateSection4: string;
    carCompany: string;
    carTipId?: number;
    id: number;
  };
  onEdit: (car: any) => void;
  onDelete: (id: number) => void;
}

const CarCard: FC<CarCardProps> = ({ car, onEdit, onDelete }) => {
  return (
    <Grid key={car.id} size={{ xs: 12, sm: 6, md: 3 }}>
      <Paper
        sx={{
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          display: "flex",
          p: 2,
        }}
      >
        <Box sx={{ position: "absolute", top: 10, right: 10 }}>
          <IconButton
            onClick={() => onEdit(car)}
            color="primary"
            sx={{ mr: 1 }}
            size="small"
          >
            <Edit />
          </IconButton>
          <IconButton
            onClick={() => onDelete(car.id)}
            color="error"
            size="small"
          >
            <Delete />
          </IconButton>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          {car.carCompany}
        </Typography>

        <Box sx={{ width: "60%", my: 2 }}>
          <PlateNumberDisplay
            plateSection1={car.plateSection1}
            plateSection2={car.plateSection2}
            plateSection3={car.plateSection3}
            plateSection4={car.plateSection4}
          />
        </Box>
      </Paper>
    </Grid>
  );
};

export default CarCard;
