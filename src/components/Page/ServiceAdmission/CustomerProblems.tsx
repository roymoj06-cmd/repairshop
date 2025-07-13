import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, IconButton, Typography } from "@mui/material";
import { Add, Delete, Check } from "@mui/icons-material";
import { FC, useState } from "react";
import { toast } from "react-toastify";

import { Button, EnhancedInput } from "@/components";
import {
  createCustomerProblem,
  updateCustomerProblem,
  deleteCustomerProblem,
  getCustomerProblems,
} from "@/service/repairServices/repairServices.service";
import {
  useAccessControl,
  ACCESS_IDS,
  AccessGuard,
} from "@/utils/accessControl";

interface ICustomerProblemsProps {
  repairReceptionId?: string;
}

interface LocalProblem extends ICreateOrUpdateCustomerProblem {
  hasChanges?: boolean;
  isNew?: boolean;
}

interface ServerProblemChange {
  originalDescription: string;
  currentDescription: string;
  id: string;
}

const CustomerProblems: FC<ICustomerProblemsProps> = ({
  repairReceptionId,
}) => {
  const { hasAccess } = useAccessControl();
  const queryClient = useQueryClient();
  const [localProblems, setLocalProblems] = useState<LocalProblem[]>([]);
  const [serverProblemChanges, setServerProblemChanges] = useState<
    ServerProblemChange[]
  >([]);

  const { data: serverProblems = [], isLoading } = useQuery({
    queryKey: ["customerProblems", repairReceptionId],
    queryFn: () =>
      getCustomerProblems({
        repairReceptionId: repairReceptionId || "",
        size: 100,
        page: 1,
      }),
    enabled: !!repairReceptionId,
    select: (data) => data?.data?.values || [],
  });

  const allProblems = [
    ...serverProblems.map((problem: any) => ({
      ...problem,
      isNew: false,
      hasChanges: false,
    })),
    ...localProblems,
  ];

  const createMutation = useMutation({
    mutationFn: createCustomerProblem,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["customerProblems", repairReceptionId],
      });
      if (data?.isSuccess) {
        toast.success("مشکل با موفقیت ایجاد شد");
        setLocalProblems((prev) => prev.slice(0, -1));
      } else {
        toast.error(data?.message || "خطا در ایجاد مشکل");
      }
    },
    onError: () => {
      toast.error("خطا در ایجاد مشکل");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCustomerProblem,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["customerProblems", repairReceptionId],
      });
      if (data?.isSuccess) {
        toast.success("مشکل با موفقیت بروزرسانی شد");
        // Clear the change tracking for this problem
        setServerProblemChanges((prev) =>
          prev.filter((change) => change.id !== data.data?.id)
        );
      } else {
        toast.error(data?.message || "خطا در بروزرسانی مشکل");
      }
    },
    onError: () => {
      toast.error("خطا در بروزرسانی مشکل");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomerProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customerProblems", repairReceptionId],
      });
      toast.success("مشکل با موفقیت حذف شد");
    },
    onError: () => {
      toast.error("خطا در حذف مشکل");
    },
  });

  const addProblem = () => {
    const newProblem: LocalProblem = {
      repairReceptionId: repairReceptionId || "",
      description: "",
      isNew: true,
    };
    setLocalProblems([...localProblems, newProblem]);
  };

  const updateProblemDescription = (index: number, description: string) => {
    const isLocalProblem = index >= serverProblems.length;
    if (isLocalProblem) {
      const localIndex = index - serverProblems.length;
      const newLocalProblems = [...localProblems];
      newLocalProblems[localIndex] = {
        ...newLocalProblems[localIndex],
        description,
      };
      setLocalProblems(newLocalProblems);
    } else {
      // Handle server problem changes
      const problem = serverProblems[index];
      const existingChange = serverProblemChanges.find(
        (change) => change.id === problem.id
      );

      if (existingChange) {
        // Update existing change
        setServerProblemChanges((prev) =>
          prev.map((change) =>
            change.id === problem.id
              ? { ...change, currentDescription: description }
              : change
          )
        );
      } else {
        // Create new change tracking
        setServerProblemChanges((prev) => [
          ...prev,
          {
            id: problem.id,
            originalDescription: problem.description,
            currentDescription: description,
          },
        ]);
      }
    }
  };

  const getProblemDescription = (index: number) => {
    const isLocalProblem = index >= serverProblems.length;
    if (isLocalProblem) {
      const localIndex = index - serverProblems.length;
      return localProblems[localIndex]?.description || "";
    } else {
      const problem = serverProblems[index];
      const change = serverProblemChanges.find((c) => c.id === problem.id);
      return change ? change.currentDescription : problem.description;
    }
  };

  const hasChanges = (index: number) => {
    const isLocalProblem = index >= serverProblems.length;
    if (isLocalProblem) {
      const localIndex = index - serverProblems.length;
      return localProblems[localIndex]?.description?.trim() || false;
    } else {
      const problem = serverProblems[index];
      const change = serverProblemChanges.find((c) => c.id === problem.id);
      return (
        change &&
        change.currentDescription.trim() &&
        change.currentDescription !== change.originalDescription
      );
    }
  };

  const saveProblem = async (index: number) => {
    const isLocalProblem = index >= serverProblems.length;
    if (isLocalProblem) {
      const localIndex = index - serverProblems.length;
      const problem = localProblems[localIndex];
      if (!problem.description.trim()) {
        toast.error("لطفاً توضیحات مشکل را وارد کنید");
        return;
      }
      createMutation.mutate({
        repairReceptionId: problem.repairReceptionId,
        description: problem.description,
      });
    } else {
      const problem = serverProblems[index];
      const change = serverProblemChanges.find((c) => c.id === problem.id);
      const updatedDescription = change
        ? change.currentDescription
        : problem.description;

      if (!updatedDescription.trim()) {
        toast.error("لطفاً توضیحات مشکل را وارد کنید");
        return;
      }

      updateMutation.mutate({
        ...problem,
        description: updatedDescription,
      });
    }
  };

  const removeProblem = async (index: number) => {
    const isLocalProblem = index >= serverProblems.length;
    if (isLocalProblem) {
      const localIndex = index - serverProblems.length;
      const newLocalProblems = localProblems.filter((_, i) => i !== localIndex);
      setLocalProblems(newLocalProblems);
      return;
    }
    const problem = serverProblems[index];
    if (!problem.id) return;
    if (window.confirm("آیا مطمئن هستید که می‌خواهید این مشکل را حذف کنید؟")) {
      deleteMutation.mutate(problem.id);
    }
  };

  return (
    <Box>
      <AccessGuard accessId={ACCESS_IDS.ADD_PROBLEM}>
        <Box className="mb-2 flex justify-between items-center">
          <Typography variant="subtitle1">شرح مشکلات</Typography>
          <Button
            startIcon={<Add />}
            variant="outlined"
            onClick={addProblem}
            size="small"
            disabled={
              isLoading ||
              createMutation.isPending ||
              updateMutation.isPending ||
              deleteMutation.isPending
            }
          >
            افزودن مشکل
          </Button>
        </Box>
      </AccessGuard>

      {allProblems.map((problem, index) => {
        const needsSaving = hasChanges(index);
        return (
          <Box
            key={problem.id || `new-${index}`}
            className="flex items-start mb-3"
          >
            <EnhancedInput
              onChange={(e) => updateProblemDescription(index, e.target.value)}
              value={getProblemDescription(index)}
              label={`مشکل ${index + 1}`}
              name={`problem-${index}`}
              enableSpeechToText
              isTextArea
              fullWidth
              minRows={1}
              maxRows={8}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                deleteMutation.isPending
              }
            />
            {needsSaving && hasAccess(ACCESS_IDS.EDIT_PROBLEM) && (
              <IconButton
                color="success"
                onClick={() => saveProblem(index)}
                sx={{ ml: 1, mt: 1 }}
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  deleteMutation.isPending ||
                  !getProblemDescription(index).trim()
                }
              >
                <Check />
              </IconButton>
            )}
            {allProblems.length > 1 && hasAccess(ACCESS_IDS.DELETE_PROBLEM) && (
              <IconButton
                color="error"
                onClick={() => removeProblem(index)}
                sx={{ ml: 1, mt: 1 }}
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  deleteMutation.isPending
                }
              >
                <Delete />
              </IconButton>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default CustomerProblems;
