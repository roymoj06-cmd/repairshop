import { IconButton, Modal, Paper, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import React, { useState } from "react";
import {
  DirectionsCar,
  CalendarToday,
  RotateRight,
  AttachMoney,
} from "@mui/icons-material";

import { useTheme } from "@/context/ThemeContext";
import { PlateNumberDisplay } from "@/components";

interface VehicleCardProps {
  vehicle: IGetRepairReceptions;
}
const getStatusText = (status: boolean) => {
  return status ? "فاکتور شده" : "فاکتور نشده";
};
const formatPrice = (price: number) => {
  return price.toLocaleString();
};
const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const { mode } = useTheme();
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const handleCloseDescription = () => {
    setIsDescriptionModalOpen(false);
  };

  return (
    <>
      <Paper className="vehicle-card cursor-pointer">
        <div
          className="vehicle-content"
          style={{
            color: mode === "dark" ? "#ffffff" : undefined,
            padding: "0 8px 8px",
          }}
        >
          <div className="py-2 w-full mx-auto">
            <PlateNumberDisplay
              plateSection1={vehicle.plateSection1}
              plateSection2={vehicle.plateSection2}
              plateSection3={vehicle.plateSection3}
              plateSection4={vehicle.plateSection4}
            />
          </div>
          <div className="vehicle-info">
            <div className="info-item">
              <PersonIcon
                className="icon"
                style={{ color: mode === "dark" ? "#60a5fa" : undefined }}
              />
              <span style={{ color: mode === "dark" ? "#e0e0e0" : undefined }}>
                {vehicle?.customerName}
              </span>
            </div>
            <div className="info-item">
              <DirectionsCar
                className="icon"
                style={{ color: mode === "dark" ? "#60a5fa" : undefined }}
              />
              <span style={{ color: mode === "dark" ? "#e0e0e0" : undefined }}>
                {vehicle?.carTipTitle}
              </span>
            </div>
            <div className="info-item">
              <CalendarToday
                className="icon"
                style={{ color: mode === "dark" ? "#60a5fa" : undefined }}
              />
              <span style={{ color: mode === "dark" ? "#e0e0e0" : undefined }}>
                {vehicle.receptionDate} - {vehicle.receptionTime}
              </span>
            </div>
            <div className="info-item">
              <RotateRight
                className="icon"
                style={{ color: mode === "dark" ? "#60a5fa" : undefined }}
              />
              <span style={{ color: mode === "dark" ? "#e0e0e0" : undefined }}>
                {getStatusText(vehicle.status)}
              </span>
            </div>
            <div className="info-item">
              <AttachMoney
                className="icon"
                style={{ color: mode === "dark" ? "#60a5fa" : undefined }}
              />
              <span style={{ color: mode === "dark" ? "#e0e0e0" : undefined }}>
                {formatPrice(vehicle.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </Paper>
      <Modal
        open={isDescriptionModalOpen}
        onClose={handleCloseDescription}
        className="description-modal"
      >
        <div
          className="modal-content"
          style={{
            background: mode === "dark" ? "#222e3c" : undefined,
            color: mode === "dark" ? "#ffffff" : undefined,
          }}
        >
          <div className="modal-header">
            <Typography variant="h6">توضیحات</Typography>
            <IconButton
              onClick={handleCloseDescription}
              className="close-button"
            >
              ×
            </IconButton>
          </div>
          <div className="modal-body">
            <Typography dir="rtl">{vehicle.description}</Typography>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default VehicleCard;
