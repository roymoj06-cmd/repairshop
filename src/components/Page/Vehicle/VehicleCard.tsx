import { Box, IconButton, Modal, Typography } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import React, { useState } from "react";

import { PlateNumberDisplay } from "@/components";

interface VehicleCardProps {
  vehicle: IGetRepairReceptions;
}
const getStatusClass = (status: boolean) => {
  return status ? "success" : "warning";
};
const getStatusText = (status: boolean) => {
  return status ? "فاکتور شده" : "فاکتور نشده";
};
const formatPrice = (price: number) => {
  return price.toLocaleString();
};
const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const handleOpenDescription = () => {
    setIsDescriptionModalOpen(true);
  };
  const handleCloseDescription = () => {
    setIsDescriptionModalOpen(false);
  };

  return (
    <>
      <div className="vehicle-card cursor-pointer">
        <div className="price-tag">{formatPrice(vehicle.totalPrice)}</div>
        <div className={`status-chip ${getStatusClass(vehicle.status)}`}>
          {getStatusText(vehicle.status)}
        </div>

        <Box
          component="img"
          className="vehicle-image"
          src="/images/nkr.png"
          alt={vehicle.vehicleName}
        />

        <div className="vehicle-content">
          <div className="py-2 w-5/6 mx-auto">
            <PlateNumberDisplay
              plateSection1={vehicle.plateSection1}
              plateSection2={vehicle.plateSection2}
              plateSection3={vehicle.plateSection3}
              plateSection4={vehicle.plateSection4}
            />
          </div>
          <div className="vehicle-info">
            <div className="info-item">
              <PersonIcon className="icon" />
              <span>مشتری: {vehicle.customerName}</span>
            </div>
            <div className="info-item">
              <DirectionsCarIcon className="icon" />
              <span>خودرو: {vehicle.vehicleName}</span>
            </div>
            <div className="info-item">
              <CalendarTodayIcon className="icon" />
              <span>
                تاریخ پذیرش: {vehicle.receptionDate} - {vehicle.receptionTime}
              </span>
            </div>
            {vehicle.description && (
              <div className="description-item">
                <div className="info-item">
                  <DescriptionIcon className="icon" />
                  <span className="description-text">
                    {vehicle.description.length > 50
                      ? `${vehicle.description.substring(0, 50)}...`
                      : vehicle.description}
                    {vehicle.description.length > 50 && (
                      <span
                        className="show-more-button"
                        onClick={handleOpenDescription}
                      >
                        مشاهده بیشتر
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        open={isDescriptionModalOpen}
        onClose={handleCloseDescription}
        className="description-modal"
      >
        <div className="modal-content">
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
