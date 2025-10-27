import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAllMechanics,
  getActiveMechanics,
  getMechanicById,
  createMechanic,
  updateMechanic,
  deleteMechanic,
} from "@/service/mechanic/mechanic.service";

export interface MechanicFilters {
  isActive?: boolean;
}

export const useMechanics = (filters: MechanicFilters = {}) => {
  return useQuery({
    queryKey: ["mechanics", filters],
    queryFn: async () => {
      if (filters.isActive) {
        return await getActiveMechanics();
      }
      return await getAllMechanics();
    },
  });
};

export const useMechanicById = (id: number) => {
  return useQuery({
    queryKey: ["mechanic", id],
    queryFn: async () => await getMechanicById(id),
    enabled: !!id,
  });
};

export const useCreateMechanic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMechanic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] });
      toast.success("مکانیک با موفقیت ایجاد شد");
    },
    onError: (error: Error) => {
      toast.error(`خطا در ایجاد مکانیک: ${error.message}`);
    },
  });
};

export const useUpdateMechanic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMechanic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] });
      toast.success("مکانیک با موفقیت ویرایش شد");
    },
    onError: (error: Error) => {
      toast.error(`خطا در ویرایش مکانیک: ${error.message}`);
    },
  });
};

export const useDeleteMechanic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMechanic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] });
      toast.success("مکانیک با موفقیت حذف شد");
    },
    onError: (error: Error) => {
      toast.error(`خطا در حذف مکانیک: ${error.message}`);
    },
  });
};

