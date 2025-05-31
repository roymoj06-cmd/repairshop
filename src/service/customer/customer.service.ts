import { AxiosRequestConfig } from "axios";

import { convertObjectToQueryString } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getCustomers = async (searchText: string) => {
  const queryString = convertObjectToQueryString({
    searchText,
  });
  const reqConfig: AxiosRequestConfig = {
    method: "GET",
    url: `${proxyServerUrl.getCustomers}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
