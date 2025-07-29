import { convertObjectToQueryString } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getDelayedRepairs = async () => {
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getDelayedRepairs}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getAverageEstimatedTime = async () => {
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getAverageEstimatedTime}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getReceptionsCount = async (params: IReportDashboardParams) => {
  const queryString = convertObjectToQueryString(params);
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getReceptionsCount}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getAverageStayTime = async () => {
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getAverageStayTime}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getCurrentVehicles = async () => {
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getCurrentVehicles}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
