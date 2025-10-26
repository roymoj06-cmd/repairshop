import { IconButton, Paper, Chip, Box, Typography, Tooltip } from "@mui/material";
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

  // Get color for days in workshop (subtle, calm colors)
  const getDaysColor = (days: number) => {
    if (days <= 2) return { 
      bg: '#f0faf7', // very light subtle green
      text: '#3d8b78', 
      border: '#c7e7dc' 
    }; 
    if (days <= 4) return { 
      bg: '#fef9f0', // very light beige/gold
      text: '#b8860b', 
      border: '#f0e4c7' 
    }; 
    return { 
      bg: '#faf5f5', // very light brownish-red
      text: '#a0614f', 
      border: '#e8d6d3' 
    };
  };

  // Get vehicle status badge info based on database fields
  const getVehicleStatusInfo = () => {
    // مقیم = داخل تعمیرگاه
    if (vehicle.isDischarged !== true && vehicle.isTemporaryRelease !== true) {
      return {
        label: 'در تعمیرگاه',
        color: '#5a4a3a',
        bgColor: '#f5ede3',
        borderColor: '#D9CBB8'
      };
    }
    
    // ترخیص موقت = بیرون ولی پرونده بسته نشده
    if (vehicle.isDischarged !== true && vehicle.isTemporaryRelease === true) {
      return {
        label: 'ترخیص موقت',
        color: '#9a7f2a',
        bgColor: '#fef9ec',
        borderColor: '#E6C56D'
      };
    }
    
    // ترخیص شده = تحویل کامل
    if (vehicle.isDischarged === true) {
      return {
        label: 'ترخیص‌شده',
        color: '#3a5a32',
        bgColor: '#eff7ed',
        borderColor: '#B9D8B2'
      };
    }
    
    // Default fallback
    return {
      label: 'در تعمیرگاه',
      color: '#5a4a3a',
      bgColor: '#f5ede3',
      borderColor: '#D9CBB8'
    };
  };

  // Get secondary status info (work status)
  const getWorkStatusInfo = () => {
    if (vehicle.status) {
      return { 
        label: 'آماده تحویل', 
        color: '#3d8b78', 
        bgColor: '#f0faf7' 
      };
    }
    if (vehicle.description?.includes('منتظر قطعه')) {
      return { 
        label: 'منتظر قطعه', 
        color: '#b8860b', 
        bgColor: '#fef9f0' 
      };
    }
    if (vehicle.description?.includes('منتظر تایید')) {
      return { 
        label: 'منتظر تایید', 
        color: '#b8860b', 
        bgColor: '#fef9f0' 
      };
    }
    return { 
      label: 'در حال تعمیر', 
      color: '#706b66', 
      bgColor: '#f7f6f5' 
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

  const vehicleStatusInfo = getVehicleStatusInfo();
  const workStatusInfo = getWorkStatusInfo();
  const daysColor = getDaysColor(daysInWorkshop);

  return (
    <>
      <Paper 
        className="vehicle-card-modern cursor-pointer"
        sx={{
          p: 2.5,
          height: '420px', // Fixed height for all cards
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
          border: mode === 'dark' ? '1px solid #333333' : '1px solid #e8e8e8',
          borderRadius: '10px',
          boxShadow: mode === 'dark' 
            ? '0 1px 6px rgba(0,0,0,0.15)' 
            : '0 1px 8px rgba(31, 31, 31, 0.06)',
          transition: 'all 0.2s ease',
          fontFamily: '"IRANSans", sans-serif',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'dark' 
              ? '0 3px 12px rgba(0,0,0,0.25)' 
              : '0 3px 16px rgba(31, 31, 31, 0.1)',
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

        {/* Header: Plate Number with dual status badges */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5, position: 'relative' }}>
          <Box sx={{ flex: 1 }}>
            <PlateNumberDisplay
              plateSection1={vehicle.plateSection1}
              plateSection2={vehicle.plateSection2}
              plateSection3={vehicle.plateSection3}
              plateSection4={vehicle.plateSection4}
            />
          </Box>
        </Box>
        
        {/* Status badges - vehicle status and work status */}
        <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5, flexWrap: 'wrap' }}>
          {/* Primary: Vehicle Status */}
          <Chip
            label={vehicleStatusInfo.label}
            size="small"
            sx={{
              bgcolor: vehicleStatusInfo.bgColor,
              color: vehicleStatusInfo.color,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: '24px',
              borderRadius: '6px',
              border: `1.5px solid ${vehicleStatusInfo.borderColor}`,
              px: 1,
              fontFamily: '"IRANSans", sans-serif',
            }}
          />
          
          {/* Secondary: Work Status */}
          <Chip
            label={workStatusInfo.label}
            size="small"
            sx={{
              bgcolor: workStatusInfo.bgColor,
              color: workStatusInfo.color,
              fontWeight: 500,
              fontSize: '0.68rem',
              height: '24px',
              borderRadius: '6px',
              border: `1px solid ${workStatusInfo.color}25`,
              px: 0.75,
              fontFamily: '"IRANSans", sans-serif',
            }}
          />
        </Box>

        {/* Days in workshop - calm colors with spacing */}
        <Box
          sx={{
            bgcolor: daysColor.bg,
            color: daysColor.text,
            p: 1,
            mt: 1,
            borderRadius: '6px',
            textAlign: 'center',
            fontWeight: 500,
            border: `1px solid ${daysColor.border}`,
            fontSize: '0.8rem',
            letterSpacing: '0.02em',
            fontFamily: '"IRANSans", sans-serif',
          }}
        >
          {timeInWorkshop.days > 0 ? (
            <>{timeInWorkshop.days} روز در تعمیرگاه</>
          ) : (
            <>امروز وارد شده</>
          )}
        </Box>

        {/* Info Grid - improved spacing */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1.25, 
          flex: 1, 
          mt: 1.5,
          mb: 1.5 
        }}>
          {/* Responsible person */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: mode === 'dark' ? '#b0b0b0' : '#888888', 
                fontSize: '0.75rem',
                fontFamily: '"IRANSans", sans-serif',
              }}
            >
              مسئول:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 400, 
                color: mode === 'dark' ? '#e8e8e8' : '#2b2b2b', 
                fontSize: '0.85rem',
                fontFamily: '"IRANSans", sans-serif',
              }}
            >
              {vehicle.customerName}
            </Typography>
          </Box>

          {/* Price */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: mode === 'dark' ? '#b0b0b0' : '#888888', 
                fontSize: '0.75rem',
                fontFamily: '"IRANSans", sans-serif',
              }}
            >
              مبلغ:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500, 
                color: mode === 'dark' ? '#3d8b78' : '#3d8b78',
                fontSize: '0.9rem',
                fontFamily: '"IRANSans", sans-serif',
              }}
            >
              {formatPrice(vehicle.totalPrice)}
            </Typography>
          </Box>

          {/* Last update */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: mode === 'dark' ? '#b0b0b0' : '#888888', 
                fontSize: '0.75rem',
                fontFamily: '"IRANSans", sans-serif',
              }}
            >
              آخرین ثبت:
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: mode === 'dark' ? '#c0c0c0' : '#666666', 
                fontSize: '0.75rem',
                fontFamily: '"IRANSans", sans-serif',
              }}
            >
              {vehicle.receptionDate} - {vehicle.receptionTime}
            </Typography>
          </Box>

          {/* Physical location */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: mode === 'dark' ? '#b0b0b0' : '#888888', 
                fontSize: '0.75rem',
                fontFamily: '"IRANSans", sans-serif',
              }}
            >
              محل:
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: mode === 'dark' ? '#c0c0c0' : '#666666', 
                fontSize: '0.75rem',
                fontFamily: '"IRANSans", sans-serif',
              }}
            >
              {vehicle.carTipTitle || 'نامشخص'}
            </Typography>
          </Box>
        </Box>

        {/* Timeline Progress Bar - Professional gradient design */}
        <Box sx={{ mb: 1.5, px: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
            <AccessTime sx={{ fontSize: '0.9rem', color: mode === 'dark' ? '#b0b0b0' : '#888888' }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: mode === 'dark' ? '#b0b0b0' : '#666666', 
                fontWeight: 400, 
                fontSize: '0.72rem',
                fontFamily: '"IRANSans", sans-serif',
              }}
            >
              {timeInWorkshop.days === 0 && timeInWorkshop.hours === 0 ? (
                'تازه وارد شده'
              ) : (
                <>
                  مدت خواب: {timeInWorkshop.days} روز
                  {timeInWorkshop.hours > 0 && ` و ${timeInWorkshop.hours} ساعت`}
                </>
              )}
            </Typography>
          </Box>
          
          {/* Progress bar container - smooth gradient design */}
          <Box sx={{ 
            position: 'relative', 
            height: 6, 
            bgcolor: mode === 'dark' ? '#2a2a2a' : '#E9E7E5', 
            borderRadius: '8px', 
            overflow: 'hidden',
            border: '1px solid #DDD'
          }}>
            {/* Progress fill with gradient */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${Math.min(progressPercent, 100)}%`,
                borderRadius: '8px 0 0 8px',
                background: delayInfo.hasDelay 
                  ? `linear-gradient(to right, #A3C49F 0%, #E6C56D 70%, #C86B5A 100%)`
                  : progressPercent > 70
                    ? `linear-gradient(to right, #A3C49F 0%, #A3C49F ${100 - progressPercent}%, #E6C56D 100%)`
                    : '#A3C49F',
                transition: 'width 0.6s ease-in-out',
                boxShadow: mode === 'dark' 
                  ? '0 1px 3px rgba(0,0,0,0.3)' 
                  : '0 1px 3px rgba(0,0,0,0.1)',
              }}
            />
            
            {/* Current position marker with tooltip */}
            <Tooltip 
              title={
                <Box sx={{ p: 0.5, fontFamily: '"IRANSans", sans-serif' }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    مدت خواب: {timeInWorkshop.days} روز
                    {timeInWorkshop.hours > 0 && ` و ${timeInWorkshop.hours} ساعت`}
                  </Typography>
                  {delayInfo.hasDelay && (
                    <Typography variant="caption" sx={{ display: 'block', color: '#ffcccb', fontSize: '0.7rem', mt: 0.5 }}>
                      ({delayInfo.delayDays} روز
                      {delayInfo.delayHours > 0 && ` و ${delayInfo.delayHours} ساعت`}
                      {' '}تأخیر)
                    </Typography>
                  )}
                </Box>
              }
              arrow
              placement="top"
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: `${Math.min(progressPercent, 100)}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 10,
                  height: 10,
                  bgcolor: '#5C544E',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  zIndex: 2,
                  '&:hover': {
                    transform: 'translate(-50%, -50%) scale(1.3)',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
                  }
                }}
              />
            </Tooltip>
            
            {/* Max allowed time marker - inside the bar */}
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: 1.5,
                height: '100%',
                bgcolor: mode === 'dark' ? '#555555' : '#bbbbbb',
                opacity: 0.6,
                zIndex: 1,
              }}
            />
          </Box>
          
          {/* Labels with color coding */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.75 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.65rem', 
                color: delayInfo.hasDelay 
                  ? '#C86B5A' 
                  : (progressPercent > 70 ? '#E6C56D' : '#7A9A77'),
                fontFamily: '"IRANSans", sans-serif',
                fontWeight: 400,
              }}
            >
              {delayInfo.hasDelay 
                ? `+${delayInfo.delayDays} روز تأخیر` 
                : progressPercent > 70 
                  ? 'نزدیک به حد مجاز'
                  : 'در محدوده مجاز'
              }
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.65rem', 
                color: mode === 'dark' ? '#777777' : '#aaaaaa',
                fontFamily: '"IRANSans", sans-serif',
              }}
            >
              حد مجاز: {maxAllowedDays} روز
            </Typography>
          </Box>
        </Box>

        {/* Action buttons - Smaller icons, consistent spacing */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          pt: 1.5, 
          borderTop: mode === 'dark' ? '1px solid #2a2a2a' : '1px solid #ececec',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* Note button - Outline style */}
          <IconButton
            size="small"
            sx={{
              flex: 1,
              bgcolor: mode === 'dark' ? 'transparent' : '#ffffff',
              color: mode === 'dark' ? '#b0b0b0' : '#2b2b2b',
              border: mode === 'dark' ? '1px solid #444444' : '1px solid #d0d0d0',
              borderRadius: '6px',
              py: 0.6,
              '&:hover': {
                bgcolor: mode === 'dark' ? '#2a2a2a' : '#f8f8f8',
                borderColor: mode === 'dark' ? '#555555' : '#2b2b2b',
              },
            }}
            title="ثبت یادداشت"
          >
            <NoteAdd sx={{ fontSize: '1.1rem' }} />
          </IconButton>
          
          {/* Ready button - Secondary style */}
          <IconButton
            size="small"
            sx={{
              flex: 1,
              bgcolor: mode === 'dark' ? '#706b66' : '#98877b',
              color: '#ffffff',
              borderRadius: '6px',
              py: 0.6,
              '&:hover': {
                bgcolor: mode === 'dark' ? '#7d7873' : '#8a7a6e',
              },
            }}
            title="اعلام آماده تحویل"
          >
            <CheckCircle sx={{ fontSize: '1.1rem' }} />
          </IconButton>
          
          {/* Request button - Primary style */}
          <IconButton
            size="small"
            sx={{
              flex: 1,
              bgcolor: mode === 'dark' ? '#1d1d1d' : '#1d1d1d',
              color: '#ffffff',
              borderRadius: '6px',
              py: 0.6,
              '&:hover': {
                bgcolor: mode === 'dark' ? '#2b2b2b' : '#2b2b2b',
              },
            }}
            title="درخواست قطعه"
          >
            <Build sx={{ fontSize: '1.1rem' }} />
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
