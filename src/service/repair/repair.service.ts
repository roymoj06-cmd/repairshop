import { AxiosRequestConfig } from "axios";

import { convertObjectToQueryString } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const updateRepairReception = async (data: IUpdateRepairReception) => {
  const reqConfig: AxiosRequestConfig = {
    method: "PUT",
    url: `${proxyServerUrl.updateRepairReception}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const updateRepairReceptionByProblem = async (
  data: IUpdateRepairReceptionByProblem
) => {
  const reqConfig: AxiosRequestConfig = {
    method: "PUT",
    url: `${proxyServerUrl.updateRepairReceptionByProblem}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const createRepairReception = async (data: IUpdateRepairReception) => {
  const reqConfig: AxiosRequestConfig = {
    method: "POST",
    url: `${proxyServerUrl.createRepairReception}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const scanProduct = async (data: { scanCode: string | undefined }) => {
  const reqConfig: AxiosRequestConfig = {
    method: "POST",
    url: `${proxyServerUrl.scanProduct}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getCustomerCars = async (customerId: number) => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getCustomerCars}${customerId}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getRepairReceptionForUpdateById = async (id: number) => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getRepairReceptionForUpdateById}${id}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const repairReceptionSummary = async (id: number) => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.repairReceptionSummary}?id=${id}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const generateRepairReceptionFactors = async (
  data: IGenerateRepairRecaptionFactors
) => {
  const reqConfig: AxiosRequestConfig = {
    method: "POST",
    url: `${proxyServerUrl.generateRepairReceptionFactors}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const inventoryViewByCustomerAndByCarId = async (
  data: ISaleViewByCustomerAndByCarId
) => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.salesViewByCustomerAndByCarId}/customer/${data?.customerId}/car/${data?.carId}/repair/${data?.id}/inventory-view`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const dischargeRepairReception = async (data: {
  repairReceptionId: number;
}) => {
  const reqConfig: AxiosRequestConfig = {
    method: "POST",
    url: `${proxyServerUrl.dischargeRepairReception}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const salesViewByCustomerAndByCarId = async (
  data: ISaleViewByCustomerAndByCarId
) => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.salesViewByCustomerAndByCarId}/customer/${data?.customerId}/car/${data?.carId}/repair/${data?.id}/sales-view`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const deleteRepairReception = async (data: {
  repairReceptionId: number;
}) => {
  const reqConfig: AxiosRequestConfig = {
    method: "DELETE",
    url: `${proxyServerUrl.deleteRepairReception}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getRepairReceptions = async ({
  page = 1,
  size = 18,
  plateSection1,
  plateSection2,
  plateSection3,
  plateSection4,
  customerId,
  isDischarged,
}: {
  page: number | string;
  size: number | string;
  plateSection1?: string;
  plateSection2?: string;
  plateSection3?: string;
  plateSection4?: string;
  customerId?: number;
  isDischarged?: boolean | null;
  carColor?: string;
}) => {
  const queryString = convertObjectToQueryString({
    page,
    size,
    plateSection1,
    plateSection2,
    plateSection3,
    plateSection4,
    customerId,
    isDischarged,
  });
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getRepairReceptions}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const deleteRepairReceptionDetailById = async (data: {
  repairReceptionDetailId: number;
}) => {
  const reqConfig: AxiosRequestConfig = {
    method: "POST",
    url: `${proxyServerUrl.deleteRepairReceptionDetailById}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const createRepairFactorRequest = async (
  data: ICreateRepairFactorRequest
) => {
  const reqConfig: AxiosRequestConfig = {
    method: "POST",
    url: `${proxyServerUrl.createRepairFactorRequest}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getRepairReceptionById = async (id: number) => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getRepairReceptionById}${id}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getRepairReceptionsByCustomerId = async () => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getRepairReceptionsByCustomerId}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
