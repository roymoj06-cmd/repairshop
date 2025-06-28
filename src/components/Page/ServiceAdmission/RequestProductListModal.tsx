import { Dispatch, FC, SetStateAction, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Dialog,
  Button,
  Table,
  useTheme,
  useMediaQuery,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material";

import { getAllRepairProductRequestsByReceptionId } from "@/service/repairProductRequest/repairProductRequest.service";
import { Loading, RequestProductDetailsModal } from "@/components";

interface IRequestProductListModalProps {
  setShowModal: Dispatch<SetStateAction<boolean | undefined>>;
  repairReceptionId?: string;
  showModal: boolean;
}
interface IGetAllRepairProductRequestsByReceptionId {
  repairCustomerProblemId: number;
  problemDescription: string;
  repairProductRequestDto: [
    {
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
      isAccepted: true;
      country: string;
      status: number;
      brand: string;
      qty: number;
    }
  ];
}
const RequestProductListModal: FC<IRequestProductListModalProps> = ({
  repairReceptionId,
  setShowModal,
  showModal,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProblem, setSelectedProblem] =
    useState<IGetAllRepairProductRequestsByReceptionId | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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

  const renderMobileCard = (
    problem: IGetAllRepairProductRequestsByReceptionId
  ) => (
    <Card key={problem.repairCustomerProblemId} sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
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
        // onClose={() => setShowModal(false)}
        open={showModal}
        fullWidth
        fullScreen={isMobile}
        maxWidth={isMobile ? "xs" : isTablet ? "md" : "lg"}
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
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        selectedProblem={selectedProblem}
      />
    </>
  );
};

export default RequestProductListModal;
