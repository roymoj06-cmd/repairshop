import { convertObjectToQueryString } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

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
export const createRepairService = async (
  data: ICreateOrUpdateRepairService
) => {
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.createRepairService}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const UpdateRepairService = async (
  data: ICreateOrUpdateRepairService
) => {
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
export const createCustomerProblem = async (
  data: ICreateOrUpdateCustomerProblem
) => {
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.createCustomerProblem}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getCustomerProblems = async (
  data: IAllGetRepairReceptionService
) => {
  const queryString = convertObjectToQueryString(data);
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getCustomerProblems}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getCustomerProblemById = async (id: string) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getCustomerProblemById}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const updateCustomerProblem = async (
  data: ICreateOrUpdateCustomerProblem
) => {
  const reqConfig = {
    method: "PUT",
    url: `${proxyServerUrl.updateCustomerProblem}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const deleteCustomerProblem = async (id: number) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig = {
    method: "DELETE",
    url: `${proxyServerUrl.deleteCustomerProblem}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const updateProblemIsTested = async (data: IUpdateProblemIsTested) => {
  const queryString = convertObjectToQueryString(data);
  const reqConfig = {
    method: "PUT",
    url: `${proxyServerUrl.updateProblemIsTested}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
