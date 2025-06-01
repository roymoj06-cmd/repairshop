import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { FC, useState, useEffect, useCallback, useRef } from "react";
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

import { Button, EnhancedInput, EnhancedSelect } from "@/components";
import { getCustomers } from "@/service/customer/customer.service";
import { expertLevelOptions } from "@/utils/statics";

interface MechanicModalProps {
  onSubmit: (data: ICreateOrUpdateMechanic) => void;
  editingMechanic: IGetAllMechanics | null;
  onClose: () => void;
  loading: boolean;
  open: boolean;
}

const MechanicModal: FC<MechanicModalProps> = ({
  editingMechanic,
  onSubmit,
  onClose,
  loading,
  open,
}) => {
  const [customers, setCustomers] = useState<SelectOption[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ICreateOrUpdateMechanic>({
    defaultValues: {
      mechanic: {
        userId: undefined,
        expertLevel: 1,
        isActive: true,
        fullName: "",
      },
    },
  });
  const { mutateAsync: getCustomersMutation, isPending: isGettingCustomers } =
    useMutation({
      mutationFn: getCustomers,
      onSuccess: (data) => {
        const options = data?.data?.map((i: any) => ({
          label: i?.fullName,
          value: i.userId,
        }));
        setCustomers((prevCustomers) => {
          const prevValues = prevCustomers.map((c: any) => c.value).sort();
          const newValues = options?.map((c: any) => c.value).sort() || [];
          if (JSON.stringify(prevValues) !== JSON.stringify(newValues)) {
            return options || [];
          }
          return prevCustomers;
        });
      },
    });
  const searchCustomers = useCallback(
    (searchText: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        if (searchText.length > 2) {
          getCustomersMutation(searchText);
        } else if (searchText.length === 0) {
          if (!editingMechanic) {
            setCustomers([]);
          }
        }
      }, 300);
    },
    [getCustomersMutation, editingMechanic]
  );

  const handleFormSubmit = (data: ICreateOrUpdateMechanic) => {
    onSubmit(data);
  };
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  useEffect(() => {
    if (open) {
      if (editingMechanic) {
        reset({
          mechanic: {
            expertLevel: editingMechanic.expertLevel,
            isActive: editingMechanic.isActive,
            fullName: editingMechanic.fullName,
            userId: editingMechanic.userId,
            id: editingMechanic.id,
          },
        });
        if (editingMechanic.userName) {
          const existingCustomer: SelectOption = {
            label: editingMechanic.userName,
            value: editingMechanic.userId,
          };
          setCustomers([existingCustomer]);
        }
      } else {
        reset({
          mechanic: {
            userId: undefined,
            expertLevel: 1,
            isActive: true,
            fullName: "",
          },
        });
        setCustomers([]);
      }
    } else {
      setCustomers([]);
      reset({
        mechanic: {
          userId: undefined,
          expertLevel: 1,
          isActive: true,
          fullName: "",
        },
      });
    }
  }, [open, editingMechanic, reset]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="mechanic-modal"
    >
      <DialogTitle className="mechanic-modal__title">
        {editingMechanic ? "ویرایش مکانیک" : "افزودن مکانیک جدید"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent className="mechanic-modal__content">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EnhancedInput
                rules={{
                  required: "نام کامل الزامی است",
                  minLength: {
                    value: 2,
                    message: "نام کامل باید حداقل 2 کاراکتر باشد",
                  },
                }}
                className="mechanic-modal__field"
                name="mechanic.fullName"
                label="نام کامل"
                enableSpeechToText
                control={control}
                type="text"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <EnhancedSelect
                onInputChange={searchCustomers}
                onChange={(e) => {
                  console.log(e);
                }}
                helperText={errors.mechanic?.userId?.message}
                placeholder="نام کاربر را جستجو کنید"
                error={!!errors.mechanic?.userId}
                className="mechanic-modal__field"
                loading={isGettingCustomers}
                name="mechanic.userId"
                storeValueOnly={true}
                label="انتخاب کاربر"
                options={customers}
                enableSpeechToText
                searchable={true}
                control={control}
                defaultValue={
                  editingMechanic && {
                    label: editingMechanic?.userName,
                    value: editingMechanic?.userId,
                  }
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="mechanic.expertLevel"
                control={control}
                rules={{ required: "سطح تخصص الزامی است" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    helperText={errors.mechanic?.expertLevel?.message}
                    className="mechanic-modal__field"
                    error={!!errors.mechanic?.expertLevel}
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="mechanic.isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        color="primary"
                      />
                    }
                    label="فعال"
                    className="mechanic-modal__switch"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="mechanic-modal__actions">
          <Button
            onClick={onClose}
            variant="outlined"
            color="secondary"
            disabled={loading}
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            loading={loading}
          >
            {editingMechanic ? "بروزرسانی" : "ایجاد"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MechanicModal;
