import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Grid2 as Grid,
  useMediaQuery,
  Typography,
  useTheme,
  Paper,
} from "@mui/material";
import {
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
  Box,
} from "@mui/material";

import { getRepairProductFractionalsByPlate } from "@/service/repairProductFractional/repairProductFractional.service";
import {
  convertGeorginaToJalaliOnlyDayByNumber,
  parsePlateNumber,
} from "@/utils";
import {
  CreateProductRequestModal,
  PlateNumberDisplay,
  Loading,
  Button,
} from "@/components";

const ProductRequests: React.FC = () => {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: fractionalData, isLoading } = useQuery({
    queryKey: ["productFractionals"],
    queryFn: getRepairProductFractionalsByPlate,
  });

  const handleCreateRequestSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["productFractionals"] });
  };

  const renderTableRow = (product: any, index: number) => {
    return (
      <TableRow key={product.id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{product.productCode}</TableCell>
        <TableCell sx={{ width: "20%" }}>{product.productName}</TableCell>
        <TableCell>{product.quantity}</TableCell>
        <TableCell>
          {(() => {
            const plateData = parsePlateNumber(product.plateNumber);
            return plateData ? (
              <div
                style={{ transform: "scale(0.8)", transformOrigin: "center" }}
              >
                <PlateNumberDisplay
                  plateSection1={plateData.plateSection1}
                  plateSection2={plateData.plateSection2}
                  plateSection3={plateData.plateSection3}
                  plateSection4={plateData.plateSection4}
                />
              </div>
            ) : (
              product.plateNumber
            );
          })()}
        </TableCell>
        <TableCell>{product.userName || "-"}</TableCell>
        <TableCell>
          {convertGeorginaToJalaliOnlyDayByNumber(product.createDm) || "-"}
        </TableCell>
      </TableRow>
    );
  };

  const renderMobileCard = (product: any) => {
    return (
      <Grid key={product.id} size={{ xs: 12, sm: 6 }}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              {product.productName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              کد کالا: {product.productCode}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="body2">تعداد:</Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {product.quantity}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="body2">درخواست کننده:</Typography>
            <Typography variant="body1">{product.userName || "-"}</Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="body2">تاریخ:</Typography>
            <Typography variant="body1">
              {convertGeorginaToJalaliOnlyDayByNumber(product.createDm) || "-"}
            </Typography>
          </Box>

          {product.plateNumber && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                پلاک:
              </Typography>
              {(() => {
                const plateData = parsePlateNumber(product.plateNumber);
                return plateData ? (
                  <div
                    style={{
                      transform: "scale(0.8)",
                      transformOrigin: "center",
                    }}
                  >
                    <PlateNumberDisplay
                      plateSection1={plateData.plateSection1}
                      plateSection2={plateData.plateSection2}
                      plateSection3={plateData.plateSection3}
                      plateSection4={plateData.plateSection4}
                    />
                  </div>
                ) : (
                  <Typography variant="body1">{product.plateNumber}</Typography>
                );
              })()}
            </Box>
          )}
        </Paper>
      </Grid>
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  const products = fractionalData?.data || [];

  return (
    <>
      <Box className="product-requests-container mt-5">
        <Box className="mb-4 flex justify-start">
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="contained"
            color="secondary"
            size="large"
          >
            ایجاد درخواست کسری قطعه
          </Button>
        </Box>

        {products.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              هیچ درخواست کسری قطعه‌ای یافت نشد
            </Typography>
          </Paper>
        ) : (
          <>
            {isMobile ? (
              <Grid container spacing={3}>
                {products.map((product: any) =>
                  renderMobileCard(product?.products?.[0])
                )}
              </Grid>
            ) : (
              <TableContainer component={Paper} className="table-container">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ردیف</TableCell>
                      <TableCell>کد محصول</TableCell>
                      <TableCell>نام محصول</TableCell>
                      <TableCell>تعداد</TableCell>
                      <TableCell>پلاک</TableCell>
                      <TableCell>درخواست کننده</TableCell>
                      <TableCell>تاریخ ایجاد</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product: any, index: number) =>
                      renderTableRow(product?.products[0], index)
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Box>
      <CreateProductRequestModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateRequestSuccess}
      />
    </>
  );
};

export default ProductRequests;
