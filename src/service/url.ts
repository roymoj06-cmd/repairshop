declare global {
  interface Window {
    globalConfig: {
      mode: string;
    };
  }
}
const serverTestIp = "http://192.168.0.113";
const copserverUrl =
  window.globalConfig?.mode === "production"
    ? "https://copserver.copapp.ir/api/v1"
    : `${serverTestIp}:8075/api/v1`;
const panelServiceBaseUrl =
  window.globalConfig?.mode === "production"
    ? "https://repairservice.baaz.ir/api/v1"
    : `${serverTestIp}:8091/api/v1`;
// =========================================================================
export const proxyServerUrl = {
  // authentication Controller
  login: `${panelServiceBaseUrl}/Users/Token`,

  // file infos
  removeFileFromFolderById: `${panelServiceBaseUrl}/FileInfos/RemoveFileFromFolderById`,
  getFilesWithPagination: `${panelServiceBaseUrl}/FileInfos/GetFilesWithPagination`,
  uploadFileToFolder: `${panelServiceBaseUrl}/FileInfos/UploadFileToFolder`,
  getFileById: `${panelServiceBaseUrl}/FileInfos/GetFileById`,
  uploadFile: `${panelServiceBaseUrl}/FileInfos/UploadFile`,

  // car Controller
  deleteAddressRepair: `${panelServiceBaseUrl}/Car/DeleteAddress/`,
  getCarById: `${panelServiceBaseUrl}/Car/GetCarById/`,
  getCarsRepair: `${panelServiceBaseUrl}/Car/GetCars`,
  updateCar: `${panelServiceBaseUrl}/Car/UpdateCar`,
  createCar: `${panelServiceBaseUrl}/Car/CreateCar`,
  getCars: `${panelServiceBaseUrl}/Car/GetCars`,

  // repair Controller
  deleteRepairReceptionDetailById: `${panelServiceBaseUrl}/Repair/DeleteRepairReceptionDetailById`,
  getRepairReceptionsByCustomerId: `${panelServiceBaseUrl}/Repair/GetRepairReceptionsByCustomerId`,
  getRepairReceptionForUpdateById: `${panelServiceBaseUrl}/Repair/GetRepairReceptionProductById/`,
  generateRepairReceptionFactors: `${panelServiceBaseUrl}/Repair/GenerateRepairReceptionFactors`,
  updateRepairReceptionByProblem: `${panelServiceBaseUrl}/Repair/UpdateRepairReceptionByProblem`,
  createRepairFactorRequest: `${panelServiceBaseUrl}/Repair/CreateRepairFactorRequest`,
  dischargeRepairReception: `${panelServiceBaseUrl}/Repair/DischargeRepairReception`,
  repairReceptionSummary: `${panelServiceBaseUrl}/Repair/repair-reception-summary`,
  getRepairReceptionById: `${panelServiceBaseUrl}/Repair/GetRepairReceptionById`,
  createRepairReception: `${panelServiceBaseUrl}/Repair/CreateRepairReception`,
  updateRepairReception: `${panelServiceBaseUrl}/Repair/UpdateRepairReception`,
  deleteRepairReception: `${panelServiceBaseUrl}/Repair/DeleteRepairReception`,
  getRepairReceptions: `${panelServiceBaseUrl}/Repair/GetRepairReceptions`,
  getCustomerCars: `${panelServiceBaseUrl}/Repair/GetCustomerCars/`,
  salesViewByCustomerAndByCarId: `${panelServiceBaseUrl}/Repair`,
  scanProduct: `${panelServiceBaseUrl}/Repair/ScanProduct`,

  // customer Controller
  getCustomers: `${panelServiceBaseUrl}/Customer/GetCustomersV2`,

  // user Controller
  getCurrentUserAccesses: `${panelServiceBaseUrl}/UserSecurity/GetCurrentUserAccesses`,
  resetPasswordTwoFactor: `${panelServiceBaseUrl}/Users/ResetPasswordTwoFactor`,
  getTokenOnValidation: `${panelServiceBaseUrl}/Users/GetTokenOnValidation`,
  getResetPasswordCode: `${panelServiceBaseUrl}/Users/GetResetPasswordCode`,

  // mechanic Controller
  getActiveMechanics: `${panelServiceBaseUrl}/Mechanic/GetActiveMechanics`,
  getAllMechanics: `${panelServiceBaseUrl}/Mechanic/GetAllMechanics`,
  getMechanicById: `${panelServiceBaseUrl}/Mechanic/GetMechanicById`,
  createMechanic: `${panelServiceBaseUrl}/Mechanic/CreateMechanic`,
  updateMechanic: `${panelServiceBaseUrl}/Mechanic/UpdateMechanic`,
  deleteMechanic: `${panelServiceBaseUrl}/Mechanic/DeleteMechanic`,

  // repairMechanicLeaves Controller
  getMechanicLeaveByMechanicId: `${panelServiceBaseUrl}/RepairMechanicLeaves/GetMechanicLeaveByMechanicId`,
  geMechanicLeavetByDateRange: `${panelServiceBaseUrl}/RepairMechanicLeaves/GeMechanicLeavetByDateRange`,
  createRepairMechanicLeave: `${panelServiceBaseUrl}/RepairMechanicLeaves/CreateRepairMechanicLeave`,
  updateRepairMechanicLeave: `${panelServiceBaseUrl}/RepairMechanicLeaves/UpdateRepairMechanicLeave`,
  deleteRepairMechanicLeave: `${panelServiceBaseUrl}/RepairMechanicLeaves/DeleteRepairMechanicLeave`,
  getMechanicLeaveById: `${panelServiceBaseUrl}/RepairMechanicLeaves/GetMechanicLeaveById`,
  getAllMechanicLeave: `${panelServiceBaseUrl}/RepairMechanicLeaves/GetAllMechanicLeave`,

  // repairServices Controller
  getCustomerProblemById: `${panelServiceBaseUrl}/RepairServices/GetCustomerProblemById`,
  updateProblemIsTested: `${panelServiceBaseUrl}/RepairServices/UpdateProblemIsTested`,
  createCustomerProblem: `${panelServiceBaseUrl}/RepairServices/CreateCustomerProblem`,
  deleteCustomerProblem: `${panelServiceBaseUrl}/RepairServices/DeleteCustomerProblem`,
  updateCustomerProblem: `${panelServiceBaseUrl}/RepairServices/UpdateCustomerProblem`,
  getAllRepairServices: `${panelServiceBaseUrl}/RepairServices/GetAllRepairServices`,
  getRepairServiceById: `${panelServiceBaseUrl}/RepairServices/GetRepairServiceById`,
  createRepairService: `${panelServiceBaseUrl}/RepairServices/CreateRepairService`,
  updateRepairService: `${panelServiceBaseUrl}/RepairServices/UpdateRepairService`,
  deleteRepairService: `${panelServiceBaseUrl}/RepairServices/DeleteRepairService`,
  getCustomerProblems: `${panelServiceBaseUrl}/RepairServices/GetCustomerProblems`,

  // repairSchedule Controller
  getSchedulesByMechanicId: `${panelServiceBaseUrl}/RepairSchedule/schedules/by-mechanic/`,
  getAvailability: `${panelServiceBaseUrl}/RepairSchedule/availability`,
  getScheduleById: `${panelServiceBaseUrl}/RepairSchedule/schedules/`,
  updateSchedule: `${panelServiceBaseUrl}/RepairSchedule/schedules/`,
  getAllSchedules: `${panelServiceBaseUrl}/RepairSchedule/schedules`,
  deleteSchedule: `${panelServiceBaseUrl}/RepairSchedule/schedules/`,
  createSchedule: `${panelServiceBaseUrl}/RepairSchedule/schedules`,
  receptions: `${panelServiceBaseUrl}/RepairSchedule/receptions`,

  // RepairReceptionService Controller
  getAllRepairReceptionServices: `${panelServiceBaseUrl}/RepairReceptionService/GetRepairReceptionServicesGroupedByProblems`,
  updateCustomerOldPartConfirmation: `${panelServiceBaseUrl}/RepairReceptionService/UpdateCustomerOldPartConfirmation`,
  getRepairReceptionServiceById: `${panelServiceBaseUrl}/RepairReceptionService/GetRepairReceptionServiceById`,
  updateRepairReceptionService: `${panelServiceBaseUrl}/RepairReceptionService/UpdateRepairReceptionService`,
  deleteRepairReceptionService: `${panelServiceBaseUrl}/RepairReceptionService/DeleteRepairReceptionService`,
  saveRepairReceptionServices: `${panelServiceBaseUrl}/RepairReceptionService/SaveRepairReceptionServices`,
  getRepairReceptionServices: `${panelServiceBaseUrl}/RepairReceptionService/GetRepairReceptionServices`,
  updateDetailHasOldPart: `${panelServiceBaseUrl}/RepairReceptionService/UpdateDetailHasOldPart`,
  updateServiceStatus: `${panelServiceBaseUrl}/RepairReceptionService/UpdateServiceStatus`,
  getRepairReceptionStatuses: `${panelServiceBaseUrl}/Repair/GetRepairReceptionStatuses`,

  // RepairProductRequest Controller
  getAllRepairProductRequestsByReceptionId: `${panelServiceBaseUrl}/RepairProductRequest/GetAllRepairProductRequestsByReceptionId`,
  getRepairProductRequestsByReceptionId: `${panelServiceBaseUrl}/RepairProductRequest/GetRepairProductRequestsByReceptionId`,
  addApprovedProductsToReceptionDirect: `${panelServiceBaseUrl}/RepairProductRequest/AddApprovedProductsToReceptionDirect`,
  getRepairProductRequestsByProblemId: `${panelServiceBaseUrl}/RepairProductRequest/GetRepairProductRequestsByProblemId`,
  getAllProductRequestsByReceptionId: `${panelServiceBaseUrl}/RepairProductRequest/GetAllProductRequestsByReceptionId`,
  getPendingRepairProductRequests: `${panelServiceBaseUrl}/RepairProductRequest/GetPendingRepairProductRequests`,
  createBatchRepairProductRequest: `${panelServiceBaseUrl}/RepairProductRequest/CreateBatchRepairProductRequest`,
  batchReviewRepairProductRequest: `${panelServiceBaseUrl}/RepairProductRequest/BatchReviewRepairProductRequest`,
  getRepairProductRequestSummary: `${panelServiceBaseUrl}/RepairProductRequest/GetRepairProductRequestSummary`,
  addApprovedProductsToReception: `${panelServiceBaseUrl}/RepairProductRequest/AddApprovedProductsToReception`,
  getRepairProductRequestById: `${panelServiceBaseUrl}/RepairProductRequest/GetRepairProductRequestById`,
  createRepairProductRequest: `${panelServiceBaseUrl}/RepairProductRequest/CreateRepairProductRequest`,
  updateRepairProductRequest: `${panelServiceBaseUrl}/RepairProductRequest/UpdateRepairProductRequest`,
  deleteRepairProductRequest: `${panelServiceBaseUrl}/RepairProductRequest/DeleteRepairProductRequest`,
  reviewRepairProductRequest: `${panelServiceBaseUrl}/RepairProductRequest/ReviewRepairProductRequest`,
  updateStatusToBuyCompleted: `${panelServiceBaseUrl}/RepairProductRequest/UpdateStatusToBuyCompleted`,
  getProductDetailsByProblem: `${panelServiceBaseUrl}/RepairProductRequest/GetProductDetailsByProblem`,
  getOutOfStockRequests: `${panelServiceBaseUrl}/RepairProductRequest/GetOutOfStockRequests`,
  buyRequest: `${panelServiceBaseUrl}/RepairProductRequest/BuyRequest`,

  // product Controller
  getProductsThatContainsText: `${copserverUrl}/Product/GetProductsThatContainsText`,

  // customer Controller
  getCustomerAccountBalance: `${copserverUrl}/Customer/GetCustomerAccountBalance`,

  // RepairReceptionFile Controller
  sendFileLinksNotification: `${panelServiceBaseUrl}/RepairReceptionFile/SendFileLinksNotification`,
  getFilesByReceptionId: `${panelServiceBaseUrl}/RepairReceptionFile/GetFilesByReceptionId`,
  uploadFileRepairReceptionFile: `${panelServiceBaseUrl}/RepairReceptionFile/UploadFile`,
  deleteFileRepairReceptionFile: `${panelServiceBaseUrl}/RepairReceptionFile/DeleteFile`,
  updateShowCustomer: `${panelServiceBaseUrl}/RepairReceptionFile/UpdateShowCustomer`,

  // RepairMechanicProductRequest Controller
  getMechanicProductRequestByProblemId: `${panelServiceBaseUrl}/RepairMechanicProductRequest/GetMechanicProductRequestByProblemId`,
  createMechanicProductRequest: `${panelServiceBaseUrl}/RepairMechanicProductRequest/CreateMechanicProductRequest`,
  deleteMechanicProductRequest: `${panelServiceBaseUrl}/RepairMechanicProductRequest/DeleteMechanicProductRequest`,
  getMechanicProductRequest: `${panelServiceBaseUrl}/RepairMechanicProductRequest/GetMechanicProductRequest`,

  // MechanicPerformance Controller
  getMechanicPerformance: `${panelServiceBaseUrl}/MechanicPerformance/GetMechanicPerformance`,

  // RepairServiceFactor Controller
  getRepairServiceFactorById: `${panelServiceBaseUrl}/RepairServiceFactor/GetRepairServiceFactorById`,
  getAllRepairServiceFactor: `${panelServiceBaseUrl}/RepairServiceFactor/GetAllRepairServiceFactor`,
  deleteRepairServiceFactor: `${panelServiceBaseUrl}/RepairServiceFactor/DeleteRepairServiceFactor`,
  saveRepairServiceFactor: `${panelServiceBaseUrl}/RepairServiceFactor/SaveRepairServiceFactor`,

  // RepairReport Controller
  getAverageEstimatedTime: `${panelServiceBaseUrl}/RepairReport/GetAverageEstimatedTime`,
  getReceptionsCount: `${panelServiceBaseUrl}/RepairReport/GetReceptionsCount`,
  getAverageStayTime: `${panelServiceBaseUrl}/RepairReport/GetAverageStayTime`,
  getCurrentVehicles: `${panelServiceBaseUrl}/RepairReport/GetCurrentVehicles`,
  getDelayedRepairs: `${panelServiceBaseUrl}/RepairReport/GetDelayedRepairs`,

  //RepairProductFractional Controller
  updateRepairProductFractionalPurchased: `${panelServiceBaseUrl}/RepairProductFractional/UpdateRepairProductFractionalPurchased`,
  getRepairProductFractionalsByPlate: `${panelServiceBaseUrl}/RepairProductFractional/GetRepairProductFractionalsByPlate`,
  createRepairProductFractional: `${panelServiceBaseUrl}/RepairProductFractional/CreateRepairProductFractional`,

  // MechanicAttendance Controller
  getMechanicAttendanceByMechanicId: `${panelServiceBaseUrl}/MechanicAttendance/GetMechanicAttendanceByMechanicId`,
  getMechanicAttendanceByDateRange: `${panelServiceBaseUrl}/MechanicAttendance/GetMechanicAttendanceByDateRange`,
  getMechanicAttendanceById: `${panelServiceBaseUrl}/MechanicAttendance/GetMechanicAttendanceById`,
  createMechanicAttendance: `${panelServiceBaseUrl}/MechanicAttendance/CreateMechanicAttendance`,
  updateMechanicAttendance: `${panelServiceBaseUrl}/MechanicAttendance/UpdateMechanicAttendance`,
  deleteMechanicAttendance: `${panelServiceBaseUrl}/MechanicAttendance/DeleteMechanicAttendance`,
};
