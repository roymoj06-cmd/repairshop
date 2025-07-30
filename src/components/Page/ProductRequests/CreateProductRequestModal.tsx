import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useRef, useEffect } from "react";
import { Add, Remove, Close } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  DialogContent,
  DialogActions,
  Grid2 as Grid,
  DialogTitle,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  Card,
  Chip,
  Box,
} from "@mui/material";

import { createRepairProductFractional } from "@/service/repairProductFractional/repairProductFractional.service";
import { getProductsThatContainsText } from "@/service/Product/Product.service";
import { getCustomers } from "@/service/customer/customer.service";
import { getCustomerCars } from "@/service/repair/repair.service";
import { EnhancedSelect, Button, Loading } from "@/components";

interface CreateProductRequestModalProps {
  onSuccess?: () => void;
  onClose: () => void;
  open: boolean;
}

interface FormData {
  customerUserId: number | undefined;
  productId: number | undefined;
  carId: number | undefined;
}

interface SelectedProduct {
  countryName?: string;
  productName: string;
  productCode: string;
  productId: number;
  quantity: number;
  brand?: string;
}

const CreateProductRequestModal: React.FC<CreateProductRequestModalProps> = ({
  onSuccess,
  onClose,
  open,
}) => {
  const queryClient = useQueryClient();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([]);
  const [customerVehicles, setCustomerVehicles] = useState<SelectOption[]>([]);
  const [productOptions, setProductOptions] = useState<SelectOption[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );

  const {
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      customerUserId: undefined,
      carId: undefined,
      productId: undefined,
    },
  });

  const { mutateAsync: searchCustomers, isPending: isSearchingCustomers } =
    useMutation({
      mutationFn: getCustomers,
      onSuccess: (data) => {
        const customerOptions = data?.data?.map((i: any) => ({
          label: i?.fullName,
          value: i.customerId,
          userId: i.userId,
        }));
        setCustomerOptions(customerOptions || []);
      },
    });

  const { mutateAsync: getCustomerPlates, isPending: isLoadingPlates } =
    useMutation({
      mutationFn: (customerId: number) => getCustomerCars(customerId),
      onSuccess: (data: any) => {
        if (data?.isSuccess) {
          const cars = data?.data?.map((i: any) => ({
            label: `${i.plateSection1}${i.plateSection2}${i.plateSection3}-ایران${i.plateSection4}`,
            value: i.id,
          }));
          setCustomerVehicles(cars);
        } else {
          toast.error(data?.message);
        }
      },
    });

  const { mutateAsync: searchProducts, isPending: isSearchingProducts } =
    useMutation({
      mutationFn: getProductsThatContainsText,
      onSuccess: (data: any) => {
        const products = data?.data?.map((product: any) => ({
          label: `${product?.productName} - ${product?.productCode}`,
          value: product?.productId,
          productName: product?.productName,
          productCode: product?.productCode,
          brand: product?.brand || "",
          countryName: product?.countryName || "",
        }));
        setProductOptions(products || []);
      },
    });

  const { mutateAsync: createRequest, isPending: isCreatingRequest } =
    useMutation({
      mutationFn: createRepairProductFractional,
      onSuccess: (data: any) => {
        if (data?.isSuccess) {
          toast.success("درخواست کسری قطعه با موفقیت ایجاد شد");
          queryClient.invalidateQueries({ queryKey: ["productFractionals"] });
          handleClose();
          onSuccess?.();
        } else {
          toast.error(data?.message);
        }
      },
      onError: () => {
        toast.error("خطا در ایجاد درخواست کسری قطعه");
      },
    });

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

  const handleCustomerChange = (value: any) => {
    setValue("carId", undefined);
    setCustomerVehicles([]);
    if (value?.value) {
      setValue("customerUserId", value.userId || value.value);
      getCustomerPlates(value.value);
    }
  };

  const handleProductSearch = (searchText: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (searchText && searchText.length >= 2) {
        searchProducts(searchText);
      }
    }, 300);
  };

  const handleProductSelection = (option: any) => {
    if (option) {
      const newProduct: SelectedProduct = {
        productId: option.value,
        productName: option.productName || option.label.split(" - ")[0],
        productCode: option.productCode || option.label.split(" - ")[1] || "",
        brand: option.brand || "",
        countryName: option.countryName || "",
        quantity: 1,
      };
      setSelectedProducts([newProduct]); // For now, replace with single product
      setValue("productId", option.value);
    }
  };

  const handleQuantityChange = (change: number, productIndex: number = 0) => {
    if (selectedProducts[productIndex]) {
      const updatedProducts = [...selectedProducts];
      const newQuantity = updatedProducts[productIndex].quantity + change;
      if (newQuantity > 0) {
        updatedProducts[productIndex] = {
          ...updatedProducts[productIndex],
          quantity: newQuantity,
        };
        setSelectedProducts(updatedProducts);
      }
    }
  };

  const removeProduct = (productIndex: number) => {
    const updatedProducts = selectedProducts.filter(
      (_, index) => index !== productIndex
    );
    setSelectedProducts(updatedProducts);
    if (updatedProducts.length === 0) {
      setValue("productId", undefined);
    }
  };

  const handleClose = () => {
    reset();
    setCustomerOptions([]);
    setCustomerVehicles([]);
    setProductOptions([]);
    setSelectedProducts([]);
    onClose();
  };

  const onSubmit = async () => {
    if (selectedProducts.length === 0) {
      toast.error("لطفا یک کالا انتخاب کنید");
      return;
    }

    const formData = watch();
    if (!formData.customerUserId || !formData.carId) {
      toast.error("لطفا مشتری و پلاک را انتخاب کنید");
      return;
    }

    try {
      // For now, submit the first selected product
      const selectedProduct = selectedProducts[0];
      const requestData: ICreateRepairProductFractional = {
        customerUserId: formData.customerUserId,
        carId: formData.carId,
        productId: selectedProduct.productId,
        quantity: selectedProduct.quantity,
      };

      await createRequest(requestData);
    } catch (error) {
      console.error("Error creating fractional request:", error);
      toast.error("خطا در ایجاد درخواست کسری قطعه");
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const isLoading =
    isSearchingCustomers ||
    isLoadingPlates ||
    isSearchingProducts ||
    isCreatingRequest;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      {isLoading && <Loading />}
      <DialogTitle
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
        }}
      >
        <Typography variant="h6">ایجاد درخواست کسری قطعه</Typography>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <EnhancedSelect
                helperText={errors.customerUserId?.message as string}
                onInputChange={handleCustomerSearch}
                onChange={handleCustomerChange}
                error={!!errors.customerUserId}
                loading={isSearchingCustomers}
                options={customerOptions}
                enableSpeechToText={true}
                storeValueOnly={true}
                iconPosition="end"
                searchable={true}
                name="customerUserId"
                control={control}
                disabled={false}
                label="مشتری"
                isRtl={true}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <EnhancedSelect
                helperText={errors.carId?.message as string}
                disabled={!watch("customerUserId")}
                options={customerVehicles}
                loading={isLoadingPlates}
                placeholder="انتخاب پلاک"
                error={!!errors.carId}
                storeValueOnly={true}
                searchable={true}
                control={control}
                label="پلاک"
                name="carId"
                size="small"
                isRtl
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <EnhancedSelect
                onInputChange={handleProductSearch}
                onChange={handleProductSelection}
                loading={isSearchingProducts}
                placeholder="جست‌وجوی کالا"
                options={productOptions}
                label="انتخاب کالا"
                control={control}
                searchable={true}
                name="productId"
                size="small"
                isRtl
              />
            </Grid>

            {selectedProducts.map((selectedProduct, index) => (
              <Grid key={index} size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" component="div">
                        کالای انتخاب شده
                      </Typography>
                      <IconButton
                        onClick={() => removeProduct(index)}
                        size="small"
                        color="error"
                      >
                        <Close />
                      </IconButton>
                    </Box>

                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                          {selectedProduct.productName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          کد کالا: {selectedProduct.productCode}
                        </Typography>
                        {selectedProduct.brand && (
                          <Chip
                            label={selectedProduct.brand}
                            size="small"
                            sx={{ mt: 1, mr: 1 }}
                          />
                        )}
                        {selectedProduct.countryName && (
                          <Chip
                            label={selectedProduct.countryName}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 2,
                          }}
                        >
                          <Typography variant="body1">تعداد:</Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              onClick={() => handleQuantityChange(-1, index)}
                              disabled={selectedProduct.quantity <= 1}
                              size="small"
                              color="primary"
                            >
                              <Remove />
                            </IconButton>
                            <Typography
                              variant="h6"
                              sx={{ minWidth: "2rem", textAlign: "center" }}
                            >
                              {selectedProduct.quantity}
                            </Typography>
                            <IconButton
                              onClick={() => handleQuantityChange(1, index)}
                              size="small"
                              color="primary"
                            >
                              <Add />
                            </IconButton>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          انصراف
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          disabled={
            selectedProducts.length === 0 ||
            !watch("customerUserId") ||
            !watch("carId") ||
            isLoading
          }
        >
          ایجاد درخواست
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProductRequestModal;
