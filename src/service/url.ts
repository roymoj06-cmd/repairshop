declare global {
  interface Window {
    globalConfig: {
      mode: string;
    };
  }
}
// const panelServiceBaseUrl = "http://192.168.0.113:8075/api/v1";
const panelServiceBaseUrl = "https://repairservice.baaz.ir/api/v1";

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

  // RepairServices controller
  getAllRepairServices: `${panelServiceBaseUrl}/RepairServices/GetAllRepairServices`,
  getRepairServiceById: `${panelServiceBaseUrl}/RepairServices/GetRepairServiceById`,
  createRepairService: `${panelServiceBaseUrl}/RepairServices/CreateRepairService`,
  updateRepairService: `${panelServiceBaseUrl}/RepairServices/UpdateRepairService`,
  deleteRepairService: `${panelServiceBaseUrl}/RepairServices/DeleteRepairService`,

  // mechanic controller
  getActiveMechanics: `${panelServiceBaseUrl}/Mechanic/GetActiveMechanics`,
  getAllMechanics: `${panelServiceBaseUrl}/Mechanic/GetAllMechanics`,
  getMechanicById: `${panelServiceBaseUrl}/Mechanic/GetMechanicById`,
  createMechanic: `${panelServiceBaseUrl}/Mechanic/CreateMechanic`,
  updateMechanic: `${panelServiceBaseUrl}/Mechanic/UpdateMechanic`,
  deleteMechanic: `${panelServiceBaseUrl}/Mechanic/DeleteMechanic`,

  // repairMechanicLeaves controller
  getMechanicLeaveByMechanicId: `${panelServiceBaseUrl}/RepairMechanicLeaves/GetMechanicLeaveByMechanicId`,
  geMechanicLeavetByDateRange: `${panelServiceBaseUrl}/RepairMechanicLeaves/GeMechanicLeavetByDateRange`,
  createRepairMechanicLeave: `${panelServiceBaseUrl}/RepairMechanicLeaves/CreateRepairMechanicLeave`,
  updateRepairMechanicLeave: `${panelServiceBaseUrl}/RepairMechanicLeaves/UpdateRepairMechanicLeave`,
  deleteRepairMechanicLeave: `${panelServiceBaseUrl}/RepairMechanicLeaves/DeleteRepairMechanicLeave`,
  getMechanicLeaveById: `${panelServiceBaseUrl}/RepairMechanicLeaves/GetMechanicLeaveById`,
  getAllMechanicLeave: `${panelServiceBaseUrl}/RepairMechanicLeaves/GetAllMechanicLeave`,
};
