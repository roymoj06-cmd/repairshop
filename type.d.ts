interface SelectOption {
  value: string | number;
  label: string;
}
interface UserAccess {
  id: string
  name: string
  code: string
  description?: string
}

interface UserAccessResponse {
  accesses: UserAccess[]
  role: string
} 
interface IUpdateRepairReception {
  repairReception: {
    fileIds?: number[]
    repairReceptionId?: number
    description: string
    customerId: number
    carId: number
    details?:
      | any
      | [
          {
            repairReceptionDetailId: number
            overridedUnitPrice: number
            isCustomerOwner: boolean
            productId: number
            unitPrice: number
            barcodeId: number
            mechanic: string
            scanCode: string
            qty: number
          }
        ]
  }
}
interface IUpdateCarRepair {
  plateSection1?: string
  plateSection2?: string
  plateSection3?: string
  plateSection4?: string
  customerId: number
  carCompany: string
  carType: string
  carTipId: any
  id?: number
}
interface IProductScanned {
  productCodeBarcodeCode?: string
  barcodeCode: string
  productCode: string
  countryName: string
  productName: string
  barcodeId?: number
  isManual?: boolean
  partName: string
  id: number
}
interface IGetRepairReceptions {
  plateSection1: string
  plateSection2: string
  plateSection3: string
  plateSection4: string
  receptionDate: string
  receptionTime: string
  customerName: string
  vehicleName: string
  plateNumber: string
  description: string
  totalPrice: number
  code: number
  status: true
  id: number
}
interface IGenerateRepairRecaptionFactors {
  repairReception: {
    repairReceptionId: number
    customerId: number
    files?: { id: number; title: string }[]
    selectedDetails: [
      {
        isSelectedForFactorLocal?: boolean
        isSelectedForFactor: boolean
        overrideProductName: string
        isCustomerOwner: boolean
        overridePrice: number
        productId: number
        qty: number
      }
    ]
  }
}
interface ISaleViewByCustomerAndByCarId {
  customerId: number
  carId: number
  id: number
}
type plateSection = {
  plateSection1?: string | undefined
  plateSection2?: string | undefined
  plateSection3?: string | undefined
  plateSection4?: string | undefined
  isDischarged?: any
  customerId?: number
  carCompany?: string
  carTipId?: number
}

interface ICustomer {
  customerId: number
  fullName: string
}

interface IVehicleType {
  id: number
  name: string
}

interface IIssue {
  id: string
  description: string
}

interface IServiceAdmissionForm {
  isReturnedVehicle: boolean
  customerId: number
  carCompany: string
  carType: string
  carTipId: number
  plateSection1?: string
  plateSection2?: string
  plateSection3?: string
  plateSection4?: string
  vehicleTypeId: number
  issues: IIssue[]
  files: File[]
  preferredRepairTime: string
  notifyManagement: boolean
  notifyWorkshopManager: boolean
  notifyWarehouseManager: boolean
}