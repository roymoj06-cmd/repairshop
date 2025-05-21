import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getTokenOnValidation = async (phoneNumber: string, otp: string) => {
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.login}`,
    data: {
      phoneNumber,
      otp
    },
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
