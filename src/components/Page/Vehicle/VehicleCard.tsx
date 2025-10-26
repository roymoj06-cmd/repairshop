import { IconButton, Paper, Chip, Box, Typography } from "@mui/material";
import { Delete as DeleteIcon, NoteAdd, CheckCircle, Build } from "@mui/icons-material";
import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";

import { deleteRepairReception } from "@/service/repair/repair.service";
import { PlateNumberDisplay, ConfirmDeleteDialog } from "@/components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { useStore } from "@/Store/useStore";

interface VehicleCardProps {
  vehicle: IGetRepairReceptions;
  onRefresh?: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onRefresh }) => {
  const { mode } = useTheme();
  const { userAccesses } = useStore();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Calculate days in workshop
  const daysInWorkshop = useMemo(() => {
    if (!vehicle.receptionDate) return 0;
    const [year, month, day] = vehicle.receptionDate.split('/').map(Number);
    const receptionDate = new Date(year, month - 1, day);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - receptionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [vehicle.receptionDate]);

  // Get color for days in workshop
  const getDaysColor = (days: number) => {
    if (days <= 2) return { bg: '#10b981', text: 'white' }; // green
    if (days <= 4) return { bg: '#f59e0b', text: 'white' }; // yellow/orange
    return { bg: '#ef4444', text: 'white' }; // red
  };

  // Get status info
  const getStatusInfo = () => {
    if (vehicle.status) {
      return { label: 'آماده تحویل', color: '#10b981' };
    }
    // Check description for specific statuses
    if (vehicle.description?.includes('منتظر قطعه')) {
      return { label: 'منتظر قطعه', color: '#f59e0b' };
    }
    if (vehicle.description?.includes('منتظر تایید')) {
      return { label: 'منتظر تایید', color: '#f59e0b' };
    }
    return { label: 'در حال تعمیر', color: '#3b82f6' };
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' ت';
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

  const statusInfo = getStatusInfo();
  const daysColor = getDaysColor(daysInWorkshop);

  return (
    <>
      <Paper 
        className="vehicle-card-modern cursor-pointer"
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          position: 'relative',
          bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
          border: mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'dark' 
              ? '0 10px 25px rgba(0,0,0,0.3)' 
              : '0 10px 25px rgba(0,0,0,0.1)',
          }
        }}
      >
        {/* Delete button */}
        {userAccesses?.find(
          (item: string) => item === "faddee5d-7277-420f-9452-ccb315b15f1e"
        ) && (
          <IconButton
            onClick={handleDeleteClick}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 10,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}

        {/* Header: Plate + Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <PlateNumberDisplay
              plateSection1={vehicle.plateSection1}
              plateSection2={vehicle.plateSection2}
              plateSection3={vehicle.plateSection3}
              plateSection4={vehicle.plateSection4}
            />
          </Box>
          <Chip
            label={statusInfo.label}
            size="small"
            sx={{
              bgcolor: statusInfo.color,
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Days in workshop - prominent */}
        <Box
          sx={{
            bgcolor: daysColor.bg,
            color: daysColor.text,
            p: 1,
            borderRadius: 1,
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {daysInWorkshop} روز در تعمیرگاه
        </Box>

        {/* Info Grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, flex: 1 }}>
          {/* Responsible person */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#94a3b8' : '#64748b' }}>
              مسئول:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: mode === 'dark' ? '#e2e8f0' : '#1e293b' }}>
              {vehicle.customerName}
            </Typography>
          </Box>

          {/* Price */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#94a3b8' : '#64748b' }}>
              مبلغ:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'bold', 
                color: mode === 'dark' ? '#34d399' : '#059669',
                fontSize: '0.95rem'
              }}
            >
              {formatPrice(vehicle.totalPrice)}
            </Typography>
          </Box>

          {/* Last update */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#94a3b8' : '#64748b' }}>
              آخرین ثبت:
            </Typography>
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#cbd5e1' : '#475569' }}>
              {vehicle.receptionDate} - {vehicle.receptionTime}
            </Typography>
          </Box>

          {/* Physical location - placeholder */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#94a3b8' : '#64748b' }}>
              محل:
            </Typography>
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#cbd5e1' : '#475569' }}>
              {vehicle.carTipTitle || 'نامشخص'}
            </Typography>
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 1, pt: 1, borderTop: `1px solid ${mode === 'dark' ? '#334155' : '#e2e8f0'}` }}>
          <IconButton
            size="small"
            sx={{
              flex: 1,
              bgcolor: mode === 'dark' ? '#1e40af' : '#dbeafe',
              color: mode === 'dark' ? '#93c5fd' : '#1e40af',
              borderRadius: 1,
              fontSize: '0.7rem',
              '&:hover': {
                bgcolor: mode === 'dark' ? '#1e3a8a' : '#bfdbfe',
              },
            }}
            title="ثبت یادداشت"
          >
            <NoteAdd fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              flex: 1,
              bgcolor: mode === 'dark' ? '#15803d' : '#dcfce7',
              color: mode === 'dark' ? '#86efac' : '#15803d',
              borderRadius: 1,
              fontSize: '0.7rem',
              '&:hover': {
                bgcolor: mode === 'dark' ? '#166534' : '#bbf7d0',
              },
            }}
            title="اعلام آماده تحویل"
          >
            <CheckCircle fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              flex: 1,
              bgcolor: mode === 'dark' ? '#b45309' : '#fed7aa',
              color: mode === 'dark' ? '#fcd34d' : '#b45309',
              borderRadius: 1,
              fontSize: '0.7rem',
              '&:hover': {
                bgcolor: mode === 'dark' ? '#92400e' : '#fde68a',
              },
            }}
            title="درخواست قطعه"
          >
            <Build fontSize="small" />
          </IconButton>
        </Box>
      </Paper>

      <ConfirmDeleteDialog
        content={`آیا مطمئن هستید که می‌خواهید پذیرش مشتری "${vehicle.customerName}" را حذف کنید؟`}
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
        open={showDeleteDialog}
        title="حذف پذیرش"
      />
    </>
  );
};

export default VehicleCard;
