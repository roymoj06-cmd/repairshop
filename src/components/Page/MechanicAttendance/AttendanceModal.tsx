import TimePicker from "react-multi-date-picker/plugins/time_picker";
import gregorian_en from "react-date-object/locales/gregorian_en";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import {
  DialogContent,
  Grid,
  DialogActions,
  Autocomplete,
  FormControl,
  DialogTitle,
  InputLabel,
  TextField,
  MenuItem,
  Dialog,
  Select,
  Box,
} from "@mui/material";

import { Button, EnhancedInput } from "@/components";

const attendanceSchema = z.object({
  mechanicId: z.number().min(1, "انتخاب مکانیک الزامی است"),
  type: z.number().min(1, "انتخاب نوع حضور/غیاب الزامی است"),
  description: z.string().optional(),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

interface AttendanceModalProps {
  editingAttendance?: IGetMechanicAttendanceById | null;
  onSubmit: (data: ICreateMechanicAttendance) => void;
  mechanics: IGetAllMechanics[];
  onClose: () => void;
  loading?: boolean;
  open: boolean;
}

const attendanceTypes = [
  { value: 1, label: "ورود" },
  { value: 2, label: "خروج" },
];

const AttendanceModal: FC<AttendanceModalProps> = ({
  editingAttendance,
  loading = false,
  mechanics,
  onSubmit,
  onClose,
  open,
}) => {
  const [dateTime, setDateTime] = useState<DateObject | null>(null);

  const {
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      description: "",
      mechanicId: 0,
      type: 0,
    },
  });

  // Reset form when modal opens/closes or editing data changes
  useEffect(() => {
    if (open) {
      if (editingAttendance) {
        // Populate form with editing data
        setValue("mechanicId", editingAttendance.mechanicId);
        setValue("type", editingAttendance.type);
        setValue("description", editingAttendance.description || "");

        // Set dateTime from editing data
        if (editingAttendance.dateTime) {
          const dateValue = new DateObject({
            calendar: persian,
            date: new Date(editingAttendance.dateTime),
          });
          setDateTime(dateValue);
        }
      } else {
        // Reset to defaults for new attendance
        setDateTime(new DateObject({ calendar: persian, locale: persian_fa }));
        reset({
          mechanicId: 0,
          type: 0,
          description: "",
        });
      }
    } else {
      setDateTime(null);
      reset({
        mechanicId: 0,
        type: 0,
        description: "",
      });
    }
  }, [open, editingAttendance, setValue, reset]);

  const handleFormSubmit = (data: AttendanceFormData) => {
    if (!dateTime) {
      toast.error("تاریخ و زمان الزامی است");
      return;
    }

    // Set default description based on attendance type if user didn't provide one
    let description = data.description || "";
    if (!description.trim()) {
      switch (data.type) {
        case 1:
          description = "شروع شیفت کاری";
          break;
        case 2:
          description = "پایان شیفت کاری";
          break;
        default:
          description = "";
      }
    }

    const submitData: ICreateMechanicAttendance = {
      mechanicId: data.mechanicId,
      type: data.type,
      dateTime: dateTime
        .convert(gregorian, gregorian_en)
        .format("YYYY-MM-DDTHH:mm:ss")
        .toString(),
      description,
      ...(editingAttendance?.id && { id: editingAttendance.id }),
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const selectedMechanic = mechanics.find(
    (m) => m.id === control._formValues.mechanicId
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: "rounded-lg",
      }}
    >
      <DialogTitle className="bg-gray-50 border-b">
        <Box className="flex items-center gap-2">
          {editingAttendance ? "ویرایش رکورد حضور/غیاب" : "ثبت حضور/غیاب جدید"}
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent className="py-6">
          <Grid container spacing={3}>
            {/* Mechanic Selection */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="mechanicId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={mechanics}
                    getOptionLabel={(option: IGetAllMechanics) =>
                      option.fullName
                    }
                    value={selectedMechanic || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.id || 0);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="انتخاب مکانیک *"
                        variant="outlined"
                        fullWidth
                        error={!!errors.mechanicId}
                        helperText={errors.mechanicId?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* Attendance Type */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>نوع حضور/غیاب *</InputLabel>
                    <Select
                      {...field}
                      label="نوع حضور/غیاب *"
                      value={field.value || ""}
                    >
                      <MenuItem value="">
                        <em>انتخاب کنید</em>
                      </MenuItem>
                      {attendanceTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.type && (
                      <Box className="text-red-500 text-sm mt-1">
                        {errors.type.message}
                      </Box>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Date and Time */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="attendance-modal__field">
                <DatePicker
                  className="custom-datepicker"
                  containerClassName="w-full custom-datepicker-container"
                  value={dateTime}
                  onChange={(date: DateObject) => setDateTime(date)}
                  plugins={[<TimePicker position="bottom" />]}
                  placeholder="انتخاب تاریخ و زمان (الزامی)"
                  calendarPosition="bottom-left"
                  onOpenPickNewDate={false}
                  locale={persian_fa}
                  calendar={persian}
                  format="YYYY/MM/DD HH:mm"
                  portal={true}
                  zIndex={2001}
                  style={{
                    width: "100%",
                    height: "56px",
                  }}
                />
              </Box>
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <EnhancedInput
                    {...field}
                    label="توضیحات"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="توضیحات اضافی در مورد حضور/غیاب..."
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className="px-6 py-4 bg-gray-50 border-t">
          <Button
            onClick={handleClose}
            label="انصراف"
            variant="outlined"
            color="secondary"
          />
          <Button
            type="submit"
            label={editingAttendance ? "بروزرسانی" : "ثبت"}
            variant="contained"
            color="primary"
            loading={loading}
          />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AttendanceModal;
