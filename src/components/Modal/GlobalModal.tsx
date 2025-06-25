import { Close } from "@mui/icons-material";
import { Box, IconButton, Modal, Slide, Typography } from "@mui/material";
import { ElementType, useEffect, useRef } from "react";

interface GlobalModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
  classList?: string;
  fullscreen?: boolean;
  CloseIcon?: ElementType;
  closeAfterClickBackdrop?: boolean;
  disableAutoFocus?: boolean;
  customHeader?: React.ReactNode;
  showCustomHeader?: boolean;
  noPadding?: boolean;
}

const ModalHeader: React.FC<{
  title?: string;
  onClose: () => void;
  CloseIcon?: ElementType;
  fullscreen?: boolean;
}> = ({ title, onClose, CloseIcon = Close, fullscreen }) => (
  <div
    className={`flex justify-between items-center  ${
      fullscreen
        ? "fixed top-0 left-0 right-0 bg-white z-10 p-3"
        : "mb-4 w-full"
    }`}
  >
    <Typography
      id="global-modal-title "
      sx={{
        fontSize: "16px",
      }}
      variant="h6"
      component="h2"
    >
      {title}
    </Typography>
    <IconButton onClick={onClose} size="small">
      <CloseIcon />
    </IconButton>
  </div>
);

const GlobalModal: React.FC<GlobalModalProps> = ({
  open,
  onClose,
  title,
  children,
  classList,
  width = "700px",
  fullscreen = false,
  closeAfterClickBackdrop = false,
  CloseIcon = Close,
  disableAutoFocus = false,
  customHeader,
  showCustomHeader = false,
  noPadding = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !disableAutoFocus) {
      modalRef.current?.focus();
    }
  }, [open, disableAutoFocus]);

  const handleClose = () => {
    onClose();
  };

  const handleModalClose = (_event: any, reason: string) => {
    if (!closeAfterClickBackdrop) {
      if (reason !== "backdropClick") {
        handleClose();
      }
    } else {
      handleClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      closeAfterTransition
      disableEscapeKeyDown
      disableAutoFocus={disableAutoFocus}
      aria-labelledby="global-modal-title"
      aria-describedby="global-modal-description"
      className="flex items-center justify-center "
    >
      <Slide in={open} direction="up">
        <Box
          className={`bg-tertiary-six overflow-y-auto   outline-none  ${
            classList || ""
          } ${
            fullscreen ? "fixed top-0 left-0 " : `relative mx-4  rounded-lg`
          } ${noPadding ? "" : "p-3"} `}
          sx={{
            width: fullscreen ? "100vw" : width,
            maxWidth: fullscreen ? "100vw" : "100%",
            height: fullscreen ? "100vh" : "auto",
            maxHeight: fullscreen ? "auto" : "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          ref={modalRef}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          {showCustomHeader && customHeader ? (
            customHeader
          ) : title ? (
            <ModalHeader
              title={title}
              onClose={handleClose}
              CloseIcon={CloseIcon}
              fullscreen={fullscreen}
            />
          ) : null}
          <div
            id="global-modal-description"
            className={
              fullscreen ? "pt-14  max-w-[820px] text-center w-full" : "w-full"
            }
          >
            {children}
          </div>
        </Box>
      </Slide>
    </Modal>
  );
};

export default GlobalModal;
