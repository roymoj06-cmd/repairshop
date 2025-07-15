import { Box, Grid2 as Grid, Tab, Tabs, Typography } from "@mui/material";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import gregorian_en from "react-date-object/locales/gregorian_en";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import { FC, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Add } from "@mui/icons-material";
import { toast } from "react-toastify";

import { getCustomers } from "@/service/customer/customer.service";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";
import {
  createRepairReception,
  getCustomerCars,
} from "@/service/repair/repair.service";
import UploaderDocs from "./UploaderDocs";
import {
  RepairReceptionProducts,
  RepairReceptionService,
  PlateManagementDialog,
  CustomerProblems,
  EnhancedSelect,
  EnhancedInput,
  Loading,
  Button,
} from "@/components";

const AddServiceAdmissionForm: FC = () => {
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([]);
  const [showNewPlateDialog, setShowNewPlateDialog] = useState(false);
  const [customerVehicles, setCustomerVehicles] = useState<any[]>([]);
  const [repairReceptionId, setRepairReceptionId] = useState<
    string | undefined
  >();
  const [activeTab, setActiveTab] = useState(0);
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

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    handleSubmit,
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
      // New fields default values
      customerEstimatedTime: undefined,
      delivererPhone: "",
      deliveryDateTime: undefined,
      carKilometers: undefined,
      delivererName: "",
      receiverName: "",
      receptionDateTime: undefined,
      description: "",
      carColor: "",
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
        setRepairReceptionId(data?.data?.id);
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
    mutateAsyncCreateRepairReception({
      repairReception: {
        customerId: watch("customerId"),
        carId: watch("carId"),
        // New fields
        customerEstimatedTime: watch("customerEstimatedTime"),
        delivererPhone: watch("delivererPhone"),
        deliveryDateTime: deliveryDate
          ?.convert(gregorian, gregorian_en)
          .format("YYYY-MM-DDTHH:mm:ss")
          .toString(),
        carKilometers: watch("carKilometers"),
        delivererName: watch("delivererName"),
        receiverName: watch("receiverName"),
        receptionDateTime: receptionDate
          ?.convert(gregorian, gregorian_en)
          .format("YYYY-MM-DDTHH:mm:ss")
          .toString(),
        description: watch("description"),
        carColor: watch("carColor"),
      },
    });
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  const isLoading = isPendingCreateRepairReception;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {isLoading && <Loading />}
      <Grid container spacing={4}>
        {/* ردیف اول - مشتری، پلاک و تاریخ پذیرش */}
        <Grid size={{ xs: 12, md: 4 }}>
          <EnhancedSelect
            helperText={errors.customerId?.message as string}
            onInputChange={handleCustomerSearch}
            onChange={handleCustomerChange}
            loading={isSearchingCustomers}
            error={!!errors.customerId}
            options={customerOptions}
            enableSpeechToText={true}
            storeValueOnly={true}
            iconPosition="end"
            searchable={true}
            name="customerId"
            control={control}
            disabled={false}
            label="مشتری"
            isRtl={true}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <EnhancedSelect
            helperText={errors.carId?.message as string}
            onInputChange={(value) => {
              console.log("Vehicle search input:", value);
            }}
            placeholder="جستجوی پلاک خودرو"
            loading={isPendingCustomerCars}
            options={customerVehicles}
            error={!!errors.carId}
            storeValueOnly={true}
            enableSpeechToText
            label="پلاک خودرو"
            control={control}
            searchable={true}
            name="carId"
            isRtl
          />
          <Box className="mb-2 flex justify-end mt-2 items-center">
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
        <Grid size={{ xs: 12, md: 4 }}>
          <Box>
            <DatePicker
              className={`custom-datepicker ${errors.receptionDateTime ? "error" : ""}`}
              containerClassName="w-full custom-datepicker-container"
              onChange={(e: DateObject) => setReceptionDate(e)}
              placeholder="انتخاب تاریخ و زمان پذیرش"
              calendarPosition="bottom-left"
              onOpenPickNewDate={false}
              format="YYYY/MM/DD HH:mm"
              value={receptionDate}
              locale={persian_fa}
              calendar={persian}
              portal={true}
              zIndex={2001}
              plugins={[
                <TimePicker position="bottom" />
              ]}
              style={{
                width: "100%",
                height: "56px",
              }}
            />
          </Box>
        </Grid>

        {/* ردیف دوم - فیلدهای کوچک */}
        <Grid size={{ xs: 12, md: 3 }}>
          <EnhancedInput
            helperText={errors.customerEstimatedTime?.message as string}
            error={!!errors.customerEstimatedTime}
            name="customerEstimatedTime"
            label="زمان تخمینی (روز)"
            enableSpeechToText={true}
            iconPosition="end"
            control={control}
            type="number"
            isRtl={true}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <EnhancedInput
            helperText={errors.carKilometers?.message as string}
            error={!!errors.carKilometers}
            enableSpeechToText={true}
            name="carKilometers"
            label="کیلومتر خودرو"
            iconPosition="end"
            control={control}
            type="number"
            isRtl={true}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <EnhancedInput
            helperText={errors.carColor?.message as string}
            error={!!errors.carColor}
            iconPosition="end"
            label="رنگ خودرو"
            control={control}
            name="carColor"
            disabled={true}
            isRtl={true}
            type="text"
          />
        </Grid>
        {/* ردیف سوم - اطلاعات تحویل دهنده */}
        <Grid size={{ xs: 12, md: 6 }}>
          <EnhancedInput
            helperText={errors.delivererName?.message as string}
            error={!!errors.delivererName}
            enableSpeechToText={true}
            label="نام تحویل دهنده"
            name="delivererName"
            iconPosition="end"
            control={control}
            isRtl={true}
            type="text"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <EnhancedInput
            helperText={errors.delivererPhone?.message as string}
            error={!!errors.delivererPhone}
            label="شماره تلفن تحویل دهنده"
            enableSpeechToText={true}
            name="delivererPhone"
            iconPosition="end"
            control={control}
            isRtl={true}
            type="tel"
          />
        </Grid>

        {/* ردیف چهارم - اطلاعات تحویل گیرنده */}
        <Grid size={{ xs: 12, md: 6 }}>
          <EnhancedInput
            helperText={errors.receiverName?.message as string}
            error={!!errors.receiverName}
            enableSpeechToText={true}
            label="نام تحویل گیرنده"
            name="receiverName"
            iconPosition="end"
            control={control}
            isRtl={true}
            type="text"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <DatePicker
              className={`custom-datepicker ${errors.deliveryDateTime ? "error" : ""}`}
              containerClassName="w-full custom-datepicker-container"
              onChange={(e: DateObject) => setDeliveryDate(e)}
              placeholder="انتخاب تاریخ و زمان تحویل"
              calendarPosition="bottom-left"
              onOpenPickNewDate={false}
              format="YYYY/MM/DD HH:mm"
              value={deliveryDate}
              locale={persian_fa}
              calendar={persian}
              portal={true}
              zIndex={2001}
              plugins={[
                <TimePicker position="bottom" />
              ]}
              style={{
                width: "100%",
                height: "56px",
              }}
            />
          </Box>
        </Grid>

        {/* ردیف پنجم - توضیحات */}
        <Grid size={{ xs: 12 }}>
          <EnhancedInput
            helperText={errors.description?.message as string}
            error={!!errors.description}
            enableSpeechToText={true}
            name="description"
            iconPosition="end"
            control={control}
            label="توضیحات"
            isRtl={true}
            type="text"
            isTextArea
            rows={3}
          />
        </Grid>
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
        >
          <AccessGuard accessId={ACCESS_IDS.ADMISSION}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              disabled={
                !watch("carId") &&
                watch("carId") !== 0 &&
                !watch("isReturnedVehicle")
              }
            >
              {"ثبت پذیرش"}
            </Button>
          </AccessGuard>
        </Grid>
        {createRepairReceptionData?.isSuccess ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="service tabs"
              >
                <Tab label="مشکلات" />
                <Tab label="تعمیرات" />
                <Tab label="قطعات" />
                <Tab label="مستندات" />
              </Tabs>
            </Box>

            {/* تب مشکلات */}
            {activeTab === 0 && (
              <CustomerProblems repairReceptionId={repairReceptionId} />
            )}

            {/* تب تعمیرات */}
            {activeTab === 1 && (
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
            {activeTab === 2 && (
              <RepairReceptionProducts repairReceptionId={repairReceptionId} />
            )}

            {/* تب مستندات */}
            {activeTab === 3 && (
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
    </form>
  );
};

export default AddServiceAdmissionForm;
