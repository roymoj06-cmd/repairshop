import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const token = async (credentials: {
  username: string;
  password: string;
}) => {
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.login}`,
    data: credentials,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
