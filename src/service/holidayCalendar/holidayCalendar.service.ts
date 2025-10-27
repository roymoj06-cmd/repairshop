import axiosInstance from "../axiosInstance";
import { AxiosRequestConfig } from "axios";
import { proxyServerUrl } from "../url";
import { convertObjectToQueryString } from "@/utils";

export const getHolidayById = async (id: number) => {
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getHolidayById}?id=${id}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};

export const getHolidayByShamsiDate = async (
  fromDate?: string,
  toDate?: string
) => {
  const queryString = convertObjectToQueryString({ fromDate, toDate });
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getHolidayByShamsiDate}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};

export const createHoliday = async (data: ICreateHolidayCalendar) => {
  const reqConfig: AxiosRequestConfig = {
    method: "POST",
    url: `${proxyServerUrl.createHoliday}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};

export const updateHoliday = async (
  id: number,
  data: IUpdateHolidayCalendar
) => {
  const reqConfig: AxiosRequestConfig = {
    method: "PUT",
    url: `${proxyServerUrl.updateHoliday}?id=${id}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};

export const deleteHoliday = async (id: number) => {
  const reqConfig: AxiosRequestConfig = {
    method: "DELETE",
    url: `${proxyServerUrl.deleteHoliday}?id=${id}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};

