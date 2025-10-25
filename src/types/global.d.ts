// Global types moved from project root type.d.ts so TS can include them via src
// Keep this file in sync with root type.d.ts if needed

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
    userId: number;
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
    headOfMechanicId?: number;
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
  headOfMechanicId?: number;
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
interface IUpdateRepairProductFractionalPurchased {
  rejectReason?: string;
  buyApprovedQty: number;
  productId: number;
  problemId: number;
}
interface IGetRepairProductFractionalsByPlateProducts {
  usageQty: number;
  buyQty: number;
  value: number;
  isManual: boolean;
  globalPrice: number;
  id: number;
}
interface IGetRepairProductFractionalsByPlate {
  plateNumber: string;
  products: IGetRepairProductFractionalsByPlateProducts[];
  productCount: number;
  customerName: string;
  plateId: number;
}
interface ICreateRepairProductFractional {
  productCode?: string;
  problemId?: number;
  barcodes: string[];
}
interface ICreateMechanicAttendance {
  mechanicId: number;
  description?: string;
  type: number;
  dateTime: string;
  id?: number;
}
interface IGetMechanicAttendanceByMechanicId {
  mechanicFullName: string;
  createdByUserFullname: string;
  description: string;
  mechanicId: number;
  userId: number;
  dateTime: string;
  type: number;
  id: number;
}
interface IGetMechanicAttendanceById {
  mechanicFullName: string;
  createdByUserFullname: string;
  description: string;
  mechanicId: number;
  userId: number;
  dateTime: string;
  type: number;
  id: number;
}
interface IGetRepairReceptionService {
  performedByMechanicName: string;
  estimatedMinute: number;
  isSelectedForFactorLocal?: boolean;
  isSelectedForFactor: boolean;
  repairReceptionServiceId: number;
  description: string;
  serviceTitle: string;
  serviceCount: number;
  servicePrice: number;
  hasFactor: boolean;
  performedByMechanicId: number;
  id: number;
}
interface IMechanicPerformance {
  fromDate: string;
  toDate: string;
  mechanicId: number;
  serviceId: number;
}
interface IMechanicPerformanceResponse {
  averageServicePrice: number;
  averageServiceDurationMinutes: number;
  services: {
    percentage: number;
    title: string;
    value: number;
  }[];
  mechanics: {
    percentage: number;
    value: number;
    name: string;
  }[];
}
