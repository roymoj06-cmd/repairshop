import { FC, useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QrCode as QrCodeIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  CircularProgress,
  TableContainer,
  DialogActions,
  DialogContent,
  useMediaQuery,
  DialogTitle,
  Typography,
  TableHead,
  TableBody,
  TableCell,
  useTheme,
  TableRow,
  Button,
  Dialog,
  Table,
  Paper,
  Box,
} from "@mui/material";

import {
  buyRequest,
  addApprovedProductsToReception,
} from "../../../service/repairProductRequest/repairProductRequest.service";

interface IRequestProductDetailsModalProps {
  setShowDetailsModal: (show: boolean) => void;
  showDetailsModal: boolean;
  selectedProblem: IGetAllRepairProductRequestsByReceptionId | null;
  onSuccess?: () => void;
}

// Extracted component for mobile card
const MobileProductCard: FC<{
  product: any;
  onActionClick: (requestId: number, status: number) => void;
}> = ({ product, onActionClick }) => {
  const getStatusClass = (isAccepted: boolean) => {
    return isAccepted
      ? "request-product-details-modal__status--accepted"
      : "request-product-details-modal__status--rejected";
  };
  const handleKasriClick = () => {
    onActionClick(product.requestedId, 1);
  };
  const handleRejectClick = () => {
    onActionClick(product.requestedId, 4);
  };

  // اگر تعداد کالاهای درخواستی با تعداد مصرفی یکسان شد باید دکمه های رد و کسری غیر فعال شود
  // همینطور اگر تعداد کالاهای مصرفی بیشتر از 0 بود دکمه رد غیر فعال شود
  const isKasriDisabled =
    product.statusId === 1 ||
    product.statusId === 4 ||
    product.requestedQty === product.usedQty;
  const isRejectDisabled =
    product.statusId === 1 ||
    product.statusId === 4 ||
    product.usedQty > 0 ||
    product.requestedQty === product.usedQty;

  return (
    <Paper
      key={product.requestedId}
      elevation={2}
      className="request-product-details-modal__mobile-card"
    >
      <Box className="request-product-details-modal__mobile-card-content">
        <Box className="request-product-details-modal__mobile-text">
          <strong>نام کالا :</strong> {product.productName}
        </Box>
        <Box className="request-product-details-modal__mobile-text">
          <strong>کد کالا :</strong> {product.productCode}
        </Box>
        <Box className="request-product-details-modal__mobile-text">
          <strong>موجودی :</strong> {product.realQty}
        </Box>
        <Box className="request-product-details-modal__mobile-text">
          <strong>تعداد درخواستی :</strong> {product?.requestedQty}
        </Box>
        <Box className="request-product-details-modal__mobile-text">
          <strong>تعداد مصرفی :</strong> {product.usedQty}
        </Box>
        <Box className="request-product-details-modal__mobile-text">
          <strong>برند / کشور :</strong> {product?.brandName} /{" "}
          {product?.countryName}
        </Box>
        <Box className="request-product-details-modal__mobile-text">
          <strong>وضعیت :</strong> {product.statusDescription}
        </Box>

        <Box className="request-product-details-modal__mobile-card-actions">
          <Button
            variant="contained"
            color="secondary"
            size="small"
            className="request-product-details-modal__mobile-button"
            onClick={handleKasriClick}
            disabled={isKasriDisabled}
          >
            کسری
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            className="request-product-details-modal__mobile-button"
            onClick={handleRejectClick}
            disabled={isRejectDisabled}
          >
            رد
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
const ActionButtons: FC<{
  isTablet: boolean;
  requestId: number;
  statusId: number;
  requestedQty: number;
  usedQty: number;
  onActionClick: (requestId: number, status: number) => void;
}> = ({
  isTablet,
  requestId,
  statusId,
  requestedQty,
  usedQty,
  onActionClick,
}) => {
  const buttonClass = isTablet
    ? "request-product-details-modal__action-button--tablet"
    : "request-product-details-modal__action-button--desktop";

  const containerClass = isTablet
    ? "request-product-details-modal__action-buttons-container--tablet"
    : "request-product-details-modal__action-buttons-container";

  const handleKasriClick = () => {
    onActionClick(requestId, 1);
  };

  const handleRejectClick = () => {
    onActionClick(requestId, 4);
  };

  // اگر تعداد کالاهای درخواستی با تعداد مصرفی یکسان شد باید دکمه های رد و کسری غیر فعال شود
  // همینطور اگر تعداد کالاهای مصرفی بیشتر از 0 بود دکمه رد غیر فعال شود
  const isKasriDisabled =
    statusId === 1 || statusId === 4 || requestedQty === usedQty;
  const isRejectDisabled =
    statusId === 1 || statusId === 4 || usedQty > 0 || requestedQty === usedQty;

  return (
    <Box className={containerClass}>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        className={buttonClass}
        onClick={handleKasriClick}
        disabled={isKasriDisabled}
      >
        کسری
      </Button>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        className={buttonClass}
        onClick={handleRejectClick}
        disabled={isRejectDisabled}
      >
        رد
      </Button>
    </Box>
  );
};
const tableColumns = [
  { key: "row", label: "ردیف", minWidth: 50, align: "left" as const },
  {
    key: "productName",
    label: "نام کالا",
    minWidth: 150,
    maxWidth: 200,
    align: "center" as const,
  },
  {
    key: "productCode",
    label: "کد کالا",
    minWidth: 120,
    maxWidth: 140,
    align: "center" as const,
  },
  {
    key: "realQty",
    label: "موجودی",
    minWidth: 80,
    maxWidth: 100,
    align: "center" as const,
  },
  {
    key: "requestedQty",
    label: "تعداد درخواستی",
    minWidth: 70,
    maxWidth: 90,
    align: "center" as const,
  },
  {
    key: "usedQty",
    label: "تعداد مصرفی",
    minWidth: 70,
    maxWidth: 90,
    align: "center" as const,
  },
  {
    key: "brandCountry",
    label: "برند / کشور",
    minWidth: 120,
    maxWidth: 160,
    align: "center" as const,
  },
  {
    key: "status",
    label: "وضعیت",
    minWidth: 100,
    maxWidth: 120,
    align: "center" as const,
  },
  {
    key: "actions",
    label: "عملیات",
    minWidth: 160,
    maxWidth: 200,
    align: "center" as const,
  },
];
const RequestProductDetailsModal: FC<IRequestProductDetailsModalProps> = ({
  setShowDetailsModal,
  showDetailsModal,
  selectedProblem,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [showBarcodeSection, setShowBarcodeSection] = useState<boolean>(false);
  const [currentBarcode, setCurrentBarcode] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const addApprovedProductMutation = useMutation({
    mutationFn: addApprovedProductsToReception,
    onSuccess: (data: any) => {
      if (data?.isSuccess) {
        toast.success(data?.message || "کالا با موفقیت اضافه شد");
        queryClient.invalidateQueries({
          queryKey: [
            "repairReceptionId",
            selectedProblem?.repairCustomerProblemId,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: ["getAllProductRequestsByReceptionId"],
        });
        queryClient.invalidateQueries({
          queryKey: ["getAllRepairProductRequestsByReceptionId"],
        });

        // Call onSuccess to refresh parent component data
        onSuccess?.();
      } else {
        toast.error(data?.message || "خطا در اضافه کردن کالا");
      }

      setCurrentBarcode("");
      setIsScanning(false);
    },
    onError: (_: any) => {
      toast.error("خطا در ارتباط با سرور");
      setCurrentBarcode("");
      setIsScanning(false);
    },
  });
  const handleScanBarcode = useCallback(
    (barcode: string) => {
      if (!selectedProblem?.repairCustomerProblemId) {
        toast.error("مشکل انتخاب نشده است");
        return;
      }
      const matchingProduct = {
        barcode: barcode,
        problemId: selectedProblem?.repairCustomerProblemId,
      };
      if (!matchingProduct) {
        toast.error("کالای مربوط به این بارکد یافت نشد");
        return;
      }
      setCurrentBarcode(barcode);
      setIsScanning(true);
      addApprovedProductMutation.mutate({
        problemId: selectedProblem?.repairCustomerProblemId,
        barcode: barcode,
      });
    },
    [selectedProblem, addApprovedProductMutation]
  );
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!showBarcodeSection || isScanning) return;
      if (event.key === "Enter") {
        const barcode = currentBarcode.trim();
        if (barcode) {
          handleScanBarcode(barcode);
          setCurrentBarcode("");
        }
      } else if (event.key.length === 1) {
        setCurrentBarcode((prev) => prev + event.key);
      }
    },
    [showBarcodeSection, isScanning, currentBarcode, handleScanBarcode]
  );
  useEffect(() => {
    if (showBarcodeSection) {
      document.addEventListener("keydown", handleKeyPress);
      return () => {
        document.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [showBarcodeSection, handleKeyPress]);
  const buyRequestMutation = useMutation({
    mutationFn: buyRequest,
    onSuccess: (data: any) => {
      if (data.isSuccess) {
        toast.success(data?.message);

        // Invalidate and refetch related queries to refresh the data
        queryClient.invalidateQueries({
          queryKey: [
            "repairReceptionId",
            selectedProblem?.repairCustomerProblemId,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: ["getAllProductRequestsByReceptionId"],
        });
        queryClient.invalidateQueries({
          queryKey: ["getAllRepairProductRequestsByReceptionId"],
        });

        // Call onSuccess to refresh parent component data
        onSuccess?.();
      } else {
        toast.error(data?.message);
      }
    },
  });
  useEffect(() => {
    if (showBarcodeSection && barcodeInputRef.current) {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    }
  }, [showBarcodeSection]);
  useEffect(() => {
    if (!showDetailsModal) {
      setCurrentBarcode("");
      setIsScanning(false);
      setShowBarcodeSection(false);
    }
  }, [showDetailsModal]);
  const handleActionClick = (requestId: number, status: number) => {
    const requestData = {
      requestId: requestId,
      status: status,
      rejectReason: status === 4 ? "درخواست رد شد" : "",
    };

    buyRequestMutation.mutate(requestData);
  };
  const renderBarcodeSection = () => (
    <Box sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
      {isScanning ? (
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={24} sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            در حال پردازش بارکد...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ textAlign: "center" }}>
          <QrCodeIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography variant="body1" sx={{ mb: 1 }}>
            آماده برای اسکن بارکد
          </Typography>
          <Typography variant="caption" color="text.secondary">
            بارکد کالا را اسکن کنید
          </Typography>
        </Box>
      )}
    </Box>
  );
  const getDialogClass = () => {
    if (isMobile) return "request-product-details-modal__dialog--mobile";
    if (isTablet) return "request-product-details-modal__dialog--tablet";
    return "request-product-details-modal__dialog--desktop";
  };
  const getTitleClass = () => {
    if (isMobile) return "request-product-details-modal__title--mobile";
    if (isTablet) return "request-product-details-modal__title--tablet";
    return "request-product-details-modal__title--desktop";
  };
  const getContentClass = () => {
    if (isMobile) return "request-product-details-modal__content--mobile";
    if (isTablet) return "request-product-details-modal__content--tablet";
    return "request-product-details-modal__content--desktop";
  };
  const getActionsClass = () => {
    if (isMobile) return "request-product-details-modal__actions--mobile";
    if (isTablet) return "request-product-details-modal__actions--tablet";
    return "request-product-details-modal__actions--desktop";
  };
  const getTableClass = () => {
    return isTablet
      ? "request-product-details-modal__table--tablet"
      : "request-product-details-modal__table--desktop";
  };
  const getTableCellHeaderClass = () => {
    return isTablet
      ? "request-product-details-modal__table-cell--header--tablet"
      : "request-product-details-modal__table-cell--header--desktop";
  };
  const getTableCellBodyClass = () => {
    return isTablet
      ? "request-product-details-modal__table-cell--body--tablet"
      : "request-product-details-modal__table-cell--body--desktop";
  };
  const getTableCellPaddingClass = () => {
    return isTablet
      ? "request-product-details-modal__table-cell-padding--tablet"
      : "request-product-details-modal__table-cell-padding--desktop";
  };
  const renderMobileLayout = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {selectedProblem?.repairProductRequestDto?.map((product) => (
        <MobileProductCard
          key={product.requestedId}
          product={product}
          onActionClick={handleActionClick}
        />
      ))}
    </Box>
  );
  const renderDesktopLayout = () => (
    <TableContainer
      component={Paper}
      className="request-product-details-modal__table-container"
    >
      <Table size={isTablet ? "small" : "medium"} className={getTableClass()}>
        <TableHead className="request-product-details-modal__table-head">
          <TableRow>
            {tableColumns.map((column) => (
              <TableCell
                key={column.key}
                className={getTableCellHeaderClass()}
                style={{
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                  textAlign: column.align,
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedProblem?.repairProductRequestDto?.map((product, index) => (
            <TableRow key={product.requestedId}>
              <TableCell
                className={`${getTableCellBodyClass()} request-product-details-modal__table-cell--body--left`}
                style={{ textAlign: "center" }}
              >
                {index + 1}
              </TableCell>
              <TableCell
                className={`${getTableCellBodyClass()} request-product-details-modal__table-cell--body--word-break`}
                style={{ textAlign: "center" }}
              >
                {product.productName}
              </TableCell>
              <TableCell
                className={getTableCellBodyClass()}
                style={{ textAlign: "center" }}
              >
                {product.productCode}
              </TableCell>
              <TableCell
                className={getTableCellBodyClass()}
                style={{ textAlign: "center" }}
              >
                {product.realQty}
              </TableCell>
              <TableCell
                className={getTableCellBodyClass()}
                style={{ textAlign: "center" }}
              >
                {product?.requestedQty}
              </TableCell>
              <TableCell
                className={getTableCellBodyClass()}
                style={{ textAlign: "center" }}
              >
                {product?.usedQty}
              </TableCell>
              <TableCell
                className={getTableCellBodyClass()}
                style={{ textAlign: "center" }}
              >
                {product?.brandName} / {product?.countryName}
              </TableCell>
              <TableCell
                className={getTableCellBodyClass()}
                style={{ textAlign: "center" }}
              >
                {product.statusDescription}
              </TableCell>
              <TableCell className={getTableCellPaddingClass()}>
                <ActionButtons
                  isTablet={isTablet}
                  requestId={product.requestedId}
                  statusId={product.statusId}
                  requestedQty={product.requestedQty}
                  usedQty={product.usedQty}
                  onActionClick={handleActionClick}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Dialog
      maxWidth={isMobile ? "xs" : "xl"}
      open={showDetailsModal}
      fullWidth
      className={`request-product-details-modal ${getDialogClass()}`}
    >
      <DialogTitle className={getTitleClass()}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>
            جزئیات درخواست قطعه برای مشکل: {selectedProblem?.problemDescription}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowBarcodeSection(!showBarcodeSection)}
            startIcon={<QrCodeIcon />}
          >
            {showBarcodeSection ? "پنهان کردن اسکنر" : "نمایش اسکنر بارکد"}
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent className={getContentClass()}>
        {/* Barcode Scanner Section */}
        {showBarcodeSection && renderBarcodeSection()}

        {/* Existing Content */}
        {isMobile ? renderMobileLayout() : renderDesktopLayout()}
      </DialogContent>

      <DialogActions className={getActionsClass()}>
        <Button
          onClick={() => setShowDetailsModal(false)}
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          fullWidth={isMobile}
        >
          بستن
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestProductDetailsModal;
