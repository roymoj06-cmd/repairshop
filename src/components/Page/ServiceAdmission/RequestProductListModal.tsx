import { Dispatch, FC, SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  Box,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Table,
} from "@mui/material";

import { getAllRepairProductRequestsByReceptionId } from "@/service/repairProductRequest/repairProductRequest.service";
import { Loading } from "@/components";

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
      status: number;
      qty: number;
    }
  ];
}
const RequestProductListModal: FC<IRequestProductListModalProps> = ({
  repairReceptionId,
  setShowModal,
  showModal,
}) => {
  const {
    isLoading: isLoadingGetAllRepairProductRequestsByReceptionId,
    data: dataGetAllRepairProductRequestsByReceptionId,
  } = useQuery({
    queryKey: ["customerProblems", repairReceptionId],
    queryFn: () => getAllRepairProductRequestsByReceptionId(repairReceptionId),
    enabled: !!repairReceptionId,
  });
  console.log(dataGetAllRepairProductRequestsByReceptionId);
  return (
    <Dialog
      onClose={() => setShowModal(false)}
      open={showModal}
      fullWidth
      maxWidth="lg"
    >
      {isLoadingGetAllRepairProductRequestsByReceptionId && <Loading />}
      <DialogTitle>لیست درخواست های قطعه</DialogTitle>
      <DialogContent sx={{ pt: "10px !important" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell>ردیف</TableCell>
              <TableCell sx={{ textAlign: "center" }}>عنوان مشکل</TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                تعداد کالاهای درخوساتی
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataGetAllRepairProductRequestsByReceptionId?.data?.map(
              (
                problem: IGetAllRepairProductRequestsByReceptionId,
                index: number
              ) => (
                <TableRow key={problem.repairCustomerProblemId}>
                  <TableCell sx={{ textAlign: "left" }}>{index + 1}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {problem.problemDescription}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>مشاهده</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
};

export default RequestProductListModal;
