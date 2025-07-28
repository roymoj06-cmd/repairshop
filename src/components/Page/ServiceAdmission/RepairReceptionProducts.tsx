import { Delete as DeleteIcon, CheckCircle, Cancel, Search } from "@mui/icons-material";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FC, useState } from "react";
import {
  FormControlLabel,
  TableContainer,
  InputAdornment,
  useMediaQuery,
  CardContent,
  Typography,
  IconButton,
  TableBody,
  TextField,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
  Button,
  Switch,
  Table,
  Paper,
  Stack,
  Card,
  Chip,
  Box,
} from "@mui/material";

import { updateDetailHasOldPart } from "@/service/repairReceptionService/repairReceptionService.service";
import {
  getRepairReceptionForUpdateById,
  deleteRepairReceptionDetailById,
} from "@/service/repair/repair.service";
import {
  useAccessControl,
  AccessGuard,
  ACCESS_IDS,
} from "@/utils/accessControl";
import {
  RequestProductFromCustomerModal,
  RequestProductForInventoryModal,
  CreateFactorForReception,
  // RequestProductListModal,
  RequestProductModal,
  ConfirmDeleteDialog,
  ProductFactorModal,
  RequestListModal,
  Loading,
} from "@/components";

interface RepairReceptionProductsProps {
  repairReceptionId?: string;
}

const RepairReceptionProducts: FC<RepairReceptionProductsProps> = ({
  repairReceptionId,
}) => {
  const { hasAccess } = useAccessControl();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showCreateFactorModal, setShowCreateFactorModal] =
    useState<boolean>(false);
  const [showProductRequestModal, setShowProductRequestModal] =
    useState<boolean>();
  const [showProductRequestListModal, setShowProductRequestListModal] =
    useState<boolean>();
  const [showFactorModal, setShowFactorModal] = useState<boolean>();
  const [
    showProductRequestForInventoryModal,
    setShowProductRequestForInventoryModal,
  ] = useState<boolean>();
  const [selectedProductForDelete, setSelectedProductForDelete] =
    useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [
    showProductRequestFromCustomerModal,
    setShowProductRequestFromCustomerModal,
  ] = useState<boolean>();

  const { data: repairReception, isLoading: isLoadingRepairReception } =
    useQuery({
      queryKey: ["getRepairReceptionForUpdateById", repairReceptionId],
      queryFn: () =>
        getRepairReceptionForUpdateById(+(repairReceptionId || "")),
      enabled: !!repairReceptionId,
      select: (data) => data?.data || null,
    });
  const deleteProductMutation = useMutation({
    mutationFn: async (detailId: number) => {
      const response = await deleteRepairReceptionDetailById({
        repairReceptionDetailId: detailId,
      });
      return response;
    },
    onSuccess: () => {
      toast.success("کالا با موفقیت حذف شد");
      queryClient.invalidateQueries({
        queryKey: ["getRepairReceptionForUpdateById", repairReceptionId],
      });
      setShowDeleteDialog(false);
      setSelectedProductForDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || "خطا در حذف کالا");
    },
  });
  const updateHasOldPartMutation = useMutation({
    mutationFn: async ({
      hasOldPart,
      detailId,
    }: {
      hasOldPart: boolean;
      detailId: number;
    }) => {
      const response = await updateDetailHasOldPart({
        hasOldPart,
        detailId,
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data.isSuccess) {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: ["getRepairReceptionForUpdateById", repairReceptionId],
        });
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "خطا در آپدیت وضعیت قطعه قدیمی");
    },
  });
  const handleRefreshData = () => {
    queryClient.invalidateQueries({
      queryKey: ["repairReceptionId", repairReceptionId],
    });
    queryClient.invalidateQueries({
      queryKey: ["getAllRepairProductRequestsByReceptionId", repairReceptionId],
    });
    queryClient.invalidateQueries({
      queryKey: ["getRepairReceptionForUpdateById", repairReceptionId],
    });
  };
  const handleDeleteClick = (product: any) => {
    setSelectedProductForDelete(product);
    setShowDeleteDialog(true);
  };
  const handleConfirmDelete = () => {
    if (selectedProductForDelete) {
      deleteProductMutation.mutate(
        selectedProductForDelete.repairReceptionDetailId
      );
    }
  };
  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setSelectedProductForDelete(null);
  };
  const handleOldPartStatusChange = (detailId: number, hasOldPart: boolean) => {
    updateHasOldPartMutation.mutate({
      detailId,
      hasOldPart,
    });
  };

  // Filter products based on search term
  const filteredProducts = repairReception?.details?.filter((product: any) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      product.productName?.toLowerCase().includes(term) ||
      product.productCode?.toLowerCase().includes(term)
    );
  }) || [];

  const ProductCard: FC<{ product: any; index: number }> = ({ product }) => (
    <Card key={product.repairReceptionDetailId} sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: "bold", fontSize: isMobile ? "1rem" : "1.1rem" }}
          >
            {product.productName}
          </Typography>
          {hasAccess(ACCESS_IDS.DELETE_SCANNED_PART) && (
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDeleteClick(product)}
              sx={{ ml: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Stack spacing={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              کد کالا:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {product.productCode}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              بارکد:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "medium" }} dir="rtl">
              {product.barcodeCode} -
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              شماره فنی:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {product.partNumber || "-"}
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
        </Stack>

        <AccessGuard accessId={ACCESS_IDS.OLD_PART_DELIVERED}>
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={product.hasOldPart || false}
                  onChange={(e) =>
                    handleOldPartStatusChange(
                      product.repairReceptionDetailId,
                      e.target.checked
                    )
                  }
                  disabled={updateHasOldPartMutation.isPending}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    قطعه قدیمی تحویل شده
                  </Typography>
                  {product.hasOldPart ? (
                    <Chip
                      icon={<CheckCircle />}
                      label="تحویل شده"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip
                      icon={<Cancel />}
                      label="تحویل نشده"
                      color="error"
                      size="small"
                    />
                  )}
                </Box>
              }
            />
          </Box>
        </AccessGuard>
      </CardContent>
    </Card>
  );
  const ProductTable: FC = () => (
    <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
      <Table>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              ردیف
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              کد کالا
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              نام کالا
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              بارکد
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              شماره فنی
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              برند / کشور
            </TableCell>
            <AccessGuard accessId={ACCESS_IDS.OLD_PART_DELIVERED}>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                قطعه قدیمی
              </TableCell>
            </AccessGuard>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              عملیات
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProducts?.map((product: any, index: number) => (
            <TableRow key={product.repairReceptionDetailId} hover>
              <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                {product.productCode}
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "medium" }}>
                {product.productName}
              </TableCell>
              <TableCell dir="ltr" sx={{ textAlign: "center" }}>
                {product.productCode} - {product.barcodeCode}
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                {product.partNumber || "-"}
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                {product.brand} / {product.countryName}
              </TableCell>
              <AccessGuard accessId={ACCESS_IDS.OLD_PART_DELIVERED}>
                <TableCell sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      flexDirection: "column",
                      alignItems: "center",
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    <Switch
                      checked={product.hasOldPart || false}
                      onChange={(e) =>
                        handleOldPartStatusChange(
                          product.repairReceptionDetailId,
                          e.target.checked
                        )
                      }
                      disabled={updateHasOldPartMutation.isPending}
                      color="primary"
                      size="small"
                    />
                    {product.hasOldPart ? (
                      <Chip
                        icon={<CheckCircle />}
                        label="تحویل شده"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<Cancel />}
                        label="تحویل نشده"
                        color="error"
                        size="small"
                      />
                    )}
                  </Box>
                </TableCell>
              </AccessGuard>
              <TableCell sx={{ textAlign: "center" }}>
                {hasAccess(ACCESS_IDS.DELETE_SCANNED_PART) && (
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDeleteClick(product)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <div className="">
      {isLoadingRepairReception && <Loading />}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        <AccessGuard accessId={ACCESS_IDS.MECHANIC_PART_REQUEST}>
          <Button
            onClick={() => setShowProductRequestForInventoryModal(true)}
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              flex: "1 1 auto",
              minWidth: "fit-content",
              maxWidth: "calc(50% - 8px)",
            }}
          >
            درخواست قطعه
          </Button>
        </AccessGuard>
        {/* <AccessGuard accessId={ACCESS_IDS.WAREHOUSE_PART_REQUEST}>
          <Button
            onClick={() => setShowProductRequestModal(true)}
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              flex: "1 1 auto",
              minWidth: "fit-content",
              maxWidth: "calc(50% - 8px)",
            }}
          >
            درخواست قطعه انبار
          </Button>
        </AccessGuard> */}
        <AccessGuard accessId={ACCESS_IDS.VIEW_REQUESTS}>
          <Button
            onClick={() => setShowProductRequestListModal(true)}
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              flex: "1 1 auto",
              minWidth: "fit-content",
              maxWidth: "calc(50% - 8px)",
            }}
          >
            نمایش درخواست ها
          </Button>
        </AccessGuard>
        <AccessGuard accessId={ACCESS_IDS.CREATE_FACTOR}>
          <Button
            onClick={() => setShowCreateFactorModal(true)}
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              flex: "1 1 auto",
              minWidth: "fit-content",
              maxWidth: "calc(50% - 8px)",
            }}
          >
            ایجاد فاکتور
          </Button>
        </AccessGuard>
        <AccessGuard accessId={ACCESS_IDS.CUSTOMER_PART_RECEIPT}>
          <Button
            onClick={() => setShowProductRequestFromCustomerModal(true)}
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              flex: "1 1 auto",
              minWidth: "fit-content",
              maxWidth: "calc(50% - 8px)",
            }}
          >
            رسید کالا از مشتری
          </Button>
        </AccessGuard>
        <AccessGuard accessId={ACCESS_IDS.VIEW_FACTORS}>
          <Button
            onClick={() => setShowFactorModal(true)}
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              flex: "1 1 auto",
              minWidth: "fit-content",
              maxWidth: "calc(50% - 8px)",
            }}
          >
            نمایش فاکتور
          </Button>
        </AccessGuard>
      </Box>
      {repairReception?.details && repairReception.details.length > 0 ? (
        <Box>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            لیست کالاهای مصرف شده
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="جستجو در کالاها (نام کالا یا کد کالا)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: 500,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.paper",
                },
              }}
            />
          </Box>

          {filteredProducts.length > 0 ? (
            <>
              {isMobile || isTablet ? (
                <Box>
                  {filteredProducts.map((product: any, index: number) => (
                    <ProductCard
                      key={product.repairReceptionDetailId}
                      product={product}
                      index={index}
                    />
                  ))}
                </Box>
              ) : (
                <ProductTable />
              )}
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                {searchTerm.trim()
                  ? "هیچ کالایی با این جستجو یافت نشد"
                  : "هیچ کالایی در این پذیرش ثبت نشده است"
                }
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            هیچ کالایی در این پذیرش ثبت نشده است
          </Typography>
        </Box>
      )}
      <ConfirmDeleteDialog
        content={`آیا از حذف کالای "${selectedProductForDelete?.productName}" اطمینان دارید؟`}
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
        open={showDeleteDialog}
        title="تایید حذف کالا"
      />
      {showProductRequestModal && (
        <RequestProductModal
          setShowModal={setShowProductRequestModal}
          repairReceptionId={repairReceptionId}
          showModal={showProductRequestModal}
        />
      )}
      {showProductRequestListModal && (
        <RequestListModal
          setShowModal={setShowProductRequestListModal}
          showModal={showProductRequestListModal}
          repairReceptionId={repairReceptionId}
          onRefresh={handleRefreshData}
        />
      )}
      {showCreateFactorModal && repairReception && (
        <CreateFactorForReception
          open={showCreateFactorModal}
          onClose={() => setShowCreateFactorModal(false)}
          repairReceptionId={+(repairReceptionId || "")}
          customerId={repairReception.customerId}
          carId={repairReception.carId}
          details={{
            customerName: repairReception.customerName || "",
            plateNumber: repairReception.plateNumber || "",
            receptionDate: repairReception.receptionDate || "",
          }}
          onSuccess={handleRefreshData}
        />
      )}
      {showProductRequestFromCustomerModal && (
        <RequestProductFromCustomerModal
          setShowModal={setShowProductRequestFromCustomerModal}
          showModal={showProductRequestFromCustomerModal}
          repairReceptionId={repairReceptionId}
          onRefresh={handleRefreshData}
        />
      )}
      {showProductRequestForInventoryModal && (
        <RequestProductForInventoryModal
          setShowModal={setShowProductRequestForInventoryModal}
          showModal={showProductRequestForInventoryModal}
          repairReceptionId={repairReceptionId}
        />
      )}
      {showFactorModal && (
        <ProductFactorModal
          open={showFactorModal}
          onClose={() => setShowFactorModal(false)}
          repairReceptionId={+(repairReceptionId || "")}
          details={{
            customerName: repairReception?.customerName || "",
            plateNumber: repairReception?.plateNumber || "",
            receptionDate: repairReception?.receptionDate || "",
            isDischarged: repairReception?.isDischarged,
          }}
          onRefresh={handleRefreshData}
        />
      )}
    </div>
  );
};

export default RepairReceptionProducts;
