import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getMechanicAttendanceByMechanicId,
  getMechanicAttendanceByDateRange,
  getMechanicAttendanceById,
  createMechanicAttendance,
  updateMechanicAttendance,
  deleteMechanicAttendance,
} from "@/service/mechanicAttendance/MechanicAttendance.service";

export interface AttendanceFilters {
  mechanicId?: number;
  startDate?: string;
  endDate?: string;
}

export const useAttendanceByMechanic = (mechanicId: number) => {
  return useQuery({
    queryKey: ["attendance", "mechanic", mechanicId],
    queryFn: async () => await getMechanicAttendanceByMechanicId(mechanicId),
    enabled: !!mechanicId,
  });
};

export const useAttendanceByDateRange = (filters: AttendanceFilters) => {
  return useQuery({
    queryKey: ["attendance", "dateRange", filters],
    queryFn: async () => {
      if (!filters.mechanicId || !filters.startDate || !filters.endDate) {
        throw new Error("تمام فیلدها الزامی است");
      }
      return await getMechanicAttendanceByDateRange(filters);
    },
    enabled: !!(filters.mechanicId && filters.startDate && filters.endDate),
  });
};

export const useAttendanceById = (id: number) => {
  return useQuery({
    queryKey: ["attendance", id],
    queryFn: async () => await getMechanicAttendanceById(id),
    enabled: !!id,
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMechanicAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("حضور و غیاب با موفقیت ثبت شد");
    },
    onError: (error: Error) => {
      toast.error(`خطا در ثبت حضور و غیاب: ${error.message}`);
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMechanicAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("حضور و غیاب با موفقیت ویرایش شد");
    },
    onError: (error: Error) => {
      toast.error(`خطا در ویرایش حضور و غیاب: ${error.message}`);
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMechanicAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("حضور و غیاب با موفقیت حذف شد");
    },
    onError: (error: Error) => {
      toast.error(`خطا در حذف حضور و غیاب: ${error.message}`);
    },
  });
};

