import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import { FC, useState } from "react";
import {
  TableContainer,
  useMediaQuery,
  CardContent,
  Typography,
  IconButton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
  Button,
  Table,
  Paper,
  Stack,
  Card,
  Box,
} from "@mui/material";

import {
  getRepairReceptionForUpdateById,
  changeIsCancelled,
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
  RequestProductListModal,
  RequestProductModal,
  ConfirmDeleteDialog,
  ProductFactorModal,
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
      const response = await changeIsCancelled({
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
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              عملیات
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {repairReception?.details?.map((product: any, index: number) => (
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
            درخواست قطعه مکانیک
          </Button>
        </AccessGuard>
        <AccessGuard accessId={ACCESS_IDS.WAREHOUSE_PART_REQUEST}>
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
        </AccessGuard>
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
      </Box>
      {repairReception?.details && repairReception.details.length > 0 ? (
        <Box>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            لیست کالاهای مصرف شده
          </Typography>

          {isMobile || isTablet ? (
            <Box>
              {repairReception.details.map((product: any, index: number) => (
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
        <RequestProductListModal
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
