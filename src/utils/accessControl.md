# سیستم مدیریت دسترسی هوشمند RepairShop

## مقدمه

این سیستم مدیریت دسترسی بر اساس ساختار درختی دسترسی‌ها طراحی شده و امکان مدیریت آسان و انعطاف‌پذیر دسترسی‌ها را فراهم می‌کند.

## ویژگی‌های کلیدی

### 1. ساختار سلسله‌مراتبی
- **دسترسی‌های اصلی**: بخش‌های اصلی سیستم (پذیرش، مدیریت خودروها، و...)
- **دسته‌های عملیاتی**: زیرمجموعه‌های هر بخش (مشکلات، تعمیرات، قطعات)
- **عملیات**: عملیات‌های خاص (افزودن، ویرایش، حذف)

### 2. Hook های کاربردی
- `useAccessControl()`: Hook اصلی برای بررسی دسترسی‌ها
- `AccessGuard`: کامپوننت برای نمایش شرطی بر اساس دسترسی
- `CategoryGuard`: کامپوننت برای نمایش شرطی بر اساس دسته
- `CombinedAccessGuard`: کامپوننت برای نمایش شرطی ترکیبی

### 3. ثابت‌های دسترسی
- `ACCESS_IDS`: تمام ID های دسترسی به صورت ثابت تعریف شده‌اند

## نحوه استفاده

### 1. استفاده از Hook

```typescript
import { useAccessControl, ACCESS_IDS } from "@/utils/accessControl";

const MyComponent = () => {
  const { hasAccess, hasCategoryAccess, hasMainAccess } = useAccessControl();
  
  // بررسی دسترسی به عملیات خاص
  if (hasAccess(ACCESS_IDS.ADD_PROBLEM)) {
    // نمایش دکمه افزودن مشکل
  }
  
  // بررسی دسترسی به دسته
  if (hasCategoryAccess(ACCESS_IDS.PROBLEMS)) {
    // نمایش بخش مشکلات
  }
  
  // بررسی دسترسی به بخش اصلی
  if (hasMainAccess(ACCESS_IDS.ADMISSION)) {
    // نمایش بخش پذیرش
  }
};
```

### 2. استفاده از کامپوننت‌های Guard

```typescript
import { AccessGuard, ACCESS_IDS } from "@/utils/accessControl";

const MyComponent = () => {
  return (
    <div>
      <AccessGuard accessId={ACCESS_IDS.ADD_PROBLEM}>
        <Button>افزودن مشکل</Button>
      </AccessGuard>
      
      <AccessGuard 
        accessId={ACCESS_IDS.DELETE_PROBLEM}
        fallback={<span>شما مجاز به حذف نیستید</span>}
      >
        <Button color="error">حذف مشکل</Button>
      </AccessGuard>
    </div>
  );
};
```

### 3. بررسی دسترسی ترکیبی

```typescript
import { CombinedAccessGuard, ACCESS_IDS } from "@/utils/accessControl";

const MyComponent = () => {
  return (
    <CombinedAccessGuard 
      categoryId={ACCESS_IDS.PROBLEMS}
      operationId={ACCESS_IDS.EDIT_PROBLEM}
    >
      <Button>ویرایش مشکل</Button>
    </CombinedAccessGuard>
  );
};
```

## متدهای موجود

### کلاس AccessControlManager

- `hasAccess(operationId)`: بررسی دسترسی به عملیات خاص
- `hasCategoryAccess(categoryId)`: بررسی دسترسی به دسته
- `hasMainAccess(mainAccessId)`: بررسی دسترسی به بخش اصلی
- `hasCombinedAccess(categoryId, operationId)`: بررسی دسترسی ترکیبی
- `hasMultipleAccess(operationIds)`: بررسی دسترسی به چندین عملیات
- `hasAnyAccess(operationIds)`: بررسی دسترسی به حداقل یکی از عملیات
- `getCategoryOperations(categoryId)`: دریافت عملیات‌های مجاز یک دسته
- `getAvailableCategories()`: دریافت دسته‌های مجاز
- `getOperationInfo(operationId)`: دریافت اطلاعات عملیات
- `getCategoryInfo(categoryId)`: دریافت اطلاعات دسته

### Hook useAccessControl

تمام متدهای کلاس AccessControlManager به علاوه:
- `userAccesses`: آرایه مستقیم دسترسی‌های کاربر

## ساختار دسترسی‌ها

### دسترسی‌های اصلی
- `MY_GARAGE`: گاراژ من
- `ADMISSION`: پذیرش
- `VEHICLE_MANAGEMENT`: مدیریت خودروها
- `SERVICE_MANAGEMENT`: مدیریت اجرت‌ها
- `MECHANIC_MANAGEMENT`: مدیریت مکانیک‌ها
- `LEAVE_MANAGEMENT`: مدیریت مرخصی‌ها
- `PERFORMANCE_REPORT`: گزارش عملکرد

### دسته‌های پذیرش
- `PROBLEMS`: مشکلات
- `REPAIRS`: تعمیرات
- `PARTS`: قطعات
- `DOCUMENTS`: مستندات
- `DISCHARGE`: ترخیص
- `EDIT_ADMISSION`: ویرایش پذیرش

### عملیات مشکلات
- `ADD_PROBLEM`: افزودن مشکل
- `EDIT_PROBLEM`: ویرایش مشکل
- `DELETE_PROBLEM`: حذف مشکل

### عملیات تعمیرات
- `ADD_REPAIR`: افزودن تعمیر
- `EDIT_REPAIR`: ویرایش تعمیر
- `DELETE_REPAIR`: حذف تعمیر

### عملیات قطعات
- `MECHANIC_PART_REQUEST`: درخواست قطعه از طرف مکانیک
- `WAREHOUSE_PART_REQUEST`: درخواست قطعه از طرف انباردار
- `VIEW_REQUESTS`: نمایش درخواست‌ها
- `CREATE_FACTOR`: ایجاد فاکتور
- `CUSTOMER_PART_RECEIPT`: رسید کالا از مشتری
- `DELETE_SCANNED_PART`: حذف کالای اسکن شده

## مثال‌های کاربردی

### 1. نمایش شرطی دکمه‌ها

```typescript
const ProblemActions = () => {
  const { hasAccess } = useAccessControl();
  
  return (
    <div>
      {hasAccess(ACCESS_IDS.ADD_PROBLEM) && (
        <Button>افزودن مشکل</Button>
      )}
      
      {hasAccess(ACCESS_IDS.EDIT_PROBLEM) && (
        <Button>ویرایش مشکل</Button>
      )}
      
      {hasAccess(ACCESS_IDS.DELETE_PROBLEM) && (
        <Button color="error">حذف مشکل</Button>
      )}
    </div>
  );
};
```

### 2. نمایش شرطی بخش‌ها

```typescript
const ServiceAdmissionTabs = () => {
  const { hasCategoryAccess } = useAccessControl();
  
  return (
    <Tabs>
      {hasCategoryAccess(ACCESS_IDS.PROBLEMS) && (
        <Tab label="مشکلات" />
      )}
      
      {hasCategoryAccess(ACCESS_IDS.REPAIRS) && (
        <Tab label="تعمیرات" />
      )}
      
      {hasCategoryAccess(ACCESS_IDS.PARTS) && (
        <Tab label="قطعات" />
      )}
    </Tabs>
  );
};
```

### 3. بررسی دسترسی ترکیبی

```typescript
const ProblemManagement = () => {
  const { hasCombinedAccess } = useAccessControl();
  
  const canEditProblems = hasCombinedAccess(
    ACCESS_IDS.PROBLEMS,
    ACCESS_IDS.EDIT_PROBLEM
  );
  
  return (
    <div>
      {canEditProblems && (
        <div>
          <h3>مدیریت مشکلات</h3>
          <ProblemEditor />
        </div>
      )}
    </div>
  );
};
```

## مزایای این سیستم

1. **سازماندهی بهتر**: دسترسی‌ها به صورت سلسله‌مراتبی سازماندهی شده‌اند
2. **قابلیت نگهداری**: تغییرات در یک مکان اعمال می‌شود
3. **Type Safety**: استفاده از TypeScript برای اطمینان از صحت کد
4. **قابلیت توسعه**: به راحتی قابل گسترش است
5. **عملکرد بهتر**: بررسی‌های دسترسی بهینه شده‌اند
6. **خوانایی کد**: کد تمیزتر و قابل فهم‌تر است

## نکات مهم

1. همیشه از `ACCESS_IDS` استفاده کنید تا از خطاهای تایپی جلوگیری شود
2. برای بررسی‌های پیچیده از `hasCombinedAccess` استفاده کنید
3. از کامپوننت‌های Guard برای نمایش شرطی استفاده کنید
4. برای عملکرد بهتر، دسترسی‌ها را در سطح کامپوننت بررسی کنید 