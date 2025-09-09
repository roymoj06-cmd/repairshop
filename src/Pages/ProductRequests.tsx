import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import gregorian_en from "react-date-object/locales/gregorian_en";
import DatePicker, { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import persian_fa from "react-date-object/locales/persian_fa";
import persian from "react-date-object/calendars/persian";
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  DirectionsCar,
  ExpandMore,
  Inventory,
  Schedule,
  Close,
} from "@mui/icons-material";
import {
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  useMediaQuery,
  DialogContent,
  DialogActions,
  Grid2 as Grid,
  DialogTitle,
  Typography,
  IconButton,
  Accordion,
  useTheme,
  Divider,
  Dialog,
  Paper,
  Chip,
} from "@mui/material";
import {
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
  Box,
} from "@mui/material";

import {
  updateRepairProductFractionalPurchased,
  getRepairProductFractionalsByPlate,
} from "@/service/repairProductFractional/repairProductFractional.service";
import {
  convertGeorginaToJalaliOnlyDayByNumber,
  parsePlateNumber,
} from "@/utils";
import {
  CreateProductRequestModal,
  PlateNumberDisplay,
  EnhancedSelect,
  Checkbox,
  Loading,
  Button,
} from "@/components";
import { useForm } from "react-hook-form";

const ProductRequests: React.FC = () => {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const { control, setValue } = useForm<any>({
    defaultValues: {
      deliveryTime: "",
    },
  });
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState<number[]>([]);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [isTomorrow, setIsTomorrow] = useState(false);
  const [isDayAfterTomorrow, setIsDayAfterTomorrow] = useState(false);
  const [customDate, setCustomDate] = useState<DateObject | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<number | null>(null);
  const { data: fractionalData, isLoading } = useQuery({
    queryKey: ["productFractionals"],
    queryFn: getRepairProductFractionalsByPlate,
  });
  const handleCreateRequestSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["productFractionals"] });
  };
  const deliveryTimeOptions = [
    { label: "انتخاب زمان ارسال", value: 0 },
    { label: "1 ساعته", value: 1 },
    { label: "2 ساعته", value: 2 },
    { label: "3 ساعته", value: 3 },
    { label: "4 ساعته", value: 4 },
    { label: "5 ساعته", value: 5 },
  ];
  const { mutateAsync: updateDelivery, isPending: isUpdatingDelivery } =
    useMutation({
      mutationFn: updateRepairProductFractionalPurchased,
      onSuccess: (data: any) => {
        if (data?.isSuccess) {
          toast.success("زمان ارسال با موفقیت ثبت شد");
          queryClient.invalidateQueries({ queryKey: ["productFractionals"] });
          handleCloseDeliveryModal();
        } else {
          toast.error(data?.message || "خطا در ثبت زمان ارسال");
        }
      },
      onError: () => {
        toast.error("خطا در ثبت زمان ارسال");
      },
    });
  const handleProductSelection = (
    productId: number,
    checked: boolean,
    isDelivering?: boolean
  ) => {
    if (isDelivering) return;

    if (checked) {
      setSelectedRequestIds((prev) => [...prev, productId]);
    } else {
      setSelectedRequestIds((prev) => prev.filter((id) => id !== productId));
    }
  };
  const handleSelectAllForCar = (carData: any, checked: boolean) => {
    const selectableProductIds = carData.products
      .filter((product: any) => !product.isDelivering)
      .map((product: any) => product.id);

    if (checked) {
      setSelectedRequestIds((prev) => [
        ...new Set([...prev, ...selectableProductIds]),
      ]);
    } else {
      setSelectedRequestIds((prev) =>
        prev.filter((id) => !selectableProductIds.includes(id))
      );
    }
  };
  const isAllSelectedForCar = (carData: any) => {
    const selectableProductIds = carData.products
      .filter((product: any) => !product.isDelivering)
      .map((product: any) => product.id);
    return (
      selectableProductIds.length > 0 &&
      selectableProductIds.every((id: number) =>
        selectedRequestIds.includes(id)
      )
    );
  };
  const isSomeSelectedForCar = (carData: any) => {
    const selectableProductIds = carData.products
      .filter((product: any) => !product.isDelivering)
      .map((product: any) => product.id);
    return (
      selectableProductIds.some((id: number) =>
        selectedRequestIds.includes(id)
      ) && !isAllSelectedForCar(carData)
    );
  };
  const handleOpenDeliveryModal = () => {
    if (selectedRequestIds.length === 0) {
      toast.error("لطفا ابتدا حداقل یک کالا انتخاب کنید");
      return;
    }
    setShowDeliveryModal(true);
  };
  const handleCloseDeliveryModal = () => {
    setShowDeliveryModal(false);
    setSelectedRequestIds([]);
    setDeliveryTime(null);
    setIsTomorrow(false);
    setIsDayAfterTomorrow(false);
    setCustomDate(null);
    setValue("deliveryTime", "");
  };
  const handleTomorrowDelivery = () => {
    setIsTomorrow(true);
    setDeliveryTime(null);
    setIsDayAfterTomorrow(false);
    setCustomDate(null);
    setValue("deliveryTime", 0);
  };
  const handleDayAfterTomorrowDelivery = () => {
    setIsDayAfterTomorrow(true);
    setDeliveryTime(null);
    setIsTomorrow(false);
    setCustomDate(null);
    setValue("deliveryTime", 0);
  };
  const handleDatePickerChange = (date: DateObject) => {
    setCustomDate(date);
    setDeliveryTime(null);
    setIsTomorrow(false);
    setIsDayAfterTomorrow(false);
    setValue("deliveryTime", 0);
  };
  const handleDeliveryTimeChange = (option: any) => {
    setDeliveryTime(option || null);
    if (option) {
      setIsTomorrow(false);
      setIsDayAfterTomorrow(false);
      setCustomDate(null);
    }
  };
  const handleSubmitDelivery = async () => {
    if (!deliveryTime && !isTomorrow && !isDayAfterTomorrow && !customDate) {
      toast.error("لطفا یکی از گزینه‌های ارسال را انتخاب کنید");
      return;
    }

    try {
      let deliveryDay = "";

      if (isTomorrow) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDateObject = new DateObject({
          calendar: persian,
          date: tomorrow,
        });
        deliveryDay = tomorrowDateObject
          .convert(gregorian, gregorian_en)
          .format("YYYY-MM-DD")
          .toString();
      } else if (isDayAfterTomorrow) {
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        const dayAfterTomorrowDateObject = new DateObject({
          calendar: persian,
          date: dayAfterTomorrow,
        });
        deliveryDay = dayAfterTomorrowDateObject
          .convert(gregorian, gregorian_en)
          .format("YYYY-MM-DD")
          .toString();
      } else if (customDate) {
        deliveryDay = customDate
          .convert(gregorian, gregorian_en)
          .format("YYYY-MM-DD")
          .toString();
      }

      const requestData: IUpdateRepairProductFractionalPurchased = {
        deliveryTime: deliveryTime || undefined,
        requestedIds: selectedRequestIds,
        deliveryDay: deliveryDay,
      };

      await updateDelivery(requestData);
    } catch (error) {
      console.error("Error updating delivery:", error);
    }
  };
  const formatDeliveryInfo = (product: any) => {
    if (!product.isDelivering) return "-";

    if (product.deliveryTime) {
      return `امروز - ${product.deliveryTime} ساعت`;
    }

    if (product.deliveryDay) {
      const deliveryDate = product.deliveryDay;
      return deliveryDate || product.deliveryDay;
    }

    return "در حال ارسال";
  };
  const renderProductRow = (product: any, index: number) => {
    return (
      <TableRow
        key={product.id}
        sx={{ bgcolor: product.isDelivering ? "warning.50" : "grey.50" }}
      >
        <TableCell sx={{ pl: 2 }}>
          <Checkbox
            checked={selectedRequestIds.includes(product.id)}
            onChange={(e) =>
              handleProductSelection(
                product.id,
                e.target.checked,
                product.isDelivering
              )
            }
            disabled={product.isDelivering}
            color="primary"
          />
        </TableCell>
        <TableCell sx={{ pl: 2 }}>{index + 1}</TableCell>
        <TableCell>{product.productCode}</TableCell>
        <TableCell sx={{ maxWidth: "200px" }}>{product.productName}</TableCell>
        <TableCell>
          <Chip
            label={product.quantity}
            color="primary"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        </TableCell>
        <TableCell>{product.requestedByUserName || "-"}</TableCell>
        <TableCell>
          {convertGeorginaToJalaliOnlyDayByNumber(product.createDm) || "-"}
        </TableCell>
        <TableCell>
          <Chip
            label={formatDeliveryInfo(product)}
            color={product.isDelivering ? "warning" : "default"}
            size="small"
            variant={product.isDelivering ? "filled" : "outlined"}
          />
        </TableCell>
      </TableRow>
    );
  };
  const renderCarAccordion = (carData: IGetRepairProductFractionalsByPlate) => {
    const plateData = parsePlateNumber(carData.products[0]?.plateNumber);

    return (
      <Accordion
        key={carData.carId}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "grey.300",
          "&:before": { display: "none" },
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            bgcolor: "primary.50",
            "&:hover": { bgcolor: "primary.100" },
            minHeight: 72,
            "& .MuiAccordionSummary-content": {
              alignItems: "center",
              py: 1,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <DirectionsCar color="primary" fontSize="large" />

            <Box sx={{ flex: 1 }}>
              {plateData ? (
                <Box sx={{ width: "150px" }}>
                  <PlateNumberDisplay
                    plateSection1={plateData.plateSection1}
                    plateSection2={plateData.plateSection2}
                    plateSection3={plateData.plateSection3}
                    plateSection4={plateData.plateSection4}
                  />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  پلاک: {carData.products[0]?.plateNumber}
                </Typography>
              )}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mt: 3 }}
              >
                <Chip
                  icon={<Inventory />}
                  label={`${carData.productCount} قلم کالا`}
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
              </Box>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell sx={{ fontWeight: "bold", pl: 2 }}>
                    <Checkbox
                      checked={isAllSelectedForCar(carData)}
                      indeterminate={isSomeSelectedForCar(carData)}
                      onChange={(e) =>
                        handleSelectAllForCar(carData, e.target.checked)
                      }
                      color="primary"
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", pl: 2 }}>ردیف</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>کد محصول</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>نام محصول</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>تعداد</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    درخواست کننده
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>تاریخ ایجاد</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    ساعت/روز ارسال
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {carData.products.map(
                  (
                    product: IGetRepairProductFractionalsByPlateProducts,
                    productIndex: number
                  ) => renderProductRow(product, productIndex)
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    );
  };
  const renderMobileCarCard = (
    carData: IGetRepairProductFractionalsByPlate
  ) => {
    const plateData = parsePlateNumber(carData.products[0]?.plateNumber);

    return (
      <Accordion
        key={carData.carId}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "grey.300",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            bgcolor: "primary.50",
            "&:hover": { bgcolor: "primary.100" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <DirectionsCar color="primary" />
            <Box sx={{ flex: 1 }}>
              {plateData && (
                <Box sx={{ width: "150px" }}>
                  <PlateNumberDisplay
                    plateSection1={plateData.plateSection1}
                    plateSection2={plateData.plateSection2}
                    plateSection3={plateData.plateSection3}
                    plateSection4={plateData.plateSection4}
                  />
                </Box>
              )}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}
              >
                <Chip
                  icon={<Inventory />}
                  label={`${carData.productCount} قلم`}
                  color="secondary"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 2 }}>
          {/* Select All for Mobile */}
          <Box sx={{ mb: 2, p: 2, bgcolor: "primary.50", borderRadius: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAllSelectedForCar(carData)}
                  indeterminate={isSomeSelectedForCar(carData)}
                  onChange={(e) =>
                    handleSelectAllForCar(carData, e.target.checked)
                  }
                  color="primary"
                />
              }
              label="انتخاب همه کالاهای قابل انتخاب"
            />
          </Box>

          {carData.products.map(
            (
              product: IGetRepairProductFractionalsByPlateProducts,
              productIndex: number
            ) => (
              <Box
                key={product.id}
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: product.isDelivering ? "warning.50" : "grey.50",
                  borderRadius: 1,
                  border: product.isDelivering ? "1px solid" : "none",
                  borderColor: product.isDelivering
                    ? "warning.300"
                    : "transparent",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Checkbox
                    checked={selectedRequestIds.includes(product.id)}
                    onChange={(e) =>
                      handleProductSelection(
                        product.id,
                        e.target.checked,
                        product.isDelivering
                      )
                    }
                    disabled={product.isDelivering}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", flex: 1 }}
                  >
                    {product.productName}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  کد: {product.productCode}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">تعداد:</Typography>
                  <Chip label={product.quantity} color="primary" size="small" />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">درخواست کننده:</Typography>
                  <Typography variant="body2">
                    {product.requestedByUserName || "-"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">تاریخ:</Typography>
                  <Typography variant="body2">
                    {convertGeorginaToJalaliOnlyDayByNumber(product.createDm) ||
                      "-"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">ساعت/روز ارسال:</Typography>
                  <Chip
                    label={formatDeliveryInfo(product)}
                    color={product.isDelivering ? "warning" : "default"}
                    size="small"
                    variant={product.isDelivering ? "filled" : "outlined"}
                  />
                </Box>
                {productIndex < carData.products.length - 1 && (
                  <Divider sx={{ mt: 2 }} />
                )}
              </Box>
            )
          )}
        </AccordionDetails>
      </Accordion>
    );
  };
  if (isLoading) {
    return <Loading />;
  }
  const carsData = fractionalData?.data || [];

  return (
    <>
      <Box className="product-requests-container mt-5">
        <Box className="mb-4">
          <Grid container spacing={2} alignItems="center">
            {/* Buttons Section */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                  width: "100%",
                }}
              >
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    minWidth: { sm: "auto" },
                  }}
                >
                  ایجاد درخواست کسری قطعه
                </Button>

                <Button
                  disabled={selectedRequestIds.length === 0}
                  onClick={handleOpenDeliveryModal}
                  startIcon={<Schedule />}
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    minWidth: { sm: "auto" },
                  }}
                >
                  تنظیم زمان ارسال ({selectedRequestIds.length})
                </Button>
              </Box>
            </Grid>

            {/* Cars Counter Section */}
            {carsData.length > 0 && (
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    justifyContent: { xs: "flex-start", md: "flex-end" },
                    alignItems: "center",
                    mt: { xs: 1, md: 0 },
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    تعداد خودروها:
                  </Typography>
                  <Chip
                    label={carsData.length}
                    color="info"
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>

        {carsData.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <DirectionsCar sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              هیچ درخواست کسری قطعه‌ای یافت نشد
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              برای ایجاد درخواست جدید از دکمه بالا استفاده کنید
            </Typography>
          </Paper>
        ) : (
          <Box>
            {isMobile ? (
              <Box>
                {carsData.map((carData: IGetRepairProductFractionalsByPlate) =>
                  renderMobileCarCard(carData)
                )}
              </Box>
            ) : (
              <Box>
                {carsData.map((carData: IGetRepairProductFractionalsByPlate) =>
                  renderCarAccordion(carData)
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
      <CreateProductRequestModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateRequestSuccess}
      />

      {/* Delivery Time Setting Modal */}
      <Dialog
        open={showDeliveryModal}
        onClose={handleCloseDeliveryModal}
        maxWidth="md"
        fullWidth
      >
        {isUpdatingDelivery && <Loading />}
        <DialogTitle
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            display: "flex",
          }}
        >
          <Typography variant="h6">تنظیم زمان ارسال</Typography>
          <IconButton onClick={handleCloseDeliveryModal}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Selected Items Count */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "primary.50",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "primary.200",
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  تعداد کالاهای انتخاب شده: {selectedRequestIds.length} قلم
                </Typography>
              </Box>
            </Grid>

            {/* Delivery Time and Date Selection - Single Row Layout */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, fontWeight: "bold" }}
              >
                تنظیم زمان و روز ارسال:
              </Typography>
            </Grid>

            <div className="flex justify-center items-end gap-2 w-full">
              {/* Time Selection */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <EnhancedSelect
                  options={deliveryTimeOptions}
                  label="ارسال امروز(ساعت)"
                  name="deliveryTime"
                  control={control}
                  value={
                    deliveryTime
                      ? { label: `${deliveryTime} ساعته`, value: deliveryTime }
                      : null
                  }
                  onChange={handleDeliveryTimeChange}
                  searchable={false}
                  size="small"
                  isRtl
                />
              </Grid>

              {/* Tomorrow Button */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Button
                    variant={isTomorrow ? "contained" : "outlined"}
                    onClick={handleTomorrowDelivery}
                    size="small"
                    fullWidth
                    sx={{ flex: 1, minHeight: "40px" }}
                  >
                    فردا
                  </Button>
                </Box>
              </Grid>

              {/* Day After Tomorrow Button */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Button
                    variant={isDayAfterTomorrow ? "contained" : "outlined"}
                    onClick={handleDayAfterTomorrowDelivery}
                    sx={{ flex: 1, minHeight: "40px" }}
                    size="small"
                    fullWidth
                  >
                    پس‌فردا
                  </Button>
                </Box>
              </Grid>

              {/* Custom Date Picker */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <DatePicker
                    className="custom-datepicker"
                    containerClassName="w-full custom-datepicker-container"
                    value={customDate}
                    onChange={handleDatePickerChange}
                    placeholder="انتخاب تاریخ ارسال"
                    calendarPosition="bottom"
                    onOpenPickNewDate={false}
                    format="YYYY/MM/DD"
                    locale={persian_fa}
                    calendar={persian}
                    portal={true}
                    zIndex={2001}
                    style={{
                      width: "100%",
                      height: "40px",
                    }}
                  />
                </Box>
              </Grid>
            </div>

            {/* Summary */}
            {(deliveryTime ||
              isTomorrow ||
              isDayAfterTomorrow ||
              customDate) && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "success.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "success.200",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    خلاصه تنظیمات:
                  </Typography>
                  {deliveryTime && (
                    <Typography variant="body2">
                      • ارسال امروز در مدت {deliveryTime} ساعت
                    </Typography>
                  )}
                  {isTomorrow && (
                    <Typography variant="body2">• ارسال فردا</Typography>
                  )}
                  {isDayAfterTomorrow && (
                    <Typography variant="body2">• ارسال پس‌فردا</Typography>
                  )}
                  {customDate && (
                    <Typography variant="body2">
                      • روز ارسال: {customDate.format("YYYY/MM/DD")}
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeliveryModal} variant="outlined">
            انصراف
          </Button>
          <Button
            onClick={handleSubmitDelivery}
            variant="contained"
            color="primary"
            disabled={
              (!deliveryTime &&
                !isTomorrow &&
                !isDayAfterTomorrow &&
                !customDate) ||
              isUpdatingDelivery
            }
          >
            ثبت تنظیمات
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductRequests;
