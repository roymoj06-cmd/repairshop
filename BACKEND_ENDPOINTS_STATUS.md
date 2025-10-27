# وضعیت Endpoint های Backend

## ✅ Endpoint های سینک شده

### 1. RepairController
- ✅ GetCustomerCars
- ✅ CreateRepairReception
- ✅ UpdateRepairReception
- ✅ DeleteRepairReception
- ✅ GetRepairReceptions
- ✅ ScanProduct
- ✅ GenerateRepairReceptionFactors
- ✅ DischargeRepairReception
- ✅ GetRepairReceptionProductById
- ✅ sales-view
- ✅ inventory-view
- ✅ repair-reception-summary

### 2. CarController
- ✅ CreateCar
- ✅ UpdateCar
- ✅ GetCarById
- ✅ GetCars
- ✅ GetCarsRepair
- ✅ DeleteAddress

### 3. CustomerController
- ✅ GetCustomersV2

### 4. FileInfosController
- ✅ UploadFile
- ✅ UploadFileToFolder
- ✅ GetFileById
- ✅ RemoveFileFromFolderById
- ✅ GetFilesWithPagination

### 5. UsersController
- ✅ Token (Login)

### 6. UserSecurityController
- ✅ GetCurrentUserAccesses

## ❌ Endpoint های موجود در Backend ولی سینک نشده

### 1. RepairController (اضافی)
- ❌ GetRepairReceptionById
- ❌ UpdateRepairReceptionByProblem
- ❌ GetOrderById
- ❌ UpdateTemporaryReleaseStatus
- ❌ UpdateResidentVehicleStatus
- ❌ DeleteRepairReceptionDetailById
- ❌ CreateRepairFactorRequest
- ❌ GetAllRepairFactorRequests
- ❌ GetRepairFactorRequestById
- ❌ ChangeStatusRepairFactorRequest
- ❌ process-factors
- ❌ InsertInvDocForCustomerOwner
- ❌ GetRepairReceptionsByCustomerId

### 2. CarController (اضافی)
- ❌ GetCarTips
- ❌ GetAllCarCompanies
- ❌ GetCarTipsByCompanyId

### 3. CustomerController (کل controller)
- ❌ CheckIfCustomerHasCredit
- ❌ AddPhoneNumberV2
- ❌ GetCustomerAccountBalance
- ❌ GetCustomerAccountBalanceToExcel
- ❌ GetAllCustomerAccountBalance
- ❌ GetAllCustomerAccountBalanceToExcel
- ❌ UpdateAllCustomersBalanceAccounts
- ❌ UpdateCustomersBalanceAccounts

### 4. UsersController (کل controller)
- ❌ GetResetPasswordCode
- ❌ ResetPasswordTwoFactor
- ❌ CreateUser
- ❌ GetDeletedUser
- ❌ GetUserDependency
- ❌ ReviveUser
- ❌ UpdateUser
- ❌ GetUsers
- ❌ GetProvisionUsers
- ❌ GetInventoryUsers
- ❌ و 10+ endpoint دیگر

### 5. MechanicController (کل controller)
- ❌ GetActiveMechanics
- ❌ GetAllMechanics
- ❌ GetMechanicById
- ❌ CreateMechanic
- ❌ UpdateMechanic
- ❌ DeleteMechanic

### 6. HolidayCalendarController (کل controller)
- ❌ GetHolidayById
- ❌ GetHolidayByShamsiDate
- ❌ CreateHoliday
- ❌ UpdateHoliday
- ❌ DeleteHoliday

### 7. MechanicAttendanceController
### 8. MechanicPerformanceController
### 9. ProductController
### 10. RepairMechanicLeavesController
### 11. RepairMechanicProductRequestController
### 12. RepairProductFractionalController
### 13. RepairProductRequestController
### 14. RepairReceptionFileController
### 15. RepairReceptionServiceController
### 16. RepairReportController
### 17. RepairScheduleController
### 18. RepairServiceFactorController
### 19. RepairServicesController

## نتیجه
- رویکرد فعلی: **Minimal** - فقط endpoint های ضروری
- تصمیم: آیا می‌خواهید سایر endpoint ها را نیز اضافه کنیم یا همین کافی است؟

