import { useQuery } from "@tanstack/react-query";
import { FC, useEffect } from "react";
import {
  ExpandMore as ExpandMoreIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  AccordionSummary,
  AccordionDetails,
  TableContainer,
  DialogContent,
  Grid,
  useMediaQuery,
  DialogTitle,
  CardContent,
  IconButton,
  Typography,
  TableBody,
  TableCell,
  TableHead,
  Accordion,
  TableRow,
  useTheme,
  Dialog,
  Table,
  Paper,
  Card,
  Chip,
  Box,
} from "@mui/material";

import { repairReceptionSummary } from "@/service/repair/repair.service";
import { Loading, EmptyList } from "@/components";

interface IProductFactorModalProps {
  open: boolean;
  onClose: () => void;
  repairReceptionId: number;
  details: {
    customerName: string;
    plateNumber: string;
    receptionDate: string;
    isDischarged?: boolean;
  };
  onRefresh?: () => void;
}

interface IOrderDetails {
  productName: string;
  productCode: string;
  countryName: string;
  finalPrice: number;
  priceValue: number;
  unitPrice: number;
  productId: number;
  quantity: number;
  brand: string;
}

interface IOrdersType {
  orderDetails: IOrderDetails[];
  repairReceptionId: number;
  orderHeaderId: number;
  files?: any[];
  code: number;
}

const ProductFactorModal: FC<IProductFactorModalProps> = ({
  repairReceptionId,
  onClose,
  details,
  open,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    data: repairReceptionSummaryData,
    isLoading: isLoadingRepairReceptionSummary,
    refetch: refetchRepairReceptionSummary,
  } = useQuery({
    queryKey: ["repairReceptionSummary", repairReceptionId],
    queryFn: () => repairReceptionSummary(repairReceptionId),
    enabled: open && !!repairReceptionId,
    select: (data: any) => data?.data || null,
  });
  useEffect(() => {
    if (open && repairReceptionId) {
      refetchRepairReceptionSummary();
    }
  }, [open, repairReceptionId, refetchRepairReceptionSummary]);

  const renderCustomerInfo = () => (
    <Card
      sx={{
        mb: 3,
        mt: 3,
        p: 2,
        border: (theme) =>
          theme.palette.mode === "dark"
            ? "1px solid #404040"
            : "1px solid #dee2e6",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
      }}
    >
      <CardContent
        sx={{
          p: 0,
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                مشتری:
              </Typography>
              <Typography
                variant="body1"
                fontWeight="medium"
                color="text.primary"
              >
                {details?.customerName}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                justifyContent: { xs: "flex-start", md: "center" },
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                پلاک:
              </Typography>
              <Typography
                variant="body1"
                fontWeight="medium"
                color="text.primary"
              >
                {details?.plateNumber}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                justifyContent: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                تاریخ:
              </Typography>
              <Typography
                variant="body1"
                fontWeight="medium"
                color="text.primary"
              >
                {details?.receptionDate}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderProductTable = (products: any[]) => (
    <TableContainer
      component={Paper}
      sx={{
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "transparent"
            : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        border: (theme) =>
          theme.palette.mode === "dark"
            ? "1px solid #404040"
            : "1px solid #dee2e6",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
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
            <TableCell
              sx={{ fontWeight: 600, color: "text.primary", textAlign: "left" }}
            >
              نام کالا
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                color: "text.primary",
                textAlign: "center",
              }}
            >
              تعداد
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                color: "text.primary",
                textAlign: "center",
              }}
            >
              کشور
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                color: "text.primary",
                textAlign: "center",
              }}
            >
              برند
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                color: "text.primary",
                textAlign: "center",
              }}
            >
              قیمت واحد
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                color: "text.primary",
                textAlign: "center",
              }}
            >
              قیمت کل
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products?.map((product: any, index: number) => (
            <TableRow
              key={index}
              sx={{
                background: (theme) =>
                  theme.palette.mode === "dark" ? "transparent" : "transparent",
                "&:nth-of-type(odd)": {
                  background: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(0,0,0,0.02)",
                },
                "&:hover": {
                  background: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                },
              }}
            >
              <TableCell sx={{ color: "text.primary", textAlign: "left" }}>
                {product.productName}
              </TableCell>
              <TableCell sx={{ color: "text.primary", textAlign: "center" }}>
                {product.quantity}
              </TableCell>
              <TableCell sx={{ color: "text.primary", textAlign: "center" }}>
                {product.countryName}
              </TableCell>
              <TableCell sx={{ color: "text.primary", textAlign: "center" }}>
                {product.brand}
              </TableCell>
              <TableCell sx={{ color: "text.primary", textAlign: "center" }}>
                {product.unitPrice?.toLocaleString()}
              </TableCell>
              <TableCell sx={{ color: "text.primary", textAlign: "center" }}>
                {product.finalPrice?.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileProductCard = (products: any[]) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {products?.map((product: any, index: number) => (
        <Card
          key={index}
          sx={{
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)"
                : "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            border: (theme) =>
              theme.palette.mode === "dark"
                ? "1px solid #404040"
                : "1px solid #dee2e6",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            "&:hover": {
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              transform: "translateY(-1px)",
              transition: "all 0.2s ease-in-out",
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  نام کالا:
                </Typography>
                <Typography
                  variant="body1"
                  color="text.primary"
                  fontWeight="medium"
                >
                  {product.productName}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  تعداد:
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {product.quantity}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  کشور:
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {product.countryName}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  برند:
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {product.brand}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  قیمت واحد:
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {product.unitPrice?.toLocaleString()}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  قیمت کل:
                </Typography>
                <Typography
                  variant="body1"
                  color="text.primary"
                  fontWeight="medium"
                >
                  {product.finalPrice?.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
          pb: 2,
        }}
      >
        <Typography variant="h6" component="div">
          جزئیات فاکتور محصولات
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: isMobile ? 2 : 3, overflow: "auto" }}>
        {isLoadingRepairReceptionSummary ? (
          <Loading />
        ) : (
          <Box>
            {renderCustomerInfo()}

            <Grid container spacing={3}>
              {/* Pre-factors Section */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card
                  sx={{
                    background: (theme) =>
                      theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)"
                        : "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    border: (theme) =>
                      theme.palette.mode === "dark"
                        ? "1px solid #404040"
                        : "1px solid #dee2e6",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: 1,
                        borderColor: "divider",
                        background:
                          "linear-gradient(135deg, #aa8c78 0%, #98877b 100%)",
                        color: "white",
                        borderRadius: "8px 8px 0 0",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          fontWeight: 600,
                        }}
                      >
                        <ReceiptIcon sx={{ color: "white" }} />
                        لیست کالاها و پیش فاکتور ها
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      {repairReceptionSummaryData?.preFactors &&
                        repairReceptionSummaryData.preFactors.length > 0 && (
                          <Accordion defaultExpanded sx={{ boxShadow: "none" }}>
                            {repairReceptionSummaryData.preFactors.map(
                              (preFactor: IOrdersType, index: number) => (
                                <Accordion
                                  key={index}
                                  sx={{
                                    mb: 0.5, // 4px spacing between accordions
                                    "&:not(:last-child)": {
                                      mb: 0.5, // 4px spacing between accordions
                                    },
                                  }}
                                >
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight="medium"
                                    >
                                      شماره پیش فاکتور: {preFactor?.code}
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    {isMobile
                                      ? renderMobileProductCard(
                                          preFactor?.orderDetails
                                        )
                                      : renderProductTable(
                                          preFactor?.orderDetails
                                        )}
                                  </AccordionDetails>
                                </Accordion>
                              )
                            )}
                          </Accordion>
                        )}

                      <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            کالاهای فاکتور نشده
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {repairReceptionSummaryData?.nonFactoredDetails
                            ?.length > 0 ? (
                            isMobile ? (
                              renderMobileProductCard(
                                repairReceptionSummaryData?.nonFactoredDetails
                              )
                            ) : (
                              renderProductTable(
                                repairReceptionSummaryData?.nonFactoredDetails
                              )
                            )
                          ) : (
                            <EmptyList />
                          )}
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Factors Section */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card
                  sx={{
                    background: (theme) =>
                      theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)"
                        : "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    border: (theme) =>
                      theme.palette.mode === "dark"
                        ? "1px solid #404040"
                        : "1px solid #dee2e6",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: 1,
                        borderColor: "divider",
                        background:
                          "linear-gradient(135deg, #42a68c 0%, #3a8f7a 100%)",
                        color: "white",
                        borderRadius: "8px 8px 0 0",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          fontWeight: 600,
                        }}
                      >
                        <InventoryIcon sx={{ color: "white" }} />
                        لیست فاکتور ها
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      {repairReceptionSummaryData?.factors &&
                        repairReceptionSummaryData.factors.length > 0 && (
                          <Accordion defaultExpanded sx={{ boxShadow: "none" }}>
                            {repairReceptionSummaryData.factors.map(
                              (factor: IOrdersType, index: number) => (
                                <Accordion
                                  key={index}
                                  sx={{
                                    mb: 0.5, // 4px spacing between accordions
                                    "&:not(:last-child)": {
                                      mb: 0.5, // 4px spacing between accordions
                                    },
                                  }}
                                >
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight="medium"
                                    >
                                      شماره فاکتور: {factor?.code}
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    {isMobile
                                      ? renderMobileProductCard(
                                          factor?.orderDetails
                                        )
                                      : renderProductTable(
                                          factor?.orderDetails
                                        )}

                                    {factor?.files &&
                                      factor.files.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                          <Typography
                                            variant="subtitle2"
                                            sx={{ mb: 1 }}
                                          >
                                            فایل های پیوست:
                                          </Typography>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              flexWrap: "wrap",
                                              gap: 1,
                                            }}
                                          >
                                            {factor.files.map(
                                              (file: any, index: number) => (
                                                <Chip
                                                  key={index}
                                                  label={
                                                    file.fileName ||
                                                    `فایل ${index + 1}`
                                                  }
                                                  variant="outlined"
                                                  size="small"
                                                  color="primary"
                                                />
                                              )
                                            )}
                                          </Box>
                                        </Box>
                                      )}
                                  </AccordionDetails>
                                </Accordion>
                              )
                            )}
                          </Accordion>
                        )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductFactorModal;
