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
  startIcon?: ReactNode;
  children: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "contained",
      color = "primary",
      size = "medium",
      startIcon,
      endIcon,
      loading = false,
      fullWidth = false,
      containerClassName = "",
      className = "",
      disabled = false,
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
          disabled={disabled || loading}
          fullWidth={fullWidth}
          variant={variant}
          color={color}
          ref={ref}
          size={size}
          {...rest}
        >
          {children}
          {loading && <Loading />}
        </MuiButton>
      </div>
    );
  }
);

Button.displayName = "Button";

export default Button;
