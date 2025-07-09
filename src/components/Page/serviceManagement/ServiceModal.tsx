import { useForm, Controller } from "react-hook-form";
import { FC, useEffect } from "react";
import {
  FormControlLabel,
  DialogContent,
  DialogActions,
  Grid2 as Grid,
  DialogTitle,
  TextField,
  MenuItem,
  Dialog,
  Switch,
} from "@mui/material";

import { expertLevelOptions } from "@/utils/statics";
import { Button, EnhancedInput } from "@/components";

interface ServiceModalProps {
  onSubmit: (data: ICreateOrUpdateRepairService) => void;
  editingService: IGetAllRepairServices | null;
  onClose: () => void;
  loading: boolean;
  open: boolean;
}

const ServiceModal: FC<ServiceModalProps> = ({
  editingService,
  onSubmit,
  onClose,
  loading,
  open,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ICreateOrUpdateRepairService>({
    defaultValues: {
      // durationInMinutes: 0,
      commissionPercent: 0,
      estimatedMinute: 0,
      serviceTitle: "",
      expertLevel: 1,
      isActive: true,
      price: 0,
    },
  });

  useEffect(() => {
    if (editingService) {
      reset({
        // durationInMinutes: editingService.durationInMinutes,
        commissionPercent: editingService.commissionPercent,
        estimatedMinute: editingService.estimatedMinute,
        serviceTitle: editingService.serviceTitle,
        expertLevel: editingService.expertLevel,
        isActive: editingService.isActive,
        price: editingService.price,
        id: editingService.id,
      });
    } else {
      reset({
        // durationInMinutes: 0,
        commissionPercent: 0,
        estimatedMinute: 0,
        serviceTitle: "",
        expertLevel: 1,
        isActive: true,
        price: 0,
      });
    }
  }, [editingService, reset]);

  const handleFormSubmit = (data: ICreateOrUpdateRepairService) => {
    onSubmit(data);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="service-modal"
    >
      <DialogTitle className="service-modal__title">
        {editingService ? "ویرایش اجرت" : "افزودن اجرت جدید"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent className="service-modal__content">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <EnhancedInput
                rules={{ required: "عنوان اجرت الزامی است" }}
                className="service-modal__field"
                name="serviceTitle"
                enableSpeechToText
                label="عنوان اجرت"
                control={control}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EnhancedInput
                rules={{
                  required: "قیمت الزامی است",
                  min: { value: 0, message: "قیمت نمی‌تواند منفی باشد" },
                }}
                className="service-modal__field"
                control={control}
                type="number"
                name="price"
                label="قیمت"
                formatNumber
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EnhancedInput
                rules={{
                  required: "تخمین زمانی الزامی است",
                  min: {
                    value: 1,
                    message: "تخمین زمانی باید حداقل 1 دقیقه باشد",
                  },
                }}
                className="service-modal__field"
                name="estimatedMinute"
                label="تخمین زمانی (دقیقه)"
                control={control}
                formatNumber
                type="number"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EnhancedInput
                rules={{
                  required: "درصد کمیسیون الزامی است",
                  min: {
                    value: 0,
                    message: "درصد کمیسیون نمی‌تواند منفی باشد",
                  },
                  max: {
                    value: 100,
                    message: "درصد کمیسیون نمی‌تواند بیشتر از 100 باشد",
                  },
                }}
                className="service-modal__field"
                name="commissionPercent"
                label="درصد کمیسیون"
                enableSpeechToText
                control={control}
                type="number"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="expertLevel"
                control={control}
                rules={{ required: "سطح تخصص الزامی است" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    helperText={errors.expertLevel?.message}
                    className="service-modal__field"
                    error={!!errors.expertLevel}
                    label="سطح تخصص"
                    fullWidth
                    select
                  >
                    {expertLevelOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => {
                  return (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(field.value)}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={field.value ? "فعال" : "غیرفعال"}
                      className="service-modal__switch"
                    />
                  );
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="service-modal__actions">
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            انصراف
          </Button>
          <Button
            variant="contained"
            loading={loading}
            color="primary"
            type="submit"
          >
            {editingService ? "بروزرسانی" : "ایجاد"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ServiceModal;
