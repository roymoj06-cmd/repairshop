import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getCars,
  getCarsRepair,
  getCarById,
  createCar,
  updateCar,
  deleteAddressRepair,
  getCustomerCars,
} from "@/service/cars/cars.service";

export const useCars = () => {
  return useQuery({
    queryKey: ["cars"],
    queryFn: async () => await getCars(),
  });
};

export const useCarsRepair = () => {
  return useQuery({
    queryKey: ["carsRepair"],
    queryFn: async () => await getCarsRepair(),
  });
};

export const useCarById = (id: number) => {
  return useQuery({
    queryKey: ["car", id],
    queryFn: async () => await getCarById(id),
    enabled: !!id,
  });
};

export const useCustomerCars = (customerId: number) => {
  return useQuery({
    queryKey: ["customerCars", customerId],
    queryFn: async () => await getCustomerCars(customerId),
    enabled: !!customerId,
  });
};

export const useCreateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["carsRepair"] });
      toast.success("خودرو با موفقیت ثبت شد");
    },
    onError: (error: Error) => {
      toast.error(`خطا در ثبت خودرو: ${error.message}`);
    },
  });
};

export const useUpdateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["carsRepair"] });
      queryClient.invalidateQueries({ queryKey: ["car"] });
      toast.success("خودرو با موفقیت ویرایش شد");
    },
    onError: (error: Error) => {
      toast.error(`خطا در ویرایش خودرو: ${error.message}`);
    },
  });
};

export const useDeleteCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddressRepair,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["carsRepair"] });
      toast.success("خودرو با موفقیت حذف شد");
    },
    onError: (error: Error) => {
      toast.error(`خطا در حذف خودرو: ${error.message}`);
    },
  });
};

