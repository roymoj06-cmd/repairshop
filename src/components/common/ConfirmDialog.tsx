import { FC } from "react";
import {
  DialogContent,
  DialogActions,
  DialogTitle,
  Typography,
  Dialog,
} from "@mui/material";

import Button from "./Button";

interface ConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  message: string;
  open: boolean;
  title: string;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  confirmText = "تأیید",
  cancelText = "انصراف",
  loading = false,
  onConfirm,
  onCancel,
  message,
  title,
  open,
}) => {
  return (
    <Dialog
      className="confirm-dialog"
      onClose={onCancel}
      maxWidth="sm"
      open={open}
      fullWidth
    >
      <DialogTitle className="confirm-dialog__title">{title}</DialogTitle>
      <DialogContent className="confirm-dialog__content">
        <Typography variant="body1">{message}</Typography>
      </DialogContent>
      <DialogActions className="confirm-dialog__actions">
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          loading={loading}
          color="error"
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
