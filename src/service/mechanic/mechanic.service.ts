import { AxiosRequestConfig } from "axios";

import { convertObjectToQueryString } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getActiveMechanics = async () => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getActiveMechanics}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getAllMechanics = async (data: IPaginationForService) => {
  const queryString = convertObjectToQueryString(data);
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getAllMechanics}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getMechanicById = async (id: number) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getMechanicById}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const createMechanic = async (data: ICreateOrUpdateMechanic) => {
  const reqConfig: AxiosRequestConfig = {
    method: "POST",
    url: `${proxyServerUrl.createMechanic}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const updateMechanic = async (data: ICreateOrUpdateMechanic) => {
  const reqConfig: AxiosRequestConfig = {
    method: "PUT",
    url: `${proxyServerUrl.updateMechanic}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const deleteMechanic = async (id: number) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig: AxiosRequestConfig = {
    method: "DELETE",
    url: `${proxyServerUrl.deleteMechanic}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};

export const getMechanicAccountBalance = async (userId: number) => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getCustomerAccountBalance}?userId=${userId}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
