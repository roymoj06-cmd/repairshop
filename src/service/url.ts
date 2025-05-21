declare global {
  interface Window {
    globalConfig: {
      mode: string;
    };
  }
}
// this variables are global scope in file public/envConfig.js
// =========================================================================
// const serverTestIp = "http://192.168.0.113";
// const panelServiceBaseUrl = "https://copserver.copapp.ir/api/v1";
const panelServiceBaseUrl = "http://192.168.0.113:8075/api/v1";
// const panelServiceBaseUrl =
//   window.globalConfig?.mode === "production"
//     ? "https://copserver.copapp.ir/api/v1"
//     : `${serverTestIp}:8075/api/v1`;
// =========================================================================
export const proxyServerUrl = {
  copServer: "https://copserver.copapp.ir",

  // authentication controller
  login: `${panelServiceBaseUrl}/Users/Token`,

  // file infos
  removeFileFromFolderById: `${panelServiceBaseUrl}/FileInfos/RemoveFileFromFolderById`,
  getFilesWithPagination: `${panelServiceBaseUrl}/FileInfos/GetFilesWithPagination`,
  uploadFileToFolder: `${panelServiceBaseUrl}/FileInfos/UploadFileToFolder`,
  getFileById: `${panelServiceBaseUrl}/FileInfos/GetFileById`,
  uploadFile: `${panelServiceBaseUrl}/FileInfos/UploadFile`,

  // car controller
  deleteAddressRepair: `${panelServiceBaseUrl}/Car/DeleteAddress/`,
  getCarById: `${panelServiceBaseUrl}/Car/GetCarById/`,
  getCarsRepair: `${panelServiceBaseUrl}/Car/GetCars`,
  updateCar: `${panelServiceBaseUrl}/Car/UpdateCar`,
  createCar: `${panelServiceBaseUrl}/Car/CreateCar`,
  getCars: `${panelServiceBaseUrl}/Car/GetCars`,

  // repair Controller
  getRepairReceptionForUpdateById: `${panelServiceBaseUrl}/Repair/GetRepairReceptionForUpdateById/`,
  generateRepairReceptionFactors: `${panelServiceBaseUrl}/Repair/GenerateRepairReceptionFactors`,
  dischargeRepairReception: `${panelServiceBaseUrl}/Repair/DischargeRepairReception`,
  repairReceptionSummary: `${panelServiceBaseUrl}/Repair/repair-reception-summary`,
  createRepairReception: `${panelServiceBaseUrl}/Repair/CreateRepairReception`,
  updateRepairReception: `${panelServiceBaseUrl}/Repair/UpdateRepairReception`,
  deleteRepairReception: `${panelServiceBaseUrl}/Repair/DeleteRepairReception`,
  getRepairReceptions: `${panelServiceBaseUrl}/Repair/GetRepairReceptions`,
  changeIsCancelled: `${panelServiceBaseUrl}/Repair/ChangeIsCancelled`,
  getCustomerCars: `${panelServiceBaseUrl}/Repair/GetCustomerCars/`,
  salesViewByCustomerAndByCarId: `${panelServiceBaseUrl}/Repair`,
  scanProduct: `${panelServiceBaseUrl}/Repair/ScanProduct`,

  // customer controller
  getCustomers: `${panelServiceBaseUrl}/Customer/GetCustomersV2`,

  // user controller
  getCurrentUserAccesses: `${panelServiceBaseUrl}/UserSecurity/GetCurrentUserAccesses`,
};
