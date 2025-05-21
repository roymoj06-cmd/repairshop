import { toast } from "react-toastify";
import axios from "axios";

import { getToken } from "@/utils";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json-patch+json",
    accept: "/",
  },
});
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// const { setIsAuthenticated } = useStore();
axiosInstance.interceptors.response.use(
  (response: any) => {
    return response;
  },
  async (error: any) => {
    if (error) {
      if (error.status === 401) {
        try {
          localStorage.removeItem("auth-storage");
          Cookies.remove("token");
          window.location.replace(`/`);
        } catch (refreshError) {}
      } else if (error.status === 400) {
        toast.error(error?.response?.data?.errors?.[0]);
      } else if (error.status === 403) {
        toast.error("شما مجاز به این درخواست نمی‌باشید.");
      } else if (error.status === 406) {
        toast.error("شما مجوز دسترسی به سرویس مورد نظر را ندارید.");
      } else if (error.status === 404) {
        toast.error(error?.response?.data?.errors?.[0]);
      } else if (error.status === 417) {
        toast.error(`${error.data?.Reasons?.[0]?.Message}`);
      } else if (error.status === 500) {
        toast.error("سرور با مشکل مواجه شده است لطفا مجدد تلاش کنید.");
        console.error(
          "error 500 ",
          `===> ${error.response.data?.Reasons?.[0]?.Message}`
        );
      }
    } else {
      toast.error("خطایی رخ داده است لطفا مجدد تلاش کنید.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
