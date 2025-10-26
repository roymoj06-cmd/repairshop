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

  // Get color for days in workshop (using brand colors - subtle tones)
  const getDaysColor = (days: number) => {
    if (days <= 2) return { 
      bg: '#e8f5f1', // very light success green
      text: '#42a68c', 
      border: '#42a68c40' 
    }; 
    if (days <= 4) return { 
      bg: '#fff8e1', // very light warning yellow
      text: '#f2a102', 
      border: '#f2a10240' 
    }; 
    return { 
      bg: '#fef2f2', // very light danger red
      text: '#dc3545', 
      border: '#dc354540' 
    };
  };

  // Get status info (using brand design system)
  const getStatusInfo = () => {
    if (vehicle.status) {
      return { 
        label: 'آماده تحویل', 
        color: '#42a68c', // success
        bgColor: '#e8f5f1' 
      };
    }
    // Check description for specific statuses
    if (vehicle.description?.includes('منتظر قطعه')) {
      return { 
        label: 'منتظر قطعه', 
        color: '#f2a102', // warning
        bgColor: '#fff8e1' 
      };
    }
    if (vehicle.description?.includes('منتظر تایید')) {
      return { 
        label: 'منتظر تایید', 
        color: '#f2a102', // warning
        bgColor: '#fff8e1' 
      };
    }
    return { 
      label: 'در حال تعمیر', 
      color: '#98877b', // secondary
      bgColor: '#f5f5f5' 
    };
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
          p: 2.5,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          position: 'relative',
          bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
          border: mode === 'dark' ? '1px solid #333333' : '1px solid #ebebeb',
          borderRadius: '12px',
          boxShadow: mode === 'dark' 
            ? '0 2px 8px rgba(0,0,0,0.2)' 
            : '0 2px 12px rgba(31, 31, 31, 0.08)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'dark' 
              ? '0 4px 16px rgba(0,0,0,0.3)' 
              : '0 4px 20px rgba(31, 31, 31, 0.12)',
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

        {/* Status badge - top right, subtle design system style */}
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <Chip
            label={statusInfo.label}
            size="small"
            sx={{
              bgcolor: statusInfo.bgColor,
              color: statusInfo.color,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: '24px',
              borderRadius: '6px',
              border: `1px solid ${statusInfo.color}30`,
              px: 1,
            }}
          />
        </Box>

        {/* Days in workshop - soft brand colors */}
        <Box
          sx={{
            bgcolor: daysColor.bg,
            color: daysColor.text,
            p: 1.25,
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 700,
            border: `1px solid ${daysColor.border}`,
            fontSize: '0.875rem',
            letterSpacing: '0.01em',
          }}
        >
          {timeInWorkshop.days > 0 ? (
            <>{timeInWorkshop.days} روز در تعمیرگاه</>
          ) : (
            <>امروز وارد شده</>
          )}
        </Box>

        {/* Info Grid - cleaner spacing */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, mt: 0.5 }}>
          {/* Responsible person */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#c7c7c7' : '#808080', fontSize: '0.75rem' }}>
              مسئول:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: mode === 'dark' ? '#eeeeee' : '#1d1d1d', fontSize: '0.875rem' }}>
              {vehicle.customerName}
            </Typography>
          </Box>

          {/* Price */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#c7c7c7' : '#808080', fontSize: '0.75rem' }}>
              مبلغ:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 700, 
                color: mode === 'dark' ? '#42a68c' : '#42a68c',
                fontSize: '0.95rem'
              }}
            >
              {formatPrice(vehicle.totalPrice)}
            </Typography>
          </Box>

          {/* Last update */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#c7c7c7' : '#808080', fontSize: '0.75rem' }}>
              آخرین ثبت:
            </Typography>
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#c7c7c7' : '#666666', fontSize: '0.75rem' }}>
              {vehicle.receptionDate} - {vehicle.receptionTime}
            </Typography>
          </Box>

          {/* Physical location */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#c7c7c7' : '#808080', fontSize: '0.75rem' }}>
              محل:
            </Typography>
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#c7c7c7' : '#666666', fontSize: '0.75rem' }}>
              {vehicle.carTipTitle || 'نامشخص'}
            </Typography>
          </Box>
        </Box>

        {/* Timeline Progress Bar */}
        <Box sx={{ mt: 1.5, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
            <AccessTime sx={{ fontSize: '1rem', color: mode === 'dark' ? '#c7c7c7' : '#808080' }} />
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#c7c7c7' : '#666666', fontWeight: 600, fontSize: '0.75rem' }}>
              {timeInWorkshop.days === 0 && timeInWorkshop.hours === 0 ? (
                'تازه وارد شده'
              ) : (
                <>
                  مدت خواب: {timeInWorkshop.days} روز
                  {timeInWorkshop.hours > 0 && ` و ${timeInWorkshop.hours} ساعت`}
                  {delayInfo.hasDelay && (
                    <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
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
          <Box sx={{ position: 'relative', height: 6, bgcolor: mode === 'dark' ? '#333333' : '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
            {/* Normal time (brand success) */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${progressPercent}%`,
                bgcolor: '#42a68c',
                transition: 'width 0.3s ease',
                borderRadius: '3px',
              }}
            />
            
            {/* Delay time (brand danger) */}
            {delayInfo.hasDelay && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${Math.min(progressPercent + overProgressPercent, 200)}%`,
                  background: 'linear-gradient(90deg, #42a68c 0%, #42a68c 50%, #dc3545 50%, #dc3545 100%)',
                  backgroundSize: '200% 100%',
                  backgroundPosition: 'left',
                  transition: 'width 0.3s ease',
                  borderRadius: '3px',
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
                height: 10,
                bgcolor: mode === 'dark' ? '#666666' : '#c8c8c8',
                transform: 'translateX(-1px)',
              }}
            />
          </Box>
          
          {/* Labels */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: mode === 'dark' ? '#808080' : '#bbbbbb' }}>
              ورود
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: mode === 'dark' ? '#808080' : '#bbbbbb' }}>
              حد مجاز: {maxAllowedDays} روز
            </Typography>
          </Box>
        </Box>

        {/* Action buttons - Design System style */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          mt: 1, 
          pt: 1.5, 
          borderTop: mode === 'dark' ? '1px solid #333333' : '1px solid #ebebeb' 
        }}>
          {/* Note button - Ghost/Outline style */}
          <IconButton
            size="small"
            sx={{
              flex: 1,
              bgcolor: mode === 'dark' ? 'transparent' : '#ffffff',
              color: mode === 'dark' ? '#c7c7c7' : '#1d1d1d',
              border: mode === 'dark' ? '1px solid #505050' : '1px solid #c8c8c8',
              borderRadius: '8px',
              fontSize: '0.7rem',
              py: 0.75,
              '&:hover': {
                bgcolor: mode === 'dark' ? '#333333' : '#fafafa',
                borderColor: mode === 'dark' ? '#666666' : '#1d1d1d',
              },
            }}
            title="ثبت یادداشت"
          >
            <NoteAdd fontSize="small" />
          </IconButton>
          
          {/* Ready button - Secondary style */}
          <IconButton
            size="small"
            sx={{
              flex: 1,
              bgcolor: mode === 'dark' ? '#98877b' : '#aa8c78',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.7rem',
              py: 0.75,
              '&:hover': {
                bgcolor: mode === 'dark' ? '#aa8c78' : '#98877b',
              },
            }}
            title="اعلام آماده تحویل"
          >
            <CheckCircle fontSize="small" />
          </IconButton>
          
          {/* Request button - Primary style */}
          <IconButton
            size="small"
            sx={{
              flex: 1,
              bgcolor: mode === 'dark' ? '#2b2b2b' : '#1d1d1d',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.7rem',
              py: 0.75,
              '&:hover': {
                bgcolor: mode === 'dark' ? '#1d1d1d' : '#333333',
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
