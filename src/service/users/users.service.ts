import { convertObjectToQueryString } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";
// تعیین رمز جدید با otp
export const resetPasswordTwoFactor = async (data: IResetPasswordTwoFactor) => {
  const reqConfig = {
    method: "PUT",
    url: `${proxyServerUrl.resetPasswordTwoFactor}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
// دریافت کد تایید otp
export const getResetPasswordCode = async (username: string) => {
  const queryString = convertObjectToQueryString({ username });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getResetPasswordCode}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
