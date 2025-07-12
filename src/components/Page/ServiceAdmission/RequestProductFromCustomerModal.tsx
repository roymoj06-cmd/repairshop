import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Add, Remove, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import { FC, useState } from "react";
import {
  TableContainer,
  DialogActions,
  DialogContent,
  useMediaQuery,
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
  Button,
  Dialog,
  Table,
  Paper,
  Stack,
  Card,
  Box,
} from "@mui/material";

import { getCustomerProblems } from "@/service/repairServices/repairServices.service";
import { getProductsThatContainsText } from "@/service/Product/Product.service";
import { updateRepairReceptionByProblem } from "@/service/repair/repair.service";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";
import { EnhancedSelect, Loading } from "@/components";

interface IRequestProductFromCustomerModalProps {
  setShowModal: (show: boolean) => void;
  repairReceptionId?: string;
  onRefresh?: () => void;
  showModal: boolean;
}

interface SelectedProduct {
  productName: string;
  productCode: string;
  countryName: string;
  productId: number;
  quantity: number;
  brand: string;
}

const RequestProductFromCustomerModal: FC<
  IRequestProductFromCustomerModalProps
> = ({ repairReceptionId, setShowModal, showModal, onRefresh }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const queryClient = useQueryClient();

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const { data: problems = [] } = useQuery({
    queryKey: ["customerProblems", repairReceptionId],
    queryFn: () =>
      getCustomerProblems({
        repairReceptionId: repairReceptionId || "",
        page: 1,
        size: 100,
      }),
    enabled: !!repairReceptionId,
    select: (data) =>
      data?.data?.values?.map((problem: any) => ({
        value: problem.id,
        label: problem.description,
      })) || [],
  });
  const {
    isPending: isPendingGetProductsThatContainsText,
    mutateAsync: mutateGetProductsThatContainsText,
  } = useMutation({
    mutationFn: getProductsThatContainsText,
    onSuccess: (data: any) => {
      const temp = data?.data?.map((brand: IProductSummery) => ({
        label: `${brand?.productName} - ${brand?.productCode}`,
        value: brand?.productId,
        productCode: brand?.productCode,
        brand: brand?.brand,
        countryName: brand?.country,
        productName: brand?.productName,
      }));
      setProducts([...temp]);
    },
  });
  const {
    isPending: isPendingUpdateRepairReception,
    mutateAsync: mutateUpdateRepairReception,
  } = useMutation({
    mutationFn: updateRepairReceptionByProblem,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast.success(data?.message);
        queryClient.invalidateQueries({
          queryKey: ["repairReceptionId", repairReceptionId],
        });
        queryClient.invalidateQueries({
          queryKey: ["getRepairReceptionForUpdateById", repairReceptionId],
        });
        setShowModal(false);
        setSelectedProducts([]);
        setSelectedProblem(null);
        onRefresh?.();
      } else {
        toast.error(data?.message);
      }
    },
    onError: () => {
      toast.error("خطا در ثبت کالاهای مشتری");
    },
  });
  const handleSearchProduct = (value: any) => {
    if (value.length > 2) {
      mutateGetProductsThatContainsText(value);
    }
  };
  const handleProductSelection = (selectedOptions: SelectOption[]) => {
    const newProducts = selectedOptions.map((option: any) => ({
      productId: Number(option.value),
      productName: option.productName || option.label.split(" - ")[0],
      productCode: option.productCode || option.label.split(" - ")[1] || "",
      brand: option.brand || "",
      countryName: option.countryName || "",
      quantity: 1,
    }));
    setSelectedProducts(newProducts);
  };
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.productId === productId
          ? { ...product, quantity: newQuantity }
          : product
      )
    );
  };
  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.filter((product) => product.productId !== productId)
    );
  };
  const handleSubmit = () => {
    if (!selectedProblem) {
      toast.error("لطفا یک مشکل انتخاب کنید");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("لطفا حداقل یک کالا انتخاب کنید");
      return;
    }
    if (!repairReceptionId) {
      toast.error("شناسه پذیرش تعمیر یافت نشد");
      return;
    }
    const requestData: IUpdateRepairReceptionByProblem = {
      repairReception: {
        repairCustomerProblemId: +selectedProblem?.value,
        details: selectedProducts.map((product) => ({
          productId: +product.productId,
          qty: +product.quantity,
          isCustomerOwner: true,
        })),
      },
    };
    mutateUpdateRepairReception(requestData);
  };
  const handleClose = () => {
    setShowModal(false);
    setSelectedProducts([]);
    setSelectedProblem(null);
  };
  const renderMobileProductCard = (product: SelectedProduct) => (
    <Card key={product.productId} variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", flex: 1 }}>
            {product.productName}
          </Typography>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleRemoveProduct(product.productId)}
            sx={{ ml: 1 }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
        <Stack spacing={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              کد فنی:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {product.productCode}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              برند / کشور:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {product.brand} / {product.countryName}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              تعداد:
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="small"
                onClick={() =>
                  handleQuantityChange(product.productId, product.quantity + 1)
                }
              >
                <Add fontSize="small" />
              </IconButton>
              <TextField
                size="small"
                value={product.quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  handleQuantityChange(product.productId, value);
                }}
                sx={{ width: 60 }}
                inputProps={{
                  min: 1,
                  style: { textAlign: "center", fontSize: "14px" },
                }}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleQuantityChange(product.productId, product.quantity - 1)
                }
                disabled={product.quantity <= 1}
              >
                <Remove fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
  const renderDesktopProductTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              ردیف
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              نام کالا
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              کد فنی
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              کشور
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              برند
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              تعداد
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              عملیات
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedProducts.map((product, index) => (
            <TableRow key={product.productId} hover>
              <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "medium" }}>
                {product.productName}
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                {product.productCode}
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                {product.countryName}
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                {product.brand}
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: "center",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleQuantityChange(
                        product.productId,
                        product.quantity + 1
                      )
                    }
                  >
                    <Add />
                  </IconButton>
                  <TextField
                    size="small"
                    value={product.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      handleQuantityChange(product.productId, value);
                    }}
                    sx={{ width: 80 }}
                    inputProps={{
                      min: 1,
                      style: { textAlign: "center" },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleQuantityChange(
                        product.productId,
                        product.quantity - 1
                      )
                    }
                    disabled={product.quantity <= 1}
                  >
                    <Remove />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveProduct(product.productId)}
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  const renderProductList = () => {
    if (selectedProducts.length === 0) return null;
    if (isMobile || isTablet) {
      return (
        <Stack spacing={2}>
          {selectedProducts.map((product) => renderMobileProductCard(product))}
        </Stack>
      );
    }
    return renderDesktopProductTable();
  };

  return (
    <Dialog
      open={showModal}
      onClose={handleClose}
      fullWidth
      maxWidth={isMobile ? "xs" : isTablet ? "sm" : "lg"}
      fullScreen={isMobile}
    >
      {isPendingUpdateRepairReception && <Loading />}
      <DialogTitle
        sx={{
          pb: isMobile ? 1 : 2,
          fontSize: isMobile ? "1.1rem" : "1.25rem",
        }}
      >
        رسید کالا از مشتری
      </DialogTitle>
      <DialogContent
        sx={{
          pt: isMobile ? "5px !important" : "10px !important",
          px: isMobile ? 2 : 3,
        }}
      >
        <Box sx={{ py: isMobile ? 1 : 2 }}>
          <EnhancedSelect
            onChange={(value) => setSelectedProblem(value)}
            placeholder="مشکل مورد نظر را انتخاب کنید"
            value={selectedProblem}
            label="انتخاب مشکل"
            options={problems}
            name="problemId"
            searchable
          />
        </Box>
        <Box sx={{ py: isMobile ? 1 : 2 }}>
          <EnhancedSelect
            containerClassName={isMobile ? "mb-3" : "mb-5"}
            loading={isPendingGetProductsThatContainsText}
            onInputChange={handleSearchProduct}
            onChange={handleProductSelection}
            placeholder="جست و جوی کالا"
            storeValueOnly={true}
            label="جست و جوی کالا"
            className="font-12"
            options={products}
            searchable={true}
            name="product"
            multiple
            isRtl
          />
        </Box>
        {selectedProducts.length > 0 && (
          <Box sx={{ mt: isMobile ? 2 : 3 }}>
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{
                mb: isMobile ? 1 : 2,
                fontWeight: "bold",
              }}
            >
              کالاهای انتخاب شده
            </Typography>
            {renderProductList()}
          </Box>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          px: isMobile ? 2 : 3,
          pb: isMobile ? 2 : 3,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 1 : 0,
        }}
      >
        <AccessGuard accessId={ACCESS_IDS.CUSTOMER_PART_RECEIPT}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              selectedProducts.length === 0 ||
              !selectedProblem ||
              isPendingUpdateRepairReception
            }
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            ثبت
          </Button>
        </AccessGuard>
        <Button
          onClick={handleClose}
          variant="outlined"
          fullWidth={isMobile}
          size={isMobile ? "large" : "medium"}
        >
          انصراف
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestProductFromCustomerModal;
