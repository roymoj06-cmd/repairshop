import { Visibility, VisibilityOff, Mic, MicOff } from "@mui/icons-material";
import { useState, forwardRef, useEffect, useRef } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import {
  Controller,
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import {
  InputAdornment,
  TextFieldProps,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";

import { addCommas, removeComma, fixNumbers } from "@/utils";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export interface EnhancedInputProps<T extends FieldValues = FieldValues>
  extends Omit<TextFieldProps, "variant" | "name"> {
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  iconPosition?: "start" | "end";
  containerClassName?: string;
  enableSpeechToText?: boolean;
  rules?: RegisterOptions<T>;
  icon?: React.ReactNode;
  formatNumber?: boolean;
  isTextArea?: boolean;
  control?: Control<T>;
  helperText?: string;
  disabled?: boolean;
  defaultValue?: any;
  maxRows?: number;
  error?: boolean;
  isRtl?: boolean;
  label?: string;
  value?: string;
  type?: string;
  rows?: number;
  name: Path<T>;
}

const EnhancedInput = <T extends FieldValues = FieldValues>(
  props: EnhancedInputProps<T> & { ref?: React.Ref<HTMLInputElement> }
) => {
  const {
    enableSpeechToText = false,
    containerClassName = "",
    iconPosition = "start",
    formatNumber = false,
    isTextArea = false,
    disabled = false,
    error = false,
    type = "text",
    isRtl = true,
    maxRows = 5,
    helperText,
    rows = 1,
    onChange,
    label,
    value,
    name,
    icon,
    control,
    rules,
    defaultValue,
    ref,
    ...rest
  } = props;

  // Store original type for logic consistency
  const originalType = type;
  const isNumberType = originalType === "number";

  // If control is provided, use Controller
  if (control) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => (
          <EnhancedInputInternal
            {...field}
            {...rest}
            value={
              isNumberType && formatNumber
                ? addCommas(field.value?.toString() || "")
                : isNumberType
                ? `${field.value || ""}`
                : field.value || ""
            }
            onChange={(e) => {
              if (isNumberType) {
                const cleanValue = removeComma(e.target.value);
                const numericValue = cleanValue === "" ? "" : +cleanValue;
                field.onChange(numericValue);
              } else {
                field.onChange(e.target.value);
              }
              if (onChange) {
                onChange(e);
              }
            }}
            enableSpeechToText={enableSpeechToText}
            containerClassName={containerClassName}
            iconPosition={iconPosition}
            formatNumber={formatNumber}
            isTextArea={isTextArea}
            disabled={disabled}
            error={error || !!fieldState.error}
            type={isNumberType && formatNumber ? "text" : originalType}
            isRtl={isRtl}
            maxRows={maxRows}
            helperText={fieldState.error?.message || helperText}
            rows={rows}
            label={label}
            name={name}
            icon={icon}
            ref={ref}
            originalType={originalType}
          />
        )}
      />
    );
  }

  // If no control, use the component directly
  return (
    <EnhancedInputInternal
      enableSpeechToText={enableSpeechToText}
      containerClassName={containerClassName}
      iconPosition={iconPosition}
      formatNumber={formatNumber}
      isTextArea={isTextArea}
      disabled={disabled}
      error={error}
      type={isNumberType && formatNumber ? "text" : originalType}
      isRtl={isRtl}
      maxRows={maxRows}
      helperText={helperText}
      rows={rows}
      onChange={onChange}
      label={label}
      value={value}
      name={name}
      icon={icon}
      ref={ref}
      originalType={originalType}
      {...rest}
    />
  );
};

// Internal component that contains the actual input logic
const EnhancedInputInternal = forwardRef<
  HTMLInputElement,
  Omit<EnhancedInputProps, "control" | "rules" | "defaultValue"> & {
    originalType?: string;
  }
>(
  (
    {
      enableSpeechToText = false,
      containerClassName = "",
      iconPosition = "start",
      formatNumber = false,
      isTextArea = false,
      disabled = false,
      error = false,
      type = "text",
      isRtl = true,
      maxRows = 5,
      helperText,
      rows = 1,
      onChange,
      label,
      value,
      name,
      icon,
      originalType,
      ...rest
    },
    ref
  ) => {
    const [formattedValue, setFormattedValue] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [lastProcessedResult, setLastProcessedResult] = useState<
      string | null
    >(null);

    // Use originalType if provided, otherwise use type
    const actualType = originalType || type;
    const isNumberType = actualType === "number";

    const {
      error: speechError,
      interimResult,
      isRecording,
      results,
      startSpeechToText,
      stopSpeechToText,
    } = useSpeechToText({
      continuous: true,
      crossBrowser: true,
      useLegacyResults: false,
      speechRecognitionProperties: {
        lang: "fa-IR",
      },
    });

    const isSpeechSupported =
      typeof window !== "undefined" &&
      (typeof window.SpeechRecognition !== "undefined" ||
        typeof window.webkitSpeechRecognition !== "undefined");

    // Initialize and sync formattedValue with incoming value
    useEffect(() => {
      if (value !== undefined && value !== null) {
        let newValue = String(value);
        if (
          formatNumber &&
          isNumberType &&
          newValue &&
          !isNaN(Number(removeComma(newValue)))
        ) {
          newValue = addCommas(removeComma(newValue));
        }
        setFormattedValue(newValue);
      } else {
        setFormattedValue("");
      }
    }, [value, formatNumber, isNumberType]);

    useEffect(() => {
      if (enableSpeechToText && results && results.length > 0) {
        const lastResult = results[results.length - 1];
        const resultId =
          typeof lastResult === "string"
            ? lastResult
            : `${lastResult?.transcript}_${results.length}`;

        if (lastProcessedResult === resultId) {
          return;
        }
        setLastProcessedResult(resultId);
        const newText =
          typeof lastResult === "string"
            ? lastResult
            : lastResult?.transcript || "";

        const fixedText = fixNumbers(newText);
        let finalText = fixedText;
        if (
          formatNumber &&
          isNumberType &&
          !isNaN(Number(removeComma(finalText)))
        ) {
          finalText = addCommas(removeComma(finalText));
        }
        const updatedValue = formattedValue
          ? `${formattedValue} ${finalText}`.trim()
          : finalText.trim();
        setFormattedValue(updatedValue);
        if (onChange) {
          const syntheticEvent = {
            target: { name, value: updatedValue },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      }
    }, [results, enableSpeechToText, formatNumber, isNumberType, formattedValue, lastProcessedResult, name, onChange]);

    useEffect(() => {
      if (isRecording) {
        setLastProcessedResult(null);
      }
    }, [isRecording]);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const handleSpeechToText = () => {
      if (!isSpeechSupported) {
        alert(
          "تبدیل گفتار به متن در این مرورگر پشتیبانی نمی‌شود. لطفاً از Google Chrome استفاده کنید."
        );
        return;
      }
      if (isRecording) {
        stopSpeechToText();
      } else {
        if (inputRef.current) {
          inputRef.current.focus();
        }
        startSpeechToText();
      }
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      let newValue = e.target.value;
      let processedValue = newValue;
      
      // Handle number formatting
      if (formatNumber && isNumberType) {
        // Remove existing commas first
        const cleanValue = removeComma(newValue);
        
        // Check if it's a valid number (including empty string)
        if (cleanValue === "" || !isNaN(Number(cleanValue))) {
          // Format with commas if not empty
          if (cleanValue !== "") {
            processedValue = addCommas(cleanValue);
          } else {
            processedValue = "";
          }
        } else {
          // If invalid number, keep previous formatted value
          processedValue = formattedValue;
          return; // Don't update anything if invalid
        }
      }
      
      setFormattedValue(processedValue);
      
      if (onChange) {
        // Create a new event with the clean value for number inputs
        const eventValue = formatNumber && isNumberType ? removeComma(processedValue) : processedValue;
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: eventValue },
        } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
        onChange(syntheticEvent);
      }
    };

    const inputType =
      actualType === "password" ? (showPassword ? "text" : "password") : actualType === "number" && formatNumber ? "text" : actualType;

    const renderPasswordIcon = () => {
      if (actualType !== "password") return null;
      return (
        <InputAdornment position="end">
          <IconButton
            onClick={togglePasswordVisibility}
            edge="end"
            size="small"
            aria-label="toggle password visibility"
            disabled={disabled}
          >
            {showPassword ? (
              <VisibilityOff fontSize="small" />
            ) : (
              <Visibility fontSize="small" />
            )}
          </IconButton>
        </InputAdornment>
      );
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
            <div className="position-relative">
              <IconButton
                onClick={handleSpeechToText}
                edge="end"
                size="small"
                aria-label="speech to text"
                disabled={disabled || !isSpeechSupported}
                color={
                  !isSpeechSupported
                    ? "default"
                    : isRecording
                    ? "error"
                    : "default"
                }
                className={isRecording ? "pulse-effect" : ""}
                sx={{
                  ...(isRecording && {
                    "::after": {
                      content: '""',
                      position: "absolute",
                      width: "35px",
                      height: "35px",
                      borderRadius: "50%",
                      background: "rgba(244, 67, 54, 0.2)",
                      animation: "pulse 1.5s infinite",
                    },
                    "@keyframes pulse": {
                      "0%": {
                        transform: "scale(0.95)",
                        boxShadow: "0 0 0 0 rgba(244, 67, 54, 0.5)",
                      },
                      "70%": {
                        transform: "scale(1)",
                        boxShadow: "0 0 0 10px rgba(244, 67, 54, 0)",
                      },
                      "100%": {
                        transform: "scale(0.95)",
                        boxShadow: "0 0 0 0 rgba(244, 67, 54, 0)",
                      },
                    },
                  }),
                }}
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
            </div>
          </Tooltip>
        </InputAdornment>
      );
    };

    const getEndAdornment = () => {
      if (actualType === "password") {
        return renderPasswordIcon();
      } else if (enableSpeechToText && icon && iconPosition === "end") {
        return (
          <>
            <InputAdornment position="end">{icon}</InputAdornment>
            {renderSpeechToTextIcon()}
          </>
        );
      } else if (enableSpeechToText) {
        return renderSpeechToTextIcon();
      } else if (icon && iconPosition === "end") {
        return <InputAdornment position="end">{icon}</InputAdornment>;
      }
      return null;
    };

    const showInterimResult =
      enableSpeechToText && isRecording && interimResult;

    return (
      <div className={`w-full ${containerClassName}`}>
        <TextField
          fullWidth
          variant="outlined"
          label={label}
          name={name}
          type={inputType}
          error={error}
          helperText={
            showInterimResult
              ? `در حال شنیدن: ${fixNumbers(interimResult)}`
              : speechError
              ? ""
              : helperText
          }
          inputRef={(input) => {
            if (typeof ref === "function") {
              ref(input);
            } else if (ref) {
              ref.current = input;
            }
            inputRef.current = input;
          }}
          value={formattedValue}
          onChange={handleChange}
          className={`${isRtl ? "rtl:text-right" : "ltr:text-left"} w-full`}
          multiline={isTextArea}
          rows={isTextArea ? rows : undefined}
          maxRows={isTextArea ? maxRows : undefined}
          disabled={disabled}
          InputProps={{
            startAdornment:
              icon && iconPosition === "start" ? (
                <InputAdornment position="start">{icon}</InputAdornment>
              ) : null,
            endAdornment: getEndAdornment(),
            className: `rounded-md ${isRtl ? "rtl" : "ltr"}`,
          }}
          InputLabelProps={{
            className: isRtl
              ? "rtl:right-4 rtl:left-auto rtl:transform-none"
              : "",
          }}
          {...rest}
        />
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";
EnhancedInputInternal.displayName = "EnhancedInputInternal";

export default EnhancedInput;
