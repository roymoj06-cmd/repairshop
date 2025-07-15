import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";
import { convertObjectToQueryString } from "@/utils";

export const getSchedules = async (page: number, size: number) => {
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getAllSchedules}?page=${page}&size=${size}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
type ICreateSchedule = {
  repairSchedule: {
    id?: number;
    mechanicId: number;
    receptionServiceId: number;
    startDatetime: string;
    endDatetime: string;
    durationInMinutes: number;
  };
};
export const createSchedule = async (schedule: ICreateSchedule) => {
  const data: ICreateSchedule = {
    repairSchedule: {
      mechanicId: schedule?.repairSchedule?.mechanicId,
      receptionServiceId: schedule?.repairSchedule?.receptionServiceId,
      startDatetime: schedule?.repairSchedule?.startDatetime,
      endDatetime: schedule?.repairSchedule?.endDatetime,
      durationInMinutes: schedule?.repairSchedule?.durationInMinutes,
    },
  };
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.createSchedule}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const updateSchedule = async (schedule: ICreateSchedule) => {
  const reqConfig = {
    method: "PUT",
    url: `${proxyServerUrl.updateSchedule}${schedule.repairSchedule.id}`,
    data: schedule,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getScheduleById = async (id: number) => {
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getScheduleById}${id}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};

export const deleteSchedule = async (id: number) => {
  const reqConfig = {
    method: "DELETE",
    url: `${proxyServerUrl.deleteSchedule}${id}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getSchedulesByMechanicId = async (
  mechanicId: number,
  fromDate?: string,
  toDate?: string
) => {
  const query = convertObjectToQueryString({
    fromDate,
    toDate,
  });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getSchedulesByMechanicId}${mechanicId}?${query}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getAvailability = async (date: string, mechanicId: number) => {
  const query = convertObjectToQueryString({
    date,
    mechanicId,
  });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getAvailability}?${query}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
type IGetReceptions = {
  fromDate: string;
  toDate: string;
  customerId: number;
  plateNumber: string;
};
export const getReceptions = async (data: IGetReceptions) => {
  const query = convertObjectToQueryString(data);
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.receptions}?${query}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
