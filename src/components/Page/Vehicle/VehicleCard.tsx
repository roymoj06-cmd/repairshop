import { IconButton, Paper, Chip, Box, Typography } from "@mui/material";
import { Delete as DeleteIcon, NoteAdd, CheckCircle, Build, AccessTime } from "@mui/icons-material";
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

  // Calculate days and hours in workshop
  const timeInWorkshop = useMemo(() => {
    if (!vehicle.receptionDate || !vehicle.receptionTime) return { days: 0, hours: 0, totalHours: 0 };
    
    const [year, month, day] = vehicle.receptionDate.split('/').map(Number);
    const [hour, minute] = vehicle.receptionTime.split(':').map(Number);
    const receptionDate = new Date(year, month - 1, day, hour || 0, minute || 0);
    const now = new Date();
    
    const diffTime = now.getTime() - receptionDate.getTime();
    const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    
    return { days, hours, totalHours };
  }, [vehicle.receptionDate, vehicle.receptionTime]);

  const daysInWorkshop = timeInWorkshop.days;

  // Maximum allowed days (can be customized per vehicle type in future)
  const maxAllowedDays = 3;
  const maxAllowedHours = maxAllowedDays * 24;
  
  // Calculate delay
  const delayInfo = useMemo(() => {
    const overageHours = timeInWorkshop.totalHours - maxAllowedHours;
    if (overageHours <= 0) {
      return { hasDelay: false, delayDays: 0, delayHours: 0 };
    }
    
    const delayDays = Math.floor(overageHours / 24);
    const delayHours = overageHours % 24;
    
    return { hasDelay: true, delayDays, delayHours };
  }, [timeInWorkshop.totalHours, maxAllowedHours]);

  // Calculate progress percentage (cap at 100% for visual, but track actual for display)
  const progressPercent = Math.min((timeInWorkshop.totalHours / maxAllowedHours) * 100, 100);
  const overProgressPercent = delayInfo.hasDelay 
    ? Math.min(((timeInWorkshop.totalHours - maxAllowedHours) / maxAllowedHours) * 100, 100)
    : 0;

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

        {/* Timeline Progress Bar */}
        <Box sx={{ mt: 1.5, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <AccessTime sx={{ fontSize: '1rem', color: mode === 'dark' ? '#94a3b8' : '#64748b' }} />
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
              مدت خواب: {timeInWorkshop.days} روز
              {timeInWorkshop.hours > 0 && ` و ${timeInWorkshop.hours} ساعت`}
              {delayInfo.hasDelay && (
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                  {' '}(+{delayInfo.delayDays} روز
                  {delayInfo.delayHours > 0 && ` و ${delayInfo.delayHours} ساعت`}
                  {' '}تأخیر)
                </span>
              )}
            </Typography>
          </Box>
          
          {/* Progress bar container */}
          <Box sx={{ position: 'relative', height: 8, bgcolor: mode === 'dark' ? '#1e293b' : '#e2e8f0', borderRadius: 1, overflow: 'hidden' }}>
            {/* Normal time (green) */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${progressPercent}%`,
                bgcolor: delayInfo.hasDelay ? '#10b981' : '#10b981',
                transition: 'width 0.3s ease',
                borderRadius: 1,
              }}
            />
            
            {/* Delay time (red) - overlays on top */}
            {delayInfo.hasDelay && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${Math.min(progressPercent + overProgressPercent, 200)}%`,
                  background: 'linear-gradient(90deg, #10b981 0%, #10b981 50%, #ef4444 50%, #ef4444 100%)',
                  backgroundSize: '200% 100%',
                  backgroundPosition: 'left',
                  transition: 'width 0.3s ease',
                  borderRadius: 1,
                  animation: delayInfo.hasDelay ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                }}
              />
            )}
            
            {/* Marker for max allowed time */}
            <Box
              sx={{
                position: 'absolute',
                left: '100%',
                top: -2,
                width: 2,
                height: 12,
                bgcolor: mode === 'dark' ? '#64748b' : '#475569',
                transform: 'translateX(-1px)',
              }}
            />
          </Box>
          
          {/* Labels */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: mode === 'dark' ? '#64748b' : '#94a3b8' }}>
              ورود
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: mode === 'dark' ? '#64748b' : '#94a3b8' }}>
              حد مجاز: {maxAllowedDays} روز
            </Typography>
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, pt: 1, borderTop: `1px solid ${mode === 'dark' ? '#334155' : '#e2e8f0'}` }}>
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
