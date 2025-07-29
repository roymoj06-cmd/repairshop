interface IPaginationForService {
  page: number;
  size: number;
}
interface SelectOption {
  value: string | number;
  label: string;
}
interface UserAccess {
  description?: string;
  name: string;
  code: string;
  id: string;
}
interface IModalGlobal {
  show: boolean;
  data?: any;
  type?: string;
}
interface UserAccessResponse {
  accesses: UserAccess[];
  role: string;
}
interface IUpdateRepairReceptionByProblem {
  repairReception: {
    repairCustomerProblemId: number;
    details: {
      isCustomerOwner: boolean;
      productId: number;
      qty: number;
    }[];
  };
}
interface IUpdateRepairReception {
  repairReception: {
    receiverNameAtReception?: string;
    driverPhoneAtDelivery?: string;
    customerPhoneAtReturn?: string;
    customerEstimatedTime?: number;
    driverNameAtDelivery?: string;
    customerNameAtReturn?: string;
    receptionDateTime?: string;
    staffNameAtReturn?: string;
    repairReceptionId?: number;
    returnDateTime?: string;
    carKilometers?: number;
    description?: string;
    customerId: number;
    carColor?: string;
    carId: number;
  };
}
interface IUpdateCarRepair {
  plateSection1?: string;
  plateSection2?: string;
  plateSection3?: string;
  plateSection4?: string;
  customerId: number;
  carCompany: string;
  carColor?: string;
  carType: string;
  carTipId: any;
  id?: number;
}
interface IProductScanned {
  productCodeBarcodeCode?: string;
  barcodeCode: string;
  productCode: string;
  countryName: string;
  productName: string;
  barcodeId?: number;
  isManual?: boolean;
  partName: string;
  id: number;
}
interface IGetRepairReceptions {
  plateSection1: string;
  plateSection2: string;
  plateSection3: string;
  plateSection4: string;
  receptionDate: string;
  receptionTime: string;
  customerName: string;
  carTipTitle: string;
  vehicleName: string;
  plateNumber: string;
  description: string;
  carColor: string;
  totalPrice: number;
  code: number;
  status: true;
  id: number;
}
interface IGenerateRepairRecaptionFactors {
  repairReception: {
    repairReceptionId: number;
    customerId: number;
    files?: { id: number; title: string }[];
    selectedDetails: [
      {
        isSelectedForFactorLocal?: boolean;
        isSelectedForFactor: boolean;
        overrideProductName: string;
        isCustomerOwner: boolean;
        overridePrice: number;
        productId: number;
        qty: number;
      }
    ];
  };
}
interface IGetReceptionForShowToSales {
  productId: number;
  productCode: string;
  productName: string;
  qty: number;
  brand: string;
  countryName: string;
  lastPurchasePrice: number;
  priceValue: number;
  overridePrice?: number;
  isSelectedForFactor: boolean;
  isSelectedForFactorLocal: boolean;
  isSelectedForRequest: boolean;
  isCustomerOwner: boolean;
  status?: boolean;
  receptionDetailId?: number;
}
interface ISaleViewByCustomerAndByCarId {
  customerId: number;
  carId: number;
  id: number;
}
type plateSection = {
  plateSection1?: string | undefined;
  plateSection2?: string | undefined;
  plateSection3?: string | undefined;
  plateSection4?: string | undefined;
  customerId?: number;
  carCompany?: string;
  isDischarged?: any;
  carTipId?: number;
  carColor?: string;
};
interface ICustomer {
  customerId: number;
  fullName: string;
  userId: number;
}
interface IVehicleType {
  name: string;
  id: number;
}
interface IIssue {
  description: string;
  id: string;
}
interface IServiceAdmissionForm {
  notifyWorkshopManager: boolean;
  notifyWarehouseManager: boolean;
  preferredRepairTime: string;
  isReturnedVehicle: boolean;
  notifyManagement: boolean;
  plateSection1?: string;
  plateSection2?: string;
  plateSection3?: string;
  plateSection4?: string;
  customerId: number;
  carCompany: string;
  issues: IIssue[];
  carTipId: number;
  carType: string;
  files: File[];
  carId: number;
  // Updated fields based on new model
  customerEstimatedTime?: number;
  carKilometers?: number;
  description?: string;
  carColor?: string;
  receiverNameAtReception?: string;
  receptionDateTime?: Date;
  driverNameAtDelivery?: string;
  driverPhoneAtDelivery?: string;
  staffNameAtReturn?: string;
  returnDateTime?: Date;
  customerNameAtReturn?: string;
  customerPhoneAtReturn?: string;
}
interface IGetAllRepairServices {
  commissionPercent: number;
  durationInMinutes: number;
  estimatedMinute: number;
  lastUpdateDm: string;
  lastUpdateDs: string;
  serviceTitle: string;
  expertLevel: number;
  isActive: boolean;
  createDm: string;
  createDs: string;
  price: number;
  id: number;
}
interface ICreateOrUpdateRepairService {
  commissionPercent: number;
  durationInMinutes: number;
  estimatedMinute: number;
  serviceTitle: string;
  expertLevel: number;
  isActive: boolean;
  price: number;
  id?: number;
}
interface ICreateOrUpdateMechanic {
  mechanic: {
    expertLevel: number;
    isActive: boolean;
    fullName: string;
    userId?: number;
    id?: number;
  };
}
interface IGetAllMechanics {
  expertLevel: number;
  isActive: boolean;
  fullName: string;
  userName: string;
  createDm: string;
  userId: number;
  id: number;
}
interface IGetActiveMechanics {
  expertLevel: number;
  isActive: boolean;
  fullName: string;
  userName: string;
  createDm: string;
  userId: number;
  id: number;
}
interface IGetMechanicById {
  expertLevel: number;
  isActive: boolean;
  fullName: string;
  userName: string;
  createDm: string;
  userId: number;
  id: number;
}
interface ICreateOrUpdateMechanicLeave {
  description?: string;
  mechanicId?: number;
  date?: string;
  id?: number;
}
interface IGetAllMechanicLeaves {
  mechanicFullName: string;
  description: string;
  mechanicId: number;
  date: string;
  id: number;
}
interface ICreateOrUpdateCustomerProblem {
  repairReceptionId: number | string;
  description: string;
  id?: number;
}
interface ICreateOrUpdateRepairReceptionService {
  request: {
    repairReceptionServiceId: number;
    repairCustomerProblemId: number;
    performedByMechanicId: number;
    estimatedMinute: number;
    serviceCount: number;
    description?: string;
    serviceId: number;
    startDate: string;
    endDate: string;
    status: number;
    price: number;
  };
}
interface IAllGetRepairReceptionService extends IPaginationForService {
  repairReceptionId: number | string | undefined;
}
interface IGetAllRepairReceptionServices {
  problems: ProblemsService[];
  repairReceptionId: number;
}
interface ProblemsService {
  totalEstimatedMinutes: number;
  problemDescription: string;
  totalProblemPrice: number;
  services: Service[];
  problemId: number;
  isTested?: boolean;
}
interface Service {
  repairCustomerProblemDescription: string;
  performedByMechanicName: string;
  repairCustomerProblemId: number;
  performedByMechanicId: number;
  repairReceptionId: number;
  createdByUserName: string;
  createdByUserId: number;
  estimatedMinute: number;
  serviceTitle: string;
  servicePrice: number;
  serviceCount: number;
  description?: string;
  statusTitle: string;
  totalPrice: number;
  isTested?: boolean;
  serviceId: number;
  startDate: string;
  statusId: number;
  endDate: string;
  status: number;
  id: number;
}
interface getRepairProductRequestsByReceptionId extends IPaginationForService {
  receptionId: number;
}
interface getRepairProductRequestsByProblemId extends IPaginationForService {
  problemId: number;
}
interface ICreateBatchRepairProductRequest {
  repairCustomerProblemId: number;
  products: {
    mechanicRequestId: number;
    productId: number;
    qty: number;
  }[];
}
interface IBatchReviewRepairProductRequest {
  requests: {
    rejectReason: string;
    approvedQty: number;
    status: number;
    id: number;
  }[];
}
interface ICreateOrUpdateRepairProductRequest {
  repairCustomerProblemId: number;
  productId: number;
  qty: number;
}
interface IReviewRepairProductRequest {
  rejectReason: string;
  approvedQty: number;
  status: number;
  id: number;
}
interface IProductSummery {
  invDocDPrice?: number | string;
  productFaragostarName?: string;
  isCustomerOwner?: boolean;
  scanQuantity?: number;
  invDocDTotal?: number;
  thumbnailPath: string;
  productName?: string;
  keywordsName: string;
  multiPleQty: number;
  productCode: string;
  invDocDQty?: number;
  partNumber: string;
  isManual?: boolean;
  productId: number;
  brandName: string;
  vehicles?: string;
  quantity: number;
  isGift: boolean;
  country: string;
  brand: string;
  image: string;
  name: string;
  qty?: number;
}
interface IUpdateRepairReceptionServicesForProblems {
  request: {
    repairReceptionId: number;
    problemServices: {
      repairCustomerProblemId: number;
      services: {
        performedByMechanicId: number;
        estimatedMinute: number;
        serviceCount: number;
        isDeleted: boolean;
        serviceId: number;
        status: number;
        price: number;
        id: number;
      }[];
    }[];
  };
}
interface IBuyRequest {
  requestId: number;
}
interface IGetAllRepairProductRequestsByReceptionId {
  repairCustomerProblemId: number;
  problemDescription: string;
  repairProductRequestDto: [
    {
      repairCustomerProblemId: number;
      requestedByUserName: string;
      problemDescription: string;
      reviewedByUserName: string;
      statusDescription: string;
      requestedByUserId: number;
      reviewedByUserId: number;
      reviewedDate: string;
      rejectReason: string;
      requestedQty: number;
      productCode: string;
      productName: string;
      requestedId: number;
      isAccepted: boolean;
      countryName: string;
      createDate: string;
      productId: number;
      brandName: string;
      statusId: number;
      usedQty: number;
      realQty: number;
      status: number;
    }
  ];
}
interface IAddApprovedProductsToReception {
  problemId: number;
  barcode: string;
}
interface IGetRepairProductRequestSummary {
  buyCompletedRequests: number;
  buyRequestedRequests: number;
  cancelledRequests: number;
  repairReceptionId: number;
  notFoundRequests: number;
  totalRequests: number;
  items: [
    {
      buyRequestedByUserFullname: string;
      repairCustomerProblemId: number;
      requestedByUserFullname: string;
      buyRequestedByUserId: number;
      problemDescription: string;
      requestedByUserId: number;
      statusDescription: string;
      buyRejectReason: string;
      requestedQty: number;
      requestedId: number;
      productCode: string;
      productName: string;
      countryName: string;
      buyDateTime: string;
      createDate: string;
      productId: number;
      brandName: string;
      statusId: number;
      realQty: number;
      usedQty: number;
      status: number;
    }
  ];
}
interface IGetReceptionProductRequestsById {
  plateSection1: string;
  plateSection2: string;
  plateSection3: string;
  plateSection4: string;
  carColor: string;
  receptionDate: string;
  receptionTime: string;
  customerName: string;
  plateNumber: string;
  description: string;
  customerId: number;
  totalPrice: number;
  status: boolean;
  carId: number;
  code: number;
  id: number;
  details: {
    repairReceptionDetailId: number;
    isCustomerOwner: boolean;
    hasOldPart?: boolean;
    productCode: string;
    barcodeCode: string;
    countryName: string;
    productName: string;
    partNumber: string;
    productId: number;
    barcodeId: number;
    mechanic: string;
    partName: string;
    title: string;
    brand: string;
  }[];
}
interface ICreateRepairFactorRequest {
  repairFactorRequest: {
    repairReceptionId: number;
    customerId: number;
    files?: { id: number; title: string }[];
    selectedDetails: [
      {
        isSelectedForFactorLocal?: boolean;
        isSelectedForRequest?: boolean;
        isSelectedForFactor?: boolean;
        overrideProductName: string;
        isCustomerOwner: boolean;
        overridePrice: number;
        productId: number;
        qty: number;
      }
    ];
  };
}
type Task = {
  id: string;
  user: string;
  startDay: number;
  startHour: number; // ساعت شروع (0-7)
  duration: number; // مدت زمان به ساعت
  title: string;
  // برای تسک‌های چند روزه
  endDay?: number; // روز پایان (اگر null باشد یعنی همان روز شروع)
  endHour?: number; // ساعت پایان در روز آخر
  // اطلاعات اضافی برای ویرایش
  plateSection1?: string;
  plateSection2?: string;
  plateSection3?: string;
  plateSection4?: string;
  receptionId?: number;
  carColor?: string;
  serviceId?: number;
  mechanicId?: number;
};
interface ICreateMechanicProductRequest {
  productTitle: string;
  problemId: number;
  fileId: number;
}
interface IMechanicPerformance {
  serviceId?: number;
  fromDate?: string;
  userId: number;
  toDate?: string;
}
interface IMechanicPerformanceResponse {
  totalTimeSpentMinutes: number;
  mechanicName: string;
  totalProfit: number;
  fromDate: string;
  userId: number;
  toDate: string;
  services: {
    commissionPercent: number;
    timeSpentMinutes: number;
    servicePrice: number;
    serviceName: string;
    serviceId: number;
    startDate: string;
    basePrice: number;
    endDate: string;
    profit: number;
  }[];
}
interface IGetMechanicProductRequestByProblemId {
  problemTitle: string;
  productTitle: string;
  registered: boolean;
  problemId: number;
  fileId: number;
  id: number;
}
interface IGetRepairReceptionService {
  repairCustomerProblemDescription: string;
  isSelectedForFactorLocal?: boolean;
  performedByMechanicName: string;
  repairCustomerProblemId: number;
  performedByMechanicId: number;
  createdByUserName: string;
  repairReceptionId: number;
  createdByUserId: number;
  estimatedMinute: number;
  serviceTitle: string;
  servicePrice: number;
  serviceCount: number;
  totalPrice: number;
  hasFactor: boolean;
  serviceId: number;
  startDate: string;
  endDate: string;
  status: string;
  description?: string;
  id: number;
}
interface IGetRepairReceptionServices {
  services: IGetRepairReceptionService[];
  totalEstimatedMinutes: number;
  repairReceptionId: number;
  totalPrice: number;
}
interface IRepairServiceFactor {
  repairReceptionId: number;
  description: string;
  id?: number;
  details: {
    repairReceptionServiceId?: number;
    overridedServiceTitle: string;
    overridedUnitPrice: number;
    unitPrice: number;
    quantity: number;
    id?: number;
  }[];
}
interface IUpdateProblemIsTested {
  isTested: boolean;
  problemId: number;
}
interface IUpdateDetailHasOldPart {
  hasOldPart: boolean;
  detailId: number;
}
interface IUpdateServiceStatus {
  serviceId: number;
  status: number;
}
interface IGetRepairReceptionStatuses {
  persianName: string;
  name: string;
  id: number;
}
interface IGetAllRepairServiceFactor {
  shamsiFactorDate: string;
  repairReceptionId: number;
  customerName: string;
  customerCode: string;
  plateNumber: string;
  description: string;
  factorDate: string;
  totalPrice: number;
  carInfo: string;
  code: number;
  vin: string;
  id: number;
  details: {
    overridedServiceTitle: string;
    problemDescription: string;
    overridedUnitPrice: number;
    estimatedMinute: number;
    serviceTitle: string;
    servicePrice: number;
    serviceCount: number;
    mechanicName: string;
    totalPrice: number;
    statusText: string;
    serviceId: number;
    startDate: string;
    unitPrice: number;
    quantity: number;
    endDate: string;
    status: number;
  }[];
}
interface IGetAllRepairProductRequests {
  buyRequestedByUserFullname: string;
  repairCustomerProblemId: number;
  requestedByUserFullname: string;
  buyRequestedByUserId: number;
  problemDescription: string;
  statusDescription: string;
  requestedByUserId: number;
  buyUserFullname: string;
  buyRejectReason: string;
  customerName: string;
  requestedQty: number;
  rejectReason: string;
  plateNumber: string;
  requestedId: number;
  productCode: string;
  productName: string;
  countryName: string;
  barcodeCode: string;
  buyDateTime: string;
  createDate: string;
  brandName: string;
  productId: number;
  barcodeId: number;
  statusId: number;
  realQty: number;
  usedQty: number;
  status: number;
}
interface IGetRepairReceptionServiceForEdit {
  repairCustomerProblemDescription: string;
  performedByMechanicName: string;
  repairCustomerProblemId: number;
  performedByMechanicId: number;
  createdByUserName: string;
  repairReceptionId: number;
  createdByUserId: number;
  estimatedMinute: number;
  serviceTitle: string;
  servicePrice: number;
  serviceCount: number;
  statusTitle: string;
  hasFactor: boolean;
  totalPrice: number;
  serviceId: number;
  startDate: string;
  statusId: number;
  status: string;
  id?: number;
}
interface ServiceFormData {
  mechanicId: SelectOption | undefined;
  serviceId: SelectOption | undefined;
  estimatedMinute: number | undefined;
  servicePrice: number | undefined;
  totalPrice: number | undefined;
  originalServiceId?: number;
  description?: string;
  serviceCount: number;
  serviceTitle: string;
  isDeleted?: boolean;
  startDate?: string;
  endDate?: string;
}
interface IGetProductDetailsByProblem {
  repairReceptionDetailId: number;
  isCustomerOwner: boolean;
  productCode: string;
  barcodeCode: string;
  countryName: string;
  productName: string;
  hasOldPart: boolean;
  partNumber: string;
  productId: number;
  barcodeId: number;
  mechanic: string;
  partName: string;
  title: string;
  brand: string;
}
interface IReportDashboardParams {
  fromDate: string;
  toDate: string;
}
interface IUpdateCustomerOldPartConfirmation {
  customerConfirmedOldPart: boolean;
  detailId: number;
  fileIds: number[];
}
interface ICreateRepairProductFractional {
  customerUserId: number;
  productId: number;
  quantity: number;
  carId: number;
}
interface IGetRepairProductFractionalsByPlate {
  productCount: number;
  carId: number;
  products: {
    plateNumber: string;
    productName: string;
    productCode: string;
    description: string;
    productId: number;
    userName: string;
    createDm: string;
    quantity: number;
    userId: number;
    id: number;
  }[];
}
