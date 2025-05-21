import { convertObjectToQueryString, createFormData } from '@/utils'
import axiosInstance from '../axiosInstance'
import { proxyServerUrl } from '../url'

export const uploadFileToFolder = async ({
  dataObject,
  path = 'blogs'
}: {
  dataObject: File[]
  path?: string
}) => {
  const data = createFormData({ file: dataObject?.[0] })
  const query = convertObjectToQueryString({
    path
  })
  const reqConfig = {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    url: `${proxyServerUrl.uploadFileToFolder}${query ? `?${query}` : ''}`,
    data
  }
  return await axiosInstance(reqConfig).then((res) => res.data)
}
export const uploadFile = async ({
  FormFile,
  FileSource
}: {
  FormFile?: any
  FileSource?: number
}) => {
  const data = FileSource
    ? createFormData({ FormFile, FileSource })
    : createFormData({ FormFile })
  const reqConfig = {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    url: `${proxyServerUrl.uploadFile}`,
    data
  }
  return await axiosInstance(reqConfig).then((res) => res.data)
}
export const getFilesWithPagination = async ({
  fileSource = 8,
  pageSize = 12,
  pageNumber = 1
}: {
  pageNumber?: number | string
  pageSize?: number | string
  fileSource?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 255
}) => {
  const query = convertObjectToQueryString({
    fileSource,
    pageNumber,
    pageSize
  })
  const reqConfig = {
    method: 'GET',
    url: `${proxyServerUrl.getFilesWithPagination}${query ? `?${query}` : ''}`
  }
  return await axiosInstance(reqConfig).then((res) => res.data)
}
export const removeFileFromFolderById = async ({
  fileId
}: {
  fileId?: number
}) => {
  const query = convertObjectToQueryString({
    fileId
  })
  const reqConfig = {
    method: 'POST',
    url: `${proxyServerUrl.removeFileFromFolderById}${query ? `?${query}` : ''}`
  }
  return await axiosInstance(reqConfig).then((res) => res.data)
}
export const getFileById = async ({ fileId }: { fileId?: number | string }) => {
  const query = convertObjectToQueryString({
    fileId
  })
  const reqConfig = {
    method: 'GET',
    responseType: 'blob' as const,
    url: `${proxyServerUrl.getFileById}${query ? `?${query}` : ''}`
  }
  return await axiosInstance(reqConfig).then((res) => res.data)
}
