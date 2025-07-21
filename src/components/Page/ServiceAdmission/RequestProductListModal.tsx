import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dispatch, FC, SetStateAction, useState } from "react";
import {
  DialogActions,
  DialogContent,
  useMediaQuery,
  DialogTitle,
  CardContent,
  Typography,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  useTheme,
  Dialog,
  Button,
  Table,
  Stack,
  Card,
  Chip,
  Box,
} from "@mui/material";

import { getAllRepairProductRequestsByReceptionId } from "@/service/repairProductRequest/repairProductRequest.service";
import { Loading, RequestProductDetailsModal } from "@/components";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";

interface IRequestProductListModalProps {
  setShowModal: Dispatch<SetStateAction<boolean | undefined>>;
  repairReceptionId?: string;
  showModal: boolean;
  onRefresh?: () => void;
}

const RequestProductListModal: FC<IRequestProductListModalProps> = ({
  repairReceptionId,
  setShowModal,
  showModal,
  onRefresh,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProblem, setSelectedProblem] =
    useState<IGetAllRepairProductRequestsByReceptionId | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingGetAllRepairProductRequestsByReceptionId,
    data: dataGetAllRepairProductRequestsByReceptionId,
  } = useQuery({
    queryKey: ["repairReceptionId", repairReceptionId],
    queryFn: () => getAllRepairProductRequestsByReceptionId(repairReceptionId),
    enabled: !!repairReceptionId,
  });

  const handleViewDetails = (
    problem: IGetAllRepairProductRequestsByReceptionId
  ) => {
    setSelectedProblem(problem);
    setShowDetailsModal(true);
  };

  const handleSuccess = async () => {
    // Invalidate and refetch all related queries to refresh the data
    queryClient.invalidateQueries({
      queryKey: ["repairReceptionId", repairReceptionId],
    });
    queryClient.invalidateQueries({
      queryKey: ["getAllProductRequestsByReceptionId", repairReceptionId],
    });
    queryClient.invalidateQueries({
      queryKey: ["getAllRepairProductRequestsByReceptionId", repairReceptionId],
    });
    const newData = await queryClient.fetchQuery({
      queryKey: ["repairReceptionId", repairReceptionId],
      queryFn: () =>
        getAllRepairProductRequestsByReceptionId(repairReceptionId),
    });
    if (selectedProblem && newData?.data) {
      const updatedProblem = newData.data.find(
        (problem: IGetAllRepairProductRequestsByReceptionId) =>
          problem.repairCustomerProblemId ===
          selectedProblem.repairCustomerProblemId
      );
      if (updatedProblem) {
        setSelectedProblem(updatedProblem);
      }
    }
    onRefresh?.();
  };

  const renderMobileCard = (
    problem: IGetAllRepairProductRequestsByReceptionId
  ) => (
    <Card key={problem.repairCustomerProblemId} sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Box
            justifyContent="space-between"
            alignItems="center"
            display="flex"
          >
            <Typography variant="body2" color="text.secondary">
              مشکل : {problem.problemDescription}
            </Typography>
            <Chip
              label={`${problem.repairProductRequestDto?.length || 0} کالا`}
              sx={{ padding: "8px" }}
              variant="outlined"
              color="primary"
              size="small"
            />
          </Box>
          <Box display="flex" justifyContent="flex-end">
            <AccessGuard accessId={ACCESS_IDS.VIEW_REQUESTS}>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => handleViewDetails(problem)}
                sx={{
                  minWidth: "100px",
                  fontSize: "0.875rem",
                  py: 0.5,
                }}
              >
                مشاهده جزئیات
              </Button>
            </AccessGuard>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderTable = () => (
    <Table
      sx={{
        minWidth: isTablet ? 300 : 650,
        "& .MuiTableCell-root": {
          fontSize: isTablet ? "0.875rem" : "1rem",
          padding: isTablet ? "8px 4px" : "16px",
        },
      }}
    >
      <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
        <TableRow>
          <TableCell sx={{ width: isTablet ? "40px" : "60px" }}>ردیف</TableCell>
          <TableCell sx={{ textAlign: "center" }}>عنوان مشکل</TableCell>
          <TableCell
            sx={{ textAlign: "center", width: isTablet ? "100px" : "150px" }}
          >
            تعداد کالاها
          </TableCell>
          <TableCell
            sx={{ textAlign: "center", width: isTablet ? "80px" : "120px" }}
          >
            عملیات
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {dataGetAllRepairProductRequestsByReceptionId?.data?.map(
          (
            problem: IGetAllRepairProductRequestsByReceptionId,
            index: number
          ) => (
            <TableRow key={problem.repairCustomerProblemId}>
              <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{
                    maxWidth: isTablet ? "200px" : "300px",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    lineHeight: 1.4,
                  }}
                >
                  {problem.problemDescription}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                <Chip
                  label={problem.repairProductRequestDto?.length || 0}
                  variant="outlined"
                  color="primary"
                  size="small"
                />
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                <AccessGuard accessId={ACCESS_IDS.VIEW_REQUESTS}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => handleViewDetails(problem)}
                    sx={{
                      fontSize: isTablet ? "0.75rem" : "0.875rem",
                      minWidth: isTablet ? "60px" : "80px",
                      py: isTablet ? 0.5 : 1,
                    }}
                  >
                    مشاهده
                  </Button>
                </AccessGuard>
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Dialog
        maxWidth={isMobile ? "xs" : isTablet ? "md" : "lg"}
        fullScreen={isMobile}
        open={showModal}
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            margin: isMobile ? "16px" : "24px",
            maxHeight: isMobile ? "calc(100% - 32px)" : "calc(100% - 48px)",
          },
        }}
      >
        {isLoadingGetAllRepairProductRequestsByReceptionId && <Loading />}
        <DialogTitle
          sx={{
            pb: isMobile ? 1 : 2,
            fontSize: isMobile ? "1.1rem" : "1.25rem",
          }}
        >
          لیست درخواست های قطعه
        </DialogTitle>
        <DialogContent
          sx={{
            pt: isMobile ? "8px !important" : "10px !important",
            px: isMobile ? 1 : 2,
            pb: isMobile ? 1 : 2,
          }}
        >
          {isMobile ? (
            <Box>
              {dataGetAllRepairProductRequestsByReceptionId?.data?.map(
                (problem: IGetAllRepairProductRequestsByReceptionId) =>
                  renderMobileCard(problem)
              )}
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>{renderTable()}</Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: isMobile ? 2 : 3,
            pb: isMobile ? 2 : 3,
          }}
        >
          <Button
            onClick={() => setShowModal(false)}
            variant="outlined"
            fullWidth={isMobile}
            sx={{
              minWidth: isMobile ? "auto" : "100px",
            }}
          >
            بستن
          </Button>
        </DialogActions>
      </Dialog>

      <RequestProductDetailsModal
        setShowDetailsModal={setShowDetailsModal}
        showDetailsModal={showDetailsModal}
        selectedProblem={selectedProblem}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default RequestProductListModal;
