import { Add } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import { FC, useState } from "react";
import { toast } from "react-toastify";
import { Grid2 as Grid, Typography, Paper, Box } from "@mui/material";

import { getCustomers } from "@/service/customer/customer.service";
import {
  getCustomerCars,
  deleteAddressRepair,
} from "@/service/cars/cars.service";
import {
  PlateManagementDialog,
  EnhancedSelect,
  Button,
  Loading,
  CarCard,
} from "@/components";

const CarsManagement: FC = () => {
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    number | undefined
  >();
  const [customerCars, setCustomerCars] = useState<any[]>([]);
  const [showPlateDialog, setShowPlateDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editCarData, setEditCarData] = useState<any>(undefined);
  const { mutateAsync: searchCustomers, isPending: isSearchingCustomers } =
    useMutation({
      mutationFn: getCustomers,
      onSuccess: (data) => {
        const options = data?.data?.map((i: any) => ({
          label: i?.fullName,
          value: i.customerId,
          id: `customer-${i.customerId}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
        }));
        setCustomerOptions(options || []);
      },
    });
  const { mutateAsync: fetchCustomerCars, isPending: isLoadingCars } =
    useMutation({
      mutationFn: getCustomerCars,
      onSuccess: (data: any) => {
        if (data?.isSuccess) {
          setCustomerCars(data?.data || []);
        } else {
          toast?.error(data?.message);
        }
      },
    });
  const { mutateAsync: removeCar, isPending: isDeletingCar } = useMutation({
    mutationFn: deleteAddressRepair,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast.success("پلاک با موفقیت حذف شد");
        if (selectedCustomerId) {
          fetchCustomerCars(selectedCustomerId);
        }
      } else {
        toast?.error(data?.message || "خطا در حذف پلاک");
      }
    },
  });
  const handleCustomerSearch = (searchText: string) => {
    if (searchText && searchText.length >= 2) {
      searchCustomers(searchText);
    }
  };
  const handleCustomerSelect = (option: any) => {
    if (option?.value) {
      setSelectedCustomerId(option.value);
      fetchCustomerCars(option.value);
    }
  };
  const handleAddNewPlate = () => {
    setDialogMode("add");
    setEditCarData(undefined);
    setShowPlateDialog(true);
  };
  const handleEditPlate = (car: any) => {
    setDialogMode("edit");
    setEditCarData({
      id: car.id,
      plateSection1: car.plateSection1,
      plateSection2: car.plateSection2,
      plateSection3: car.plateSection3,
      plateSection4: car.plateSection4,
      carCompany: car.carCompany,
      carTipId: car.carTipId,
    });
    setShowPlateDialog(true);
  };
  const handleClosePlateDialog = () => {
    setShowPlateDialog(false);
    setEditCarData(undefined);
  };
  const handlePlateSuccess = () => {
    if (selectedCustomerId) {
      fetchCustomerCars(selectedCustomerId);
    }
  };
  const handleDeletePlate = (id: number) => {
    if (window.confirm("آیا از حذف این پلاک اطمینان دارید؟")) {
      removeCar(id);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {(isDeletingCar || isLoadingCars) && <Loading />}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <EnhancedSelect
              onChange={handleCustomerSelect}
              loading={isSearchingCustomers}
              onInputChange={(value) => {
                handleCustomerSearch(value);
              }}
              options={customerOptions}
              enableSpeechToText={true}
              iconPosition="end"
              searchable={true}
              disabled={false}
              name="customer"
              label="مشتری"
              isRtl={true}
            />
          </Grid>
        </Grid>
      </Paper>
      {selectedCustomerId && customerCars.length === 0 && !isLoadingCars && (
        <Typography variant="body1" sx={{ my: 4, textAlign: "center" }}>
          هیچ خودرویی برای این مشتری ثبت نشده است
        </Typography>
      )}
      <Button
        containerClassName="mb-3 md:mb-3 lg:mb-0"
        disabled={!selectedCustomerId}
        sx={{ mb: { xs: 0, md: 2 } }}
        onClick={handleAddNewPlate}
        label="افزودن پلاک جدید"
        startIcon={<Add />}
        variant="contained"
        color="secondary"
      />
      <Grid container spacing={3}>
        {customerCars.map((car) => (
          <CarCard
            onDelete={handleDeletePlate}
            onEdit={handleEditPlate}
            key={car.id}
            car={car}
          />
        ))}
      </Grid>
      <PlateManagementDialog
        onClose={handleClosePlateDialog}
        customerId={selectedCustomerId}
        onSuccess={handlePlateSuccess}
        open={showPlateDialog}
        editData={editCarData}
        mode={dialogMode}
      />
    </Box>
  );
};

export default CarsManagement;
