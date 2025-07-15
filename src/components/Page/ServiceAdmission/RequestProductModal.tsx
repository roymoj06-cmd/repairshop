import { Dispatch, FC, SetStateAction, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Add, Remove, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
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

import { getMechanicProductRequestByProblemId } from "@/service/RepairMechanicProductRequest/RepairMechanicProductRequest.service";
import { createBatchRepairProductRequest } from "@/service/repairProductRequest/repairProductRequest.service";
import { getCustomerProblems } from "@/service/repairServices/repairServices.service";
import { getProductsThatContainsText } from "@/service/Product/Product.service";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";
import { EnhancedSelect, Loading } from "@/components";

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

interface MechanicRequest {
  id: number;
  problemTitle: string;
  productTitle: string;
  problemId: number;
  fileId: number;
  selectedProducts: SelectedProduct[];
}

const RequestProductModal: FC<IRequestProductModalProps> = ({
  repairReceptionId,
  setShowModal,
  showModal,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [mechanicRequests, setMechanicRequests] = useState<MechanicRequest[]>(
    []
  );
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [currentEditingRequestId, setCurrentEditingRequestId] = useState<
    number | null
  >(null);
  const [showProductSelectionModal, setShowProductSelectionModal] =
    useState(false);

  // Query for getting customer problems
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

  // Query for getting mechanic product requests by problem ID
  const { data: mechanicRequestsData = [] } = useQuery({
    queryKey: ["mechanicProductRequests", selectedProblem?.value],
    queryFn: () => getMechanicProductRequestByProblemId(selectedProblem?.value),
    enabled: !!selectedProblem?.value,
    select: (data) => data?.data || [],
  });

  // Mutation for product search
  const {
    isPending: isPendingGetProductsThatContainsText,
    mutateAsync: mutateGetProductsThatContainsText,
  } = useMutation({
    mutationFn: getProductsThatContainsText,
    onSuccess: (data: any) => {
      const temp = data?.data?.map((brand: IProductSummery) => ({
        label: `${brand?.productName} - ${brand?.productCode}`,
        value: brand?.productId,
      }));
      setProducts([...temp]);
    },
  });

  // Mutation for creating batch repair product request
  const {
    isPending: isPendingCreateBatchRepairProductRequest,
    mutateAsync: mutateCreateBatchRepairProductRequest,
  } = useMutation({
    mutationFn: createBatchRepairProductRequest,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast?.success(data?.message);
        setShowModal(false);
        setSelectedProblem(null);
        setMechanicRequests([]);
        setCurrentEditingRequestId(null);
        setShowProductSelectionModal(false);
      } else {
        toast?.error(data?.message);
      }
    },
  });

  // Handle problem selection
  const handleProblemSelection = (problem: any) => {
    setSelectedProblem(problem);
    setMechanicRequests([]);
    setCurrentEditingRequestId(null);
  };

  // Handle product search
  const handleSearchProduct = (value: any) => {
    if (value.length > 2) {
      mutateGetProductsThatContainsText(value);
    }
  };

  // Handle product selection for a specific request
  const handleProductSelectionForRequest = (
    requestId: number,
    selectedOptions: SelectOption[] | any
  ) => {
    console.log("handleProductSelectionForRequest received:", selectedOptions);

    // Handle different data formats from EnhancedSelect
    let selectedOption;
    if (Array.isArray(selectedOptions) && selectedOptions.length > 0) {
      selectedOption = selectedOptions[0];
    } else if (selectedOptions && typeof selectedOptions === "object") {
      selectedOption = selectedOptions;
    } else {
      console.log("No valid option selected");
      return;
    }

    if (!selectedOption || !selectedOption.value) {
      console.log("Invalid selectedOption:", selectedOption);
      return;
    }

    const selectedProduct = {
      productId: Number(selectedOption.value),
      productName: selectedOption.label || selectedOption.value,
      quantity: 1,
    };

    console.log("Created selectedProduct:", selectedProduct);

    setMechanicRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              selectedProducts: [...request.selectedProducts, selectedProduct],
            }
          : request
      )
    );
    setCurrentEditingRequestId(null);
  };

  // Handle quantity change for a specific product in a request
  const handleQuantityChange = (
    requestId: number,
    productId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    setMechanicRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              selectedProducts: request.selectedProducts.map((product) =>
                product.productId === productId
                  ? { ...product, quantity: newQuantity }
                  : product
              ),
            }
          : request
      )
    );
  };

  // Handle removing product from a request
  const handleRemoveProduct = (requestId: number, productId: number) => {
    setMechanicRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              selectedProducts: request.selectedProducts.filter(
                (p) => p.productId !== productId
              ),
            }
          : request
      )
    );
  };

  // Handle submit
  const handleSubmit = () => {
    const requestsWithProducts = mechanicRequests.filter(
      (request) => request.selectedProducts.length > 0
    );

    if (requestsWithProducts.length === 0) {
      toast.error("لطفا حداقل یک کالا برای یکی از درخواست‌ها انتخاب کنید");
      return;
    }

    if (!repairReceptionId) {
      toast.error("شناسه پذیرش تعمیر یافت نشد");
      return;
    }

    // Group products by problem ID and create batch request
    const productsByProblem = requestsWithProducts.reduce((acc, request) => {
      if (!acc[request.problemId]) {
        acc[request.problemId] = [];
      }
      request.selectedProducts.forEach((product) => {
        acc[request.problemId].push({
          productId: product.productId,
          qty: product.quantity,
        });
      });
      return acc;
    }, {} as Record<number, Array<{ productId: number; qty: number }>>);

    // Submit each problem's products
    Object.entries(productsByProblem).forEach(([problemId, products]) => {
      const requestData = {
        repairCustomerProblemId: Number(problemId),
        products: products,
      };
      mutateCreateBatchRepairProductRequest(requestData);
    });
  };

  // Update mechanic requests when data changes
  useEffect(() => {
    if (mechanicRequestsData.length > 0) {
      setMechanicRequests(
        mechanicRequestsData.map(
          (request: IGetMechanicProductRequestByProblemId) => ({
            id: request.id,
            problemTitle: request.problemTitle,
            productTitle: request.productTitle,
            problemId: request.problemId,
            fileId: request.fileId,
            selectedProducts: [],
          })
        )
      );
    }
  }, [mechanicRequestsData]);

  // Handle opening product selection modal
  const handleOpenProductSelection = (requestId: number) => {
    setCurrentEditingRequestId(requestId);
    setShowProductSelectionModal(true);
  };

  // Handle closing product selection modal
  const handleCloseProductSelection = () => {
    setShowProductSelectionModal(false);
    setCurrentEditingRequestId(null);
  };

  const renderRequestList = () => {
    if (isMobile) {
      return (
        <Stack spacing={2}>
          {mechanicRequests?.map((request) => (
            <Card
              key={request.id}
              variant="outlined"
              sx={{
                border:
                  currentEditingRequestId === request.id
                    ? "2px solid #1976d2"
                    : "1px solid #e0e0e0",
                backgroundColor:
                  currentEditingRequestId === request.id
                    ? "#f3f8ff"
                    : "transparent",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "bold" }}
                >
                  {request.productTitle}
                </Typography>

                {/* Debug info */}
                <Typography variant="caption" color="text.secondary">
                  تعداد کالاهای انتخاب شده: {request.selectedProducts.length}
                </Typography>

                {/* Temporarily show this section always for debugging */}
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    کالاهای انتخاب شده:
                  </Typography>
                  {request.selectedProducts.length > 0 ? (
                    <Stack spacing={1}>
                      {request.selectedProducts.map((product) => (
                        <Box
                          key={product.productId}
                          className="product-selection-box"
                          sx={{
                            p: 1,
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {product.productName}
                            </Typography>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() =>
                                handleRemoveProduct(
                                  request.id,
                                  product.productId
                                )
                              }
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleQuantityChange(
                                  request.id,
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
                                handleQuantityChange(
                                  request.id,
                                  product.productId,
                                  value
                                );
                              }}
                              sx={{ width: 60 }}
                              inputProps={{
                                min: 1,
                                style: {
                                  textAlign: "center",
                                  fontSize: "14px",
                                },
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleQuantityChange(
                                  request.id,
                                  product.productId,
                                  product.quantity - 1
                                )
                              }
                              disabled={product.quantity <= 1}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      هیچ کالایی انتخاب نشده
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenProductSelection(request.id)}
                    fullWidth
                  >
                    {request.selectedProducts.length > 0
                      ? "افزودن کالای دیگر"
                      : "انتخاب کالا"}
                  </Button>

                  {/* Test button for debugging */}
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      const testProduct = {
                        productId: 999,
                        productName: "کالای تست",
                        quantity: 1,
                      };
                      setMechanicRequests((prev) =>
                        prev.map((req) =>
                          req.id === request.id
                            ? {
                                ...req,
                                selectedProducts: [
                                  ...req.selectedProducts,
                                  testProduct,
                                ],
                              }
                            : req
                        )
                      );
                    }}
                    sx={{ mt: 1 }}
                  >
                    تست اضافه کردن کالا
                  </Button>
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
              <TableCell>عنوان درخواست</TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                کالاهای انتخاب شده
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mechanicRequests?.map((request) => (
              <TableRow
                key={request.id}
                sx={{
                  backgroundColor:
                    currentEditingRequestId === request.id
                      ? "#f3f8ff"
                      : "transparent",
                  "& .MuiTableCell-root": {
                    borderColor:
                      currentEditingRequestId === request.id
                        ? "#1976d2"
                        : "#e0e0e0",
                  },
                }}
              >
                <TableCell sx={{ textAlign: "left" }}>
                  {request.productTitle}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {request.selectedProducts.length > 0 ? (
                    <Stack spacing={1}>
                      {request.selectedProducts.map((product) => (
                        <Box
                          key={product.productId}
                          className="product-selection-box"
                          sx={{
                            p: 1,
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            backgroundColor: "#f9f9f9",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ flex: 1, fontSize: "12px" }}
                          >
                            {product.productName}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleQuantityChange(
                                  request.id,
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
                                handleQuantityChange(
                                  request.id,
                                  product.productId,
                                  value
                                );
                              }}
                              sx={{ width: 60 }}
                              inputProps={{
                                min: 1,
                                style: {
                                  textAlign: "center",
                                  fontSize: "12px",
                                },
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleQuantityChange(
                                  request.id,
                                  product.productId,
                                  product.quantity - 1
                                )
                              }
                              disabled={product.quantity <= 1}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() =>
                                handleRemoveProduct(
                                  request.id,
                                  product.productId
                                )
                              }
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      کالایی انتخاب نشده
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenProductSelection(request.id)}
                  >
                    {request.selectedProducts.length > 0
                      ? "افزودن کالا"
                      : "انتخاب کالا"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <Dialog
        maxWidth={isMobile ? "xs" : isTablet ? "sm" : "md"}
        open={showModal}
        fullScreen
        fullWidth
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
              onChange={handleProblemSelection}
              placeholder="مشکل مورد نظر را انتخاب کنید"
              value={selectedProblem}
              label="انتخاب مشکل"
              options={problems}
              name="problemId"
              searchable
            />
          </Box>

          {selectedProblem && mechanicRequests.length > 0 && (
            <Box sx={{ mt: isMobile ? 2 : 3 }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                sx={{
                  mb: isMobile ? 1 : 2,
                  fontWeight: "bold",
                }}
              >
                درخواست‌های مکانیک برای این مشکل: {selectedProblem.label}
              </Typography>
              {renderRequestList()}
            </Box>
          )}

          {selectedProblem && mechanicRequests.length === 0 && (
            <Box sx={{ mt: isMobile ? 2 : 3, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                هیچ درخواستی برای این مشکل یافت نشد
              </Typography>
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
            onClick={() => {
              setShowModal(false);
              setSelectedProblem(null);
              setMechanicRequests([]);
              setCurrentEditingRequestId(null);
              setShowProductSelectionModal(false);
            }}
            variant="outlined"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            انصراف
          </Button>
          <AccessGuard accessId={ACCESS_IDS.WAREHOUSE_PART_REQUEST}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={
                !selectedProblem ||
                mechanicRequests.filter((r) => r.selectedProducts.length > 0)
                  .length === 0 ||
                isPendingCreateBatchRepairProductRequest
              }
              fullWidth={isMobile}
              size={isMobile ? "large" : "medium"}
            >
              ثبت درخواست
            </Button>
          </AccessGuard>
        </DialogActions>
      </Dialog>

      {/* Product Selection Modal */}
      <Dialog
        onClose={handleCloseProductSelection}
        open={showProductSelectionModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          انتخاب کالا برای درخواست:{" "}
          {
            mechanicRequests.find((r) => r.id === currentEditingRequestId)
              ?.productTitle
          }
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <EnhancedSelect
              loading={isPendingGetProductsThatContainsText}
              onInputChange={handleSearchProduct}
              onChange={(selectedOptions) => {
                console.log(
                  "EnhancedSelect onChange received:",
                  selectedOptions
                );
                handleProductSelectionForRequest(
                  currentEditingRequestId!,
                  selectedOptions
                );
                handleCloseProductSelection();
              }}
              placeholder="جست و جوی کالا"
              storeValueOnly={true}
              label="جست و جوی کالا"
              className="font-12"
              options={products}
              searchable={true}
              name={`product-${currentEditingRequestId}`}
              isRtl
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductSelection} variant="outlined">
            انصراف
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RequestProductModal;
