import { convertObjectToQueryString, createFormData } from "@/utils";
import axiosInstance from "../axiosInstance";
import { proxyServerUrl } from "../url";

export const uploadFileToFolder = async ({
  dataObject,
  path = "blogs",
}: {
  dataObject: File[];
  path?: string;
}) => {
  const data = createFormData({ file: dataObject?.[0] });
  const queryString = convertObjectToQueryString({
    path,
  });
  const reqConfig = {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    url: `${proxyServerUrl.uploadFileToFolder}${
      queryString ? `?${queryString}` : ""
    }`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const uploadFile = async ({
  FormFile,
  FileSource,
}: {
  FormFile?: any;
  FileSource?: number;
}) => {
  const data = FileSource
    ? createFormData({ FormFile, FileSource })
    : createFormData({ FormFile });
  const reqConfig = {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    url: `${proxyServerUrl.uploadFile}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getFilesWithPagination = async ({
  fileSource = 8,
  pageSize = 12,
  pageNumber = 1,
}: {
  pageNumber?: number | string;
  pageSize?: number | string;
  fileSource?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 255;
}) => {
  const queryString = convertObjectToQueryString({
    fileSource,
    pageNumber,
    pageSize,
  });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getFilesWithPagination}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const removeFileFromFolderById = async ({
  fileId,
}: {
  fileId?: number;
}) => {
  const queryString = convertObjectToQueryString({
    fileId,
  });
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.removeFileFromFolderById}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getFileById = async ({ fileId }: { fileId?: number | string }) => {
  const queryString = convertObjectToQueryString({
    fileId,
  });
  const reqConfig = {
    method: "GET",
    responseType: "blob" as const,
    url: `${proxyServerUrl.getFileById}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
