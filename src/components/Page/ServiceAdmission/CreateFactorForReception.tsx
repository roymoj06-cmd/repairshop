import { useMutation, useQuery } from "@tanstack/react-query";
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
  Checkbox,
  useTheme,
  Dialog,
  Button,
  Paper,
  Table,
  Card,
  Chip,
  Box,
} from "@mui/material";
import { Close as CloseIcon, Star as StarIcon } from "@mui/icons-material";

import { uploadFile } from "@/service/fileInfos/fileInfos.service";
import { Loading, EmptyList } from "@/components";
import { addCommas, fixNumbers } from "@/utils";
import {
  generateRepairReceptionFactors,
  salesViewByCustomerAndByCarId,
  createRepairFactorRequest,
} from "@/service/repair/repair.service";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";

interface CreateFactorForReceptionProps {
  repairReceptionId: number;
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

const CreateFactorForReception: React.FC<CreateFactorForReceptionProps> = ({
  repairReceptionId,
  customerId,
  onSuccess,
  onClose,
  details,
  carId,
  open,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [products, setProducts] = useState<IGetReceptionForShowToSales[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    { id: number; title: string }[]
  >([]);
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: [
      "salesViewByCustomerAndByCarId",
      customerId,
      carId,
      repairReceptionId,
    ],
    queryFn: () =>
      salesViewByCustomerAndByCarId({
        customerId,
        carId,
        id: repairReceptionId,
      }),
    enabled: open && !!customerId && !!carId && !!repairReceptionId,
  });
  const uploadFileMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        setUploadedFiles((prevFiles) => {
          const newFile = {
            id: data.data.id,
            title: data.data.fileName,
          };
          return [...prevFiles, newFile];
        });
      } else {
        toast.error(data?.message);
      }
    },
    onError: (_: any) => {
      toast.error("خطا در بارگذاری فایل");
    },
  });
  const generateFactorsMutation = useMutation({
    mutationFn: generateRepairReceptionFactors,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast.success(data?.message);
        onSuccess?.();
        onClose();
      } else {
        toast.error(data?.message);
      }
    },
    onError: (_: any) => {
      toast.error("خطا در ایجاد فاکتور");
    },
  });
  const createFactorRequestMutation = useMutation({
    mutationFn: createRepairFactorRequest,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast.success(data?.message);
        onSuccess?.();
        onClose();
      } else {
        toast.error(data?.message);
      }
    },
    onError: (_: any) => {
      toast.error("خطا در ارسال درخواست فاکتور");
    },
  });
  const handleChangeProductName = (productId: number, value: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.productId === productId
          ? { ...product, productName: value }
          : product
      )
    );
  };
  const handleChangeProductPrice = (productId: number, newValue: string) => {
    const value = fixNumbers(newValue);
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.productId === productId
          ? { ...product, overridePrice: value }
          : product
      )
    );
  };
  const handleSelectedProduct = (productId: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.productId === productId
          ? {
              ...product,
              isSelectedForFactorLocal: !product.isSelectedForFactorLocal,
              isSelectedForFactor: !product.isSelectedForFactorLocal,
            }
          : product
      )
    );
  };
  const handleSubmit = () => {
    const selectedProducts = products.filter(
      (product) => product.isSelectedForFactorLocal
    );

    if (selectedProducts.length === 0) {
      toast.error("لطفا حداقل یک کالا انتخاب کنید");
      return;
    }

    generateFactorsMutation.mutate({
      repairReception: {
        customerId,
        repairReceptionId,
        files: uploadedFiles,
        selectedDetails: selectedProducts.map((product) => ({
          overridePrice: product.overridePrice || product.priceValue,
          isSelectedForFactorLocal: product.isSelectedForFactorLocal,
          isSelectedForFactor: product.isSelectedForFactor,
          isCustomerOwner: product.isCustomerOwner,
          overrideProductName: product.productName,
          productId: product.productId,
          qty: product.qty,
        })) as any,
      },
    });
  };
  useEffect(() => {
    if (productsData?.isSuccess) {
      setProducts(productsData.data);
    } else if (productsData?.message) {
      toast.error(productsData.message);
    }
  }, [productsData]);
  const isLoading =
    loadingProducts ||
    uploadFileMutation.isPending ||
    generateFactorsMutation.isPending ||
    createFactorRequestMutation.isPending;

  const availableProducts = products.filter(
    (product) => !product.status && !product.isSelectedForRequest
  );
  const selectedProducts = products.filter(
    (product) => product.isSelectedForFactorLocal
  );
  const completedProducts = products.filter(
    (product) => product.status || product.isSelectedForRequest
  );
  const totalAmount = selectedProducts.reduce(
    (total, product) =>
      total + (product.overridePrice || product.priceValue) * product.qty,
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
          {/* Products List */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontSize: 14 }}>
              لیست کالاها برای فاکتور
            </Typography>
            <Card>
              <CardContent sx={{ p: 0 }}>
                {/* Desktop Table View */}
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <TableContainer
                    component={Paper}
                    sx={{ maxHeight: "calc(100vh - 300px)" }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            انتخاب
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            کد کالا
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontSize: 14, width: "35%" }}
                          >
                            نام کالا
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            تعداد
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            برند/کشور
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            خرید
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            فروش
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
                        {/* Available Products */}
                        {availableProducts.map((product) => (
                          <TableRow key={`available-${product.productId}`}>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              <Checkbox
                                checked={product.isSelectedForFactorLocal}
                                onChange={() =>
                                  handleSelectedProduct(product.productId)
                                }
                                color="primary"
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {product.productCode}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              <TextField
                                value={product.productName}
                                onChange={(e) =>
                                  handleChangeProductName(
                                    product.productId,
                                    e.target.value
                                  )
                                }
                                placeholder="نام جدید کالا را وارد کنید"
                                size="small"
                                className="font-14"
                                fullWidth
                                InputProps={{
                                  sx: {
                                    fontSize: "14px",
                                  },
                                  endAdornment: product.isCustomerOwner ===
                                    true && (
                                    <StarIcon
                                      titleAccess="رسید کالا از مشتری"
                                      fontSize="small"
                                      color="warning"
                                      sx={{ color: "#ff9800" }}
                                    />
                                  ),
                                }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {product.qty}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {product.brand}/{product.countryName}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {product.lastPurchasePrice
                                ? addCommas(product.lastPurchasePrice)
                                : 0}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {addCommas(product.priceValue)}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              <TextField
                                value={
                                  product.overridePrice
                                    ? addCommas(
                                        product.overridePrice.toString()
                                      )
                                    : ""
                                }
                                size="small"
                                className="font-14"
                                onChange={(e) => {
                                  const rawValue = e.target.value
                                    .split(",")
                                    .join("");
                                  handleChangeProductPrice(
                                    product.productId,
                                    rawValue
                                  );
                                }}
                                placeholder="قیمت جدید کالا"
                                error={Boolean(
                                  product.overridePrice &&
                                    product.overridePrice <
                                      product.lastPurchasePrice
                                )}
                                helperText={
                                  product.overridePrice &&
                                  product.overridePrice <
                                    product.lastPurchasePrice
                                    ? "قیمت کمتر از خرید"
                                    : ""
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* Completed Products */}
                        {completedProducts.map((product) => (
                          <TableRow
                            key={`completed-${product.productId}`}
                            sx={{
                              backgroundColor: product.status
                                ? "success.light"
                                : "warning.light",
                              "& .MuiTableCell-root": {
                                color: product.status
                                  ? "success.dark"
                                  : "warning.dark",
                                fontSize: 14,
                              },
                            }}
                          >
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              <Chip
                                label={
                                  product.status ? "انتخاب شده" : "در انتظار"
                                }
                                color={product.status ? "success" : "warning"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {product.productCode}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 1,
                                }}
                              >
                                <span>{product.productName}</span>
                                {product.isCustomerOwner === true && (
                                  <StarIcon
                                    titleAccess="رسید کالا از مشتری"
                                    fontSize="small"
                                    color="warning"
                                    sx={{ color: "#ff9800" }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {product.qty}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {product.brand}/{product.countryName}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {addCommas(product.lastPurchasePrice)}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {addCommas(product.priceValue)}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 14 }}>
                              {addCommas(product.overridePrice || 0)}
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
                    {/* Available Products Cards */}
                    {availableProducts.map((product, index) => (
                      <Card
                        key={`mobile-available-${product.productId}`}
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
                                checked={product.isSelectedForFactorLocal}
                                onChange={() =>
                                  handleSelectedProduct(product.productId)
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
                                product.isSelectedForFactorLocal
                                  ? "انتخاب شده"
                                  : "انتخاب نشده"
                              }
                              color={
                                product.isSelectedForFactorLocal
                                  ? "success"
                                  : "default"
                              }
                              size="small"
                            />
                          </Box>

                          {/* Product Name */}
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1, fontSize: 14 }}
                            >
                              نام کالا
                            </Typography>
                            <TextField
                              value={product.productName}
                              onChange={(e) =>
                                handleChangeProductName(
                                  product.productId,
                                  e.target.value
                                )
                              }
                              placeholder="نام جدید کالا را وارد کنید"
                              size="small"
                              fullWidth
                              InputProps={{
                                endAdornment: product.isCustomerOwner ===
                                  true && (
                                  <StarIcon
                                    color="warning"
                                    fontSize="small"
                                    titleAccess="رسید کالا از مشتری"
                                    sx={{ color: "#ff9800" }}
                                  />
                                ),
                              }}
                            />
                          </Box>

                          {/* Product Details Grid */}
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
                                کد کالا
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ fontSize: 14 }}
                              >
                                {product.productCode}
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
                                {product.qty}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                برند/کشور
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ fontSize: 14 }}
                              >
                                {product.brand}/{product.countryName}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                قیمت خرید
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ fontSize: 14 }}
                              >
                                {product.lastPurchasePrice
                                  ? addCommas(product.lastPurchasePrice)
                                  : 0}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                قیمت فروش
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ fontSize: 14 }}
                              >
                                {addCommas(product.priceValue)}
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
                                product.overridePrice
                                  ? addCommas(product.overridePrice.toString())
                                  : ""
                              }
                              onChange={(e) => {
                                const rawValue = e.target.value
                                  .split(",")
                                  .join("");
                                handleChangeProductPrice(
                                  product.productId,
                                  rawValue
                                );
                              }}
                              placeholder="قیمت جدید کالا"
                              size="small"
                              fullWidth
                              error={Boolean(
                                product.overridePrice &&
                                  product.overridePrice <
                                    product.lastPurchasePrice
                              )}
                              helperText={
                                product.overridePrice &&
                                product.overridePrice <
                                  product.lastPurchasePrice
                                  ? "قیمت کمتر از خرید"
                                  : ""
                              }
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Completed Products Cards */}
                    {completedProducts.map((product, index) => (
                      <Card
                        key={`mobile-completed-${product.productId}`}
                        sx={{
                          mb: 2,
                          boxShadow: 2,
                          border: product.status
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
                                product.status ? "انتخاب شده" : "در انتظار"
                              }
                              color={product.status ? "success" : "warning"}
                              size="small"
                            />
                          </Box>

                          {/* Product Name */}
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1, fontSize: 14 }}
                            >
                              نام کالا
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{
                                  color: product.status
                                    ? "success.dark"
                                    : "warning.dark",
                                  fontSize: 14,
                                }}
                              >
                                {product.productName}
                              </Typography>
                              {product.isCustomerOwner === true && (
                                <StarIcon
                                  titleAccess="رسید کالا از مشتری"
                                  fontSize="small"
                                  color="warning"
                                  sx={{ color: "#ff9800" }}
                                />
                              )}
                            </Box>
                          </Box>

                          {/* Product Details Grid */}
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
                                کد کالا
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{
                                  color: product.status
                                    ? "success.dark"
                                    : "warning.dark",
                                  fontSize: 14,
                                }}
                              >
                                {product.productCode}
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
                                  color: product.status
                                    ? "success.dark"
                                    : "warning.dark",
                                  fontSize: 14,
                                }}
                              >
                                {product.qty}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                برند/کشور
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{
                                  color: product.status
                                    ? "success.dark"
                                    : "warning.dark",
                                  fontSize: 14,
                                }}
                              >
                                {product.brand}/{product.countryName}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                قیمت خرید
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{
                                  color: product.status
                                    ? "success.dark"
                                    : "warning.dark",
                                  fontSize: 14,
                                }}
                              >
                                {addCommas(product.lastPurchasePrice)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                قیمت فروش
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{
                                  color: product.status
                                    ? "success.dark"
                                    : "warning.dark",
                                  fontSize: 14,
                                }}
                              >
                                {addCommas(product.priceValue)}
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
                                color: product.status
                                  ? "success.dark"
                                  : "warning.dark",
                                fontSize: 14,
                              }}
                            >
                              {addCommas(product.overridePrice || 0)}
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

          {/* Selected Products */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontSize: 14 }}>
              لیست کالاهای انتخاب شده
            </Typography>
            <Card>
              <CardContent>
                {selectedProducts.length > 0 ? (
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
                                کد کالا
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: 14 }}>
                                نام کالا
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: 14 }}>
                                تعداد
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: 14 }}>
                                برند/کشور
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: 14 }}>
                                قیمت
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedProducts.map((product, index) => (
                              <TableRow key={index}>
                                <TableCell align="center" sx={{ fontSize: 14 }}>
                                  {index + 1}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: 14 }}>
                                  {product.productCode}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: 14 }}>
                                  {product.productName}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: 14 }}>
                                  {product.qty}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: 14 }}>
                                  {product.brand}/{product.countryName}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: 14 }}>
                                  {product.overridePrice
                                    ? addCommas(product.overridePrice)
                                    : addCommas(product.priceValue)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell
                                colSpan={5}
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

                    {/* Mobile Card View for Selected Products */}
                    <Box sx={{ display: { xs: "block", md: "none" } }}>
                      <Box sx={{ maxHeight: 400, overflowY: "auto", p: 1 }}>
                        {selectedProducts.map((product, index) => (
                          <Card
                            key={`mobile-selected-${product.productId}`}
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
                                  {product.productCode}
                                </Typography>
                              </Box>

                              {/* Product Name */}
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
                                  نام کالا
                                </Typography>
                                <Typography
                                  variant="body1"
                                  fontWeight="bold"
                                  sx={{ fontSize: 14 }}
                                >
                                  {product.productName}
                                </Typography>
                              </Box>

                              {/* Product Details Grid */}
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
                                    {product.qty}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: 14 }}
                                  >
                                    برند/کشور
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    sx={{ fontSize: 14 }}
                                  >
                                    {product.brand}/{product.countryName}
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
                                    {product.overridePrice
                                      ? addCommas(product.overridePrice)
                                      : addCommas(product.priceValue)}
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
                      {/* <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSendRequest}
                        disabled={isLoading}
                        fullWidth
                      >
                        ارسال درخواست فاکتور
                      </Button> */}
                    </Box>
                  </>
                ) : (
                  <EmptyList message="هیچ کالایی انتخاب نشده است" />
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFactorForReception;
