import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Cancel, CheckCircle } from "@mui/icons-material";
import { toast } from "react-toastify";
import { FC } from "react";
import {
  FormControlLabel,
  TableContainer,
  useMediaQuery,
  CardContent,
  Typography,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
  Switch,
  Paper,
  Stack,
  Table,
  Chip,
  Card,
  Box,
} from "@mui/material";

import { updateCustomerOldPartConfirmation } from "@/service/repairReceptionService/repairReceptionService.service";
import { getRepairReceptionForUpdateById } from "@/service/repair/repair.service";
import { Loading } from "@/components";

interface RepairReceptionOldPartProps {
  repairReceptionId?: string;
}

const RepairReceptionOldPart: FC<RepairReceptionOldPartProps> = ({
  repairReceptionId,
}) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { data: repairReception, isLoading: isLoadingRepairReception } =
    useQuery({
      queryKey: ["getRepairReceptionForUpdateById", repairReceptionId],
      queryFn: () =>
        getRepairReceptionForUpdateById(+(repairReceptionId || "")),
      enabled: !!repairReceptionId,
      select: (data) => data?.data || null,
    });
  const updateHasOldPartMutation = useMutation({
    mutationFn: async ({
      customerConfirmedOldPart,
      detailId,
      fileIds,
    }: {
      customerConfirmedOldPart: boolean;
      detailId: number;
      fileIds: number[];
    }) => {
      const response = await updateCustomerOldPartConfirmation({
        customerConfirmedOldPart,
        detailId,
        fileIds,
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data.isSuccess) {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: ["getRepairReceptionForUpdateById"],
        });
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "خطا در آپدیت وضعیت قطعه قدیمی");
    },
  });
  const handleOldPartStatusChange = (detailId: number, hasOldPart: boolean) => {
    updateHasOldPartMutation.mutate({
      customerConfirmedOldPart: hasOldPart,
      detailId,
      fileIds: [],
    });
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
        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}>
          <FormControlLabel
            control={
              <Switch
                checked={product.CustomerConfirmedOldPart || false}
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
                {product.CustomerConfirmedOldPart ? (
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
              نام کالا
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              شماره فنی
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              برند / کشور
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              قطعه قدیمی
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {repairReception?.details?.map((product: any, index: number) => (
            <TableRow key={product.repairReceptionDetailId} hover>
              <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "medium" }}>
                {product.productName}
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                {product.partNumber || "-"}
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                {product.brand} / {product.countryName}
              </TableCell>
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
                    checked={product.CustomerConfirmedOldPart || false}
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
                  {product.CustomerConfirmedOldPart ? (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  return (
    <>
      {isLoadingRepairReception && <Loading />}
      {isMobile || isTablet ? (
        <Box>
          {repairReception?.details.map((product: any, index: number) => (
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
  );
};

export default RepairReceptionOldPart;
