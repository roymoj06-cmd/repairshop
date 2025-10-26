import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import { Search, Add, Close } from '@mui/icons-material';
import { useTheme } from '@/context/ThemeContext';

interface PlateSearchInputProps {
  vehicles: IGetRepairReceptions[];
  onSelect: (vehicle: IGetRepairReceptions) => void;
  selectedIds: Set<number>;
}

const PlateSearchInput: React.FC<PlateSearchInputProps> = ({
  vehicles,
  onSelect,
  selectedIds,
}) => {
  const { mode } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Normalize Persian/Arabic characters
  const normalizePlateText = (text: string): string => {
    return text
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
      .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632))
      .replace(/\s+/g, '')
      .toLowerCase();
  };

  // Format plate display
  const formatPlateDisplay = (vehicle: IGetRepairReceptions): string => {
    return `${vehicle.plateSection1} ${vehicle.plateSection2} ${vehicle.plateSection3} ${vehicle.plateSection4}`;
  };

  // Filter suggestions
  const suggestions = useMemo(() => {
    if (debouncedValue.length < 2) return [];

    const normalized = normalizePlateText(debouncedValue);

    return vehicles
      .filter((vehicle) => {
        if (selectedIds.has(vehicle.id)) return false;

        const customerName = normalizePlateText(vehicle.customerName || '');
        const plateStr = normalizePlateText(
          `${vehicle.plateSection1}${vehicle.plateSection2}${vehicle.plateSection3}${vehicle.plateSection4}`
        );

        return customerName.includes(normalized) || plateStr.includes(normalized);
      })
      .slice(0, 8);
  }, [debouncedValue, vehicles, selectedIds]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(value.length >= 2);
    setFocusedIndex(-1);
    
    if (inputRef.current) {
      setAnchorEl(inputRef.current);
    }
  };

  // Handle selection
  const handleSelect = (vehicle: IGetRepairReceptions) => {
    onSelect(vehicle);
    setInputValue('');
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
          handleSelect(suggestions[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const showNoResults = isOpen && debouncedValue.length >= 2 && suggestions.length === 0;

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TextField
          ref={inputRef}
          fullWidth
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length >= 2) {
              setIsOpen(true);
              if (inputRef.current) {
                setAnchorEl(inputRef.current);
              }
            }
          }}
          placeholder="جستجو بر اساس پلاک یا نام مشتری..."
          helperText={inputValue.length > 0 ? "پلاک را وارد کنید — مثال: ۱۲ب۳۴۵" : ""}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: '"IRANSans", sans-serif',
              bgcolor: mode === 'dark' ? '#1a1a1a' : '#f8f8f8',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: mode === 'dark' ? '#222222' : '#f0f0f0',
              },
              '&.Mui-focused': {
                bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
                boxShadow: mode === 'dark' 
                  ? '0 0 0 2px rgba(61, 139, 120, 0.3)'
                  : '0 0 0 2px rgba(61, 139, 120, 0.2)',
              },
            },
            '& .MuiFormHelperText-root': {
              fontFamily: '"IRANSans", sans-serif',
              fontSize: '0.75rem',
              color: mode === 'dark' ? '#888888' : '#666666',
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: mode === 'dark' ? '#b0b0b0' : '#888888' }} />
              </InputAdornment>
            ),
            endAdornment: inputValue && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setInputValue('');
                    setIsOpen(false);
                  }}
                  sx={{ color: mode === 'dark' ? '#888888' : '#666666' }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          size="small"
        />

        <Popper
          open={isOpen && (suggestions.length > 0 || showNoResults)}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ 
            width: anchorEl?.clientWidth || 'auto',
            zIndex: 1300,
          }}
        >
          <Paper
            sx={{
              mt: 0.5,
              maxHeight: '320px',
              overflow: 'auto',
              bgcolor: mode === 'dark' ? '#222222' : '#ffffff',
              border: mode === 'dark' ? '1px solid #333333' : '1px solid #e8e8e8',
              borderRadius: '8px',
              boxShadow: mode === 'dark'
                ? '0 4px 12px rgba(0, 0, 0, 0.5)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            {showNoResults ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"IRANSans", sans-serif',
                    color: mode === 'dark' ? '#888888' : '#666666',
                    mb: 1,
                  }}
                >
                  خودرویی یافت نشد
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"IRANSans", sans-serif',
                    color: mode === 'dark' ? '#666666' : '#999999',
                  }}
                >
                  بررسی فرمت پلاک یا سعی با نام مشتری
                </Typography>
              </Box>
            ) : (
              <List sx={{ py: 0.5 }}>
                {suggestions.map((vehicle, index) => (
                  <ListItemButton
                    key={vehicle.id}
                    selected={index === focusedIndex}
                    onClick={() => handleSelect(vehicle)}
                    sx={{
                      fontFamily: '"IRANSans", sans-serif',
                      py: 1.5,
                      px: 2,
                      cursor: 'pointer',
                      bgcolor:
                        index === focusedIndex
                          ? mode === 'dark'
                            ? '#2a2a2a'
                            : '#f0f0f0'
                          : 'transparent',
                      '&:hover': {
                        bgcolor: mode === 'dark' ? '#2a2a2a' : '#f8f8f8',
                      },
                      borderBottom:
                        index < suggestions.length - 1
                          ? mode === 'dark'
                            ? '1px solid #333333'
                            : '1px solid #e8e8e8'
                          : 'none',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            sx={{
                              fontFamily: '"IRANSans", sans-serif',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              color: mode === 'dark' ? '#e8e8e8' : '#2b2b2b',
                            }}
                          >
                            {formatPlateDisplay(vehicle)}
                          </Typography>
                          <Chip
                            label={vehicle.customerName}
                            size="small"
                            sx={{
                              height: '20px',
                              fontSize: '0.7rem',
                              fontFamily: '"IRANSans", sans-serif',
                              bgcolor: mode === 'dark' ? '#2a2a2a' : '#f0f0f0',
                              color: mode === 'dark' ? '#b0b0b0' : '#666666',
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: '"IRANSans", sans-serif',
                            color: mode === 'dark' ? '#888888' : '#999999',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          ورود: {vehicle.receptionDate} • مبلغ: {vehicle.totalPrice.toLocaleString()} ت
                        </Typography>
                      }
                    />
                    <IconButton
                      size="small"
                      sx={{
                        color: '#3d8b78',
                        '&:hover': {
                          bgcolor: mode === 'dark' ? '#2a2a2a' : '#e8f5f1',
                        },
                      }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default PlateSearchInput;
