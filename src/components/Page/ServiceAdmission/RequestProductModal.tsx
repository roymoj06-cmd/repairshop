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

  return (
    <Dialog
      onClose={() => setShowModal(false)}
      open={showModal}
      fullWidth
      maxWidth="md"
    >
      {isPendingCreateBatchRepairProductRequest && <Loading />}
      <DialogTitle>درخواست قطعه</DialogTitle>
      <DialogContent sx={{ pt: "10px !important" }}>
        <Box sx={{ py: 2 }}>
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
        <Box sx={{ py: 2 }}>
          <EnhancedSelect
            onChange={handleProductSelection}
            loading={isPendingGetProductsThatContainsText}
            onInputChange={handleSearchProduct}
            placeholder="جست و جوی کالا"
            containerClassName="mb-5"
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
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              کالاهای انتخاب شده
            </Typography>
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
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            selectedProducts.length === 0 ||
            isPendingCreateBatchRepairProductRequest
          }
        >
          ثبت درخواست
        </Button>
        <Button onClick={() => setShowModal(false)} variant="outlined">
          انصراف
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestProductModal;
