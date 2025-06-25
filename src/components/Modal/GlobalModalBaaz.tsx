import { Close } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { FC, forwardRef, ReactNode } from "react";

interface GlobalModalBaazProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const GlobalModalBaaz: FC<GlobalModalBaazProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      className="relative z-50"
      TransitionComponent={Transition}
      onClick={(e) => {
        // Close modal when clicking on the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      aria-describedby="alert-dialog-slide-description"
    >
      <div className="flex justify-between items-center  ">
        <DialogTitle
          id="global-modal-title"
          className="text-lg font-semibold text-gray-800"
        >
          {title}
        </DialogTitle>
        <Button
          className="text-gray-500 hover:text-gray-700 transition-colors"
          onClick={onClose}
          size="small"
        >
          <Close />
        </Button>
      </div>
      <DialogContent
        id="alert-dialog-slide-description"
        className="w-full min-w-[300px] max-w-md transform overflow-hidden rounded-[20px] bg-white text-left align-middle transition-all shadow-lg p-0"
      >
        <div className="">{children}</div>
        {actions && (
          <DialogActions className="p-4 border-t">{actions}</DialogActions>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GlobalModalBaaz;
