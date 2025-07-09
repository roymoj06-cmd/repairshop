import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useState, Dispatch, SetStateAction } from "react";
import { Add, Delete, Check } from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  DialogActions,
  DialogContent,
  useMediaQuery,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
  Button,
  Dialog,
  Box,
} from "@mui/material";

import { getCustomerProblems } from "@/service/repairServices/repairServices.service";
import {
  createMechanicProductRequest,
  deleteMechanicProductRequest,
  getMechanicProductRequest,
} from "@/service/RepairMechanicProductRequest/RepairMechanicProductRequest.service";
import { EnhancedInput, EnhancedSelect, Loading } from "@/components";

interface IRequestProductForInventoryModalProps {
  setShowModal: Dispatch<SetStateAction<boolean | undefined>>;
  repairReceptionId?: string;
  showModal: boolean;
}

interface LocalRequest extends ICreateMechanicProductRequest {
  isNew?: boolean;
}

const RequestProductForInventoryModal: FC<
  IRequestProductForInventoryModalProps
> = ({ repairReceptionId, setShowModal, showModal }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const queryClient = useQueryClient();

  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [localRequests, setLocalRequests] = useState<LocalRequest[]>([]);
  const { data: problems = [] } = useQuery({
    queryKey: ["customerProblems", repairReceptionId],
    queryFn: () =>
      getCustomerProblems({
        repairReceptionId: repairReceptionId || "",
        page: 1,
        size: 100,
      }),
    enabled: !!repairReceptionId,
    select: (data) =>
      data?.data?.values?.map((problem: any) => ({
        value: problem.id,
        label: problem.description,
      })) || [],
  });
  const { data: serverRequests = [], isLoading } = useQuery({
    queryKey: ["mechanicProductRequests", selectedProblem?.value],
    queryFn: () =>
      getMechanicProductRequest({
        page: 1,
        size: 100,
      }),
    enabled: !!selectedProblem?.value,
    select: (data) => data?.data?.values || [],
  });
  const allRequests = [
    ...serverRequests
      .filter((request: any) => request.problemId === selectedProblem?.value)
      .map((request: any) => ({
        ...request,
        isNew: false,
      })),
    ...localRequests,
  ];
  const createMutation = useMutation({
    mutationFn: createMechanicProductRequest,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["mechanicProductRequests"],
      });
      if (data?.isSuccess) {
        toast.success("درخواست با موفقیت ایجاد شد");
        setLocalRequests((prev) => prev.slice(0, -1));
      } else {
        toast.error(data?.message || "خطا در ایجاد درخواست");
      }
    },
    onError: () => {
      toast.error("خطا در ایجاد درخواست");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteMechanicProductRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mechanicProductRequests"],
      });
      toast.success("درخواست با موفقیت حذف شد");
    },
    onError: () => {
      toast.error("خطا در حذف درخواست");
    },
  });
  const addRequest = () => {
    if (!selectedProblem) {
      toast.error("لطفاً ابتدا مشکل مورد نظر را انتخاب کنید");
      return;
    }
    const newRequest: LocalRequest = {
      productTitle: "",
      problemId: selectedProblem.value,
      fileId: 0, // Assuming fileId is optional or will be handled later
      isNew: true,
    };
    setLocalRequests([...localRequests, newRequest]);
  };
  const updateRequestTitle = (index: number, productTitle: string) => {
    const isLocalRequest = index >= serverRequests.length;
    if (isLocalRequest) {
      const localIndex = index - serverRequests.length;
      const newLocalRequests = [...localRequests];
      newLocalRequests[localIndex] = {
        ...newLocalRequests[localIndex],
        productTitle,
      };
      setLocalRequests(newLocalRequests);
    }
  };
  const getRequestTitle = (index: number) => {
    const isLocalRequest = index >= serverRequests.length;
    if (isLocalRequest) {
      const localIndex = index - serverRequests.length;
      return localRequests[localIndex]?.productTitle || "";
    } else {
      return serverRequests[index]?.productTitle || "";
    }
  };
  const hasChanges = (index: number) => {
    const isLocalRequest = index >= serverRequests.length;
    if (isLocalRequest) {
      const localIndex = index - serverRequests.length;
      return localRequests[localIndex]?.productTitle?.trim() || false;
    }
    return false;
  };
  const saveRequest = async (index: number) => {
    const isLocalRequest = index >= serverRequests.length;
    if (isLocalRequest) {
      const localIndex = index - serverRequests.length;
      const request = localRequests[localIndex];
      if (!request.productTitle.trim()) {
        toast.error("لطفاً عنوان کالا را وارد کنید");
        return;
      }
      createMutation.mutate({
        productTitle: request.productTitle,
        problemId: request.problemId,
        fileId: request.fileId,
      });
    }
  };
  const removeRequest = async (index: number) => {
    const isLocalRequest = index >= serverRequests.length;
    if (isLocalRequest) {
      const localIndex = index - serverRequests.length;
      const newLocalRequests = localRequests.filter((_, i) => i !== localIndex);
      setLocalRequests(newLocalRequests);
      return;
    }
    const request = serverRequests[index];
    if (!request.id) return;
    if (
      window.confirm("آیا مطمئن هستید که می‌خواهید این درخواست را حذف کنید؟")
    ) {
      deleteMutation.mutate(request.id);
    }
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProblem(null);
    setLocalRequests([]);
  };

  return (
    <Dialog
      open={showModal}
      fullWidth
      maxWidth={isMobile ? "xs" : "md"}
      fullScreen={isMobile}
    >
      {(createMutation.isPending || deleteMutation.isPending) && <Loading />}

      <DialogTitle
        sx={{
          pb: isMobile ? 1 : 2,
          fontSize: isMobile ? "1.1rem" : "1.25rem",
        }}
      >
        درخواست کالا از انبار
      </DialogTitle>

      <DialogContent
        sx={{
          pt: isMobile ? "5px !important" : "10px !important",
          px: isMobile ? 2 : 3,
        }}
      >
        <Box sx={{ py: isMobile ? 1 : 2 }}>
          <EnhancedSelect
            onChange={(value) => {
              setSelectedProblem(value);
              setLocalRequests([]);
            }}
            placeholder="مشکل مورد نظر را انتخاب کنید"
            value={selectedProblem}
            label="انتخاب مشکل"
            options={problems}
            name="problemId"
            searchable
          />
        </Box>

        {selectedProblem && (
          <Box sx={{ mt: 2 }}>
            <Box className="mb-2 flex justify-between items-center">
              <Typography variant="subtitle1">درخواست‌های کالا</Typography>
              <Button
                startIcon={<Add />}
                variant="outlined"
                onClick={addRequest}
                size="small"
                disabled={
                  isLoading ||
                  createMutation.isPending ||
                  deleteMutation.isPending
                }
              >
                افزودن درخواست کالا
              </Button>
            </Box>

            {allRequests.map((request, index) => {
              const needsSaving = hasChanges(index);
              return (
                <Box
                  key={request.id || `new-${index}`}
                  className="flex items-start mb-3"
                >
                  <EnhancedInput
                    onChange={(e) => updateRequestTitle(index, e.target.value)}
                    label={`کالای درخواستی ${index + 1}`}
                    value={getRequestTitle(index)}
                    name={`request-${index}`}
                    enableSpeechToText
                    fullWidth
                    disabled={
                      createMutation.isPending ||
                      deleteMutation.isPending ||
                      !request.isNew
                    }
                  />
                  {needsSaving && (
                    <IconButton
                      color="success"
                      onClick={() => saveRequest(index)}
                      sx={{ ml: 1, mt: 1 }}
                      disabled={
                        createMutation.isPending ||
                        deleteMutation.isPending ||
                        !getRequestTitle(index).trim()
                      }
                    >
                      <Check />
                    </IconButton>
                  )}
                  <IconButton
                    color="error"
                    onClick={() => removeRequest(index)}
                    sx={{ ml: 1, mt: 1 }}
                    disabled={
                      createMutation.isPending || deleteMutation.isPending
                    }
                  >
                    <Delete />
                  </IconButton>
                </Box>
              );
            })}

            {allRequests.length === 0 && (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textAlign: "center", py: 2 }}
              >
                هیچ درخواستی برای این مشکل ثبت نشده است
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: isMobile ? 2 : 3,
          pb: isMobile ? 2 : 3,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 1 : 0,
        }}
      >
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          fullWidth={isMobile}
          size={isMobile ? "large" : "medium"}
        >
          بستن
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestProductForInventoryModal;
