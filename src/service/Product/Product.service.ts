import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getProductsThatContainsText = async (searchText: string) => {
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl?.getProductsThatContainsText}?searchText=${searchText}`,
  };
  return axiosInstance(reqConfig).then((res) => res.data);
};
