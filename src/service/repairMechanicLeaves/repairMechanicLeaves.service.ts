import { AxiosRequestConfig } from "axios";

import { convertObjectToQueryString } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getMechanicLeaveByMechanicId = async (mechanicId: number) => {
  const queryString = convertObjectToQueryString({ mechanicId });
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getMechanicLeaveByMechanicId}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const GeMechanicLeavetByDateRange = async (
  fromDate: string,
  toDate: string
) => {
  const queryString = convertObjectToQueryString({ fromDate, toDate });
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.geMechanicLeavetByDateRange}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const createRepairMechanicLeave = async (
  data: ICreateOrUpdateMechanicLeave
) => {
  const reqConfig: AxiosRequestConfig = {
    method: "POST",
    url: proxyServerUrl.createRepairMechanicLeave,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const updateRepairMechanicLeave = async (
  data: ICreateOrUpdateMechanicLeave
) => {
  const reqConfig: AxiosRequestConfig = {
    method: "PUT",
    url: proxyServerUrl.updateRepairMechanicLeave,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const deleteRepairMechanicLeave = async (id: number) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig: AxiosRequestConfig = {
    method: "DELETE",
    url: `${proxyServerUrl.deleteRepairMechanicLeave}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getAllMechanicLeave = async (data: IPaginationForService) => {
  const queryString = convertObjectToQueryString(data);
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getAllMechanicLeave}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getMechanicLeaveById = async (id: number) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getMechanicLeaveById}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
