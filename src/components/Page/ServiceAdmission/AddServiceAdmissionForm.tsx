import { Box, Grid2 as Grid, Tab, Tabs, Typography } from "@mui/material";
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
            onChange={handleCustomerChange}
            onInputChange={handleCustomerSearch}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <EnhancedSelect
            helperText={errors.carId?.message as string}
            onInputChange={(value) => {
              console.log("Vehicle search input:", value);
            }}
            placeholder="جستجوی پلاک خودرو"
            error={!!errors.carId}
            loading={isPendingCustomerCars}
            options={customerVehicles}
            control={control}
            storeValueOnly={true}
            enableSpeechToText
            searchable={true}
            label="پلاک خودرو"
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
        {/* <Grid size={{ xs: 12, md: 4 }}>
          <EnhancedInput
            helperText={errors.preferredRepairTime?.message as string}
            error={!!errors.preferredRepairTime}
            enableSpeechToText={false}
            name="preferredRepairTime"
            label="زمان ترجیحی تعمیر"
            icon={<span>روز</span>}
            type="datetime-local"
            iconPosition="end"
            isTextArea
            fullWidth
            rows={1}
          />
        </Grid> */}
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
