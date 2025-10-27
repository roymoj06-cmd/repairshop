import axiosInstance from "../axiosInstance";
import { AxiosRequestConfig } from "axios";
import { proxyServerUrl } from "../url";

export const updateCar = async (data: IUpdateCarRepair) => {
  const reqConfig: AxiosRequestConfig = {
    method: "PUT",
    url: `${proxyServerUrl.updateCar}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const createCar = async (data: IUpdateCarRepair) => {
  const reqConfig: AxiosRequestConfig = {
    method: "POST",
    url: `${proxyServerUrl.createCar}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const deleteAddressRepair = async (id: number) => {
  const reqConfig: AxiosRequestConfig = {
    method: "DELETE",
    url: `${proxyServerUrl.deleteAddressRepair}${id}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getCarById = async (id: number) => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getCarById}${id}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getCarsRepair = async () => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getCarsRepair}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getCars = async () => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getCars}`,
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

export const getCarTips = async () => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getCarTips}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};

export const getAllCarCompanies = async (
  page: number = 1,
  size: number = 10
) => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getAllCarCompanies}?page=${page}&size=${size}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};

export const getCarTipsByCompanyId = async (carCompanyId: number) => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getCarTipsByCompanyId}${carCompanyId}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};