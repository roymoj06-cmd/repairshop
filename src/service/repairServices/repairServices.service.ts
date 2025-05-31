import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";
import { convertObjectToQueryString } from "@/utils";

export const getAllRepairServices = async (data: IPaginationForService) => {
  const queryString = convertObjectToQueryString(data);
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getAllRepairServices}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getRepairServiceById = async (id: string) => {
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getRepairServiceById}/${id}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const createRepairService = async (data: ICreateOrUpdateRepairService) => {
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.createRepairService}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const UpdateRepairService = async (data: ICreateOrUpdateRepairService) => {
  const reqConfig = {
    method: "PUT",
    url: `${proxyServerUrl.updateRepairService}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const deleteRepairService = async (id: string) => {
  const reqConfig = {
    method: "DELETE",
    url: `${proxyServerUrl.deleteRepairService}?id=${id}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
