import { Box, Grid2 as Grid, Tab, Tabs, Typography, Divider } from "@mui/material";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import gregorian_en from "react-date-object/locales/gregorian_en";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import { FC, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Add } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { useAccessControl, ACCESS_IDS, AccessGuard } from "@/utils/accessControl";
import { getCustomers } from "@/service/customer/customer.service";
import {
  getRepairReceptionForUpdateById,
  createRepairReception,
  updateRepairReception,
  getCustomerCars,
  dischargeRepairReception,
} from "@/service/repair/repair.service";
import {
  RepairReceptionProducts,
  RepairReceptionService,
  PlateManagementDialog,
  CustomerProblems,
  EnhancedSelect,
  EnhancedInput,
  UploaderDocs,
  Loading,
  Button,
  ConfirmDialog,
} from "@/components";

interface IServiceAdmissionFormProps {
  repairReceptionId?: string;
}

const ServiceAdmissionForm: FC<IServiceAdmissionFormProps> = ({
  repairReceptionId,
}) => {
  const { hasCategoryAccess } = useAccessControl();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showNewPlateDialog, setShowNewPlateDialog] = useState<boolean>(false);
  const [showDischargeConfirmDialog, setShowDischargeConfirmDialog] = useState<boolean>(false);
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);
  const [customerVehicles, setCustomerVehicles] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  // Date picker states
  const [deliveryDate, setDeliveryDate] = useState<any>(null);
  const [receptionDate, setReceptionDate] = useState<any>(() => {
    // Set default to today with current time
    const now = new Date();
    return new DateObject({
      calendar: persian,
      date: now,
    });
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
      preferredRepairTime: undefined,
      notifyWarehouseManager: false,
      notifyWorkshopManager: true,
      isReturnedVehicle: false,
      notifyManagement: true,
      customerId: undefined,
      carId: undefined,
      files: [],
      // Updated fields default values
      customerEstimatedTime: undefined,
      carKilometers: undefined,
      description: "",
      carColor: "",
      receiverNameAtReception: "",
      receptionDateTime: undefined,
      driverNameAtDelivery: "",
      driverPhoneAtDelivery: "",
      staffNameAtReturn: "",
      returnDateTime: undefined,
      customerNameAtReturn: "",
      customerPhoneAtReturn: "",
    },
  });

  const {
    mutateAsync: fetchRepairReception,
    isPending: isFetchingRepairReception,
  } = useMutation({
    mutationFn: getRepairReceptionForUpdateById,
    onSuccess: (data: any) => {
      if (data?.isSuccess && data?.data) {
        const repairData = data.data;
        setValue("customerId", repairData.customerId);
        setValue("carId", repairData.carId);
        // Set new field values
        setValue("customerEstimatedTime", repairData.customerEstimatedTime);
        setValue("driverPhoneAtDelivery", repairData.driverPhoneAtDelivery);
        setValue("carKilometers", repairData.carKilometers);
        setValue("driverNameAtDelivery", repairData.driverNameAtDelivery);
        setValue("receiverNameAtReception", repairData.receiverNameAtReception);
        setValue("description", repairData.description);
        setValue("carColor", repairData.carColor);
        setValue("staffNameAtReturn", repairData.staffNameAtReturn);
        setValue("customerNameAtReturn", repairData.customerNameAtReturn);
        setValue("customerPhoneAtReturn", repairData.customerPhoneAtReturn);

        // Set date picker values
        if (repairData.returnDateTime) {
          let deliveryDateValue;
          if (repairData.returnDateTime.includes("T")) {
            deliveryDateValue = new DateObject({
              calendar: persian,
              date: new Date(repairData.returnDateTime),
            });
          } else {
            deliveryDateValue = new DateObject({
              calendar: persian,
              date: new Date(repairData.returnDateTime),
            });
          }
          setDeliveryDate(deliveryDateValue);
        }

        if (repairData.receptionDateTime) {
          let receptionDateValue;
          if (repairData.receptionDateTime.includes("T")) {
            receptionDateValue = new DateObject({
              calendar: persian,
              date: new Date(repairData.receptionDateTime),
            });
          } else {
            receptionDateValue = new DateObject({
              calendar: persian,
              date: new Date(repairData.receptionDateTime),
            });
          }
          setReceptionDate(receptionDateValue);
        }

        if (repairData.customerId) {
          mutateAsyncCustomerCars(repairData.customerId);
        }
        if (repairData.customerName) {
          setCustomerOptions([
            {
              label: repairData.customerName,
              value: repairData.customerId,
            },
          ]);
        }
        setInitialDataLoaded(true);
      } else {
        toast.error(data?.message || "خطا در دریافت اطلاعات پذیرش");
      }
    },
  });

  const { mutateAsync: searchCustomers, isPending: isSearchingCustomers } =
    useMutation({
      mutationFn: getCustomers,
      onSuccess: (data) => {
        const customerOptions = data?.data?.map((i: any) => ({
          label: i?.fullName,
          value: i.customerId,
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
    data: createRepairReceptionData,
  } = useMutation({
    mutationFn: createRepairReception,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast.success(data?.message);
        reset();
        // Reset reception date to today
        const now = new Date();
        setReceptionDate(new DateObject({
          calendar: persian,
          date: now,
        }));
      } else {
        toast?.error(data?.message);
      }
    },
  });

  const {
    mutateAsync: mutateAsyncUpdateRepairReception,
    isPending: isPendingUpdateRepairReception,
  } = useMutation({
    mutationFn: updateRepairReception,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast.success(data?.message || "پذیرش با موفقیت بروزرسانی شد");
      } else {
        toast?.error(data?.message);
      }
    },
  });

  const {
    mutateAsync: mutateAsyncDischargeRepairReception,
    isPending: isPendingDischargeRepairReception,
  } = useMutation({
    mutationFn: dischargeRepairReception,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast.success(data?.message || "پذیرش با موفقیت بروزرسانی شد");
      } else {
        toast?.error(data?.message);
      }
    },
  });

  const handleCustomerChange = (value: any) => {
    if (value?.value) {
      mutateAsyncCustomerCars(value.value);
    }
  };

  const handleCustomerSearch = (searchText: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (searchText && searchText.length >= 2) {
        searchCustomers(searchText);
      }
    }, 300);
  };

  const handleDischargeConfirm = () => {
    if (repairReceptionId) {
      mutateAsyncDischargeRepairReception({ repairReceptionId: +repairReceptionId });
    }
    setShowDischargeConfirmDialog(false);
  };

  const handleDischargeCancel = () => {
    setShowDischargeConfirmDialog(false);
  };

  const handleAddNewPlate = () => {
    setShowNewPlateDialog(true);
  };

  const handleCloseNewPlateDialog = () => {
    setShowNewPlateDialog(false);
  };

  const handlePlateSuccess = () => {
    const customerId = watch("customerId");
    if (customerId) {
      mutateAsyncCustomerCars(customerId);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const onSubmit = () => {
    if (isEditMode && repairReceptionId) {
      mutateAsyncUpdateRepairReception({
        repairReception: {
          repairReceptionId: Number(repairReceptionId),
          customerId: watch("customerId"),
          carId: watch("carId"),
          // Updated fields
          customerEstimatedTime: watch("customerEstimatedTime"),
          driverPhoneAtDelivery: watch("driverPhoneAtDelivery"),
          returnDateTime: deliveryDate
            ?.convert(gregorian, gregorian_en)
            .format("YYYY-MM-DDTHH:mm:ss")
            .toString(),
          carKilometers: watch("carKilometers"),
          driverNameAtDelivery: watch("driverNameAtDelivery"),
          receiverNameAtReception: watch("receiverNameAtReception"),
          receptionDateTime: receptionDate
            ?.convert(gregorian, gregorian_en)
            .format("YYYY-MM-DDTHH:mm:ss")
            .toString(),
          description: watch("description"),
          carColor: watch("carColor"),
          staffNameAtReturn: watch("staffNameAtReturn"),
          customerNameAtReturn: watch("customerNameAtReturn"),
          customerPhoneAtReturn: watch("customerPhoneAtReturn"),
        },
      });
    } else {
      mutateAsyncCreateRepairReception({
        repairReception: {
          customerId: watch("customerId"),
          carId: watch("carId"),
          // Updated fields
          customerEstimatedTime: watch("customerEstimatedTime"),
          driverPhoneAtDelivery: watch("driverPhoneAtDelivery"),
          returnDateTime: deliveryDate
            ?.convert(gregorian, gregorian_en)
            .format("YYYY-MM-DDTHH:mm:ss")
            .toString(),
          carKilometers: watch("carKilometers"),
          driverNameAtDelivery: watch("driverNameAtDelivery"),
          receiverNameAtReception: watch("receiverNameAtReception"),
          receptionDateTime: receptionDate
            ?.convert(gregorian, gregorian_en)
            .format("YYYY-MM-DDTHH:mm:ss")
            .toString(),
          description: watch("description"),
          carColor: watch("carColor"),
          staffNameAtReturn: watch("staffNameAtReturn"),
          customerNameAtReturn: watch("customerNameAtReturn"),
          customerPhoneAtReturn: watch("customerPhoneAtReturn"),
        },
      });
    }
  };

  useEffect(() => {
    if (repairReceptionId) {
      setIsEditMode(true);
      fetchRepairReception(+repairReceptionId);
    } else if (repairReceptionId === undefined) {
      setIsEditMode(false);
      setCustomerOptions([]);
      setCustomerVehicles([]);
      reset({
        preferredRepairTime: undefined,
        notifyWarehouseManager: false,
        notifyWorkshopManager: true,
        isReturnedVehicle: false,
        notifyManagement: true,
        customerId: undefined,
        carId: undefined,
        files: [],
        // Reset updated fields
        customerEstimatedTime: undefined,
        carKilometers: undefined,
        description: "",
        carColor: "",
        receiverNameAtReception: "",
        receptionDateTime: undefined,
        driverNameAtDelivery: "",
        driverPhoneAtDelivery: "",
        staffNameAtReturn: "",
        returnDateTime: undefined,
        customerNameAtReturn: "",
        customerPhoneAtReturn: "",
      });
      // Reset reception date to today
      const now = new Date();
      setReceptionDate(new DateObject({
        calendar: persian,
        date: now,
      }));
      setInitialDataLoaded(false);
    }
  }, [repairReceptionId, isEditMode, fetchRepairReception, reset]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const isLoading =
    isPendingDischargeRepairReception ||
    isPendingCreateRepairReception ||
    isPendingUpdateRepairReception ||
    isFetchingRepairReception;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {isLoading && <Loading />}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
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
            onChange={handleCustomerChange}
            onInputChange={handleCustomerSearch}
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <EnhancedSelect
            helperText={errors.carId?.message as string}
            onInputChange={(value) => {
              console.log("Vehicle search input:", value);
            }}
            placeholder="جستجوی پلاک"
            error={!!errors.carId}
            loading={isPendingCustomerCars}
            options={customerVehicles}
            control={control}
            storeValueOnly={true}
            searchable={true}
            label="پلاک"
            name="carId"
            isRtl
            size="small"
          />
          <Box className="mb-2 flex justify-end mt-1 items-center">
            <Button
              disabled={watch("customerId") === undefined}
              onClick={handleAddNewPlate}
              startIcon={<Add />}
              variant="outlined"
              size="small"
            >
              افزودن پلاک جدید
            </Button>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <EnhancedInput
            helperText={errors.carColor?.message as string}
            error={!!errors.carColor}
            iconPosition="end"
            label="رنگ"
            control={control}
            name="carColor"
            disabled={true}
            isRtl={true}
            type="text"
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <Box>
            <DatePicker
              className={`custom-datepicker ${errors.receptionDateTime ? "error" : ""}`}
              containerClassName="w-full custom-datepicker-container"
              onChange={(e: DateObject) => setReceptionDate(e)}
              placeholder="تاریخ و زمان پذیرش"
              calendarPosition="bottom-left"
              onOpenPickNewDate={false}
              locale={persian_fa}
              calendar={persian}
              format="YYYY/MM/DD HH:mm"
              value={receptionDate}
              portal={true}
              zIndex={2001}
              plugins={[
                <TimePicker position="bottom" />
              ]}
              style={{
                width: "100%",
                height: "45px",
              }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 6, md: 6, lg: 1 }}>
          <EnhancedInput
            helperText={errors.customerEstimatedTime?.message as string}
            error={!!errors.customerEstimatedTime}
            label="زمان تخمینی (روز)"
            name="customerEstimatedTime"
            iconPosition="end"
            control={control}
            type="number"
            isRtl={true}
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 6, lg: 2 }}>
          <EnhancedInput
            helperText={errors.carKilometers?.message as string}
            error={!!errors.carKilometers}
            label="کیلومتر"
            name="carKilometers"
            iconPosition="end"
            control={control}
            type="number"
            isRtl={true}
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <EnhancedInput
            helperText={errors.driverNameAtDelivery?.message as string}
            error={!!errors.driverNameAtDelivery}
            enableSpeechToText={true}
            name="driverNameAtDelivery"
            label="نام راننده تحویل دهنده"
            iconPosition="end"
            control={control}
            isRtl={true}
            type="text"
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <EnhancedInput
            helperText={errors.driverPhoneAtDelivery?.message as string}
            error={!!errors.driverPhoneAtDelivery}
            label="تلفن راننده تحویل دهنده"
            name="driverPhoneAtDelivery"
            iconPosition="end"
            control={control}
            isRtl={true}
            type="tel"
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <EnhancedInput
            helperText={errors.receiverNameAtReception?.message as string}
            error={!!errors.receiverNameAtReception}
            label="نام تحویل گیرنده پذیرش"
            enableSpeechToText={true}
            name="receiverNameAtReception"
            iconPosition="end"
            control={control}
            isRtl={true}
            type="text"
            size="small"
          />
        </Grid>

        {/* جداکننده بین بخش پذیرش و ترخیص */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              اطلاعات ترخیص
            </Typography>
          </Divider>
        </Grid>

        {/* بخش ترخیص - اطلاعات تحویل به مشتری */}
        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <Box>
            <DatePicker
              className={`custom-datepicker ${errors.returnDateTime ? "error" : ""}`}
              containerClassName="w-full custom-datepicker-container"
              onChange={(e: DateObject) => setDeliveryDate(e)}
              placeholder="تاریخ و زمان ترخیص"
              calendarPosition="bottom-left"
              onOpenPickNewDate={false}
              locale={persian_fa}
              calendar={persian}
              format="YYYY/MM/DD HH:mm"
              value={deliveryDate}
              portal={true}
              zIndex={2001}
              plugins={[
                <TimePicker position="bottom" />
              ]}
              style={{
                width: "100%",
                height: "45px",
              }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <EnhancedInput
            helperText={errors.staffNameAtReturn?.message as string}
            error={!!errors.staffNameAtReturn}
            enableSpeechToText={true}
            label="نام کارمند ترخیص"
            name="staffNameAtReturn"
            iconPosition="end"
            control={control}
            isRtl={true}
            type="text"
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <EnhancedInput
            helperText={errors.customerNameAtReturn?.message as string}
            error={!!errors.customerNameAtReturn}
            enableSpeechToText={true}
            label="نام مشتری تحویل گیرنده"
            name="customerNameAtReturn"
            iconPosition="end"
            control={control}
            isRtl={true}
            type="text"
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <EnhancedInput
            helperText={errors.customerPhoneAtReturn?.message as string}
            error={!!errors.customerPhoneAtReturn}
            enableSpeechToText={true}
            label="تلفن مشتری تحویل گیرنده"
            name="customerPhoneAtReturn"
            iconPosition="end"
            control={control}
            isRtl={true}
            type="tel"
            size="small"
          />
        </Grid>

        {/* جداکننده برای توضیحات */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              توضیحات
            </Typography>
          </Divider>
        </Grid>

        {/* بخش توضیحات */}
        <Grid size={{ xs: 12 }}>
          <EnhancedInput
            helperText={errors.description?.message as string}
            error={!!errors.description}
            enableSpeechToText={true}
            name="description"
            label="توضیحات"
            type="text"
            iconPosition="end"
            isRtl={true}
            control={control}
            isTextArea
            rows={3}
            size="small"
          />
        </Grid>
        <Grid
          size={{ xs: 12, md: 12 }}
          sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
        >
          {isEditMode ? (
            <AccessGuard accessId={ACCESS_IDS.EDIT_REPAIR}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                disabled={
                  (!watch("carId") &&
                    watch("carId") !== 0 &&
                    !watch("isReturnedVehicle")) ||
                  (isEditMode && !initialDataLoaded)
                }
              >
                {isEditMode ? "بروزرسانی پذیرش" : "ثبت پذیرش"}
              </Button>
            </AccessGuard>
          ) : (
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              disabled={
                (!watch("carId") &&
                  watch("carId") !== 0 &&
                  !watch("isReturnedVehicle")) ||
                (isEditMode && !initialDataLoaded)
              }
            >
              {isEditMode ? "بروزرسانی پذیرش" : "ثبت پذیرش"}
            </Button>
          )}
          <AccessGuard accessId={ACCESS_IDS.DISCHARGE_REPAIR_RECEPTION}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{ ml: 3 }}
              onClick={() => setShowDischargeConfirmDialog(true)}
              disabled={!repairReceptionId}
            >
              ترخیص خودرو
            </Button>
          </AccessGuard>
        </Grid>
        {isEditMode || createRepairReceptionData?.isSuccess ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="service tabs"
              >
                {hasCategoryAccess(ACCESS_IDS.PROBLEMS) && (
                  <Tab label="مشکلات" />
                )}
                {hasCategoryAccess(ACCESS_IDS.REPAIRS) && (
                  <Tab label="تعمیرات" />
                )}
                {hasCategoryAccess(ACCESS_IDS.PARTS) && <Tab label="قطعات" />}
                {hasCategoryAccess(ACCESS_IDS.DOCUMENTS) && (
                  <Tab label="مستندات" />
                )}
              </Tabs>
            </Box>

            {/* تب مشکلات */}
            {activeTab === 0 && hasCategoryAccess(ACCESS_IDS.PROBLEMS) && (
              <CustomerProblems repairReceptionId={repairReceptionId} />
            )}

            {/* تب تعمیرات */}
            {activeTab === 1 && hasCategoryAccess(ACCESS_IDS.REPAIRS) && (
              <RepairReceptionService
                repairReceptionId={repairReceptionId}
                customerId={watch("customerId")}
                carId={watch("carId")}
                details={{
                  customerName:
                    customerOptions.find((c) => c.value === watch("customerId"))
                      ?.label || "",
                  plateNumber:
                    customerVehicles.find((v) => v.value === watch("carId"))
                      ?.label || "",
                  receptionDate: new Date().toLocaleDateString("fa-IR"),
                }}
              />
            )}

            {/* تب قطعات */}
            {activeTab === 2 && hasCategoryAccess(ACCESS_IDS.PARTS) && (
              <RepairReceptionProducts repairReceptionId={repairReceptionId} />
            )}

            {/* تب مستندات */}
            {activeTab === 3 && hasCategoryAccess(ACCESS_IDS.DOCUMENTS) && (
              <Box>
                <Grid size={{ xs: 12 }}>
                  <Box className="mt-4">
                    <Typography variant="h6" className="mb-2">
                      آپلود فایل
                    </Typography>
                    <UploaderDocs repairReceptionId={repairReceptionId} />
                  </Box>
                </Grid>
              </Box>
            )}
          </Grid>
        ) : (
          <></>
        )}
      </Grid>
      <PlateManagementDialog
        description="لطفا اطلاعات خودرو جدید را برای مشتری انتخاب شده وارد کنید."
        onClose={handleCloseNewPlateDialog}
        customerId={watch("customerId")}
        onSuccess={handlePlateSuccess}
        open={showNewPlateDialog}
        title="ثبت پلاک جدید"
        mode="add"
      />
      <ConfirmDialog
        message="آیا از ترخیص این خودرو اطمینان دارید؟ این عمل قابل بازگشت نیست."
        loading={isPendingDischargeRepairReception}
        onConfirm={handleDischargeConfirm}
        open={showDischargeConfirmDialog}
        onCancel={handleDischargeCancel}
        title="تأیید ترخیص خودرو"
        confirmText="ترخیص خودرو"
        cancelText="انصراف"
      />
    </form>
  );
};

export default ServiceAdmissionForm;
