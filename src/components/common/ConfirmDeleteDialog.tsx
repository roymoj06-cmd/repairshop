import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogProps,
} from "@mui/material";
import Button from "./Button";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content?: string;
  children?: React.ReactNode;
  maxWidth?: DialogProps["maxWidth"];
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  content,
  children,
  maxWidth = "sm",
}) => {
  return (
    <Dialog
      open={open}
      sx={{
        zIndex: 10000,
      }}
      onClose={onClose}
      maxWidth={maxWidth}
      className="z-[10000]"
      fullWidth
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        {content ? (
          <DialogContentText id="alert-dialog-description">
            {content}
          </DialogContentText>
        ) : (
          children
        )}
      </DialogContent>
      <DialogActions>
        <Button
          label="انصراف"
          onClick={onClose}
          color="primary"
          variant="outlined"
        />
        <Button
          label="تایید"
          onClick={onConfirm}
          color="secondary"
          variant="contained"
          autoFocus
        />
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
