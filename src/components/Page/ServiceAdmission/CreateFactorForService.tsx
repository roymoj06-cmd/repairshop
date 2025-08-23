import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Close as CloseIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  TableContainer,
  useMediaQuery,
  DialogContent,
  DialogTitle,
  CardContent,
  Typography,
  IconButton,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  TableRow,
  useTheme,
  Dialog,
  Button,
  Paper,
  Table,
  Card,
  Chip,
  Box,
  Checkbox,
} from "@mui/material";

import { getRepairReceptionServices } from "@/service/repairReceptionService/repairReceptionService.service";
import { saveRepairServiceFactor } from "@/service/repairServiceFactor/repairServiceFactor.service";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";
import { Loading, EmptyList } from "@/components";
import { addCommas, fixNumbers } from "@/utils";

interface CreateFactorForServiceProps {
  repairReceptionId: number | string;
  onClose: () => void;
  customerId: number;
  open: boolean;
  carId: number;
  details: {
    receptionDate: string;
    customerName: string;
    plateNumber: string;
  };
  onSuccess?: () => void;
}

const CreateFactorForService: React.FC<CreateFactorForServiceProps> = ({
  repairReceptionId,
  onSuccess,
  onClose,
  details,
  open,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const queryClient = useQueryClient();
  const [services, setServices] = useState<IGetRepairReceptionService[]>([]);

  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ["getRepairReceptionServices", repairReceptionId],
    queryFn: () => getRepairReceptionServices(+repairReceptionId),
    enabled: open && !!repairReceptionId,
  });
  const generateFactorsMutation = useMutation({
    mutationFn: saveRepairServiceFactor,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast.success(data?.message);
        queryClient.invalidateQueries({
          queryKey: ["getRepairReceptionServices", repairReceptionId],
        });
        onSuccess?.();
      } else {
        toast.error(data?.message);
      }
    },
    onError: (_: any) => {
      toast.error("خطا در ایجاد فاکتور");
    },
  });
  const handleChangeServiceTitle = (serviceId: number, value: string) => {
    setServices((prevServices) =>
      prevServices.map((service) =>
        service.id === serviceId ? { ...service, serviceTitle: value } : service
      )
    );
  };
  const handleChangeServicePrice = (serviceId: number, newValue: string) => {
    const value = fixNumbers(newValue);
    setServices((prevServices) =>
      prevServices.map((service) =>
        service.id === serviceId ? { ...service, servicePrice: value } : service
      )
    );
  };
  const handleSelectedService = (serviceId: number) => {
    setServices((prevServices) =>
      prevServices.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              isSelectedForFactorLocal: !service.isSelectedForFactorLocal,
              isSelectedForFactor: !service.isSelectedForFactorLocal,
            }
          : service
      )
    );
  };
  const handleSubmit = () => {
    const selectedServices = services.filter(
      (service) => service.isSelectedForFactorLocal
    );
    if (selectedServices.length === 0) {
      toast.error("لطفا حداقل یک سرویس انتخاب کنید");
      return;
    }
    generateFactorsMutation.mutate({
      repairReceptionId: +repairReceptionId,
      description: `فاکتور خدمات برای پذیرش ${repairReceptionId}`,
      details: selectedServices.map((service) => ({
        repairReceptionServiceId: service.id,
        overridedServiceTitle: service.serviceTitle,
        overridedUnitPrice: service.servicePrice,
        unitPrice: service.servicePrice,
        quantity: service.serviceCount,
      })),
    });
  };
  useEffect(() => {
    if (servicesData?.isSuccess) {
      const servicesWithDefaults = (servicesData.data.services || []).map(
        (service: any) => ({
          ...service,
          isSelectedForFactorLocal: service.isSelectedForFactorLocal ?? false,
        })
      );
      setServices(servicesWithDefaults);
    } else if (servicesData?.message) {
      toast.error(servicesData.message);
    }
  }, [servicesData]);
  const isLoading = loadingServices || generateFactorsMutation.isPending;
  const availableServices = services.filter((service) => !service.hasFactor);
  const selectedServices = services.filter(
    (service) => service.isSelectedForFactorLocal
  );
  const completedServices = services.filter((service) => service.hasFactor);
  const totalAmount = selectedServices.reduce(
    (total, service) => total + service.servicePrice * service.serviceCount,
    0
  );

  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullScreen
      fullWidth
      PaperProps={{
        sx: { minHeight: isMobile ? "100vh" : "80vh" },
      }}
    >
      {isLoading && <Loading />}

      <DialogTitle
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
          m: 0,
          p: 2,
        }}
      >
        <Typography variant="h6" fontSize={12}>
          ایجاد فاکتور
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Customer Info Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                gap: 2,
              }}
            >
              <Box display="flex" alignItems="center">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1, fontSize: 14 }}
                >
                  مشتری:
                </Typography>
                <Typography variant="body1" fontSize={12}>
                  {details?.customerName}
                </Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent={isMobile ? "flex-start" : "center"}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1, fontSize: 14 }}
                >
                  پلاک:
                </Typography>
                <Typography variant="body1" fontSize={12}>
                  {details?.plateNumber}
                </Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent={isMobile ? "flex-start" : "flex-end"}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1, fontSize: 14 }}
                >
                  تاریخ:
                </Typography>
                <Typography variant="body1" fontSize={12}>
                  {details?.receptionDate}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "4fr 3fr" },
            gap: 3,
          }}
        >
          {/* Services List */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontSize: 14 }}>
              لیست خدمات برای فاکتور
            </Typography>
            <Card>
              <CardContent sx={{ p: 0 }}>
                {/* Desktop Table View */}
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <TableContainer
                    component={Paper}
                    sx={{ maxHeight: "calc(100vh - 300px)" }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{
                            background: (theme) =>
                              theme.palette.mode === "dark"
                                ? "linear-gradient(135deg, #404040 0%, #2a2a2a 100%)"
                                : "linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)",
                          }}
                        >
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            انتخاب
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            ردیف
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontSize: 14, width: "35%" }}
                          >
                            عنوان سرویس
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            تعداد
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            مکانیک
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            قیمت
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontSize: 14, width: "15%" }}
                          >
                            ویرایش قیمت
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Available Services */}
                        {availableServices.map((service, index: number) => (
                          <TableRow key={`available-${service.id}`}>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              <Checkbox
                                checked={
                                  service.isSelectedForFactorLocal ?? false
                                }
                                onChange={() =>
                                  handleSelectedService(service.id)
                                }
                                color="primary"
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {index + 1}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              <TextField
                                value={service.serviceTitle}
                                onChange={(e) =>
                                  handleChangeServiceTitle(
                                    service.id,
                                    e.target.value
                                  )
                                }
                                placeholder="عنوان جدید سرویس را وارد کنید"
                                size="small"
                                className="font-14"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {service.serviceCount}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {service.performedByMechanicName}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {addCommas(service.servicePrice)}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              <TextField
                                value={
                                  service.servicePrice
                                    ? addCommas(service.servicePrice.toString())
                                    : ""
                                }
                                size="small"
                                className="font-14"
                                onChange={(e) => {
                                  const rawValue = e.target.value.replaceAll(
                                    ",",
                                    ""
                                  );
                                  handleChangeServicePrice(
                                    service.id,
                                    rawValue
                                  );
                                }}
                                placeholder="قیمت جدید سرویس"
                              />
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* Completed Services */}
                        {completedServices.map((service) => (
                          <TableRow
                            key={`completed-${service.id}`}
                            sx={{
                              backgroundColor: service.hasFactor
                                ? "success.light"
                                : service.status
                                ? "success.light"
                                : "warning.light",
                              "& .MuiTableCell-root": {
                                color: service.hasFactor
                                  ? "success.dark"
                                  : service.status
                                  ? "success.dark"
                                  : "warning.dark",
                                fontSize: 14,
                              },
                            }}
                          >
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              <Chip
                                label={
                                  service.hasFactor
                                    ? "فاکتور شده"
                                    : service.status
                                    ? "انتخاب شده"
                                    : "در انتظار"
                                }
                                color={
                                  service.hasFactor
                                    ? "success"
                                    : service.status
                                    ? "success"
                                    : "warning"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {service.id}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {service.serviceTitle}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {service.serviceCount}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {service.performedByMechanicName}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {addCommas(service.servicePrice)}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {addCommas(service.servicePrice || 0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Mobile Card View */}
                <Box sx={{ display: { xs: "block", md: "none" } }}>
                  <Box
                    sx={{
                      maxHeight: "calc(100vh - 300px)",
                      overflowY: "auto",
                      p: 2,
                    }}
                  >
                    {/* Available Services Cards */}
                    {availableServices.map((service, index) => (
                      <Card
                        key={`mobile-available-${service.id}`}
                        sx={{ mb: 2, boxShadow: 2, fontSize: 14 }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          {/* Header */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Checkbox
                                checked={
                                  service.isSelectedForFactorLocal ?? false
                                }
                                onChange={() =>
                                  handleSelectedService(service.id)
                                }
                                color="primary"
                              />
                              <Chip
                                label={`#${index + 1}`}
                                size="small"
                                color="secondary"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                            <Chip
                              label={
                                service.isSelectedForFactorLocal
                                  ? "انتخاب شده"
                                  : "انتخاب نشده"
                              }
                              color={
                                service.isSelectedForFactorLocal
                                  ? "success"
                                  : "default"
                              }
                              size="small"
                            />
                          </Box>

                          {/* Service Title */}
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1, fontSize: 14 }}
                            >
                              عنوان سرویس
                            </Typography>
                            <TextField
                              value={service.serviceTitle}
                              onChange={(e) =>
                                handleChangeServiceTitle(
                                  service.id,
                                  e.target.value
                                )
                              }
                              placeholder="عنوان جدید سرویس را وارد کنید"
                              size="small"
                              fullWidth
                            />
                          </Box>

                          {/* Service Details Grid */}
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                ردیف
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ fontSize: 14 }}
                              >
                                {service.id}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                تعداد
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ fontSize: 14 }}
                              >
                                {service.serviceCount}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                مکانیک
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ fontSize: 14 }}
                              >
                                {service.performedByMechanicName}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                قیمت
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ fontSize: 14 }}
                              >
                                {addCommas(service.servicePrice)}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Price Override */}
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1, fontSize: 14 }}
                            >
                              ویرایش قیمت
                            </Typography>
                            <TextField
                              value={
                                service.servicePrice
                                  ? addCommas(service.servicePrice.toString())
                                  : ""
                              }
                              onChange={(e) => {
                                const rawValue = e.target.value.replaceAll(
                                  ",",
                                  ""
                                );
                                handleChangeServicePrice(service.id, rawValue);
                              }}
                              placeholder="قیمت جدید سرویس"
                              size="small"
                              fullWidth
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Completed Services Cards */}
                    {completedServices.map((service, index) => (
                      <Card
                        key={`mobile-completed-${service.id}`}
                        sx={{
                          mb: 2,
                          boxShadow: 2,
                          border: service.hasFactor
                            ? "2px solid #4caf50"
                            : service.status
                            ? "2px solid #4caf50"
                            : "2px solid #ff9800",
                          fontSize: 14,
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          {/* Header */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Chip
                              label={`#${index + 1}`}
                              size="small"
                              color="secondary"
                            />
                            <Chip
                              label={
                                service.hasFactor
                                  ? "فاکتور شده"
                                  : service.status
                                  ? "انتخاب شده"
                                  : "در انتظار"
                              }
                              color={
                                service.hasFactor
                                  ? "success"
                                  : service.status
                                  ? "success"
                                  : "warning"
                              }
                              size="small"
                            />
                          </Box>

                          {/* Service Title */}
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1, fontSize: 14 }}
                            >
                              عنوان سرویس
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              sx={{
                                color: service.hasFactor
                                  ? "success.dark"
                                  : service.status
                                  ? "success.dark"
                                  : "warning.dark",
                                fontSize: 14,
                              }}
                            >
                              {service.serviceTitle}
                            </Typography>
                          </Box>

                          {/* Service Details Grid */}
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                ردیف
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{
                                  color: service.hasFactor
                                    ? "success.dark"
                                    : service.status
                                    ? "success.dark"
                                    : "warning.dark",
                                  fontSize: 14,
                                }}
                              >
                                {service.id}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                تعداد
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{
                                  color: service.hasFactor
                                    ? "success.dark"
                                    : service.status
                                    ? "success.dark"
                                    : "warning.dark",
                                  fontSize: 14,
                                }}
                              >
                                {service.serviceCount}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                مکانیک
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{
                                  color: service.hasFactor
                                    ? "success.dark"
                                    : service.status
                                    ? "success.dark"
                                    : "warning.dark",
                                  fontSize: 14,
                                }}
                              >
                                {service.performedByMechanicName}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                قیمت
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{
                                  color: service.hasFactor
                                    ? "success.dark"
                                    : service.status
                                    ? "success.dark"
                                    : "warning.dark",
                                  fontSize: 14,
                                }}
                              >
                                {addCommas(service.servicePrice)}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Override Price */}
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1, fontSize: 14 }}
                            >
                              قیمت ویرایش شده
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              sx={{
                                color: service.hasFactor
                                  ? "success.dark"
                                  : service.status
                                  ? "success.dark"
                                  : "warning.dark",
                                fontSize: 14,
                              }}
                            >
                              {addCommas(service.servicePrice || 0)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Selected Services */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontSize: 14 }}>
              لیست خدمات انتخاب شده
            </Typography>
            <Card>
              <CardContent>
                {selectedServices.length > 0 ? (
                  <>
                    {/* Desktop Table View */}
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell align="center" sx={{ fontSize: 14 }}>
                                ردیف
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: 14 }}>
                                عنوان سرویس
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: 14 }}>
                                تعداد
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: 14 }}>
                                مکانیک
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: 14 }}>
                                قیمت
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedServices.map((service, index) => (
                              <TableRow key={index}>
                                <TableCell align="center" sx={{ fontSize: 14 }}>
                                  {index + 1}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: 14 }}>
                                  {service.serviceTitle}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: 14 }}>
                                  {service.serviceCount}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: 14 }}>
                                  {service.performedByMechanicName}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: 14 }}>
                                  {addCommas(service.servicePrice)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                align="center"
                                sx={{ fontSize: 14 }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  مجموع:
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: 14 }}>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  {addCommas(totalAmount)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>

                    {/* Mobile Card View for Selected Services */}
                    <Box sx={{ display: { xs: "block", md: "none" } }}>
                      <Box sx={{ maxHeight: 400, overflowY: "auto", p: 1 }}>
                        {selectedServices.map((service, index) => (
                          <Card
                            key={`mobile-selected-${service.id}`}
                            sx={{
                              mb: 2,
                              boxShadow: 2,
                              border: "2px solid #1976d2",
                              borderOpacity: 0.25,
                              fontSize: 14,
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              {/* Header */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mb: 2,
                                }}
                              >
                                <Chip
                                  label={`#${index + 1}`}
                                  size="small"
                                  color="primary"
                                />
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  color="primary"
                                  sx={{ fontSize: 14 }}
                                >
                                  {service.id}
                                </Typography>
                              </Box>

                              {/* Service Title */}
                              <Box
                                sx={{
                                  mb: 2,
                                  pb: 2,
                                  borderBottom: "1px solid #e0e0e0",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1, fontSize: 14 }}
                                >
                                  عنوان سرویس
                                </Typography>
                                <Typography
                                  variant="body1"
                                  fontWeight="bold"
                                  sx={{ fontSize: 14 }}
                                >
                                  {service.serviceTitle}
                                </Typography>
                              </Box>

                              {/* Service Details Grid */}
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: 2,
                                  mb: 2,
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: 14 }}
                                  >
                                    تعداد
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    sx={{ fontSize: 14 }}
                                  >
                                    {service.serviceCount}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: 14 }}
                                  >
                                    مکانیک
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    sx={{ fontSize: 14 }}
                                  >
                                    {service.performedByMechanicName}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: 14 }}
                                  >
                                    قیمت
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    sx={{ fontSize: 14 }}
                                  >
                                    {addCommas(service.servicePrice)}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}

                        {/* Total Amount Card */}
                        <Card
                          sx={{
                            mb: 2,
                            bgcolor: "primary.light",
                            color: "primary.contrastText",
                            fontSize: 14,
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ fontSize: 14 }}
                              >
                                مجموع:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ fontSize: 14 }}
                              >
                                {addCommas(totalAmount)}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <AccessGuard accessId={ACCESS_IDS.CREATE_FACTOR}>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleSubmit}
                          disabled={isLoading}
                          fullWidth
                        >
                          ثبت
                        </Button>
                      </AccessGuard>
                    </Box>
                  </>
                ) : (
                  <EmptyList message="هیچ سرویسی انتخاب نشده است" />
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFactorForService;
