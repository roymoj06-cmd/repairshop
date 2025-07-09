import { convertObjectToQueryString } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getMechanicProductRequestById = async (id: number) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getMechanicProductRequestById}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getMechanicProductRequest = async (
  data: IPaginationForService
) => {
  const queryString = convertObjectToQueryString(data);
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getMechanicProductRequest}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const deleteMechanicProductRequest = async (id: number) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig = {
    method: "DELETE",
    url: `${proxyServerUrl.deleteMechanicProductRequest}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const createMechanicProductRequest = async (
  data: ICreateMechanicProductRequest
) => {
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.createMechanicProductRequest}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
