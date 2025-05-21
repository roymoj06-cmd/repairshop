import { useState, forwardRef, useEffect, useRef } from "react";
import {
  InputAdornment,
  TextFieldProps,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import { Visibility, VisibilityOff, Mic, MicOff } from "@mui/icons-material";
import { addCommas, removeComma, fixNumbers } from "@/utils";
import useSpeechToText from "react-hook-speech-to-text";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export interface EnhancedInputProps extends Omit<TextFieldProps, "variant"> {
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  iconPosition?: "start" | "end";
  containerClassName?: string;
  enableSpeechToText?: boolean;
  icon?: React.ReactNode;
  formatNumber?: boolean;
  isTextArea?: boolean;
  helperText?: string;
  disabled?: boolean;
  maxRows?: number;
  error?: boolean;
  isRtl?: boolean;
  label?: string;
  value?: string;
  type?: string;
  rows?: number;
  name: string;
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
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
      ...rest
    },
    ref
  ) => {
    const [formattedValue, setFormattedValue] = useState(value || "");
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [lastProcessedResult, setLastProcessedResult] = useState<
      string | null
    >(null);
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
          type === "number" &&
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
    }, [results, enableSpeechToText]);
    useEffect(() => {
      if (value !== undefined && value !== formattedValue) {
        let newValue = value;
        if (
          formatNumber &&
          type === "number" &&
          value &&
          !isNaN(Number(removeComma(value)))
        ) {
          newValue = addCommas(removeComma(value));
        }
        setFormattedValue(newValue);
      }
    }, [value, formatNumber, type, formattedValue]);
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
      if (
        formatNumber &&
        type === "number" &&
        newValue &&
        !isNaN(Number(removeComma(newValue)))
      ) {
        newValue = addCommas(removeComma(newValue));
        e.target.value = newValue;
      }
      setFormattedValue(newValue);
      if (onChange) {
        onChange(e);
      }
    };
    const inputType =
      type === "password" ? (showPassword ? "text" : "password") : type;
    const renderPasswordIcon = () => {
      if (type !== "password") return null;
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
      if (type === "password") {
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
          error={error || !!speechError}
          helperText={
            showInterimResult
              ? `در حال شنیدن: ${fixNumbers(interimResult)}`
              : speechError
              ? `خطا در تشخیص گفتار: ${speechError}`
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

export default EnhancedInput;
