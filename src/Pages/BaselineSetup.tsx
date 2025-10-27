import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Checkbox,
  TextField,
  InputAdornment
} from '@mui/material';
import { CheckCircle, Delete, Info, Search } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getRepairReceptions, updateTemporaryReleaseStatus, updateResidentVehicleStatus } from '@/service/repair/repair.service';
import { PlateNumberDisplay } from '@/components';
import { useTheme } from '@/context/ThemeContext';
import PlateSearchInput from '@/components/common/PlateSearchInput';

const BaselineSetup: React.FC = () => {
  const { mode } = useTheme();
  const navigate = useNavigate();
  const [selectedVehicles, setSelectedVehicles] = useState<Set<number>>(new Set());
  const [selectedVehicleData, setSelectedVehicleData] = useState<IGetRepairReceptions[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tableSearchQuery, setTableSearchQuery] = useState('');

  // Fetch all undischarged vehicles (excluding temporary released)
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['allRepairReceptions'],
    queryFn: async () => {
      const result = await getRepairReceptions({ 
        page: 1, 
        size: 1000, 
        isDischarged: false // Only fetch unreleased vehicles (ترخیص نشده)
      });
      
      // Filter out vehicles with temporary release or discharged
      const vehicleList = Array.isArray(result?.data) 
        ? result.data 
        : result?.data?.values 
        ? result.data.values 
        : [];
      
      const filteredList = vehicleList.filter((vehicle: IGetRepairReceptions) => {
        // Exclude vehicles with temporary release (isTemporaryRelease === true)
        // Exclude vehicles that are discharged (isDischarged === true)
        return vehicle.isTemporaryRelease !== true && vehicle.isDischarged !== true;
      });
      
      return {
        ...result,
        data: Array.isArray(result?.data)
          ? filteredList
          : {
              ...result.data,
              values: filteredList,
              totalCount: filteredList.length
            }
      };
    },
  });

  // Get status for a vehicle based on current baseline
  const getVehicleStatus = (vehicleId: number): 'selected' | 'unselected' => {
    return selectedVehicles.has(vehicleId) ? 'selected' : 'unselected';
  };

  // Normalize Persian/Arabic characters for search
  const normalizePlateText = (text: string): string => {
    return text
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
      .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632))
      .replace(/\s+/g, '')
      .toLowerCase();
  };

  // Filter table vehicles based on search
  const filteredTableVehicles = useMemo(() => {
    // Check both possible response structures
    const vehicleList = Array.isArray(vehicles?.data) 
      ? vehicles.data 
      : vehicles?.data?.values 
      ? vehicles.data.values 
      : [];
    
    if (!vehicleList || !Array.isArray(vehicleList)) return [];
    
    const query = normalizePlateText(tableSearchQuery);
    if (!query) return vehicleList;

    return vehicleList.filter((vehicle: IGetRepairReceptions) => {
      const customerName = normalizePlateText(vehicle.customerName || '');
      const plateStr = normalizePlateText(
        `${vehicle.plateSection1 || ''}${vehicle.plateSection2 || ''}${vehicle.plateSection3 || ''}${vehicle.plateSection4 || ''}`
      );
      
      return customerName.includes(query) || plateStr.includes(query);
    });
  }, [vehicles, tableSearchQuery]);

  // Handle vehicle selection from search or table
  const handleSelectVehicle = (vehicle: IGetRepairReceptions) => {
    if (selectedVehicles.has(vehicle.id)) {
      // If already selected, remove it
      handleRemoveVehicle(vehicle.id);
      return;
    }

    setSelectedVehicles((prev) => new Set(prev).add(vehicle.id));
    setSelectedVehicleData((prev) => [...prev, vehicle]);
    toast.success(`خودرو ${vehicle.plateSection1} ${vehicle.plateSection2} ${vehicle.plateSection3} ${vehicle.plateSection4} اضافه شد`);
  };

  // Toggle vehicle from table
  const handleToggleVehicleFromTable = (vehicle: IGetRepairReceptions) => {
    handleSelectVehicle(vehicle);
  };

  // Select all filtered vehicles
  const handleSelectAll = () => {
    if (!filteredTableVehicles || !Array.isArray(filteredTableVehicles) || !filteredTableVehicles.length) return;

    const allFiltered = filteredTableVehicles.filter((v: IGetRepairReceptions) => !selectedVehicles.has(v.id));
    
    if (allFiltered.length === 0) {
      // Deselect all filtered
      const filteredIds = new Set<number>(filteredTableVehicles.map((v: IGetRepairReceptions) => v.id));
      setSelectedVehicles((prev) => {
        const newSet = new Set(prev);
        filteredIds.forEach(id => newSet.delete(id));
        return newSet;
      });
      setSelectedVehicleData((prev) => prev.filter((v) => !filteredIds.has(v.id)));
    } else {
      // Select all filtered
      setSelectedVehicles((prev) => {
        const newSet = new Set(prev);
        allFiltered.forEach((v: IGetRepairReceptions) => newSet.add(v.id));
        return newSet;
      });
      setSelectedVehicleData((prev) => [...prev, ...allFiltered]);
    }
  };

  // Remove vehicle from selection
  const handleRemoveVehicle = (vehicleId: number) => {
    setSelectedVehicles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(vehicleId);
      return newSet;
    });
    setSelectedVehicleData((prev) => prev.filter((v) => v.id !== vehicleId));
  };

  // Handle setting vehicles as Resident (مقیم)
  const handleSetResident = async () => {
    if (selectedVehicles.size === 0) {
      toast.error('لطفاً حداقل یک خودرو را انتخاب کنید');
      return;
    }

    setIsProcessing(true);

    try {
      // Get vehicle list with proper structure handling
      const vehicleList = Array.isArray(vehicles?.data) 
        ? vehicles.data 
        : vehicles?.data?.values 
        ? vehicles.data.values 
        : [];
      
      // Create status map for API
      // Selected vehicles = Resident = true
      // Unselected vehicles = NOT Resident = false
      
      const vehicleStatuses: Record<number, boolean> = {};
      
      vehicleList.forEach((vehicle: IGetRepairReceptions) => {
        // Selected = Resident = true
        // Unselected = NOT Resident = false
        vehicleStatuses[vehicle.id] = selectedVehicles.has(vehicle.id);
        
        // Debug log for first few vehicles
        if (Object.keys(vehicleStatuses).length <= 5) {
          console.log(`Vehicle ${vehicle.id}: selected=${selectedVehicles.has(vehicle.id)}, isResidentVehicle=${vehicleStatuses[vehicle.id]}`);
        }
      });

      console.log('=== BASELINE SETUP (RESIDENT) ===');
      console.log('Total vehicles in system:', vehicleList.length);
      console.log('Selected vehicles (should be Resident):', selectedVehicles.size);
      console.log('Unselected vehicles (should be TempReleased):', vehicleList.length - selectedVehicles.size);
      console.log('Selected vehicle IDs:', Array.from(selectedVehicles));
      console.log('Sample status map (first 3):', Object.entries(vehicleStatuses).slice(0, 3));
      console.log('===================================');

      // Call API to update resident vehicle status
      await updateResidentVehicleStatus(vehicleStatuses);

      // Mark baseline as completed
      localStorage.setItem('baselineSetupCompleted', 'true');

      toast.success(
        `خودروهای مقیم با موفقیت ثبت شدند. ${selectedVehicles.size} خودرو به عنوان "خودروهای مقیم" ثبت شد.`
      );
      
      // Navigate to vehicles page
      setTimeout(() => {
        navigate('/dashboard/vehicles');
      }, 1000);
    } catch (error) {
      console.error('Error setting up baseline:', error);
      toast.error('خطا در راه‌اندازی سیستم');
      setIsProcessing(false);
    }
  };

  // Handle setting vehicles as Temporarily Released (ترخیص موقت)
  const handleSetTempReleased = async () => {
    if (selectedVehicles.size === 0) {
      toast.error('لطفاً حداقل یک خودرو را انتخاب کنید');
      return;
    }

    setIsProcessing(true);

    try {
      // Get vehicle list with proper structure handling
      const vehicleList = Array.isArray(vehicles?.data) 
        ? vehicles.data 
        : vehicles?.data?.values 
        ? vehicles.data.values 
        : [];
      
      // Create status map for API
      // Selected vehicles = TempReleased = isTemporaryRelease: true
      // Unselected vehicles = Resident = isTemporaryRelease: false
      
      const vehicleStatuses: Record<number, boolean> = {};
      
      vehicleList.forEach((vehicle: IGetRepairReceptions) => {
        // Selected = TEMPORARILY RELEASED = isTemporaryRelease: true
        // Unselected = INSIDE workshop (Resident) = isTemporaryRelease: false
        const isTemporaryRelease = selectedVehicles.has(vehicle.id);
        vehicleStatuses[vehicle.id] = isTemporaryRelease;
        
        // Debug log for first few vehicles
        if (Object.keys(vehicleStatuses).length <= 5) {
          console.log(`Vehicle ${vehicle.id}: selected=${selectedVehicles.has(vehicle.id)}, isTemporaryRelease=${isTemporaryRelease}`);
        }
      });

      console.log('=== BASELINE SETUP (TEMP RELEASED) ===');
      console.log('Total vehicles in system:', vehicleList.length);
      console.log('Selected vehicles (should be TempReleased):', selectedVehicles.size);
      console.log('Unselected vehicles (should be Resident):', vehicleList.length - selectedVehicles.size);
      console.log('Selected vehicle IDs:', Array.from(selectedVehicles));
      console.log('Sample status map (first 3):', Object.entries(vehicleStatuses).slice(0, 3));
      console.log('=======================================');

      // Call API to update temporary release status
      await updateTemporaryReleaseStatus(vehicleStatuses);

      // Mark baseline as completed
      localStorage.setItem('baselineSetupCompleted', 'true');

      toast.success(
        `راه‌اندازی موفق: ${selectedVehicles.size} خودرو به عنوان "ترخیص موقت" و ${vehicleList.length - selectedVehicles.size} خودرو به عنوان "مقیم" ثبت شد.`
      );
      
      // Navigate to vehicles page
      setTimeout(() => {
        navigate('/dashboard/vehicles');
      }, 1000);
    } catch (error) {
      console.error('Error setting up baseline:', error);
      toast.error('خطا در راه‌اندازی سیستم');
      setIsProcessing(false);
    }
  };

  // Get total count from either response structure
  const totalVehicles = Array.isArray(vehicles?.data) 
    ? vehicles.data.length 
    : vehicles?.data?.values?.length 
    || vehicles?.data?.totalCount 
    || 0;
  const isAllFilteredSelected = (filteredTableVehicles?.length || 0) > 0 && 
    filteredTableVehicles.every((v: IGetRepairReceptions) => selectedVehicles.has(v.id));
  const isSomeFilteredSelected = (filteredTableVehicles?.length || 0) > 0 && 
    filteredTableVehicles.some((v: IGetRepairReceptions) => selectedVehicles.has(v.id));

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: mode === 'dark' ? '#1a1a1a' : '#f5f5f5'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
      p: 3
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3,
            bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
            border: mode === 'dark' ? '1px solid #333333' : '1px solid #e8e8e8',
            borderRadius: '10px',
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontFamily: '"IRANSans", sans-serif',
              fontWeight: 600,
              color: mode === 'dark' ? '#ffffff' : '#2b2b2b',
              mb: 1
            }}
          >
            راه‌اندازی اولیه سیستم
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: '"IRANSans", sans-serif',
              color: mode === 'dark' ? '#b0b0b0' : '#666666',
              mb: 2
            }}
          >
            لطفاً خودروهایی که در حال حاضر فیزیکی داخل تعمیرگاه هستند را انتخاب کنید.
            بقیه خودروها به‌صورت خودکار به عنوان "ترخیص سیستمی‌شده" ثبت می‌شوند.
          </Typography>

          <Alert 
            severity="info" 
            sx={{ 
              fontFamily: '"IRANSans", sans-serif',
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            این مرحله فقط یک‌بار برای هم‌ترازی سیستم با وضعیت واقعی تعمیرگاه انجام می‌شود.
          </Alert>
        </Paper>

        {/* Search Input */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 2,
            bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
            border: mode === 'dark' ? '1px solid #333333' : '1px solid #e8e8e8',
            borderRadius: '10px',
          }}
        >
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info sx={{ fontSize: 18, color: '#3d8b78' }} />
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: '"IRANSans", sans-serif',
                color: mode === 'dark' ? '#b0b0b0' : '#666666',
              }}
            >
              برای افزودن خودرو، پلاک یا نام مشتری را جستجو کرده و از لیست پیشنهادی انتخاب کنید
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <PlateSearchInput
              vehicles={
                Array.isArray(vehicles?.data) 
                  ? vehicles.data 
                  : vehicles?.data?.values 
                  ? vehicles.data.values 
                  : []
              }
              onSelect={handleSelectVehicle}
              selectedIds={selectedVehicles}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              label={`انتخاب شده: ${selectedVehicles.size} خودرو`}
              sx={{
                fontFamily: '"IRANSans", sans-serif',
                bgcolor: mode === 'dark' ? '#2a2a2a' : '#f0f0f0',
                color: mode === 'dark' ? '#e8e8e8' : '#2b2b2b',
                fontWeight: 600,
              }}
            />
            <Chip
              label={`کل خودروهای سیستم: ${totalVehicles}`}
              sx={{
                fontFamily: '"IRANSans", sans-serif',
                bgcolor: mode === 'dark' ? '#2a2a2a' : '#f0f0f0',
                color: mode === 'dark' ? '#b0b0b0' : '#666666',
              }}
            />
          </Box>
        </Paper>

        {/* All Vehicles Table with Search */}
        <Paper 
          sx={{ 
            mb: 3,
            bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
            border: mode === 'dark' ? '1px solid #333333' : '1px solid #e8e8e8',
            borderRadius: '10px',
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: mode === 'dark' ? '#2a2a2a' : '#f8f8f8',
              borderBottom: mode === 'dark' ? '1px solid #333333' : '1px solid #e8e8e8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"IRANSans", sans-serif',
                fontWeight: 600,
                color: mode === 'dark' ? '#ffffff' : '#2b2b2b',
                fontSize: '1rem'
              }}
            >
              لیست کامل خودروهای ترخیص‌نشده ({totalVehicles} خودرو)
            </Typography>

            <TextField
              placeholder="جستجو در لیست..."
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              size="small"
              sx={{
                minWidth: '250px',
                '& .MuiOutlinedInput-root': {
                  fontFamily: '"IRANSans", sans-serif',
                  bgcolor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: mode === 'dark' ? '#b0b0b0' : '#888888', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer sx={{ maxHeight: '500px' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: mode === 'dark' ? '#252525' : '#fafafa' }}>
                  <TableCell padding="checkbox" sx={{ bgcolor: mode === 'dark' ? '#252525' : '#fafafa' }}>
                    <Checkbox
                      checked={isAllFilteredSelected}
                      indeterminate={!isAllFilteredSelected && isSomeFilteredSelected}
                      onChange={handleSelectAll}
                      sx={{
                        color: mode === 'dark' ? '#b0b0b0' : '#888888',
                        '&.Mui-checked': {
                          color: '#3d8b78',
                        },
                        '&.MuiCheckbox-indeterminate': {
                          color: '#3d8b78',
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', fontWeight: 600, color: mode === 'dark' ? '#ffffff' : '#2b2b2b', bgcolor: mode === 'dark' ? '#252525' : '#fafafa' }}>
                    وضعیت
                  </TableCell>
                  <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', fontWeight: 600, color: mode === 'dark' ? '#ffffff' : '#2b2b2b', bgcolor: mode === 'dark' ? '#252525' : '#fafafa' }}>
                    پلاک
                  </TableCell>
                  <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', fontWeight: 600, color: mode === 'dark' ? '#ffffff' : '#2b2b2b', bgcolor: mode === 'dark' ? '#252525' : '#fafafa' }}>
                    نام مشتری
                  </TableCell>
                  <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', fontWeight: 600, color: mode === 'dark' ? '#ffffff' : '#2b2b2b', bgcolor: mode === 'dark' ? '#252525' : '#fafafa' }}>
                    تاریخ ورود
                  </TableCell>
                  <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', fontWeight: 600, color: mode === 'dark' ? '#ffffff' : '#2b2b2b', bgcolor: mode === 'dark' ? '#252525' : '#fafafa' }}>
                    مبلغ
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={30} sx={{ color: '#3d8b78' }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: '"IRANSans", sans-serif',
                          color: mode === 'dark' ? '#888888' : '#999999',
                          mt: 2
                        }}
                      >
                        در حال بارگذاری خودروهای ترخیص نشده...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : !filteredTableVehicles || !Array.isArray(filteredTableVehicles) || filteredTableVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: '"IRANSans", sans-serif',
                          color: mode === 'dark' ? '#888888' : '#999999'
                        }}
                      >
                        {tableSearchQuery ? 'خودرویی یافت نشد' : 'خودروی ترخیص نشده‌ای در سیستم وجود ندارد'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.isArray(filteredTableVehicles) && filteredTableVehicles.map((vehicle: IGetRepairReceptions) => {
                    const isSelected = selectedVehicles.has(vehicle.id);
                    const status = getVehicleStatus(vehicle.id);
                    
                    return (
                      <TableRow 
                        key={vehicle.id}
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          bgcolor: isSelected 
                            ? mode === 'dark' ? '#1a3d35' : '#e8f5f1'
                            : 'transparent',
                          '&:hover': {
                            bgcolor: isSelected
                              ? mode === 'dark' ? '#1f4a40' : '#d4efe8'
                              : mode === 'dark' ? '#2a2a2a' : '#f8f8f8'
                          }
                        }}
                        onClick={() => handleToggleVehicleFromTable(vehicle)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            sx={{
                              color: mode === 'dark' ? '#b0b0b0' : '#888888',
                              '&.Mui-checked': {
                                color: '#3d8b78',
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={status === 'selected' ? 'در تعمیرگاه' : 'انتخاب نشده'}
                            size="small"
                            sx={{
                              fontFamily: '"IRANSans", sans-serif',
                              fontSize: '0.7rem',
                              height: '22px',
                              bgcolor: status === 'selected' 
                                ? mode === 'dark' ? '#1a3d35' : '#e8f5f1'
                                : mode === 'dark' ? '#2a2a2a' : '#f0f0f0',
                              color: status === 'selected'
                                ? '#3d8b78'
                                : mode === 'dark' ? '#888888' : '#666666',
                              border: status === 'selected'
                                ? '1px solid #3d8b78'
                                : mode === 'dark' ? '1px solid #444444' : '1px solid #d0d0d0'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <PlateNumberDisplay
                            plateSection1={vehicle.plateSection1}
                            plateSection2={vehicle.plateSection2}
                            plateSection3={vehicle.plateSection3}
                            plateSection4={vehicle.plateSection4}
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', color: mode === 'dark' ? '#e8e8e8' : '#2b2b2b' }}>
                          {vehicle.customerName}
                        </TableCell>
                        <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', color: mode === 'dark' ? '#c0c0c0' : '#666666' }}>
                          {vehicle.receptionDate}
                        </TableCell>
                        <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', color: mode === 'dark' ? '#c0c0c0' : '#666666' }}>
                          {vehicle.totalPrice.toLocaleString()} ت
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Selected Vehicles Summary */}
        <Paper 
          sx={{ 
            mb: 3,
            bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
            border: mode === 'dark' ? '1px solid #333333' : '1px solid #e8e8e8',
            borderRadius: '10px',
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: mode === 'dark' ? '#2a2a2a' : '#f8f8f8',
              borderBottom: mode === 'dark' ? '1px solid #333333' : '1px solid #e8e8e8'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"IRANSans", sans-serif',
                fontWeight: 600,
                color: mode === 'dark' ? '#ffffff' : '#2b2b2b',
                fontSize: '1rem'
              }}
            >
              خودروهای انتخاب‌شده برای تعمیرگاه ({selectedVehicles.size} خودرو)
            </Typography>
          </Box>

          {selectedVehicleData.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: '"IRANSans", sans-serif',
                  color: mode === 'dark' ? '#888888' : '#999999'
                }}
              >
                هنوز خودرویی انتخاب نشده است. از قسمت جستجو خودروهای فعلی تعمیرگاه را اضافه کنید.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: mode === 'dark' ? '#252525' : '#fafafa' }}>
                    <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', fontWeight: 600, color: mode === 'dark' ? '#ffffff' : '#2b2b2b', width: '35%' }}>
                      پلاک
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', fontWeight: 600, color: mode === 'dark' ? '#ffffff' : '#2b2b2b', width: '25%' }}>
                      نام مشتری
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', fontWeight: 600, color: mode === 'dark' ? '#ffffff' : '#2b2b2b', width: '20%' }}>
                      تاریخ ورود
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', fontWeight: 600, color: mode === 'dark' ? '#ffffff' : '#2b2b2b', width: '15%' }}>
                      مبلغ
                    </TableCell>
                    <TableCell sx={{ width: '5%' }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedVehicleData.map((vehicle) => (
                    <TableRow 
                      key={vehicle.id}
                      sx={{ 
                        '&:hover': {
                          bgcolor: mode === 'dark' ? '#2a2a2a' : '#f8f8f8'
                        }
                      }}
                    >
                      <TableCell>
                        <PlateNumberDisplay
                          plateSection1={vehicle.plateSection1}
                          plateSection2={vehicle.plateSection2}
                          plateSection3={vehicle.plateSection3}
                          plateSection4={vehicle.plateSection4}
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', color: mode === 'dark' ? '#e8e8e8' : '#2b2b2b' }}>
                        {vehicle.customerName}
                      </TableCell>
                      <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', color: mode === 'dark' ? '#c0c0c0' : '#666666' }}>
                        {vehicle.receptionDate}
                      </TableCell>
                      <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', color: mode === 'dark' ? '#c0c0c0' : '#666666' }}>
                        {vehicle.totalPrice.toLocaleString()} ت
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveVehicle(vehicle.id)}
                          sx={{
                            color: '#c86b5a',
                            '&:hover': {
                              bgcolor: mode === 'dark' ? '#2a2a2a' : '#ffebee'
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Action Buttons */}
        <Paper 
          sx={{ 
            p: 2,
            bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
            border: mode === 'dark' ? '1px solid #333333' : '1px solid #e8e8e8',
            borderRadius: '10px',
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end'
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard/vehicles')}
            disabled={isProcessing}
            sx={{
              fontFamily: '"IRANSans", sans-serif',
              borderColor: mode === 'dark' ? '#444444' : '#d0d0d0',
              color: mode === 'dark' ? '#b0b0b0' : '#2b2b2b',
              '&:hover': {
                borderColor: mode === 'dark' ? '#555555' : '#2b2b2b',
                bgcolor: mode === 'dark' ? '#2a2a2a' : '#f8f8f8'
              }
            }}
          >
            انصراف
          </Button>
          
          <Button
            variant="contained"
            startIcon={isProcessing ? <CircularProgress size={20} /> : <CheckCircle />}
            onClick={handleSetResident}
            disabled={isProcessing || selectedVehicles.size === 0}
            sx={{
              fontFamily: '"IRANSans", sans-serif',
              bgcolor: '#3d8b78',
              color: '#ffffff',
              '&:hover': {
                bgcolor: '#357a67'
              },
              '&:disabled': {
                bgcolor: mode === 'dark' ? '#2a2a2a' : '#e0e0e0',
                color: mode === 'dark' ? '#666666' : '#999999'
              }
            }}
          >
            {isProcessing ? 'در حال پردازش...' : 'خودروهای مقیم'}
          </Button>

          <Button
            variant="contained"
            startIcon={isProcessing ? <CircularProgress size={20} /> : <CheckCircle />}
            onClick={handleSetTempReleased}
            disabled={isProcessing || selectedVehicles.size === 0}
            sx={{
              fontFamily: '"IRANSans", sans-serif',
              bgcolor: '#c86b5a',
              color: '#ffffff',
              '&:hover': {
                bgcolor: '#b55c4d'
              },
              '&:disabled': {
                bgcolor: mode === 'dark' ? '#2a2a2a' : '#e0e0e0',
                color: mode === 'dark' ? '#666666' : '#999999'
              }
            }}
          >
            {isProcessing ? 'در حال پردازش...' : 'ترخیص موقت'}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default BaselineSetup;
