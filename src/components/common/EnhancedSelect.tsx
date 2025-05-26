import { useState, forwardRef, useEffect, useRef } from "react";
import { ExpandMore, Mic, MicOff } from "@mui/icons-material";
import useSpeechToText from "react-hook-speech-to-text";
import { Controller, Control } from "react-hook-form";
import { fixNumbers } from "@/utils";
import {
  CircularProgress,
  InputAdornment,
  FormHelperText,
  Autocomplete,
  FormControl,
  IconButton,
  InputLabel,
  TextField,
  MenuItem,
  Checkbox,
  Tooltip,
  Select,
} from "@mui/material";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export interface SelectOption {
  value: string | number | null;
  disabled?: boolean;
  label: string;
  id?: string;
}

export interface EnhancedSelectProps {
  onChange?: (value: any, event?: React.SyntheticEvent) => void;
  onInputChange?: (value: string) => void;
  transformValue?: (value: any) => any;
  iconPosition?: "start" | "end";
  enableSpeechToText?: boolean;
  containerClassName?: string;
  size?: "small" | "medium";
  storeValueOnly?: boolean;
  options: SelectOption[];
  control?: Control<any>;
  icon?: React.ReactNode;
  placeholder?: string;
  searchable?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  required?: boolean;
  defaultValue?: any;
  className?: string;
  loading?: boolean;
  error?: boolean;
  isRtl?: boolean;
  isLtr?: boolean;
  label?: string;
  name: string;
  value?: any;
}

const EnhancedSelect = forwardRef<HTMLDivElement, EnhancedSelectProps>(
  (
    {
      options,
      onChange,
      onInputChange,
      name,
      label,
      value,
      defaultValue,
      placeholder,
      helperText,
      error = false,
      disabled = false,
      multiple = false,
      required = false,
      enableSpeechToText = false,
      icon,
      iconPosition = "start",
      isRtl = true,
      isLtr = false,
      containerClassName = "",
      className = "",
      fullWidth = true,
      size = "medium",
      searchable = false,
      loading = false,
      control,
      transformValue,
      storeValueOnly = false,
    },
    ref
  ) => {
    if (control) {
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            let selectedOption;
            if (field.value !== undefined && field.value !== null) {
              if (multiple && Array.isArray(field.value)) {
                selectedOption = field.value.map((val) => {
                  const foundOption = options.find((o) => o.value === val);
                  return foundOption || { value: val, label: String(val) };
                });
              } else {
                selectedOption = options.find((o) => o.value === field.value);
                if (!selectedOption && field.value) {
                  selectedOption = {
                    value: field.value,
                    label: String(field.value),
                  };
                }
              }
            }

            return (
              <EnhancedSelectImplementation
                {...{
                  options,
                  onInputChange,
                  name,
                  label,
                  defaultValue,
                  placeholder,
                  helperText,
                  error,
                  disabled,
                  multiple,
                  required,
                  enableSpeechToText,
                  icon,
                  iconPosition,
                  isRtl,
                  isLtr,
                  containerClassName,
                  className,
                  fullWidth,
                  size,
                  searchable,
                  loading,
                  ref,
                }}
                value={selectedOption}
                onChange={(newValue, event) => {
                  const finalValue = multiple
                    ? (newValue || []).map((v: any) =>
                        storeValueOnly && typeof v === "object" ? v.value : v
                      )
                    : storeValueOnly &&
                      newValue &&
                      typeof newValue === "object" &&
                      "value" in newValue
                    ? newValue.value
                    : newValue;
                  const transformedValue = transformValue
                    ? transformValue(finalValue)
                    : finalValue;
                  field.onChange(transformedValue);
                  if (onChange) {
                    onChange(newValue, event);
                  }
                }}
              />
            );
          }}
        />
      );
    }
    return (
      <EnhancedSelectImplementation
        options={options}
        onChange={onChange}
        onInputChange={onInputChange}
        name={name}
        label={label}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        helperText={helperText}
        error={error}
        disabled={disabled}
        multiple={multiple}
        required={required}
        enableSpeechToText={enableSpeechToText}
        icon={icon}
        iconPosition={iconPosition}
        isRtl={isRtl}
        isLtr={isLtr}
        containerClassName={containerClassName}
        className={className}
        fullWidth={fullWidth}
        size={size}
        searchable={searchable}
        loading={loading}
        ref={ref}
      />
    );
  }
);
const EnhancedSelectImplementation = forwardRef<
  HTMLDivElement,
  EnhancedSelectProps
>(
  (
    {
      options,
      onChange,
      onInputChange,
      name,
      label,
      value,
      defaultValue,
      placeholder,
      helperText,
      error = false,
      disabled = false,
      multiple = false,
      required = false,
      enableSpeechToText = false,
      icon,
      iconPosition = "start",
      isRtl = true,
      isLtr = false,
      containerClassName = "",
      className = "",
      fullWidth = true,
      size = "medium",
      searchable = false,
      loading = false,
    },
    ref
  ) => {
    const [selectedValue, setSelectedValue] = useState<any>(
      value !== undefined && value !== 0
        ? value
        : defaultValue !== undefined && defaultValue !== 0
        ? defaultValue
        : multiple
        ? []
        : null
    );

    const [searchText, setSearchText] = useState("");
    const autocompleteRef = useRef<any>(null);
    const selectRef = useRef<any>(null);

    const {
      error: speechError,
      interimResult,
      isRecording,
      results,
      startSpeechToText,
      stopSpeechToText,
    } = useSpeechToText({
      continuous: false,
      crossBrowser: true,
      useLegacyResults: false,
      speechRecognitionProperties: {
        lang: "fa-IR",
        interimResults: true,
      },
    });

    const isSpeechSupported =
      typeof window !== "undefined" &&
      (typeof window.SpeechRecognition !== "undefined" ||
        typeof window.webkitSpeechRecognition !== "undefined");
    useEffect(() => {
      if (results && results.length > 0) {
        try {
          const lastResult = results[results.length - 1];
          if (typeof lastResult === "string") {
            handleSpeechResult(lastResult);
          } else if (Array.isArray(lastResult)) {
            if (lastResult[0] && lastResult[0].transcript) {
              handleSpeechResult(lastResult[0].transcript);
            }
          } else if (lastResult && typeof lastResult === "object") {
            if (lastResult.transcript) {
              handleSpeechResult(lastResult.transcript);
            }
          }
        } catch (error) {
          console.error("Error processing speech results:", error);
        }
      }
    }, [results]);
    const handleSpeechResult = (text: string) => {
      if (!text || text.trim() === "") return;
      const fixedText = fixNumbers(text.trim());
      setSearchText(fixedText);
      if (onInputChange) {
        onInputChange(fixedText);
      }
      const matchingOption = options.find((option) =>
        option.label.toLowerCase().includes(fixedText.toLowerCase())
      );

      if (matchingOption && onChange) {
        onChange(matchingOption);
      }
      setTimeout(() => {
        try {
          if (searchable) {
            const popupButton = document.querySelector(
              ".MuiAutocomplete-popupIndicator"
            );
            if (popupButton && popupButton instanceof HTMLElement) {
              popupButton.click();
              return;
            }
            const input = document.querySelector(`input[name="${name}"]`);
            if (input && input instanceof HTMLInputElement) {
              input.focus();
              const event = new KeyboardEvent("keydown", {
                key: "ArrowDown",
                code: "ArrowDown",
                keyCode: 40,
                which: 40,
                bubbles: true,
              });
              input.dispatchEvent(event);
            }
          } else {
            const selectElement = document.querySelector(`#${name}`);
            if (selectElement) {
              selectElement.dispatchEvent(
                new MouseEvent("mousedown", {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                })
              );
            }
          }
        } catch (error) {
          console.error("Error trying to open dropdown:", error);
        }
      }, 500);
    };

    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    const handleChange = (newValue: any, event?: React.SyntheticEvent) => {
      setSelectedValue(newValue);
      if (onChange) {
        onChange(newValue, event);
      }
    };

    const handleSpeechToText = () => {
      if (!isSpeechSupported) {
        alert(
          "تبدیل گفتار به متن در این مرورگر پشتیبانی نمی‌شود. لطفاً از Google Chrome استفاده کنید."
        );
        return;
      }

      try {
        if (isRecording) {
          stopSpeechToText();
        } else {
          setSearchText("");
          startSpeechToText();
        }
      } catch (error) {
        console.error("Speech recognition error:", error);
        alert("خطا در شروع تشخیص گفتار. لطفاً دوباره تلاش کنید.");
      }
    };

    const renderSpeechToTextIcon = () => {
      if (!enableSpeechToText) return null;

      return (
        <InputAdornment position="end">
          <Tooltip
            title={
              !isSpeechSupported
                ? "تبدیل گفتار به متن در این مرورگر پشتیبانی نمی‌شود"
                : isRecording
                ? "پایان ضبط صدا"
                : "شروع ضبط صدا"
            }
          >
            <IconButton
              onClick={handleSpeechToText}
              edge="end"
              size="small"
              aria-label="speech to text"
              disabled={disabled || !isSpeechSupported}
              color={isRecording ? "error" : "default"}
            >
              {isRecording ? (
                <MicOff fontSize="small" color="error" />
              ) : (
                <Mic
                  fontSize="small"
                  color={!isSpeechSupported ? "disabled" : "action"}
                />
              )}
            </IconButton>
          </Tooltip>
        </InputAdornment>
      );
    };

    const renderMenuItems = () => {
      return options.map((option) => (
        <MenuItem
          key={option.id || `option-${option.value}`}
          value={option.value ?? ""}
          disabled={option.disabled}
        >
          {multiple && (
            <Checkbox
              checked={
                Array.isArray(selectedValue) &&
                selectedValue.findIndex((item) =>
                  typeof item === "object"
                    ? item.value === option.value
                    : item === option.value
                ) !== -1
              }
            />
          )}
          {option.label}
        </MenuItem>
      ));
    };

    const getDisplayValue = () => {
      if (!selectedValue || selectedValue === 0) return "";

      if (multiple && Array.isArray(selectedValue)) {
        return selectedValue
          .map(
            (val) =>
              (typeof val === "object"
                ? val.label
                : options.find((o) => o.value === val)?.label) || val
          )
          .join(", ");
      }

      return (
        (typeof selectedValue === "object"
          ? selectedValue.label
          : options.find((o) => o.value === selectedValue)?.label) ||
        selectedValue
      );
    };

    if (searchable) {
      return (
        <div className={`w-full ${containerClassName}`} ref={autocompleteRef}>
          <Autocomplete
            ref={(elem: any) => {
              if (ref) {
                if (typeof ref === "function") {
                  ref(elem);
                } else {
                  ref.current = elem;
                }
              }
            }}
            options={options}
            multiple={multiple}
            value={selectedValue}
            onChange={(_, newValue) => handleChange(newValue)}
            onInputChange={(_, newInputValue) => {
              setSearchText(newInputValue);
              if (onInputChange) {
                onInputChange(newInputValue);
              }
            }}
            filterOptions={(options, { inputValue }) => {
              if (!inputValue || inputValue.trim() === "") return options;
              return options.filter((option) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
              );
            }}
            isOptionEqualToValue={(option, value) =>
              typeof value === "object"
                ? option.value === value.value
                : option.value === value
            }
            getOptionLabel={(option) =>
              typeof option === "object" ? option.label : String(option)
            }
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <li
                  key={option.id || key || `option-${option.value}`}
                  {...otherProps}
                >
                  {multiple && (
                    <Checkbox
                      checked={
                        Array.isArray(selectedValue) &&
                        selectedValue.findIndex((item) =>
                          typeof item === "object"
                            ? item.value === option.value
                            : item === option.value
                        ) !== -1
                      }
                    />
                  )}
                  {option.label}
                </li>
              );
            }}
            fullWidth={fullWidth}
            disabled={disabled}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                error={error}
                helperText={
                  isRecording && interimResult
                    ? `در حال شنیدن: ${fixNumbers(interimResult)}`
                    : speechError
                    ? `خطا در تشخیص گفتار: ${speechError}`
                    : helperText
                }
                variant="outlined"
                required={required}
                placeholder={isRecording ? "در حال شنیدن..." : placeholder}
                InputProps={{
                  ...params.InputProps,
                  className: `${isRtl ? "rtl" : "ltr"}`,
                  endAdornment: (
                    <>
                      {params.InputProps.endAdornment}
                      {loading && (
                        <InputAdornment position="end">
                          <CircularProgress size={20} color="inherit" />
                        </InputAdornment>
                      )}
                      {enableSpeechToText && renderSpeechToTextIcon()}
                      {icon && iconPosition === "end" && (
                        <InputAdornment position="end">{icon}</InputAdornment>
                      )}
                    </>
                  ),
                  startAdornment:
                    icon && iconPosition === "start" ? (
                      <InputAdornment position="start">{icon}</InputAdornment>
                    ) : undefined,
                }}
                InputLabelProps={{
                  className: isRtl
                    ? "rtl:right-4 rtl:left-auto rtl:transform-none"
                    : "",
                }}
                dir={isRtl ? "rtl" : isLtr ? "ltr" : undefined}
              />
            )}
          />
        </div>
      );
    }

    return (
      <div className={`w-full ${containerClassName}`} ref={selectRef}>
        <FormControl
          fullWidth={fullWidth}
          className={className}
          required={required}
          disabled={disabled}
          error={error}
          size={size}
        >
          {label && <InputLabel id={`${name}-label`}>{label}</InputLabel>}
          <Select
            ref={(elem: any) => {
              if (ref) {
                if (typeof ref === "function") {
                  ref(elem);
                } else {
                  ref.current = elem;
                }
              }
            }}
            onChange={(e: any) => handleChange(e.target.value, e)}
            displayEmpty={!!placeholder}
            labelId={`${name}-label`}
            value={selectedValue}
            multiple={multiple}
            label={label}
            id={name}
            renderValue={
              placeholder && !selectedValue
                ? () => placeholder
                : () => getDisplayValue()
            }
            IconComponent={
              loading
                ? () => <CircularProgress size={20} color="inherit" />
                : ExpandMore
            }
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
              anchorOrigin: {
                vertical: "bottom",
                horizontal: isRtl ? "right" : "left",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: isRtl ? "right" : "left",
              },
            }}
            inputProps={{
              dir: isRtl ? "rtl" : isLtr ? "ltr" : undefined,
            }}
            className={isRtl ? "rtl" : "ltr"}
            startAdornment={
              icon && iconPosition === "start" ? (
                <InputAdornment position="start">{icon}</InputAdornment>
              ) : undefined
            }
            endAdornment={
              <>
                {icon && iconPosition === "end" && (
                  <InputAdornment position="end">{icon}</InputAdornment>
                )}
                {loading && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} color="inherit" />
                  </InputAdornment>
                )}
                {enableSpeechToText && renderSpeechToTextIcon()}
              </>
            }
          >
            {placeholder && !multiple && (
              <MenuItem value="" disabled>
                {placeholder}
              </MenuItem>
            )}
            {renderMenuItems()}
          </Select>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
          {isRecording && interimResult && (
            <FormHelperText>
              در حال شنیدن: {fixNumbers(interimResult)}
            </FormHelperText>
          )}
          {speechError && (
            <FormHelperText error>
              خطا در تشخیص گفتار: {speechError}
            </FormHelperText>
          )}
        </FormControl>
      </div>
    );
  }
);

EnhancedSelect.displayName = "EnhancedSelect";
EnhancedSelectImplementation.displayName = "EnhancedSelectImplementation";

export default EnhancedSelect;
