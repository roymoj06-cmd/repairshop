import { IconButton, Modal, Paper, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { Delete as DeleteIcon } from "@mui/icons-material";
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  DirectionsCar,
  CalendarToday,
  RotateRight,
  AttachMoney,
} from "@mui/icons-material";

import { deleteRepairReception } from "@/service/repair/repair.service";
import { PlateNumberDisplay, ConfirmDeleteDialog } from "@/components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";

interface VehicleCardProps {
  vehicle: IGetRepairReceptions;
  onRefresh?: () => void;
}
const getStatusText = (status: boolean) => {
  return status ? "فاکتور شده" : "فاکتور نشده";
};
const formatPrice = (price: number) => {
  return price.toLocaleString();
};
const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onRefresh }) => {
  const { mode } = useTheme();
  const queryClient = useQueryClient();
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCloseDescription = () => {
    setIsDescriptionModalOpen(false);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteRepairReception,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast.success(data?.message);
        queryClient.invalidateQueries({
          queryKey: ["repairReceptions"],
        });
        onRefresh?.();
      } else {
        toast.error(data?.message);
      }
      setShowDeleteDialog(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "خطا در حذف پذیرش");
      setShowDeleteDialog(false);
    },
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate({ repairReceptionId: vehicle.id });
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
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
          {/* Delete button in top-right corner */}
          <div className="delete-button">
            <IconButton
              onClick={handleDeleteClick}
              size="small"
              sx={{
                backgroundColor:
                  mode === "dark"
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                "&:hover": {
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(239, 68, 68, 0.2)",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>

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

      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="حذف پذیرش"
        content={`آیا مطمئن هستید که می‌خواهید پذیرش مشتری "${vehicle.customerName}" را حذف کنید؟`}
      />
    </>
  );
};

export default VehicleCard;
