import { convertObjectToQueryString } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getAllRepairReceptionServices = async (
  repairReceptionId: number
) => {
  const queryString = convertObjectToQueryString({ repairReceptionId });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getAllRepairReceptionServices}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getRepairReceptionServiceById = async (id: number) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getRepairReceptionServiceById}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const createRepairReceptionService = async (
  data: ICreateOrUpdateRepairReceptionService
) => {
  const reqConfig = {
    method: "PUT",
    url: `${proxyServerUrl.saveRepairReceptionServices}`,
    data: data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const updateRepairReceptionService = async (
  data: ICreateOrUpdateRepairReceptionService
) => {
  const reqConfig = {
    method: "PUT",
    url: `${proxyServerUrl.saveRepairReceptionServices}`,
    data: data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const deleteRepairReceptionService = async (id: number) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig = {
    method: "DELETE",
    url: `${proxyServerUrl.deleteRepairReceptionService}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const updateRepairReceptionServicesForProblems = async (
  data: ICreateOrUpdateRepairReceptionService
) => {
  const reqConfig = {
    method: "PUT",
    url: `${proxyServerUrl.saveRepairReceptionServices}`,
    data: data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getRepairReceptionServices = async (repairReceptionId: number) => {
  const queryString = convertObjectToQueryString({ repairReceptionId });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getRepairReceptionServices}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
