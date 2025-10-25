import { Box, Grid, Tab, Tabs, Typography, Divider } from "@mui/material";
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
import { useNavigate } from "react-router-dom";
import dir from "@/Router/dir";

const AddServiceAdmissionForm: FC = () => {
  const navigate = useNavigate();
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
        navigate({
          pathname: `${dir.serviceAdmission}`,
          search: `repairReceptionId=${data?.data?.id}`,
        });
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
        customerEstimatedTime: watch("customerEstimatedTime"),
        driverPhoneAtDelivery: watch("driverPhoneAtDelivery"),
        carKilometers: watch("carKilometers"),
        driverNameAtDelivery: watch("driverNameAtDelivery"),
        receiverNameAtReception: watch("receiverNameAtReception"),
        description: watch("description"),
        customerId: watch("customerId"),
        returnDateTime: deliveryDate
          ?.convert(gregorian, gregorian_en)
          .format("YYYY-MM-DDTHH:mm:ss")
          .toString(),
        receptionDateTime: receptionDate
          ?.convert(gregorian, gregorian_en)
          .format("YYYY-MM-DDTHH:mm:ss")
          .toString(),
        carColor: watch("carColor"),
        carId: watch("carId"),
        staffNameAtReturn: watch("staffNameAtReturn"),
        customerNameAtReturn: watch("customerNameAtReturn"),
        customerPhoneAtReturn: watch("customerPhoneAtReturn"),
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
      <Grid container spacing={2}>
        {/* ردیف اول - مشتری، پلاک، رنگ و تاریخ پذیرش */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
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
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <EnhancedSelect
            helperText={errors.carId?.message as string}
            onInputChange={(value) => {
              console.log("Vehicle search input:", value);
            }}
            placeholder="جستجوی پلاک"
            loading={isPendingCustomerCars}
            options={customerVehicles}
            error={!!errors.carId}
            storeValueOnly={true}
            control={control}
            searchable={true}
            label="پلاک"
            name="carId"
            size="small"
            isRtl
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
                height: "45px",
              }}
            />
          </Box>
        </Grid>

        {/* ردیف دوم - فیلدهای کوچک */}
        <Grid size={{ xs: 6, md: 6, lg: 1 }}>
          <EnhancedInput
            helperText={errors.customerEstimatedTime?.message as string}
            error={!!errors.customerEstimatedTime}
            label="زمان تخمینی"
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
            name="carKilometers"
            label="کیلومتر"
            iconPosition="end"
            control={control}
            type="number"
            isRtl={true}
            size="small"
          />
        </Grid>

        {/* ردیف سوم - اطلاعات تحویل دهنده */}
        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <EnhancedInput
            helperText={errors.driverNameAtDelivery?.message as string}
            error={!!errors.driverNameAtDelivery}
            enableSpeechToText={true}
            label="نام تحویل دهنده"
            name="driverNameAtDelivery"
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
            label="تلفن تحویل دهنده"
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
            enableSpeechToText={true}
            label="نام پذیرش کننده"
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
            label="ترخیص کننده"
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
            label="نام تحویل گیرنده"
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
            label="تلفن تحویل گیرنده"
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
            iconPosition="end"
            control={control}
            label="توضیحات"
            isRtl={true}
            type="text"
            isTextArea
            rows={3}
            size="small"
          />
        </Grid>
        <Grid
          size={{ xs: 12, md: 12 }}
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
