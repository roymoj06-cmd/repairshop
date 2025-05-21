import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getCurrentUserAccesses = async (token: string) => {
  const reqConfig = {
    headers: {
      "Content-Type": "application/json-patch+json",
      accept: "/",
      Authorization: token ? `Bearer ${token}` : "",
    },
    method: "GET",
    url: `${proxyServerUrl.getCurrentUserAccesses}`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
