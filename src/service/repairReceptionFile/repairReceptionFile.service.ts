import { convertObjectToQueryString, createFormData } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";
import { AxiosProgressEvent } from "axios";

export const getFilesByReceptionId = async (
  repairReceptionId?: string | number
) => {
  const queryString = convertObjectToQueryString({ repairReceptionId });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getFilesByReceptionId}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};

export const uploadFileRepairReceptionFile = async ({
  description,
  file,
  repairReceptionId,
  onProgress,
  CompressionLevel,
}: {
  onProgress?: (progress: number) => void;
  file?: any;
  repairReceptionId?: string | number;
  description?: string;
  CompressionLevel: number;
  // [Description("کیفیت بالا - حجم کم‌تر از 10% اصل")]
  // HighQuality_10Percent = 1,

  // [Description("کیفیت خوب - حجم کم‌تر از 20% اصل")]
  // GoodQuality_20Percent = 2,

  // [Description("کیفیت متوسط - حجم کم‌تر از 30% اصل")]
  // MediumQuality_30Percent = 3,

  // [Description("کیفیت پایین - حجم کم‌تر از 50% اصل")]
  // LowQuality_50Percent = 4,

  // [Description("حداکثر فشرده‌سازی - حجم کم‌تر از 70% اصل")]
  // MaxCompression_70Percent = 5
}) => {
  const data = createFormData({
    file,
    description,
    repairReceptionId,
    CompressionLevel,
  });

  const reqConfig = {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    url: `${proxyServerUrl.uploadFileRepairReceptionFile}`,
    data,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100
        );
        if (onProgress) onProgress(percent);
      }
    },
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const deleteFileRepairReceptionFile = async (fileId: number) => {
  const queryString = convertObjectToQueryString({ fileId });
  const reqConfig = {
    method: "DELETE",
    url: `${proxyServerUrl.deleteFileRepairReceptionFile}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const updateShowCustomer = async (data: IUpdateShowCustomer) => {
  const reqConfig = {
    method: "PUT",
    url: `${proxyServerUrl.updateShowCustomer}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const sendFileLinksNotification = async (
  data: ISendFileLinksNotification
) => {
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.sendFileLinksNotification}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
