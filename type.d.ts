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
interface IUpdateRepairReception {
  repairReception: {
    repairReceptionId?: number;
    description?: string;
    customerId: number;
    fileIds?: number[];
    carId: number;
    details?: {
      repairReceptionDetailId: number;
      overridedUnitPrice: number;
      isCustomerOwner: boolean;
      productId: number;
      unitPrice: number;
      barcodeId: number;
      mechanic: string;
      scanCode: string;
      qty: number;
    }[];
  };
}
interface IUpdateCarRepair {
  plateSection1?: string;
  plateSection2?: string;
  plateSection3?: string;
  plateSection4?: string;
  customerId: number;
  carCompany: string;
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
  vehicleName: string;
  plateNumber: string;
  description: string;
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
    repairReceptionId: number;
    problemServices: {
      repairCustomerProblemId: number;
      services: {
        performedByMechanicId: number;
        estimatedMinute: number;
        serviceCount: number;
        serviceId: number;
      }[];
    }[];
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
  totalPrice: number;
  serviceId: number;
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
    productId: number;
    qty: number;
  }[];
}
interface IBatchReviewRepairProductRequest {
  requests: {
    id: number;
    status: number;
    rejectReason: string;
    approvedQty: number;
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
        id: number;
        serviceId: number;
        serviceCount: number;
        performedByMechanicId: number;
        price: number;
        estimatedMinute: number;
        status: number;
        isDeleted: boolean;
      }[];
    }[];
  };
}
