import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getRepairProductFractionalsByPlate = async () => {
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getRepairProductFractionalsByPlate}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const createRepairProductFractional = async (data: any) => {
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.createRepairProductFractional}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const updateRepairProductFractionalPurchased = async (
  data: IUpdateRepairProductFractionalPurchased
) => {
  const reqConfig = {
    method: "PUT",
    url: `${proxyServerUrl.updateRepairProductFractionalPurchased}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
