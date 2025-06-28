import { Dispatch, FC, SetStateAction, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Dialog,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";

import { createBatchRepairProductRequest } from "@/service/repairProductRequest/repairProductRequest.service";
import { getProductsThatContainsText } from "@/service/Product/Product.service";
import { EnhancedSelect, Loading } from "@/components";
import { getCustomerProblems } from "@/service/repairServices/repairServices.service";

interface IRequestProductModalProps {
  setShowModal: Dispatch<SetStateAction<boolean | undefined>>;
  repairReceptionId?: string;
  showModal: boolean;
}

interface SelectedProduct {
  productId: number;
  productName: string;
  quantity: number;
}

const RequestProductModal: FC<IRequestProductModalProps> = ({
  repairReceptionId,
  setShowModal,
  showModal,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [products, setProducts] = useState<SelectOption[]>([]);

  const {
    isPending: isPendingGetProductsThatContainsText,
    mutateAsync: mutateGetProductsThatContainsText,
  } = useMutation({
    mutationFn: getProductsThatContainsText,
    onSuccess: (data: any) => {
      const temp = data?.data?.map((brand: IProductSummery) => ({
        label: `${brand?.productName}`,
        value: brand?.productId,
      }));
      setProducts([...temp]);
    },
  });

  const {
    isPending: isPendingCreateBatchRepairProductRequest,
    mutateAsync: mutateCreateBatchRepairProductRequest,
  } = useMutation({
    mutationFn: createBatchRepairProductRequest,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast?.success(data?.message);
        setShowModal(false);
        setSelectedProducts([]);
      } else {
        toast?.error(data?.message);
      }
    },
  });
  const { data: problems = [] } = useQuery({
    queryKey: ["customerProblems", repairReceptionId],
    queryFn: () =>
      getCustomerProblems({
        repairReceptionId: repairReceptionId && repairReceptionId,
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
  const handleSearchProduct = (value: any) => {
    if (value.length > 2) {
      mutateGetProductsThatContainsText(value);
    }
  };

  const handleProductSelection = (selectedOptions: SelectOption[]) => {
    const newProducts = selectedOptions.map((option) => ({
      productId: Number(option.value),
      productName: option.label,
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
    if (selectedProducts.length === 0) {
      toast.error("لطفا حداقل یک کالا انتخاب کنید");
      return;
    }

    if (!repairReceptionId) {
      toast.error("شناسه پذیرش تعمیر یافت نشد");
      return;
    }

    const requestData = {
      repairCustomerProblemId: selectedProblem?.value,
      products: selectedProducts.map((product) => ({
        productId: product.productId,
        qty: product.quantity,
      })),
    };

    mutateCreateBatchRepairProductRequest(requestData);
  };

  const renderProductList = () => {
    if (isMobile) {
      return (
        <Stack spacing={2}>
          {selectedProducts?.map((product) => (
            <Card key={product.productId} variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "bold" }}
                >
                  {product.productName}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(
                          product.productId,
                          product.quantity + 1
                        )
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
                        handleQuantityChange(
                          product.productId,
                          product.quantity - 1
                        )
                      }
                      disabled={product.quantity <= 1}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                  </Box>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleRemoveProduct(product.productId)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell>نام کالا</TableCell>
              <TableCell sx={{ textAlign: "center" }}>تعداد</TableCell>
              <TableCell sx={{ textAlign: "center" }}>عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedProducts?.map((product) => (
              <TableRow key={product.productId}>
                <TableCell sx={{ textAlign: "left" }}>
                  {product.productName}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
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
  };

  return (
    <Dialog
      // onClose={() => setShowModal(false)}
      open={showModal}
      fullWidth
      maxWidth={isMobile ? "xs" : isTablet ? "sm" : "md"}
      fullScreen={isMobile}
    >
      {isPendingCreateBatchRepairProductRequest && <Loading />}
      <DialogTitle
        sx={{
          pb: isMobile ? 1 : 2,
          fontSize: isMobile ? "1.1rem" : "1.25rem",
        }}
      >
        درخواست قطعه
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
            onChange={handleProductSelection}
            loading={isPendingGetProductsThatContainsText}
            onInputChange={handleSearchProduct}
            placeholder="جست و جوی کالا"
            containerClassName={isMobile ? "mb-3" : "mb-5"}
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
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            selectedProducts.length === 0 ||
            isPendingCreateBatchRepairProductRequest
          }
          fullWidth={isMobile}
          size={isMobile ? "large" : "medium"}
        >
          ثبت درخواست
        </Button>
        <Button
          onClick={() => setShowModal(false)}
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

export default RequestProductModal;
