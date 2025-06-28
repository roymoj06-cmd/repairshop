import { FC } from "react";
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Table,
  Button,
  TableContainer,
  Paper,
  useTheme,
  useMediaQuery,
  Box,
} from "@mui/material";

interface IRequestProductDetailsModalProps {
  setShowDetailsModal: (show: boolean) => void;
  showDetailsModal: boolean;
  selectedProblem: {
    repairCustomerProblemId: number;
    problemDescription: string;
    repairProductRequestDto: Array<{
      repairCustomerProblemId: number;
      requestedByUserName: string;
      problemDescription: string;
      reviewedByUserName: string;
      statusDescription: string;
      requestedByUserId: number;
      reviewedByUserId: number;
      reviewedDate: string;
      rejectReason: string;
      productCode: string;
      productName: string;
      requestedId: number;
      createDate: string;
      productId: number;
      isAccepted: boolean;
      country: string;
      status: number;
      brand: string;
      qty: number;
    }>;
  } | null;
}

const RequestProductDetailsModal: FC<IRequestProductDetailsModalProps> = ({
  setShowDetailsModal,
  showDetailsModal,
  selectedProblem,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      // onClose={() => setShowDetailsModal(false)}
      maxWidth={isMobile ? "xs" : "xl"}
      open={showDetailsModal}
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          margin: isMobile ? 1 : isTablet ? 1 : 2,
          maxHeight: isMobile ? "90vh" : "95vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: isMobile ? "1rem" : "1.25rem",
          padding: isMobile ? "12px 16px" : "16px 24px",
          lineHeight: 1.2,
        }}
      >
        جزئیات درخواست قطعه برای مشکل
        {` : ${selectedProblem?.problemDescription}`}
      </DialogTitle>
      <DialogContent
        sx={{
          pt: "10px !important",
          padding: isMobile ? "8px" : "16px",
          overflow: "auto",
        }}
      >
        {isMobile ? (
          // Mobile Card Layout
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {selectedProblem?.repairProductRequestDto?.map((product, index) => (
              <Paper
                key={product.requestedId}
                elevation={2}
                sx={{
                  p: 2,
                  padding: "8px 10px",
                  borderRadius: 2,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* <Box sx={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                      ردیف {index + 1}
                    </Box> */}
                    <Box
                      sx={{
                        color: product.isAccepted ? "green" : "red",
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                      }}
                    >
                      {product.statusDescription}
                    </Box>
                  </Box>
                  <Box sx={{ fontSize: "0.85rem" }}>
                    <strong>نام کالا :</strong> {product.productName}
                  </Box>
                  <Box sx={{ fontSize: "0.85rem" }}>
                    <strong>کد کالا :</strong> {product.productCode}
                  </Box>
                  <Box sx={{ fontSize: "0.85rem" }}>
                    <strong>موجودی :</strong> _
                  </Box>
                  <Box sx={{ fontSize: "0.85rem" }}>
                    <strong>تعداد :</strong> {product.qty}
                  </Box>
                  <Box sx={{ fontSize: "0.85rem" }}>
                    <strong>برند / کشور :</strong> {product?.brand} /{" "}
                    {product?.country}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      marginTop: 1.5,
                      justifyContent: "flex-start",
                    }}
                  >
                    <Button
                      // onClick={() => setShowProductRequestModal(true)}
                      variant="contained"
                      color="secondary"
                      size="small"
                      sx={{ fontSize: "0.75rem", minWidth: "60px" }}
                    >
                      کسری
                    </Button>
                    <Button
                      // onClick={() => setShowProductRequestListModal(true)}
                      variant="contained"
                      color="secondary"
                      size="small"
                      sx={{ fontSize: "0.75rem", minWidth: "60px" }}
                    >
                      رد
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          // Desktop/Tablet Table Layout
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: "60vh",
              overflow: "auto",
              width: "100%",
            }}
          >
            <Table
              size={isTablet ? "small" : "medium"}
              sx={{
                minWidth: isTablet ? 650 : 750,
                tableLayout: "auto",
              }}
            >
              <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontSize: isTablet ? "0.8rem" : "0.875rem",
                      minWidth: 50,
                    }}
                  >
                    ردیف
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontSize: isTablet ? "0.8rem" : "0.875rem",
                      minWidth: isTablet ? 100 : 150,
                      maxWidth: isTablet ? 140 : 200,
                    }}
                  >
                    نام کالا
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontSize: isTablet ? "0.8rem" : "0.875rem",
                      minWidth: isTablet ? 80 : 120,
                      maxWidth: isTablet ? 100 : 140,
                    }}
                  >
                    کد کالا
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontSize: isTablet ? "0.8rem" : "0.875rem",
                      minWidth: isTablet ? 60 : 80,
                      maxWidth: isTablet ? 80 : 100,
                    }}
                  >
                    موجودی
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontSize: isTablet ? "0.8rem" : "0.875rem",
                      minWidth: isTablet ? 50 : 70,
                      maxWidth: isTablet ? 70 : 90,
                    }}
                  >
                    تعداد
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontSize: isTablet ? "0.8rem" : "0.875rem",
                      minWidth: isTablet ? 100 : 120,
                      maxWidth: isTablet ? 130 : 160,
                    }}
                  >
                    برند / کشور
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontSize: isTablet ? "0.8rem" : "0.875rem",
                      minWidth: isTablet ? 140 : 160,
                      maxWidth: isTablet ? 160 : 200,
                    }}
                  >
                    عملیات
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedProblem?.repairProductRequestDto?.map(
                  (product, index) => (
                    <TableRow key={product.requestedId}>
                      <TableCell
                        sx={{
                          textAlign: "left",
                          fontSize: isTablet ? "0.75rem" : "0.875rem",
                        }}
                      >
                        {index + 1}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          fontSize: isTablet ? "0.75rem" : "0.875rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {product.productName}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          fontSize: isTablet ? "0.75rem" : "0.875rem",
                        }}
                      >
                        {product.productCode}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          fontSize: isTablet ? "0.75rem" : "0.875rem",
                        }}
                      >
                        _
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          fontSize: isTablet ? "0.75rem" : "0.875rem",
                        }}
                      >
                        {product.qty}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          fontSize: isTablet ? "0.75rem" : "0.875rem",
                        }}
                      >
                        {product?.brand} / {product?.country}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          padding: isTablet ? "4px" : "16px",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: isTablet ? 0.5 : 1,
                            justifyContent: "center",
                            flexWrap: isTablet ? "wrap" : "nowrap",
                          }}
                        >
                          <Button
                            // onClick={() => setShowProductRequestModal(true)}
                            variant="contained"
                            color="secondary"
                            size={isTablet ? "small" : "small"}
                            sx={{
                              fontSize: isTablet ? "0.7rem" : "0.75rem",
                              minWidth: isTablet ? "50px" : "60px",
                              padding: isTablet ? "4px 8px" : "6px 12px",
                            }}
                          >
                            کسری
                          </Button>
                          <Button
                            // onClick={() => setShowProductRequestListModal(true)}
                            variant="contained"
                            color="secondary"
                            size={isTablet ? "small" : "small"}
                            sx={{
                              fontSize: isTablet ? "0.7rem" : "0.75rem",
                              minWidth: isTablet ? "50px" : "60px",
                              padding: isTablet ? "4px 8px" : "6px 12px",
                            }}
                          >
                            رد
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          padding: isMobile ? "8px 16px" : "16px 24px",
        }}
      >
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
