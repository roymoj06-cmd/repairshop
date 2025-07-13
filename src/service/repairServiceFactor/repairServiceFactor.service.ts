import { convertObjectToQueryString } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getRepairServiceFactorById = async (id: number) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getRepairServiceFactorById}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const saveRepairServiceFactor = async (data: IRepairServiceFactor) => {
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.saveRepairServiceFactor}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const deleteRepairServiceFactor = async (id: number) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig = {
    method: "DELETE",
    url: `${proxyServerUrl.deleteRepairServiceFactor}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
