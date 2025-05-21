import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import { FC, useState } from "react";
import {
  FormControlLabel,
  DialogActions,
  DialogContent,
  Grid2 as Grid,
  FormControl,
  DialogTitle,
  Typography,
  IconButton,
  FormGroup,
  FormLabel,
  Checkbox,
  Dialog,
  Box,
} from "@mui/material";

import { getCustomers } from "@/service/customer/customer.service";
import { carCompany, carTipTypes } from "@/utils/statics";
import { createCar } from "@/service/cars/cars.service";
import useFileUpload from "@/hooks/useFileUpload";
import {
  createRepairReception,
  getCustomerCars,
} from "@/service/repair/repair.service";
import {
  PlateNumberDisplay,
  EnhancedSelect,
  EnhancedInput,
  FileUploader,
  Loading,
  Button,
} from "@/components";

const generateId = () => `id_${Math.random().toString(36).substring(2, 11)}`;

const ServiceAdmissionForm: FC = () => {
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([]);
  const [showNewPlateDialog, setShowNewPlateDialog] = useState(false);
  const [customerVehicles, setCustomerVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [newPlate, setNewPlate] = useState<plateSection>({});
  const [uploadedFileIds, setUploadedFileIds] = useState<number[]>([]);
  const { upload, uploadMultiple, isUploading, uploadError } = useFileUpload({
    onSuccess: (response) => {
      if (response?.isSuccess && response?.data?.id) {
        setUploadedFileIds((prev) => [...prev, response.data.id]);
        toast.success("فایل با موفقیت آپلود شد");
      }
    },
    onError: () => {
      toast.error("خطا در آپلود فایل");
    },
  });
  const {
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<IServiceAdmissionForm>({
    defaultValues: {
      issues: [{ id: generateId(), description: "" }],
      notifyWarehouseManager: false,
      notifyWorkshopManager: true,
      isReturnedVehicle: false,
      preferredRepairTime: "",
      notifyManagement: true,
      customerId: undefined,
      vehicleTypeId: 0,
      files: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: "issues",
    control,
  });
  const { mutateAsync: searchCustomers, isPending: isSearchingCustomers } =
    useMutation({
      mutationFn: getCustomers,
      onSuccess: (data) => {
        const customerOptions = data?.data?.map((i: any) => ({
          label: i?.fullName,
          value: i.customerId,
          id: `customer-${i.customerId}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
        }));
        setCustomerOptions(customerOptions || []);
      },
    });
  const {
    mutateAsync: mutateAsyncCustomerCars,
    isPending: isPendingCustomerCars,
  } = useMutation({
    mutationFn: getCustomerCars,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        const cars = data?.data?.map((i: any) => ({
          label: `${i.plateSection1}${i.plateSection2}${i.plateSection3}-ایران${i.plateSection4}`,
          value: i.id,
        }));
        setCustomerVehicles(cars);
      } else {
        toast?.error(data?.message);
      }
    },
  });
  const {
    mutateAsync: mutateAsyncCreateRepairReception,
    isPending: isPendingCreateRepairReception,
  } = useMutation({
    mutationFn: createRepairReception,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast.success(data?.message);
        reset();
      } else {
        toast?.error(data?.message);
      }
    },
  });
  const { mutateAsync: mutateAsyncCreateCar, isPending: isPendingCreateCar } =
    useMutation({
      mutationFn: createCar,
      onSuccess: (data: any) => {
        if (data?.isSuccess) {
          toast.success(data?.message);
          handleCloseNewPlateDialog();
          mutateAsyncCustomerCars(watch("customerId"));
        } else {
          toast?.error(data?.message);
        }
      },
    });
  const addIssue = () => {
    append({ id: generateId(), description: "" });
  };
  const handleAddNewPlate = () => {
    setShowNewPlateDialog(true);
  };
  const handleCloseNewPlateDialog = () => {
    setShowNewPlateDialog(false);
  };
  const handleSaveNewPlate = () => {
    mutateAsyncCreateCar({
      plateSection1: newPlate.plateSection1,
      plateSection2: newPlate.plateSection2,
      plateSection3: newPlate.plateSection3,
      plateSection4: newPlate.plateSection4,
      customerId: watch("customerId"),
      carCompany: watch("carCompany"),
      carTipId: watch("carTipId"),
      carType: "کامیونت",
    });
  };
  const handleFilesChange = async (files: File[]) => {
    const currentFiles = watch("files") || [];
    const newFiles = files.filter(
      (file) =>
        !currentFiles.some(
          (existingFile) =>
            existingFile.name === file.name && existingFile.size === file.size
        )
    );
    setValue("files", files, { shouldValidate: true });
    if (newFiles.length > 0) {
      try {
        if (newFiles.length === 1) {
          await upload(newFiles[0]);
        } else {
          await uploadMultiple(newFiles);
        }
      } catch (error) {
        console.error("Upload error:", error);
      }
    }
  };
  const onSubmit = () => {};
  const handleCustomerSearch = (searchText: string) => {
    if (searchText && searchText.length >= 2) {
      searchCustomers(searchText);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {isPendingCreateRepairReception && <Loading />}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <EnhancedSelect
            helperText={errors.customerId?.message as string}
            loading={isSearchingCustomers}
            error={!!errors.customerId}
            options={customerOptions}
            enableSpeechToText={true}
            iconPosition="end"
            searchable={true}
            name="customerId"
            disabled={false}
            label="مشتری"
            isRtl={true}
            control={control}
            storeValueOnly={true}
            onChange={(value) => {
              if (value?.value) {
                mutateAsyncCustomerCars(value?.value);
              }
            }}
            onInputChange={(value) => {
              handleCustomerSearch(value);
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <EnhancedSelect
            helperText={errors.vehicleTypeId?.message as string}
            placeholder="جستجوی پلاک خودرو"
            error={!!errors.vehicleTypeId}
            loading={isPendingCustomerCars}
            options={customerVehicles}
            control={control}
            storeValueOnly={true}
            name="vehicleTypeId"
            enableSpeechToText
            searchable={true}
            label="پلاک خودرو"
            isRtl
            onChange={(value) => {
              setSelectedVehicle(value);
            }}
            onInputChange={(value) => {
              console.log("Vehicle search input:", value);
            }}
          />
          <Box className="mb-2 flex justify-end mt-2 items-center">
            <Button
              disabled={watch("customerId") === undefined}
              onClick={handleAddNewPlate}
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
            >
              افزودن پلاک جدید
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box className="mb-2 flex justify-between items-center">
            <Typography variant="subtitle1">شرح مشکلات</Typography>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={addIssue}
              size="small"
            >
              افزودن مشکل
            </Button>
          </Box>
          {fields.map((item, index) => (
            <Box key={item.id} className="flex items-start mb-3">
              <EnhancedInput
                helperText={
                  errors.issues?.[index]?.description?.message as string
                }
                error={!!errors.issues?.[index]?.description}
                name={`issues.${index}.description`}
                label={`مشکل ${index + 1}`}
                enableSpeechToText
                isTextArea
                fullWidth
                rows={1}
              />
              {fields.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => remove(index)}
                  sx={{ ml: 1, mt: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" className="mb-2">
            آپلود فایل (اختیاری)
          </Typography>
          <Controller
            name="files"
            control={control}
            render={({ field }) => (
              <FileUploader
                onFilesChange={handleFilesChange}
                error={!!errors.files}
                files={field.value}
                multiple={true}
                helperText={
                  uploadError
                    ? `خطا در آپلود: ${uploadError}`
                    : (errors.files?.message as string)
                }
              />
            )}
          />
          {uploadedFileIds.length > 0 && (
            <Box className="mt-2">
              <Typography variant="caption" color="success.main">
                {uploadedFileIds.length} فایل با موفقیت آپلود شده است
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <EnhancedInput
            helperText={errors.preferredRepairTime?.message as string}
            error={!!errors.preferredRepairTime}
            name="preferredRepairTime"
            label="زمان ترجیحی تعمیر"
            type="datetime-local"
            enableSpeechToText={false}
            icon={<span>روز</span>}
            iconPosition="end"
            isTextArea
            fullWidth
            rows={1}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend" sx={{ mb: 1 }}>
              ارسال پیامک به:
            </FormLabel>
            <FormGroup>
              <Controller
                name="notifyManagement"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color="secondary"
                      />
                    }
                    label="مدیریت"
                  />
                )}
              />
              <Controller
                name="notifyWorkshopManager"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color="secondary"
                      />
                    }
                    label="مدیر کارگاه"
                  />
                )}
              />
              <Controller
                name="notifyWarehouseManager"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color="secondary"
                      />
                    }
                    label="مدیر انبار"
                  />
                )}
              />
            </FormGroup>
          </FormControl>
        </Grid>

        <Grid
          size={{ xs: 12 }}
          sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
        >
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            size="large"
            disabled={
              (!selectedVehicle && !watch("isReturnedVehicle")) || isUploading
            }
          >
            ثبت پذیرش
          </Button>
        </Grid>
      </Grid>

      <Dialog
        open={showNewPlateDialog}
        onClose={handleCloseNewPlateDialog}
        maxWidth="sm"
        fullWidth
      >
        {isPendingCreateCar && <Loading />}
        <DialogTitle>ثبت پلاک جدید</DialogTitle>
        <DialogContent sx={{ pt: "10px !important" }}>
          <Box sx={{ py: 2 }}>
            <Typography
              justifyContent="center"
              marginBottom="1rem"
              display="flex"
              variant="h6"
            >
              لطفا اطلاعات خودرو جدید را برای مشتری انتخاب شده وارد کنید.
            </Typography>
            <EnhancedSelect
              helperText={errors.vehicleTypeId?.message as string}
              placeholder="شرکت خودرو سازی را انتخاب کنید"
              containerClassName="mb-5"
              label="شرکت خودرو سازی"
              options={carCompany}
              searchable={true}
              control={control}
              storeValueOnly={true}
              name="carCompany"
              isRtl
              onChange={(value) => {
                setSelectedVehicle(value);
              }}
              onInputChange={(value) => {
                console.log("Vehicle search input:", value);
              }}
            />
            <EnhancedSelect
              helperText={errors.vehicleTypeId?.message as string}
              placeholder="تیپ خودرو را انتخاب کنید"
              containerClassName="mb-5"
              options={carTipTypes}
              control={control}
              storeValueOnly={true}
              searchable={true}
              label="تیپ خودرو"
              name="carTipId"
              isRtl
              onChange={(value) => {
                setSelectedVehicle(value);
              }}
              onInputChange={(value) => {
                console.log("Vehicle search input:", value);
              }}
            />
            <div className="w-1/2 mx-auto">
              <PlateNumberDisplay
                setState={setNewPlate as any}
                state={newPlate}
              />
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewPlateDialog} variant="outlined">
            انصراف
          </Button>
          <Button
            onClick={handleSaveNewPlate}
            variant="contained"
            color="secondary"
            disabled={
              !newPlate.plateSection1 ||
              !newPlate.plateSection2 ||
              !newPlate.plateSection3 ||
              !newPlate.plateSection4
            }
          >
            ثبت و انتخاب پلاک
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default ServiceAdmissionForm;
