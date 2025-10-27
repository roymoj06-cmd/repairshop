import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAllMechanicLeave,
  getMechanicLeaveByMechanicId,
  geMechanicLeavetByDateRange,
  getMechanicLeaveById,
  createRepairMechanicLeave,
  updateRepairMechanicLeave,
  deleteRepairMechanicLeave,
} from "@/service/repairMechanicLeaves/repairMechanicLeaves.service";

export interface LeaveFilters {
  mechanicId?: number;
  startDate?: string;
  endDate?: string;
}

export const useLeaves = () => {
  return useQuery({
    queryKey: ["leaves", "all"],
    queryFn: async () => await getAllMechanicLeave(),
  });
};

export const useLeavesByMechanic = (mechanicId: number) => {
  return useQuery({
    queryKey: ["leaves", "mechanic", mechanicId],
    queryFn: async () => await getMechanicLeaveByMechanicId(mechanicId),
    enabled: !!mechanicId,
  });
};

export const useLeavesByDateRange = (filters: LeaveFilters) => {
  return useQuery({
    queryKey: ["leaves", "dateRange", filters],
    queryFn: async () => {
      if (!filters.startDate || !filters.endDate) {
        throw new Error("تاریخ شروع و پایان الزامی است");
      }
      return await geMechanicLeavetByDateRange(filters);
    },
    enabled: !!(filters.startDate && filters.endDate),
  });
};

export const useLeaveById = (id: number) => {
  return useQuery({
    queryKey: ["leave", id],
    queryFn: async () => await getMechanicLeaveById(id),
    enabled: !!id,
  });
};

export const useCreateLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRepairMechanicLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      toast.success("مرخصی با موفقیت ثبت شد");
    },
    onError: (error: Error) => {
      toast.error(`خطا در ثبت مرخصی: ${error.message}`);
    },
  });
};

export const useUpdateLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRepairMechanicLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      toast.success("مرخصی با موفقیت ویرایش شد");
    },
    onError: (error: Error) => {
      toast.error(`خطا در ویرایش مرخصی: ${error.message}`);
    },
  });
};

export const useDeleteLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRepairMechanicLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      toast.success("مرخصی با موفقیت حذف شد");
    },
    onError: (error: Error) => {
      toast.error(`خطا در حذف مرخصی: ${error.message}`);
    },
  });
};

