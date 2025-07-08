import { convertObjectToQueryString } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getMechanicPerformance = async (data: IMechanicPerformance) => {
  const queryString = convertObjectToQueryString(data);
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl?.getMechanicPerformance}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return axiosInstance(reqConfig).then((res) => res.data);
};
