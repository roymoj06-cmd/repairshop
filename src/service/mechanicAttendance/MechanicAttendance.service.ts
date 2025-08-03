import { convertObjectToQueryString } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getMechanicAttendanceByMechanicId = async (mechanicId: number) => {
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl?.getMechanicAttendanceByMechanicId}?mechanicId=${mechanicId}`,
  };
  return axiosInstance(reqConfig).then((res) => res.data);
};
export const getMechanicAttendanceById = async (id: number) => {
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl?.getMechanicAttendanceById}?id=${id}`,
  };
  return axiosInstance(reqConfig).then((res) => res.data);
};
export const deleteMechanicAttendance = async (id: number) => {
  const reqConfig = {
    method: "DELETE",
    url: `${proxyServerUrl?.deleteMechanicAttendance}?id=${id}`,
  };
  return axiosInstance(reqConfig).then((res) => res.data);
};
export const getMechanicAttendanceByDateRange = async (
  data: IGetMechanicAttendanceByDateRange
) => {
  const queryString = convertObjectToQueryString(data);
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl?.getMechanicAttendanceByDateRange}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return axiosInstance(reqConfig).then((res) => res.data);
};
export const createMechanicAttendance = async (
  data: ICreateMechanicAttendance
) => {
  const queryString = convertObjectToQueryString(data);
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl?.createMechanicAttendance}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return axiosInstance(reqConfig).then((res) => res.data);
};
export const updateMechanicAttendance = async (
  data: ICreateMechanicAttendance
) => {
  const queryString = convertObjectToQueryString(data);
  const reqConfig = {
    method: "PUT",
    url: `${proxyServerUrl?.updateMechanicAttendance}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return axiosInstance(reqConfig).then((res) => res.data);
};
