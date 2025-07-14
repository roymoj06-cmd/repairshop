import { forwardRef, ReactNode } from "react";
import {
  ButtonProps as MuiButtonProps,
  Button as MuiButton,
} from "@mui/material";

import Loading from "./Loading";

export interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  variant?: "contained" | "outlined" | "text";
  size?: "small" | "medium" | "large";
  containerClassName?: string;
  labelClassName?: string;
  startIcon?: ReactNode;
  children?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      containerClassName = "",
      variant = "contained",
      labelClassName = "",
      color = "primary",
      fullWidth = false,
      disabled = false,
      size = "medium",
      loading = false,
      className = "",
      label = "",
      startIcon,
      children,
      endIcon,
      ...rest
    },
    ref
  ) => {
    return (
      <div className={`${containerClassName} ${fullWidth ? "w-full" : ""}`}>
        <MuiButton
          className={`relative rounded-md font-medium ${className} ${
            loading ? "text-transparent" : ""
          }`}
          startIcon={loading ? null : startIcon}
          endIcon={loading ? null : endIcon}
          fullWidth={fullWidth}
          disabled={disabled}
          variant={variant}
          color={color}
          ref={ref}
          size={size}
          {...rest}
        >
          {children && children}
          {label && <span className={labelClassName}>{label}</span>}
          {loading && <Loading />}
        </MuiButton>
      </div>
    );
  }
);

Button.displayName = "Button";

export default Button;
