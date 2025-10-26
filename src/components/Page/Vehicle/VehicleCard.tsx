import { IconButton, Paper, Chip, Box, Typography } from "@mui/material";
import { Delete as DeleteIcon, NoteAdd, CheckCircle, Build, AccessTime } from "@mui/icons-material";
import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import moment from "moment-jalaali";

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

  // Calculate days and hours in workshop using moment-jalaali for accurate conversion
  const timeInWorkshop = useMemo(() => {
    if (!vehicle.receptionDate) return { days: 0, hours: 0, totalHours: 0 };
    
    try {
      // Parse Jalali date - format: YYYY/MM/DD
      const dateTimeStr = vehicle.receptionTime 
        ? `${vehicle.receptionDate} ${vehicle.receptionTime}`
        : `${vehicle.receptionDate} 00:00`;
      
      // Parse as Jalali date using moment-jalaali
      const receptionMoment = moment(dateTimeStr, 'jYYYY/jMM/jDD HH:mm');
      
      if (!receptionMoment.isValid()) {
        console.warn('Invalid date:', vehicle.receptionDate);
        return { days: 0, hours: 0, totalHours: 0 };
      }
      
      const now = moment();
      const diffHours = now.diff(receptionMoment, 'hours');
      
      // Ensure non-negative difference
      if (diffHours < 0) {
        return { days: 0, hours: 0, totalHours: 0 };
      }
      
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      
      return { days, hours, totalHours: diffHours };
    } catch (error) {
      console.error('Error calculating time in workshop:', error);
      return { days: 0, hours: 0, totalHours: 0 };
    }
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

  // Get color for days in workshop (using brand colors)
  const getDaysColor = (days: number) => {
    if (days <= 2) return { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' }; // light green
    if (days <= 4) return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' }; // light yellow
    return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }; // light red
  };

  // Get status info (using brand colors)
  const getStatusInfo = () => {
    if (vehicle.status) {
      return { label: 'آماده تحویل', color: '#42a68c', bgColor: '#d1fae5' }; // brand success green
    }
    // Check description for specific statuses
    if (vehicle.description?.includes('منتظر قطعه')) {
      return { label: 'منتظر قطعه', color: '#92400e', bgColor: '#fef3c7' }; // beige/yellow
    }
    if (vehicle.description?.includes('منتظر تایید')) {
      return { label: 'منتظر تایید', color: '#92400e', bgColor: '#fef3c7' }; // beige/yellow
    }
    return { label: 'در حال تعمیر', color: '#98877b', bgColor: '#f5f5f4' }; // brand secondary gray-brown
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
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <PlateNumberDisplay
              plateSection1={vehicle.plateSection1}
              plateSection2={vehicle.plateSection2}
              plateSection3={vehicle.plateSection3}
              plateSection4={vehicle.plateSection4}
            />
          </Box>
        </Box>

        {/* Status badge - top left, subtle */}
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Chip
            label={statusInfo.label}
            size="small"
            sx={{
              bgcolor: statusInfo.bgColor,
              color: statusInfo.color,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: '22px',
              border: `1px solid ${statusInfo.color}20`,
            }}
          />
        </Box>

        {/* Days in workshop - prominent with brand colors */}
        <Box
          sx={{
            bgcolor: daysColor.bg,
            color: daysColor.text,
            p: 1.5,
            borderRadius: 1,
            textAlign: 'center',
            fontWeight: 'bold',
            border: `1px solid ${daysColor.border}`,
            fontSize: '0.9rem',
          }}
        >
          {timeInWorkshop.days > 0 ? (
            <>{timeInWorkshop.days} روز در تعمیرگاه</>
          ) : (
            <>امروز وارد شده</>
          )}
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
              {timeInWorkshop.days === 0 && timeInWorkshop.hours === 0 ? (
                'تازه وارد شده'
              ) : (
                <>
                  مدت خواب: {timeInWorkshop.days} روز
                  {timeInWorkshop.hours > 0 && ` و ${timeInWorkshop.hours} ساعت`}
                  {delayInfo.hasDelay && (
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                      {' '}(+{delayInfo.delayDays} روز
                      {delayInfo.delayHours > 0 && ` و ${delayInfo.delayHours} ساعت`}
                      {' '}تأخیر)
                    </span>
                  )}
                </>
              )}
            </Typography>
          </Box>
          
          {/* Progress bar container */}
          <Box sx={{ position: 'relative', height: 8, bgcolor: mode === 'dark' ? '#1e293b' : '#e5e7eb', borderRadius: 1, overflow: 'hidden' }}>
            {/* Normal time (brand green) */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${progressPercent}%`,
                bgcolor: '#42a68c',
                transition: 'width 0.3s ease',
                borderRadius: 1,
              }}
            />
            
            {/* Delay time (soft red) - overlays on top */}
            {delayInfo.hasDelay && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${Math.min(progressPercent + overProgressPercent, 200)}%`,
                  background: 'linear-gradient(90deg, #42a68c 0%, #42a68c 50%, #ef4444 50%, #ef4444 100%)',
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
                bgcolor: mode === 'dark' ? '#64748b' : '#9ca3af',
                transform: 'translateX(-1px)',
              }}
            />
          </Box>
          
          {/* Labels */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: mode === 'dark' ? '#64748b' : '#9ca3af' }}>
              ورود
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: mode === 'dark' ? '#64748b' : '#9ca3af' }}>
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
              bgcolor: mode === 'dark' ? '#1e3a8a' : '#dbeafe',
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
              bgcolor: mode === 'dark' ? '#15803d' : '#d1fae5',
              color: mode === 'dark' ? '#86efac' : '#065f46',
              borderRadius: 1,
              fontSize: '0.7rem',
              '&:hover': {
                bgcolor: mode === 'dark' ? '#166534' : '#a7f3d0',
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
              bgcolor: mode === 'dark' ? '#92400e' : '#fef3c7',
              color: mode === 'dark' ? '#fde68a' : '#92400e',
              borderRadius: 1,
              fontSize: '0.7rem',
              '&:hover': {
                bgcolor: mode === 'dark' ? '#78350f' : '#fde68a',
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
