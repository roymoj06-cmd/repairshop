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
} from "@/service/RepairMechanicProductRequest/RepairMechanicProductRequest.service";
import { EnhancedInput, EnhancedSelect, Loading, FileUploader } from "@/components";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";
import { useFileUpload } from "@/hooks/useFileUpload";

interface IRequestProductForInventoryModalProps {
  setShowModal: Dispatch<SetStateAction<boolean | undefined>>;
  repairReceptionId?: string;
  showModal: boolean;
}

interface LocalRequest extends ICreateMechanicProductRequest {
  isNew?: boolean;
  uploadedFiles?: File[];
}

const RequestProductForInventoryModal: FC<
  IRequestProductForInventoryModalProps
> = ({ repairReceptionId, setShowModal, showModal }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const queryClient = useQueryClient();

  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [localRequests, setLocalRequests] = useState<LocalRequest[]>([]);

  // File upload hook
  const { upload, isUploading } = useFileUpload({
    fileSource: 1, // Assuming 1 is for mechanic product requests
    onSuccess: (response) => {
      if (response?.isSuccess) {
        toast.success("فایل با موفقیت آپلود شد");
      } else {
        toast.error(response?.message || "خطا در آپلود فایل");
      }
    },
    onError: () => {
      toast.error("خطا در آپلود فایل");
    },
  });

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
  // Remove server requests query - we don't need to show existing requests
  const allRequests = localRequests.map((request: any) => ({
    ...request,
    isNew: true,
  }));
  const createMutation = useMutation({
    mutationFn: createMechanicProductRequest,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["mechanicProductRequests"],
      });
      if (data?.isSuccess) {
        toast.success("درخواست با موفقیت ایجاد شد");
        setLocalRequests([]);
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
      fileId: 0,
      isNew: true,
      uploadedFiles: [],
    };
    setLocalRequests([...localRequests, newRequest]);
  };
  const updateRequestTitle = (index: number, productTitle: string) => {
    const newLocalRequests = [...localRequests];
    newLocalRequests[index] = {
      ...newLocalRequests[index],
      productTitle,
    };
    setLocalRequests(newLocalRequests);
  };

  const updateRequestFiles = (index: number, files: File[]) => {
    const newLocalRequests = [...localRequests];
    newLocalRequests[index] = {
      ...newLocalRequests[index],
      uploadedFiles: files,
    };
    setLocalRequests(newLocalRequests);
  };

  const getRequestTitle = (index: number) => {
    return localRequests[index]?.productTitle || "";
  };

  const getRequestFiles = (index: number) => {
    return localRequests[index]?.uploadedFiles || [];
  };

  const hasChanges = (index: number) => {
    return localRequests[index]?.productTitle?.trim() || false;
  };
  const saveRequest = async (index: number) => {
    const request = localRequests[index];
    if (!request.productTitle.trim()) {
      toast.error("لطفاً عنوان کالا را وارد کنید");
      return;
    }

    let fileId = 0;

    // Upload file if exists
    if (request.uploadedFiles && request.uploadedFiles.length > 0) {
      try {
        const uploadResponse = await upload(request.uploadedFiles[0]);
        if (uploadResponse?.isSuccess) {
          fileId = uploadResponse.data.id;
        }
      } catch (error) {
        toast.error("خطا در آپلود فایل");
        return;
      }
    }

    createMutation.mutate({
      productTitle: request.productTitle,
      problemId: request.problemId,
      fileId: fileId,
    });
  };
  const removeRequest = async (index: number) => {
    const newLocalRequests = localRequests.filter((_, i) => i !== index);
    setLocalRequests(newLocalRequests);
  };
  const handleCloseModal = () => {
    setSelectedProblem(null);
    setLocalRequests([]);
    setShowModal(false);
  };

  return (
    <Dialog
      open={showModal}
      fullWidth
      maxWidth={isMobile ? "xs" : "md"}
      fullScreen={isMobile}
    >
      {(createMutation.isPending || deleteMutation.isPending || isUploading) && <Loading />}

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
              <AccessGuard accessId={ACCESS_IDS.MECHANIC_PART_REQUEST}>
                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  onClick={addRequest}
                  size="small"
                  disabled={
                    createMutation.isPending || deleteMutation.isPending
                  }
                >
                  افزودن درخواست کالا
                </Button>
              </AccessGuard>
            </Box>

            {allRequests.map((request, index) => {
              const needsSaving = hasChanges(index);
              return (
                <Box
                  key={request.id || `new-${index}`}
                  className="flex flex-col mb-4 p-3 border rounded-md"
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
                      !request.isNew ||
                      isUploading
                    }
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      آپلود تصویر (اختیاری)
                    </Typography>
                    <FileUploader
                      files={getRequestFiles(index)}
                      onFilesChange={(files) => updateRequestFiles(index, files)}
                      accept="image/*"
                      multiple={false}
                      maxFiles={1}
                      label="تصویر کالای درخواستی را انتخاب کنید"
                    />
                  </Box>

                  <Box className="flex justify-end gap-2">
                    {needsSaving && (
                      <IconButton
                        color="success"
                        onClick={() => saveRequest(index)}
                        disabled={
                          createMutation.isPending ||
                          deleteMutation.isPending ||
                          isUploading ||
                          !getRequestTitle(index).trim()
                        }
                      >
                        <Check />
                      </IconButton>
                    )}
                    <IconButton
                      color="error"
                      onClick={() => removeRequest(index)}
                      disabled={
                        createMutation.isPending || 
                        deleteMutation.isPending ||
                        isUploading
                      }
                    >
                      <Delete />
                    </IconButton>
                  </Box>
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
