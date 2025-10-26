import { FC, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getRepairReceptions } from "@/service/repair/repair.service";
import { PlateNumberDisplay } from "@/components";
import { useTheme } from "@/context/ThemeContext";

interface BaselineInitModalProps {
  open: boolean;
  onClose: () => void;
}

type VehicleStatus = 'in_repair' | 'system_released' | 'released';

interface VehicleStatusMapping {
  vehicleId: number;
  status: VehicleStatus;
}

const BaselineInitModal: FC<BaselineInitModalProps> = ({ open, onClose }) => {
  const { mode } = useTheme();
  const queryClient = useQueryClient();
  const [vehicleStatuses, setVehicleStatuses] = useState<Record<number, VehicleStatus>>({});
  const [step, setStep] = useState<'categorize' | 'confirm' | 'done'>('categorize');

  // Fetch all vehicles (not just undischarged)
  const { data: allVehicles, isLoading } = useQuery({
    queryKey: ["baselineVehicles"],
    queryFn: () => getRepairReceptions({
      page: 1,
      size: 1000,
      isDischarged: null, // Get all vehicles
    }),
    enabled: open,
  });

  const statusOptions: { value: VehicleStatus; label: string; color: string; bgColor: string }[] = [
    { 
      value: 'in_repair', 
      label: 'در تعمیرگاه', 
      color: '#3d8b78', 
      bgColor: '#f0faf7' 
    },
    { 
      value: 'system_released', 
      label: 'ترخیص سیستمی‌شده', 
      color: '#b8860b', 
      bgColor: '#fef9f0' 
    },
    { 
      value: 'released', 
      label: 'ترخیص‌شده', 
      color: '#706b66', 
      bgColor: '#f7f6f5' 
    },
  ];

  const handleStatusChange = (vehicleId: number, status: VehicleStatus) => {
    setVehicleStatuses(prev => ({
      ...prev,
      [vehicleId]: status
    }));
  };

  const handleSubmit = () => {
    // Save to localStorage
    const mappings: VehicleStatusMapping[] = Object.entries(vehicleStatuses).map(([id, status]) => ({
      vehicleId: Number(id),
      status
    }));

    localStorage.setItem('vehicleStatusBaseline', JSON.stringify(mappings));
    
    setStep('done');
    toast.success('وضعیت خودروها با موفقیت ثبت شد');
    
    // Invalidate queries to refresh the vehicle list
    queryClient.invalidateQueries({ queryKey: ['repairReceptions'] });
    
    setTimeout(() => {
      onClose();
      setStep('categorize');
    }, 2000);
  };

  const totalVehicles = allVehicles?.data?.values?.length || 0;
  const categorizedCount = Object.keys(vehicleStatuses).length;
  const inRepairCount = Object.values(vehicleStatuses).filter(s => s === 'in_repair').length;
  const systemReleasedCount = Object.values(vehicleStatuses).filter(s => s === 'system_released').length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
          borderRadius: '12px',
          fontFamily: '"IRANSans", sans-serif',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: mode === 'dark' ? '1px solid #333' : '1px solid #ececec',
        pb: 2,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"IRANSans", sans-serif' }}>
          راه‌اندازی اولیه سیستم (Baseline Initialization)
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {step === 'categorize' && (
          <>
            <Alert severity="info" sx={{ mb: 3, fontFamily: '"IRANSans", sans-serif' }}>
              لطفاً برای هر خودرو مشخص کنید که الان در چه وضعیتی است:
              <br />• <strong>در تعمیرگاه</strong>: خودروهایی که فیزیکی الان داخل تعمیرگاه هستند
              <br />• <strong>ترخیص سیستمی‌شده</strong>: خودروهایی که قبلاً تحویل داده شده‌اند ولی در سیستم هنوز فعالند
              <br />• <strong>ترخیص‌شده</strong>: برای ترخیص‌های رسمی آینده (معمولاً نیازی نیست الان انتخاب شود)
            </Alert>

            <Box sx={{ mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={(categorizedCount / totalVehicles) * 100} 
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="caption" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666' }}>
                دسته‌بندی شده: {categorizedCount} از {totalVehicles}
              </Typography>
            </Box>

            <Box sx={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}>
              {isLoading ? (
                <Typography>در حال بارگذاری...</Typography>
              ) : (
                allVehicles?.data?.values?.map((vehicle: any) => {
                  const currentStatus = vehicleStatuses[vehicle.id];

                  return (
                    <Box
                      key={vehicle.id}
                      sx={{
                        p: 2,
                        border: mode === 'dark' ? '1px solid #333' : '1px solid #e8e8e8',
                        borderRadius: '8px',
                        bgcolor: currentStatus 
                          ? (mode === 'dark' ? '#2a2a2a' : '#fafafa')
                          : (mode === 'dark' ? '#222' : '#fff'),
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ transform: 'scale(0.7)', transformOrigin: 'right' }}>
                          <PlateNumberDisplay
                            plateSection1={vehicle.plateSection1}
                            plateSection2={vehicle.plateSection2}
                            plateSection3={vehicle.plateSection3}
                            plateSection4={vehicle.plateSection4}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ fontFamily: '"IRANSans", sans-serif', color: mode === 'dark' ? '#e8e8e8' : '#2b2b2b' }}>
                          {vehicle.customerName}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {statusOptions.map((option) => (
                          <Chip
                            key={option.value}
                            label={option.label}
                            onClick={() => handleStatusChange(vehicle.id, option.value)}
                            sx={{
                              bgcolor: currentStatus === option.value ? option.bgColor : 'transparent',
                              color: currentStatus === option.value ? option.color : (mode === 'dark' ? '#888' : '#666'),
                              border: currentStatus === option.value 
                                ? `1.5px solid ${option.color}` 
                                : `1px solid ${mode === 'dark' ? '#444' : '#ddd'}`,
                              fontWeight: currentStatus === option.value ? 600 : 400,
                              fontSize: '0.75rem',
                              fontFamily: '"IRANSans", sans-serif',
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: option.bgColor,
                                borderColor: option.color,
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </>
        )}

        {step === 'confirm' && (
          <Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              آیا مطمئن هستید که می‌خواهید این تنظیمات را اعمال کنید؟
            </Alert>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: mode === 'dark' ? '#2a2a2a' : '#f5f5f5', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  خلاصه دسته‌بندی:
                </Typography>
                <Typography variant="body2">• خودروهای داخل تعمیرگاه: {inRepairCount}</Typography>
                <Typography variant="body2">• ترخیص سیستمی‌شده: {systemReleasedCount}</Typography>
                <Typography variant="body2">• دسته‌بندی نشده: {totalVehicles - categorizedCount}</Typography>
              </Box>
              <Alert severity="info">
                بعد از اعمال این تنظیمات، فقط خودروهای «در تعمیرگاه» در صفحه گاراژ نمایش داده می‌شوند.
              </Alert>
            </Box>
          </Box>
        )}

        {step === 'done' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ color: '#3d8b78', mb: 2, fontWeight: 600 }}>
              ✓ تنظیمات با موفقیت اعمال شد
            </Typography>
            <Typography variant="body2" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666' }}>
              صفحه گاراژ اکنون فقط خودروهای فعال را نمایش می‌دهد.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        borderTop: mode === 'dark' ? '1px solid #333' : '1px solid #ececec',
        p: 2,
        gap: 1,
      }}>
        {step === 'categorize' && (
          <>
            <Button 
              onClick={onClose} 
              sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666' }}
            >
              انصراف
            </Button>
            <Button
              variant="contained"
              onClick={() => setStep('confirm')}
              disabled={categorizedCount === 0}
              sx={{
                bgcolor: '#1d1d1d',
                color: '#fff',
                '&:hover': { bgcolor: '#2b2b2b' },
                fontFamily: '"IRANSans", sans-serif',
              }}
            >
              ادامه ({categorizedCount} مورد)
            </Button>
          </>
        )}
        {step === 'confirm' && (
          <>
            <Button 
              onClick={() => setStep('categorize')} 
              sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666' }}
            >
              بازگشت
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                bgcolor: '#3d8b78',
                color: '#fff',
                '&:hover': { bgcolor: '#2f6d5f' },
                fontFamily: '"IRANSans", sans-serif',
              }}
            >
              تایید و اعمال
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BaselineInitModal;
