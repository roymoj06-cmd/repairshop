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
  onServiceChange: (index: number, field: string, value: any) => void;
  selectedService: Service | IGetAllRepairReceptionServices | null;
  onProblemChange: (value: SelectOption | null) => void;
  selectedProblem: SelectOption | null;
  currentServices: ServiceFormData[];
  repairServices: SelectOption[];
  mechanics: SelectOption[];
  problems: SelectOption[];
  onSubmit: () => void;
  onClose: () => void;
  isLoading: boolean;
  open: boolean;
}

const ServiceManagementModal: React.FC<ServiceManagementModalProps> = ({
  selectedService,
  selectedProblem,
  currentServices,
  onProblemChange,
  onServiceChange,
  repairServices,
  mechanics,
  isLoading,
  problems,
  onSubmit,
  onClose,
  open,
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
      currentServices.some(
        (service) => 
          service.serviceId && 
          (!service.estimatedMinute || service.estimatedMinute <= 0 || 
           !service.serviceCount || service.serviceCount <= 0)
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
          selectedProblem={selectedProblem}
          currentServices={currentServices}
          onProblemChange={onProblemChange}
          onServiceChange={onServiceChange}
          repairServices={repairServices}
          mechanics={mechanics}
          problems={problems}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} label="انصراف" variant="outlined" />
        <Button
          label={getSubmitButtonLabel()}
          disabled={isSubmitDisabled()}
          variant="contained"
          onClick={onSubmit}
          color="primary"
        />
      </DialogActions>
    </Dialog>
  );
};

export default ServiceManagementModal;
