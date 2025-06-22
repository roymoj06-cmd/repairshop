import { convertObjectToQueryString } from "@/utils";
import axiosInstance from "@/service/axiosInstance";
import { proxyServerUrl } from "@/service/url";

export const getRepairProductRequestsByReceptionId = async (
  data: getRepairProductRequestsByReceptionId
) => {
  const queryString = convertObjectToQueryString(data);
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getRepairProductRequestsByReceptionId}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getRepairProductRequestsByProblemId = async (
  data: getRepairProductRequestsByProblemId
) => {
  const queryString = convertObjectToQueryString(data);
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getRepairProductRequestsByProblemId}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getPendingRepairProductRequests = async (
  data: IPaginationForService
) => {
  const queryString = convertObjectToQueryString(data);
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getPendingRepairProductRequests}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const createBatchRepairProductRequest = async (
  data: ICreateBatchRepairProductRequest
) => {
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.createBatchRepairProductRequest}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const batchReviewRepairProductRequest = async (
  data: IBatchReviewRepairProductRequest
) => {
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.batchReviewRepairProductRequest}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getRepairProductRequestSummary = async (
  repairReceptionId: number
) => {
  const queryString = convertObjectToQueryString({ repairReceptionId });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getRepairProductRequestSummary}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const addApprovedProductsToReception = async (
  repairReceptionId: number
) => {
  const queryString = convertObjectToQueryString({ repairReceptionId });
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.addApprovedProductsToReception}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const createRepairProductRequest = async (
  data: ICreateOrUpdateRepairProductRequest
) => {
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.createRepairProductRequest}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const updateRepairProductRequest = async (
  data: ICreateOrUpdateRepairProductRequest,
  id: number
) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.updateRepairProductRequest}${
      queryString ? `?${queryString}` : ""
    }`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const deleteRepairProductRequest = async (id: number) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.deleteRepairProductRequest}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const reviewRepairProductRequest = async (
  data: IReviewRepairProductRequest
) => {
  const reqConfig = {
    method: "POST",
    url: `${proxyServerUrl.reviewRepairProductRequest}`,
    data,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getOutOfStockRequests = async (repairReceptionId: number) => {
  const queryString = convertObjectToQueryString({ repairReceptionId });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getOutOfStockRequests}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
export const getRepairProductRequestById = async (id: number) => {
  const queryString = convertObjectToQueryString({ id });
  const reqConfig = {
    method: "GET",
    url: `${proxyServerUrl.getRepairProductRequestById}${
      queryString ? `?${queryString}` : ""
    }`,
  };
  return await axiosInstance(reqConfig).then((res) => res.data);
};
