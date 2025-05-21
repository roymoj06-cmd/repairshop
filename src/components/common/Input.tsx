import { useState, forwardRef } from 'react'
import {
  TextField,
  InputAdornment,
  TextFieldProps,
  IconButton
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  iconPosition?: 'start' | 'end'
  containerClassName?: string
  icon?: React.ReactNode
  helperText?: string
  error?: boolean
  label?: string
  type?: string
  name: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      iconPosition = 'start',
      containerClassName = '',
      error = false,
      type = 'text',
      helperText,
      label,
      name,
      icon,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    const inputType =
      type === 'password' ? (showPassword ? 'text' : 'password') : type

    const renderPasswordIcon = () => {
      if (type !== 'password') return null

      return (
        <InputAdornment position='end'>
          <IconButton
            onClick={togglePasswordVisibility}
            edge='end'
            size='small'
            aria-label='toggle password visibility'
          >
            {showPassword ? (
              <VisibilityOff fontSize='small' />
            ) : (
              <Visibility fontSize='small' />
            )}
          </IconButton>
        </InputAdornment>
      )
    }

    return (
      <div className={`w-full ${containerClassName}`}>
        <TextField
          fullWidth
          variant='outlined'
          label={label}
          name={name}
          type={inputType}
          error={error}
          helperText={helperText}
          ref={ref}
          className='rtl:text-right w-full'
          InputProps={{
            startAdornment:
              icon && iconPosition === 'start' ? (
                <InputAdornment position='start'>{icon}</InputAdornment>
              ) : null,
            endAdornment:
              type === 'password' ? (
                renderPasswordIcon()
              ) : icon && iconPosition === 'end' ? (
                <InputAdornment position='end'>{icon}</InputAdornment>
              ) : null,
            className: 'rounded-md'
          }}
          InputLabelProps={{
            className: 'rtl:right-4 rtl:left-auto rtl:transform-none'
          }}
          {...rest}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
