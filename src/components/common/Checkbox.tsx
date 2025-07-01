import {
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
} from "@mui/material";
import { forwardRef } from "react";

export interface CheckboxProps extends Omit<MuiCheckboxProps, "color"> {
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  containerClassName?: string;
  label?: string;
  labelClassName?: string;
}

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      containerClassName = "",
      labelClassName = "",
      color = "primary",
      className = "",
      label = "",
      ...rest
    },
    ref
  ) => {
    return (
      <div className={`flex items-center ${containerClassName}`}>
        <MuiCheckbox
          className={`${className}`}
          color={color}
          ref={ref}
          {...rest}
        />
        {label && <span className={`mr-2 ${labelClassName}`}>{label}</span>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
