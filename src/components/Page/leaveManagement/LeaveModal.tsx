import { useMutation, useQueryClient } from "@tanstack/react-query";
import DatePicker, { DateObject } from "react-multi-date-picker";
import gregorian_en from "react-date-object/locales/gregorian_en";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import { FC, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  DialogContent,
  DialogActions,
  Grid2 as Grid,
  DialogTitle,
  Dialog,
  Box,
} from "@mui/material";

import { getActiveMechanics } from "@/service/mechanic/mechanic.service";
import { Button, EnhancedInput, EnhancedSelect } from "@/components";
import {
  createRepairMechanicLeave,
  updateRepairMechanicLeave,
} from "@/service/repairMechanicLeaves/repairMechanicLeaves.service";
import { toast } from "react-toastify";

interface LeaveModalProps {
  editingLeave?: IGetAllMechanicLeaves | null;
  onClose: () => void;
  open: boolean;
}

const LeaveModal: FC<LeaveModalProps> = ({
  editingLeave = null,
  onClose,
  open,
}) => {
  const [mechanics, setMechanics] = useState<SelectOption[]>([]);
  const [dateLeave, setDateLeave] = useState<any>(null);
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ICreateOrUpdateMechanicLeave>({
    defaultValues: {
      mechanicId: undefined,
      description: "",
      date: "",
    },
  });
  const queryClient = useQueryClient();
  const { mutateAsync: getMechanicsMutation, isPending: isGettingMechanics } =
    useMutation({
      mutationFn: getActiveMechanics,
      onSuccess: (data) => {
        const options = data?.data?.map((mechanic: any) => ({
          label: mechanic?.fullName,
          value: mechanic.id,
        }));
        setMechanics(options || []);
      },
    });
  const createMutation = useMutation({
    mutationFn: createRepairMechanicLeave,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["mechanicLeaves"] });
      if (data.isSuccess) {
        onClose();
        toast.success(data.message);
        reset();
      } else {
        toast.error(data.message);
      }
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateRepairMechanicLeave,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["mechanicLeaves"] });
      if (data.isSuccess) {
        onClose();
        toast.success(data.message);
        reset();
      } else {
        toast.error(data.message);
      }
    },
  });
  const handleFormSubmit = (data: ICreateOrUpdateMechanicLeave) => {
    if (!dateLeave) {
      toast.error("تاریخ مرخصی الزامی است");
      return;
    }
    const formData = {
      ...data,
      date: dateLeave
        ?.convert(gregorian, gregorian_en)
        .format("YYYY-MM-DDT00:00:00")
        .toString(),
    };
    if (editingLeave) {
      updateMutation.mutate({ ...formData, id: editingLeave.id });
    } else {
      createMutation.mutate(formData);
    }
  };
  useEffect(() => {
    if (open) {
      getMechanicsMutation();
      if (editingLeave) {
        if (editingLeave.date) {
          let dateValue;
          if (editingLeave.date.includes("T")) {
            dateValue = new DateObject({
              calendar: persian,
              date: new Date(editingLeave.date),
            });
          } else {
            dateValue = new DateObject({
              calendar: persian,
              date: new Date(editingLeave.date),
            });
          }
          setDateLeave(dateValue);
        }
        reset({
          mechanicId: editingLeave.mechanicId,
          description: editingLeave.description,
          date: editingLeave.date,
          id: editingLeave.id,
        });
      } else {
        setDateLeave(null);
        reset({
          mechanicId: undefined,
          description: "",
          date: "",
        });
      }
    } else {
      setDateLeave(null);
      reset({
        mechanicId: undefined,
        description: "",
        date: "",
      });
    }
  }, [open, editingLeave, reset, getMechanicsMutation]);
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="leave-modal"
      disableScrollLock={true}
      style={{ zIndex: 1300 }}
    >
      <DialogTitle className="leave-modal__title">
        {editingLeave ? "ویرایش مرخصی" : "افزودن مرخصی جدید"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent className="leave-modal__content">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EnhancedSelect
                helperText={errors.mechanicId?.message}
                className="leave-modal__field"
                loading={isGettingMechanics}
                error={!!errors.mechanicId}
                storeValueOnly={true}
                label="انتخاب مکانیک"
                options={mechanics}
                name="mechanicId"
                control={control}
                defaultValue={
                  editingLeave && {
                    label: editingLeave?.mechanicFullName,
                    value: editingLeave?.mechanicId,
                  }
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box className="leave-modal__field">
                <DatePicker
                  className={`custom-datepicker ${errors.date ? "error" : ""}`}
                  containerClassName="w-full custom-datepicker-container"
                  onChange={(e: DateObject) => setDateLeave(e)}
                  placeholder="انتخاب تاریخ مرخصی (الزامی)"
                  calendarPosition="bottom-left"
                  onOpenPickNewDate={false}
                  locale={persian_fa}
                  calendar={persian}
                  format="YYYY/MM/DD"
                  value={dateLeave}
                  portal={true}
                  zIndex={2001}
                  style={{
                    width: "100%",
                    height: "56px"
                  }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <EnhancedInput
                rules={{
                  required: "توضیحات الزامی است",
                  minLength: {
                    value: 5,
                    message: "توضیحات باید حداقل 5 کاراکتر باشد",
                  },
                }}
                className="leave-modal__field"
                name="description"
                label="توضیحات"
                enableSpeechToText
                control={control}
                type="text"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="leave-modal__actions">
          <Button
            onClick={onClose}
            variant="outlined"
            color="secondary"
            disabled={isLoading}
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            loading={isLoading}
          >
            {editingLeave ? "بروزرسانی" : "ایجاد"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LeaveModal;
