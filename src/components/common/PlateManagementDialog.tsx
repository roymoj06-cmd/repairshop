import { useMutation } from "@tanstack/react-query";
import { FC, useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  DialogActions,
  DialogContent,
  Grid2 as Grid,
  DialogTitle,
  Typography,
  Dialog,
  Box,
} from "@mui/material";

import { createCar, updateCar } from "@/service/cars/cars.service";
import { carCompany, carTipTypes } from "@/utils/statics";
import {
  PlateNumberDisplay,
  EnhancedSelect,
  Loading,
  Button,
} from "@/components";

interface PlateManagementDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  customerId?: number;
  editData?: {
    id: number;
    plateSection1?: string;
    plateSection2?: string;
    plateSection3?: string;
    plateSection4?: string;
    carCompany?: string;
    carTipId?: number;
  };
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

const PlateManagementDialog: FC<PlateManagementDialogProps> = ({
  description,
  customerId,
  onSuccess,
  editData,
  onClose,
  title,
  open,
  mode,
}) => {
  const [plateData, setPlateData] = useState<plateSection>({});
  const { mutateAsync: createCarMutation, isPending: isCreating } = useMutation(
    {
      mutationFn: createCar,
      onSuccess: (data: any) => {
        if (data?.isSuccess) {
          toast.success(data?.message || "پلاک با موفقیت ثبت شد");
          handleClose();
          onSuccess?.();
        } else {
          toast.error(data?.message || "خطا در ثبت پلاک");
        }
      },
      onError: () => {
        toast.error("خطا در ثبت پلاک");
      },
    }
  );
  const { mutateAsync: updateCarMutation, isPending: isUpdating } = useMutation(
    {
      mutationFn: updateCar,
      onSuccess: (data: any) => {
        if (data?.isSuccess) {
          toast.success(data?.message || "پلاک با موفقیت ویرایش شد");
          handleClose();
          onSuccess?.();
        } else {
          toast.error(data?.message || "خطا در ویرایش پلاک");
        }
      },
      onError: () => {
        toast.error("خطا در ویرایش پلاک");
      },
    }
  );
  const handleClose = () => {
    setPlateData({});
    onClose();
  };
  const handleSave = async () => {
    if (!customerId) {
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
      customerId,
      carCompany: plateData.carCompany,
      carTipId: plateData.carTipId,
      carType: "کامیونت", // Default car type, can be modified if needed
    };

    try {
      if (mode === "add") {
        await createCarMutation(carData);
      } else if (mode === "edit" && editData?.id) {
        await updateCarMutation({ ...carData, id: editData.id });
      }
    } catch (error) {
      console.error("Error saving plate:", error);
    }
  };
  useEffect(() => {
    if (open) {
      if (mode === "edit" && editData) {
        setPlateData({
          plateSection1: editData.plateSection1,
          plateSection2: editData.plateSection2,
          plateSection3: editData.plateSection3,
          plateSection4: editData.plateSection4,
          carCompany: editData.carCompany,
          carTipId: editData.carTipId,
        });
      } else {
        setPlateData({});
      }
    }
  }, [open, mode, editData]);
  const isLoading = isCreating || isUpdating;
  const dialogTitle =
    title || (mode === "add" ? "ثبت پلاک جدید" : "ویرایش پلاک");
  const saveButtonText = mode === "add" ? "ثبت پلاک" : "ویرایش پلاک";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {isLoading && <Loading />}
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent sx={{ pt: "10px !important" }}>
        <Box sx={{ py: 2 }}>
          {description && (
            <Typography
              justifyContent="center"
              marginBottom="1rem"
              display="flex"
              variant="h6"
            >
              {description}
            </Typography>
          )}

          <EnhancedSelect
            placeholder="شرکت خودرو سازی را انتخاب کنید"
            value={carCompany?.find(
              (i) => `${i.label}` === plateData.carCompany
            )}
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
                carCompany: value.label,
              }));
            }}
          />

          <EnhancedSelect
            placeholder="تیپ خودرو را انتخاب کنید"
            value={carTipTypes?.find((i) => i.value === plateData.carTipId)}
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
        <Button onClick={handleClose} variant="outlined">
          انصراف
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="secondary"
          disabled={
            !plateData.plateSection1 ||
            !plateData.plateSection2 ||
            !plateData.plateSection3 ||
            !plateData.plateSection4 ||
            !plateData.carCompany ||
            !plateData.carTipId ||
            isLoading
          }
        >
          {saveButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlateManagementDialog;
