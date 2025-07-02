import { Close } from "@mui/icons-material";
import {
  DialogContent,
  DialogActions,
  DialogTitle,
  IconButton,
  Dialog,
} from "@mui/material";

import { Button, ServiceForm } from "@/components";
import { ServiceFormData } from "@/utils";

interface ServiceManagementModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  selectedService: Service | IGetAllRepairReceptionServices | null;
  selectedProblem: SelectOption | null;
  currentServices: ServiceFormData[];
  problems: SelectOption[];
  repairServices: SelectOption[];
  mechanics: SelectOption[];
  isLoading: boolean;
  onProblemChange: (value: SelectOption | null) => void;
  onServiceChange: (index: number, field: string, value: any) => void;
}

const ServiceManagementModal: React.FC<ServiceManagementModalProps> = ({
  open,
  onClose,
  onSubmit,
  selectedService,
  selectedProblem,
  currentServices,
  problems,
  repairServices,
  mechanics,
  isLoading,
  onProblemChange,
  onServiceChange,
}) => {
  const getModalTitle = () => {
    if (selectedService) {
      return "ویرایش سرویس";
    } else if (selectedProblem) {
      return "افزودن سرویس جدید";
    } else {
      return "افزودن تعمیر جدید";
    }
  };

  const getSubmitButtonLabel = () => {
    return selectedService ? "بروزرسانی" : "ذخیره";
  };

  const isSubmitDisabled = () => {
    return (
      currentServices.length === 0 ||
      currentServices.every(
        (service) => !service.serviceId || !service.mechanicId
      ) ||
      isLoading
    );
  };

  return (
    <Dialog
      onClose={onClose}
      className="service-modal"
      open={open}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className="service-modal__title">
        {getModalTitle()}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent className="service-modal__content">
        <ServiceForm
          problems={problems}
          repairServices={repairServices}
          mechanics={mechanics}
          selectedProblem={selectedProblem}
          currentServices={currentServices}
          onProblemChange={onProblemChange}
          onServiceChange={onServiceChange}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} label="انصراف" variant="outlined" />
        <Button
          onClick={onSubmit}
          label={getSubmitButtonLabel()}
          variant="contained"
          color="primary"
          disabled={isSubmitDisabled()}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ServiceManagementModal;
