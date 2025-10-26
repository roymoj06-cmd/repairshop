import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Checkbox, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  CircularProgress,
  Alert,
  Autocomplete
} from '@mui/material';
import { Search, CheckCircle } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getRepairReceptions } from '@/service/repair/repair.service';
import { PlateNumberDisplay } from '@/components';
import { useTheme } from '@/context/ThemeContext';

const BaselineSetup: React.FC = () => {
  const { mode } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch all vehicles
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['allRepairReceptions'],
    queryFn: () => getRepairReceptions({ 
      page: 1, 
      size: 1000, 
      isDischarged: null 
    }),
  });

  // Normalize Persian/Arabic characters for search
  const normalizePlateText = (text: string): string => {
    return text
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728)) // Persian to English numbers
      .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632)) // Arabic to English numbers
      .replace(/\s+/g, '') // Remove spaces
      .toLowerCase();
  };

  // Filter vehicles based on debounced search query
  const filteredVehicles = useMemo(() => {
    if (!vehicles?.data) return [];
    
    const query = normalizePlateText(debouncedSearch);
    if (!query) return vehicles.data;

    return vehicles.data.filter((vehicle: IGetRepairReceptions) => {
      const customerName = normalizePlateText(vehicle.customerName || '');
      const plateStr = normalizePlateText(
        `${vehicle.plateSection1}${vehicle.plateSection2}${vehicle.plateSection3}${vehicle.plateSection4}`
      );
      
      return customerName.includes(query) || plateStr.includes(query);
    });
  }, [vehicles, debouncedSearch]);

  // Autocomplete options
  const autocompleteOptions = useMemo(() => {
    if (!vehicles?.data) return [];
    return vehicles.data.map((vehicle: IGetRepairReceptions) => ({
      id: vehicle.id,
      label: `${vehicle.plateSection1} ${vehicle.plateSection2} ${vehicle.plateSection3} ${vehicle.plateSection4} - ${vehicle.customerName}`,
      vehicle
    }));
  }, [vehicles]);

  type AutocompleteOption = {
    id: number;
    label: string;
    vehicle: IGetRepairReceptions;
  };

  // Toggle vehicle selection
  const handleToggleVehicle = (vehicleId: number) => {
    const newSelected = new Set(selectedVehicles);
    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId);
    } else {
      newSelected.add(vehicleId);
    }
    setSelectedVehicles(newSelected);
  };

  // Select all filtered vehicles
  const handleSelectAll = () => {
    if (selectedVehicles.size === filteredVehicles.length) {
      setSelectedVehicles(new Set<number>());
    } else {
      const allIds = new Set<number>(filteredVehicles.map((v: IGetRepairReceptions) => v.id));
      setSelectedVehicles(allIds);
    }
  };

  // Confirm baseline setup
  const handleConfirm = () => {
    if (selectedVehicles.size === 0) {
      toast.error('لطفاً حداقل یک خودرو را انتخاب کنید');
      return;
    }

    setIsProcessing(true);

    try {
      // Create status map for all vehicles
      const statusMap: Record<number, 'in_repair' | 'system_released'> = {};
      
      vehicles?.data?.forEach((vehicle: IGetRepairReceptions) => {
        if (selectedVehicles.has(vehicle.id)) {
          statusMap[vehicle.id] = 'in_repair';
        } else {
          statusMap[vehicle.id] = 'system_released';
        }
      });

      // Save to localStorage
      localStorage.setItem('vehicleStatusBaseline', JSON.stringify(statusMap));
      
      // Mark baseline as completed
      localStorage.setItem('baselineSetupCompleted', 'true');

      toast.success(`راه‌اندازی با موفقیت انجام شد. ${selectedVehicles.size} خودرو در تعمیرگاه ثبت شد.`);
      
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

  const isAllSelected = filteredVehicles.length > 0 && selectedVehicles.size === filteredVehicles.length;

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

        {/* Search and Stats */}
        <Paper 
          sx={{ 
            p: 2, 
            mb: 2,
            bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
            border: mode === 'dark' ? '1px solid #333333' : '1px solid #e8e8e8',
            borderRadius: '10px',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Autocomplete<AutocompleteOption, false, false, true>
              freeSolo
              options={autocompleteOptions}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
              inputValue={searchQuery}
              onInputChange={(_, newValue) => setSearchQuery(newValue)}
              onChange={(_, value) => {
                if (value && typeof value !== 'string') {
                  handleToggleVehicle(value.id);
                  setSearchQuery('');
                }
              }}
              noOptionsText="خودرویی یافت نشد"
              sx={{ 
                flex: 1,
                minWidth: 250,
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="جستجو بر اساس پلاک یا نام مشتری..."
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      fontFamily: '"IRANSans", sans-serif',
                      bgcolor: mode === 'dark' ? '#1a1a1a' : '#f8f8f8',
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Search sx={{ color: mode === 'dark' ? '#b0b0b0' : '#888888' }} />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                  size="small"
                />
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    fontFamily: '"IRANSans", sans-serif',
                    bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
                    color: mode === 'dark' ? '#e8e8e8' : '#2b2b2b',
                    '&:hover': {
                      bgcolor: mode === 'dark' ? '#2a2a2a' : '#f8f8f8'
                    },
                    '&[aria-selected="true"]': {
                      bgcolor: mode === 'dark' ? '#2a2a2a' : '#f0f0f0'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      checked={selectedVehicles.has(option.id)}
                      size="small"
                      sx={{
                        color: mode === 'dark' ? '#b0b0b0' : '#888888',
                        '&.Mui-checked': {
                          color: '#3d8b78',
                        }
                      }}
                    />
                    {option.label}
                  </Box>
                </Box>
              )}
              ListboxProps={{
                sx: {
                  bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
                  border: mode === 'dark' ? '1px solid #333333' : '1px solid #e8e8e8',
                  borderRadius: '8px',
                  maxHeight: '300px',
                  '& .MuiAutocomplete-option': {
                    fontFamily: '"IRANSans", sans-serif',
                  }
                }
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: '"IRANSans", sans-serif',
                  color: mode === 'dark' ? '#b0b0b0' : '#666666'
                }}
              >
                انتخاب شده: <strong>{selectedVehicles.size}</strong> از <strong>{filteredVehicles.length}</strong>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Vehicles Table */}
        <TableContainer 
          component={Paper}
          sx={{
            bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
            border: mode === 'dark' ? '1px solid #333333' : '1px solid #e8e8e8',
            borderRadius: '10px',
            mb: 3
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: mode === 'dark' ? '#2a2a2a' : '#f8f8f8' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={selectedVehicles.size > 0 && selectedVehicles.size < filteredVehicles.length}
                    onChange={handleSelectAll}
                    sx={{
                      color: mode === 'dark' ? '#b0b0b0' : '#888888',
                      '&.Mui-checked': {
                        color: '#3d8b78',
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', fontWeight: 600, color: mode === 'dark' ? '#ffffff' : '#2b2b2b' }}>
                  پلاک
                </TableCell>
                <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', fontWeight: 600, color: mode === 'dark' ? '#ffffff' : '#2b2b2b' }}>
                  نام مشتری
                </TableCell>
                <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', fontWeight: 600, color: mode === 'dark' ? '#ffffff' : '#2b2b2b' }}>
                  تاریخ ورود
                </TableCell>
                <TableCell sx={{ fontFamily: '"IRANSans", sans-serif', fontWeight: 600, color: mode === 'dark' ? '#ffffff' : '#2b2b2b' }}>
                  مبلغ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: '"IRANSans", sans-serif',
                        color: mode === 'dark' ? '#b0b0b0' : '#888888'
                      }}
                    >
                      خودرویی یافت نشد
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle: IGetRepairReceptions) => (
                  <TableRow 
                    key={vehicle.id}
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: mode === 'dark' ? '#2a2a2a' : '#f8f8f8'
                      }
                    }}
                    onClick={() => handleToggleVehicle(vehicle.id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedVehicles.has(vehicle.id)}
                        sx={{
                          color: mode === 'dark' ? '#b0b0b0' : '#888888',
                          '&.Mui-checked': {
                            color: '#3d8b78',
                          }
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
            onClick={handleConfirm}
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
            {isProcessing ? 'در حال پردازش...' : 'تایید و راه‌اندازی'}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default BaselineSetup;
