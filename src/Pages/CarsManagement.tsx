import { FC, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Grid2 as Grid,
  Paper,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

import { getCustomers } from "@/service/customer/customer.service";
import {
  getCustomerCars,
  createCar,
  updateCar,
  deleteAddressRepair,
} from "@/service/cars/cars.service";
import {
  PlateNumberDisplay,
  EnhancedSelect,
  Button,
  Loading,
} from "@/components";
import { carCompany, carTipTypes } from "@/utils/statics";

const CarsManagement: FC = () => {
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    number | undefined
  >();
  const [customerCars, setCustomerCars] = useState<any[]>([]);
  const [showPlateDialog, setShowPlateDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editCarId, setEditCarId] = useState<number | undefined>();
  const [plateData, setPlateData] = useState<plateSection>({});

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
  const { mutateAsync: addNewCar, isPending: isAddingCar } = useMutation({
    mutationFn: createCar,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast.success(data?.message);
        handleClosePlateDialog();
        if (selectedCustomerId) {
          fetchCustomerCars(selectedCustomerId);
        }
      } else {
        toast?.error(data?.message);
      }
    },
  });
  const { mutateAsync: editCar, isPending: isEditingCar } = useMutation({
    mutationFn: updateCar,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast.success(data?.message);
        handleClosePlateDialog();
        if (selectedCustomerId) {
          fetchCustomerCars(selectedCustomerId);
        }
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
    setPlateData({});
    setShowPlateDialog(true);
  };

  const handleEditPlate = (car: any) => {
    setDialogMode("edit");
    setEditCarId(car.id);
    setPlateData({
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
    setPlateData({});
    setEditCarId(undefined);
  };

  const handleSavePlate = () => {
    if (!selectedCustomerId) {
      toast.error("لطفا ابتدا مشتری را انتخاب کنید");
      return;
    }

    if (
      !plateData.plateSection1 ||
      !plateData.plateSection2 ||
      !plateData.plateSection3 ||
      !plateData.plateSection4 ||
      !plateData.carCompany ||
      !plateData.carTipId
    ) {
      toast.error("لطفا تمامی اطلاعات را وارد کنید");
      return;
    }

    const carData = {
      plateSection1: plateData.plateSection1,
      plateSection2: plateData.plateSection2,
      plateSection3: plateData.plateSection3,
      plateSection4: plateData.plateSection4,
      customerId: selectedCustomerId,
      carCompany: plateData.carCompany,
      carTipId: plateData.carTipId,
      carType: "کامیونت", // Default car type, can be modified if needed
    };

    if (dialogMode === "add") {
      addNewCar(carData);
    } else if (dialogMode === "edit" && editCarId) {
      editCar({ ...carData, id: editCarId });
    }
  };

  const handleDeletePlate = (id: number) => {
    if (window.confirm("آیا از حذف این پلاک اطمینان دارید؟")) {
      removeCar(id);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {isDeletingCar && <Loading />}
      <Typography variant="h5" gutterBottom>
        مدیریت خودروها
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
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

      {isLoadingCars && <Loading />}

      {selectedCustomerId && customerCars.length === 0 && !isLoadingCars && (
        <Typography variant="body1" sx={{ my: 4, textAlign: "center" }}>
          هیچ خودرویی برای این مشتری ثبت نشده است
        </Typography>
      )}

      <Grid container spacing={3}>
        {customerCars.map((car) => (
          <Grid key={car.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                minHeight: "180px",
              }}
            >
              <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleEditPlate(car)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDeletePlate(car.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                {car.carCompany} - {car.carType}
              </Typography>

              <Box sx={{ width: "100%", my: 2 }}>
                <PlateNumberDisplay
                  plateSection1={car.plateSection1}
                  plateSection2={car.plateSection2}
                  plateSection3={car.plateSection3}
                  plateSection4={car.plateSection4}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Button
        disabled={!selectedCustomerId}
        sx={{ mt: { xs: 0, md: 2 } }}
        onClick={handleAddNewPlate}
        startIcon={<AddIcon />}
        variant="contained"
        color="secondary"
      >
        افزودن پلاک جدید
      </Button>

      <Dialog
        open={showPlateDialog}
        onClose={handleClosePlateDialog}
        maxWidth="sm"
        fullWidth
      >
        {(isAddingCar || isEditingCar) && <Loading />}
        <DialogTitle>
          {dialogMode === "add" ? "ثبت پلاک جدید" : "ویرایش پلاک"}
        </DialogTitle>
        <DialogContent sx={{ pt: "10px !important" }}>
          <Box sx={{ py: 2 }}>
            <EnhancedSelect
              placeholder="شرکت خودرو سازی را انتخاب کنید"
              value={plateData.carCompany}
              containerClassName="mb-5"
              label="شرکت خودرو سازی"
              storeValueOnly={true}
              options={carCompany}
              searchable={true}
              name="carCompany"
              isRtl
              onChange={(value) => {
                setPlateData((prev) => ({
                  ...prev,
                  carCompany: value.value,
                }));
              }}
            />

            <EnhancedSelect
              placeholder="تیپ خودرو را انتخاب کنید"
              value={plateData.carTipId}
              containerClassName="mb-5"
              options={carTipTypes}
              storeValueOnly={true}
              searchable={true}
              label="تیپ خودرو"
              name="carTipId"
              isRtl
              onChange={(value) => {
                setPlateData((prev) => ({
                  ...prev,
                  carTipId: value.value,
                }));
              }}
            />

            <Grid container justifyContent="center">
              <Grid size={{ xs: 12, sm: 8, md: 6 }}>
                <PlateNumberDisplay setState={setPlateData} state={plateData} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePlateDialog} variant="outlined">
            انصراف
          </Button>
          <Button
            onClick={handleSavePlate}
            variant="contained"
            color="secondary"
            disabled={
              !plateData.plateSection1 ||
              !plateData.plateSection2 ||
              !plateData.plateSection3 ||
              !plateData.plateSection4 ||
              !plateData.carCompany ||
              !plateData.carTipId
            }
          >
            {dialogMode === "add" ? "ثبت پلاک" : "ویرایش پلاک"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarsManagement;
