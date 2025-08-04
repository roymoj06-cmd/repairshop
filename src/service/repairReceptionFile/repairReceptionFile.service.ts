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
}: {
  onProgress?: (progress: number) => void;
  file?: any;
  repairReceptionId?: string | number;
  description?: string;
}) => {
  const data = createFormData({ file, description, repairReceptionId });

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
