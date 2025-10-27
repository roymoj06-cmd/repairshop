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
  
  // Separate query for KPI metrics - fetch ALL vehicles without filters
  const { data: allVehiclesForKPI } = useQuery({
    queryKey: ["allVehiclesKPI"],
    queryFn: async () => {
      if (!user?.isDinawinEmployee) {
        return await getRepairReceptionsByCustomerId({
          page: 1,
          size: 10000, // Get all
        });
      } else {
        return await getRepairReceptions({
          page: 1,
          size: 10000, // Get all
        });
      }
    },
  });
  
  const isCustomRange = useMediaQuery(
    "(min-width: 1200px) and (max-width: 1300px)"
  );
  const getGridSize = () => {
    if (isCustomRange) {
      return { xs: 12, sm: 6, md: 3, lg: 3 };
    }
    return { xs: 12, sm: 6, md: 3, lg: 2 };
  };
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState<'Resident' | 'TempReleased' | 'Released' | null>('Resident');
  
  // New status filter options
  const vehicleStatusOptions = [
    { value: 'Resident', label: "🚗 خودروهای مقیم" },
    { value: 'TempReleased', label: "🟡 ترخیص موقت" },
    { value: 'Released', label: "🟢 ترخیص‌شده" },
  ];

  const { isPending: isPendingRepairReceptions, data: vehicles } = useQuery({
    queryKey: ["repairReceptions", filter, vehicleStatusFilter],
    queryFn: async () => {
      let result;
      
      // Determine isDischarged filter based on vehicle status filter
      let dischargedFilter: boolean | null | undefined = filter?.isDischarged !== null ? filter?.isDischarged : undefined;
      
      // Override isDischarged filter based on vehicle status
      if (vehicleStatusFilter === 'Resident' || vehicleStatusFilter === 'TempReleased') {
        dischargedFilter = false; // Both are undischarged
      } else if (vehicleStatusFilter === 'Released') {
        dischargedFilter = true; // Released means discharged
      }
      
      if (!user?.isDinawinEmployee) {
        result = await getRepairReceptionsByCustomerId({
          page: 1,
          size: 1000,
          isDischarged: dischargedFilter,
          plateSection1: filter?.plateSection1,
          plateSection2: filter?.plateSection2,
          plateSection3: filter?.plateSection3,
          plateSection4: filter?.plateSection4,
        });
      } else {
        result = await getRepairReceptions({
          page: 1,
          size: 1000,
          isDischarged: dischargedFilter,
          customerId: filter?.customerId,
          plateSection1: filter?.plateSection1,
          plateSection2: filter?.plateSection2,
          plateSection3: filter?.plateSection3,
          plateSection4: filter?.plateSection4,
        });
      }

      // Filter by vehicle status (Resident vs TempReleased vs Released)
      if (vehicleStatusFilter && result?.data?.values) {
        const filteredValues = result.data.values.filter((v: IGetRepairReceptions) => {
          if (vehicleStatusFilter === 'Resident') {
            // مقیم = isResidentVehicle === true
            return v.isResidentVehicle === true;
          } else if (vehicleStatusFilter === 'TempReleased') {
            // ترخیص موقت = isTemporaryRelease === true
            return v.isTemporaryRelease === true;
          } else if (vehicleStatusFilter === 'Released') {
            // ترخیص شده = isDischarged === true
            return v.isDischarged === true;
          }
          return true;
        });
        
        console.log(`Filter: ${vehicleStatusFilter}, Total: ${result.data.values.length}, Filtered: ${filteredValues.length}`);
        
        return {
          ...result,
          data: {
            ...result.data,
            values: filteredValues,
            totalCount: filteredValues.length
          }
        };
      }

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
  // Calculate KPI metrics based on ALL vehicles (separate query, no filters)
  const kpiMetrics = useMemo(() => {
    const allVehicles = allVehiclesForKPI?.data?.values || [];
    
    // مقیم = isResidentVehicle === true
    const residentCount = allVehicles.filter((v: any) => 
      v.isResidentVehicle === true
    ).length;
    
    // ترخیص موقت = isTemporaryRelease === true
    const tempReleasedCount = allVehicles.filter((v: any) => 
      v.isTemporaryRelease === true
    ).length;
    
    // ترخیص شده = تحویل کامل
    const releasedCount = allVehicles.filter((v: any) => 
      v.isDischarged === true
    ).length;
    
    const total = residentCount + tempReleasedCount + releasedCount;
    
    console.log('KPI Metrics:', { resident: residentCount, tempReleased: tempReleasedCount, released: releasedCount, total });
    
    return {
      resident: residentCount,
      tempReleased: tempReleasedCount,
      released: releasedCount,
      total
    };
  }, [allVehiclesForKPI?.data?.values]);
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

      {/* Reset Baseline Button - Always visible */}
      {isBaselineCompleted && (
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
              bgcolor: mode === 'dark' ? '#2a2a2a' : '#fff0f0',
              border: mode === 'dark' ? '1px solid #444' : '1px solid #f87171',
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
                color: mode === 'dark' ? '#e0e0e0' : '#991b1b',
                mb: 1.5
              }}
            >
              اگر می‌خواهید راه‌اندازی اولیه را مجدداً انجام دهید، می‌توانید وضعیت را ریست کنید.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Settings />}
              onClick={() => {
                localStorage.removeItem('baselineSetupCompleted');
                toast.info('راه‌اندازی اولیه ریست شد. صفحه بازخوانی می‌شود...');
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }}
              sx={{
                bgcolor: '#dc3545',
                color: '#ffffff',
                fontFamily: '"IRANSans", sans-serif',
                '&:hover': {
                  bgcolor: '#c82333',
                }
              }}
            >
              ریست راه‌اندازی اولیه
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
              {/* Vehicle Status Filter - Primary filter */}
              <Grid size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                <label className="font-12" style={{ 
                  fontFamily: '"IRANSans", sans-serif',
                  color: mode === 'dark' ? '#e8e8e8' : '#2b2b2b'
                }}>وضعیت خودرو</label>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  {vehicleStatusOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={vehicleStatusFilter === option.value ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setVehicleStatusFilter(option.value as any)}
                      sx={{
                        fontFamily: '"IRANSans", sans-serif',
                        fontSize: '0.75rem',
                        bgcolor: vehicleStatusFilter === option.value 
                          ? (option.value === 'Resident' ? '#D9CBB8' : 
                             option.value === 'TempReleased' ? '#E6C56D' : '#B9D8B2')
                          : 'transparent',
                        color: vehicleStatusFilter === option.value 
                          ? '#2b2b2b'
                          : (mode === 'dark' ? '#e8e8e8' : '#2b2b2b'),
                        borderColor: option.value === 'Resident' ? '#D9CBB8' : 
                                     option.value === 'TempReleased' ? '#E6C56D' : '#B9D8B2',
                        '&:hover': {
                          bgcolor: vehicleStatusFilter === option.value 
                            ? (option.value === 'Resident' ? '#cbbe9f' : 
                               option.value === 'TempReleased' ? '#d9b554' : '#a8c79f')
                            : (mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                        }
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Box>
              </Grid>
              
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
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* KPI Dashboard - New Status-Based Cards */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #f5ede3 0%, #faf6f0 100%)',
                boxShadow: '0 2px 12px rgba(217, 203, 184, 0.2)',
                borderRadius: '12px',
                border: '1px solid #D9CBB8',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 16px rgba(217, 203, 184, 0.3)',
                }
              }}
              onClick={() => setVehicleStatusFilter('Resident')}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ mb: 0.5, color: '#5a4a3a', fontFamily: '"IRANSans", sans-serif' }}>
                  {kpiMetrics.resident}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7a6a5a', fontSize: '0.875rem', fontFamily: '"IRANSans", sans-serif' }}>
                  🚗 خودروهای مقیم
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #fef9ec 0%, #fffcf2 100%)',
                boxShadow: '0 2px 12px rgba(230, 197, 109, 0.2)',
                borderRadius: '12px',
                border: '1px solid #E6C56D',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 16px rgba(230, 197, 109, 0.3)',
                }
              }}
              onClick={() => setVehicleStatusFilter('TempReleased')}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ mb: 0.5, color: '#9a7f2a', fontFamily: '"IRANSans", sans-serif' }}>
                  {kpiMetrics.tempReleased}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b89f4a', fontSize: '0.875rem', fontFamily: '"IRANSans", sans-serif' }}>
                  🟡 ترخیص موقت
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #eff7ed 0%, #f5faf3 100%)',
                boxShadow: '0 2px 12px rgba(185, 216, 178, 0.2)',
                borderRadius: '12px',
                border: '1px solid #B9D8B2',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 16px rgba(185, 216, 178, 0.3)',
                }
              }}
              onClick={() => setVehicleStatusFilter('Released')}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ mb: 0.5, color: '#3a5a32', fontFamily: '"IRANSans", sans-serif' }}>
                  {kpiMetrics.released}
                </Typography>
                <Typography variant="body2" sx={{ color: '#5a7a52', fontSize: '0.875rem', fontFamily: '"IRANSans", sans-serif' }}>
                  🟢 ترخیص‌شده
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)',
              color: '#1d1d1d',
              boxShadow: '0 2px 12px rgba(31, 31, 31, 0.08)',
              borderRadius: '12px',
              border: '1px solid #ebebeb'
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ mb: 0.5, color: '#1d1d1d', fontFamily: '"IRANSans", sans-serif' }}>
                  {kpiMetrics.total}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.875rem', fontFamily: '"IRANSans", sans-serif' }}>
                  مجموع کل
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
