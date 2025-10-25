import { Edit, Delete, Palette, DirectionsCar } from "@mui/icons-material";
import { FC } from "react";
import {
  Grid,
  Typography,
  IconButton,
  Box,
  Stack,
  Chip,
} from "@mui/material";

import { PlateNumberDisplay } from "@/components";

interface CarCardProps {
  car: {
    plateSection1?: string;
    plateSection2?: string;
    plateSection3?: string;
    plateSection4?: string;
    carTipName?: string;
    carCompany?: string;
    customerId?: number;
    carTipTitle?: string;
    carTipId?: number;
    carColor?: string;
    carType?: string;
    id: number;
  };
  onEdit: (car: any) => void;
  onDelete: (id: number) => void;
}

const CarCard: FC<CarCardProps> = ({ car, onEdit, onDelete }) => {
  return (
    <Grid key={car.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 3,
          position: "relative",
          bgcolor: "background.paper",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        }}
      >
        {/* Action Buttons */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            opacity: 0.7,
            "&:hover": { opacity: 1 },
          }}
        >
          <IconButton
            onClick={() => onEdit(car)}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main", bgcolor: "primary.50" },
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => onDelete(car.id)}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "error.main", bgcolor: "error.50" },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>

        <Stack spacing={2.5} alignItems="center" sx={{ pt: 2 }}>
          <Box textAlign="center">
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {car.carCompany || "برند نامشخص"}
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                مدل:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {car.carTipTitle || "نامشخص"}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ width: "100%" }}>
            <PlateNumberDisplay
              plateSection1={car.plateSection1}
              plateSection2={car.plateSection2}
              plateSection3={car.plateSection3}
              plateSection4={car.plateSection4}
            />
          </Box>

          {/* Color */}
          <Chip
            icon={<Palette sx={{ fontSize: "16px !important" }} />}
            label={car?.carColor || "نامشخص"}
            variant="outlined"
            size="small"
            sx={{
              fontSize: "0.75rem",
              borderColor: "divider",
              color: "text.secondary",
              "& .MuiChip-icon": {
                color: "text.secondary",
              },
            }}
          />
        </Stack>
      </Box>
    </Grid>
  );
};

export default CarCard;
