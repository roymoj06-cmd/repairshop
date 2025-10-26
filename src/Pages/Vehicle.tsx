import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ExpandMore, FilterList, Settings } from "@mui/icons-material";
import { toast } from "react-toastify";
import { FC, useState, useMemo } from "react";
import {
  AccordionSummary,
  AccordionDetails,
  Grid,
  useMediaQuery,
  Accordion,
  Paper,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";

import {
  getRepairReceptions,
  getRepairReceptionsByCustomerId,
} from "@/service/repair/repair.service";
import { getCustomers } from "@/service/customer/customer.service";
import { useStore } from "@/Store/useStore";
import { useTheme } from "@/context/ThemeContext";
import dir from "@/Router/dir";
import {
  PlateNumberDisplay,
  EnhancedSelect,
  VehicleCard,
  Loading,
} from "@/components";

const Vehicle: FC = () => {
  const [, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<plateSection>({ isDischarged: "false" });
  const navigate = useNavigate();
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const { user } = useStore();
  const { mode } = useTheme();
  
  // Check if baseline setup is completed
  const isBaselineCompleted = localStorage.getItem('baselineSetupCompleted') === 'true';
  
  const isCustomRange = useMediaQuery(
    "(min-width: 1200px) and (max-width: 1300px)"
  );
  const getGridSize = () => {
    if (isCustomRange) {
      return { xs: 12, sm: 6, md: 3, lg: 3 };
    }
    return { xs: 12, sm: 6, md: 3, lg: 2 };
  };
  const statusOptions = [
    { value: null, label: "همه" },
    { value: "false", label: "ترخیص نشده" },
    { value: "true", label: "ترخیص شده" },
  ];
  // Get baseline status mappings from localStorage
  const getBaselineStatuses = () => {
    const stored = localStorage.getItem('vehicleStatusBaseline');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as Record<number, 'in_repair' | 'system_released' | 'released'>;
    } catch {
      return null;
    }
  };

  const { isPending: isPendingRepairReceptions, data: vehicles } = useQuery({
    queryKey: ["repairReceptions", filter],
    queryFn: async () => {
      let result;
      if (!user?.isDinawinEmployee) {
        result = await getRepairReceptionsByCustomerId({
          page: 1,
          size: 1000,
          isDischarged:
            filter?.isDischarged !== null ? filter?.isDischarged : undefined,
          plateSection1: filter?.plateSection1,
          plateSection2: filter?.plateSection2,
          plateSection3: filter?.plateSection3,
          plateSection4: filter?.plateSection4,
        });
      } else {
        result = await getRepairReceptions({
          page: 1,
          size: 1000,
          isDischarged:
            filter?.isDischarged !== null ? filter?.isDischarged : undefined,
          customerId: filter?.customerId,
          plateSection1: filter?.plateSection1,
          plateSection2: filter?.plateSection2,
          plateSection3: filter?.plateSection3,
          plateSection4: filter?.plateSection4,
        });
      }

      // Baseline filtering temporarily disabled to show all vehicles
      return result;
    },
  });
  const { mutateAsync: searchCustomers, isPending } = useMutation({
    mutationFn: getCustomers,
    onSuccess: (data) => {
      if (data?.isSuccess) {
        const options = data?.data?.map((i: any) => ({
          label: i?.fullName,
          value: i.customerId,
          id: `customer-${i.customerId}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
        }));
        setCustomerOptions(options || []);
      } else {
        toast?.error(data?.message);
      }
    },
  });
  const handleStatusChange = (newValue: any) => {
    setFilter({
      ...filter,
      isDischarged: newValue?.value,
    });
    setSearchParams({ page: "1" });
  };
  const handleCustomerSearch = (newValue: any) => {
    if (newValue?.value) {
      setFilter((prev: any) => ({ ...prev, customerId: newValue.value }));
    } else {
      setFilter((prev: any) => ({ ...prev, customerId: undefined }));
    }
    setSearchParams({ page: "1" });
  };
  const handleInputChange = (newInputValue: string) => {
    if (newInputValue.length >= 2) {
      searchCustomers(newInputValue);
    }
  };
  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const allVehicles = vehicles?.data?.values || [];
    const total = allVehicles.length;
    
    // Calculate delayed vehicles (more than 3 days)
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    const delayed = allVehicles.filter((v: any) => {
      if (!v.receptionDate) return false;
      const [year, month, day] = v.receptionDate.split('/').map(Number);
      const receptionDate = new Date(year, month - 1, day);
      return receptionDate < threeDaysAgo;
    }).length;
    
    // Calculate waiting for parts (based on status or other criteria)
    // For now, we'll use a placeholder - you may need to adjust based on actual data structure
    const waitingForParts = allVehicles.filter((v: any) => 
      v.description?.includes('منتظر قطعه') || 
      v.description?.includes('خرید قطعه')
    ).length;
    
    // Calculate ready for delivery today (factored but not discharged)
    const readyForDelivery = allVehicles.filter((v: any) => 
      v.status === true && !v.isDischarged
    ).length;
    
    return {
      total,
      delayed,
      waitingForParts,
      readyForDelivery
    };
  }, [vehicles?.data?.values]);
  const handleCardClick = (
    receptionId: string | number,
    event?: React.MouseEvent
  ) => {
    // Prevent navigation if the click is on a dialog, modal, or delete button
    if (event) {
      const target = event.target as HTMLElement;
      const clickedElement = target.closest(
        '.MuiDialog-root, .MuiModal-root, .delete-button, [role="dialog"]'
      );
      if (clickedElement) {
        return;
      }
    }

    navigate({
      pathname: `${dir.serviceAdmission}`,
      search: `repairReceptionId=${receptionId}`,
    });
  };

  return (
    <Box className="vehicle-page" sx={{ 
      bgcolor: mode === 'dark' ? '#222222' : '#fafafa',
      minHeight: '100vh'
    }}>
      {isPendingRepairReceptions && <Loading />}
      
      {/* Baseline Initialization Button */}
      {!isBaselineCompleted && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
          px: 2,
        }}>
          <Paper
            sx={{
              p: 2,
              bgcolor: mode === 'dark' ? '#2a2a2a' : '#fff3cd',
              border: mode === 'dark' ? '1px solid #444' : '1px solid #ffc107',
              borderRadius: '8px',
              width: '100%',
              maxWidth: 600,
              textAlign: 'center'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"IRANSans", sans-serif',
                color: mode === 'dark' ? '#e0e0e0' : '#856404',
                mb: 1.5
              }}
            >
              برای شروع استفاده از سیستم، لطفاً راه‌اندازی اولیه را انجام دهید.
              این کار فقط یک‌بار لازم است.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Settings />}
              onClick={() => navigate(dir.baselineSetup)}
              sx={{
                bgcolor: '#3d8b78',
                color: '#ffffff',
                fontFamily: '"IRANSans", sans-serif',
                '&:hover': {
                  bgcolor: '#357a67',
                }
              }}
            >
              راه‌اندازی اولیه سیستم
            </Button>
          </Paper>
        </Box>
      )}

      <Box>
        <Accordion
          defaultExpanded
          sx={{
            borderRadius: '12px',
            mb: 2,
            bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
            border: mode === 'dark' ? '1px solid #333333' : '1px solid #ebebeb',
            boxShadow: mode === 'dark' 
              ? '0 2px 8px rgba(0,0,0,0.2)' 
              : '0 2px 12px rgba(31, 31, 31, 0.08)',
            '&:before': {
              display: 'none',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="filters-content"
            id="filters-header"
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <FilterList />
              <span className="font-16 ms-2">فیلتر ها</span>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} display="flex" alignItems="end">
              <Grid size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                <label className="font-12">شماره پلاک</label>
                <PlateNumberDisplay
                  state={filter}
                  setState={setFilter}
                  setPage={setSearchParams}
                />
              </Grid>
              {user?.isDinawinEmployee && (
                <Grid size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                  <EnhancedSelect
                    onChange={handleCustomerSearch}
                    loading={isPending}
                    onInputChange={(value) => {
                      handleInputChange(value);
                    }}
                    options={customerOptions}
                    enableSpeechToText={true}
                    label="جستجوی مشتری"
                    iconPosition="end"
                    searchable={true}
                    disabled={false}
                    name="customer"
                    isRtl={true}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                <EnhancedSelect
                  value={
                    statusOptions?.find(
                      (option) => option.value === filter?.isDischarged
                    ) || statusOptions[0]
                  }
                  onChange={handleStatusChange}
                  enableSpeechToText={true}
                  options={statusOptions}
                  loading={isPending}
                  name="isDischarged"
                  iconPosition="end"
                  searchable={true}
                  disabled={false}
                  label="وضعیت"
                  isRtl={true}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* KPI Dashboard - Design System Colored Cards */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)',
              color: '#1d1d1d',
              boxShadow: '0 2px 12px rgba(31, 31, 31, 0.08)',
              borderRadius: '12px',
              border: '1px solid #ebebeb'
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ mb: 0.5, color: '#1d1d1d' }}>
                  {kpiMetrics.total}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.875rem' }}>
                  خودروهای داخل تعمیرگاه
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)',
              color: '#dc3545',
              boxShadow: '0 2px 12px rgba(220, 53, 69, 0.1)',
              borderRadius: '12px',
              border: '1px solid #fecaca'
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ mb: 0.5, color: '#dc3545' }}>
                  {kpiMetrics.delayed}
                </Typography>
                <Typography variant="body2" sx={{ color: '#991b1b', fontSize: '0.875rem' }}>
                  بیش از ۳ روز خوابیده
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #fff8e1 0%, #fffbeb 100%)',
              color: '#f2a102',
              boxShadow: '0 2px 12px rgba(242, 161, 2, 0.1)',
              borderRadius: '12px',
              border: '1px solid #fde68a'
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ mb: 0.5, color: '#f2a102' }}>
                  {kpiMetrics.waitingForParts}
                </Typography>
                <Typography variant="body2" sx={{ color: '#92400e', fontSize: '0.875rem' }}>
                  منتظر قطعه / خرید
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #e8f5f1 0%, #f0faf7 100%)',
              color: '#42a68c',
              boxShadow: '0 2px 12px rgba(66, 166, 140, 0.1)',
              borderRadius: '12px',
              border: '1px solid #a7f3d0'
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ mb: 0.5, color: '#42a68c' }}>
                  {kpiMetrics.readyForDelivery}
                </Typography>
                <Typography variant="body2" sx={{ color: '#065f46', fontSize: '0.875rem' }}>
                  آماده تحویل امروز
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box className="vehicle-cards-container p-2">
        <Grid container spacing={2}>
          {vehicles?.data?.values?.map((vehicle: any) => (
            <Grid size={getGridSize()} key={vehicle.id}>
              <Paper
                className="vehicle-card-container cursor-pointer"
                onClick={(e) => handleCardClick(vehicle.id, e)}
              >
                <VehicleCard vehicle={vehicle} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Vehicle;
