import React from "react";

import { useStore } from "@/Store/useStore";

// سیستم مدیریت دسترسی هوشمند برای RepairShop
// بر اساس ساختار درختی دسترسی‌ها

export interface AccessNode {
  securityOperationId: string;
  children: AccessNode[];
  viewOrder: number;
  parentId?: string;
  isCheck: boolean;
  itemType: string;
  title: string;
  id: string;
}

export interface AccessControlConfig {
  // دسترسی‌های اصلی سیستم
  mainAccesses: {
    [key: string]: {
      operations: string[];
      description: string;
      title: string;
    };
  };

  // دسترسی‌های عملیاتی
  operations: {
    [key: string]: {
      parentAccess: string;
      description: string;
      category: string;
      title: string;
    };
  };
}

// تعریف دسترسی‌های اصلی سیستم
export const ACCESS_CONFIG: AccessControlConfig = {
  mainAccesses: {
    // گاراژ من
    "2f326128-473e-4d6e-9d78-efed1eca42c0": {
      title: "گاراژ من",
      description: "دسترسی به بخش گاراژ من",
      operations: ["faddee5d-7277-420f-9452-ccb315b15f1e"],
    },

    // پذیرش
    "431dbdc6-5e47-4d2c-9c97-8a23162648b8": {
      title: "پذیرش",
      description: "دسترسی به بخش پذیرش",
      operations: [
        "d8a36b11-b70e-45c8-b3ef-afdaa8261d12", // مشکلات
        "f36fe06e-8b0c-460f-b84d-badab5243bd0", // تعمیرات
        "4d87f085-3eb3-4379-84e4-0b1458ee48bc", // قطعات
        "0ede3bbe-c307-49e5-afbc-7cda0a1d0310", // مستندات
        "531219f4-4d2e-447c-8d55-83293f70ed54", // ترخیص
        "76f03ebb-e5e1-468c-9b1c-3a19396ea29a", // ویرایش پذیرش
      ],
    },

    // مدیریت خودروها
    "53d81fbe-7fff-4956-a957-6f0fd520325c": {
      title: "مدیریت خودرو ها",
      description: "دسترسی به مدیریت خودروها",
      operations: [
        "6b0e803b-87b8-4a67-85e2-26f0217f54b8", // افزودن خودرو
        "fb8cc47a-fcbe-447d-aac3-93fdc6dacdda", // ویرایش خودرو
        "bca81716-b6be-4d96-ba5c-a0d394da86ae", // حذف خودرو
      ],
    },

    // مدیریت اجرت ها
    "3362fe9b-5b43-436e-a440-aefc0d1d00d8": {
      title: "مدیریت اجرت ها",
      description: "دسترسی به مدیریت اجرت‌ها",
      operations: [
        "c6ed89fb-1367-4788-9981-0254e04f8fd3", // افزودن اجرت
        "510aaa90-8d59-45d0-be7f-00dcf1a3eb5a", // ویرایش اجرت
        "07651d6f-fdd5-4185-acba-4cfef680dfac", // حذف اجرت
      ],
    },

    // مدیریت مکانیک ها
    "b33b23a8-9d34-4375-a05c-94c5b18450b7": {
      title: "مدیریت مکانیک ها",
      description: "دسترسی به مدیریت مکانیک‌ها",
      operations: [
        "7216502f-2cbf-4257-9235-5038c29bc837", // افزودن مکانیک
        "6f01745a-1f18-45d8-8c86-ebe7b58fa588", // ویرایش مکانیک
        "5a646dc0-3dfd-4506-a6df-3d2a8e571072", // حذف مکانیک
      ],
    },

    // مدیریت مرخصی ها
    "c1b563f4-9299-4865-97ba-fe56db6c5d3b": {
      title: "مدیریت مرخصی ها",
      description: "دسترسی به مدیریت مرخصی‌ها",
      operations: [
        "b93f1615-801a-491f-be19-53182ef23efa", // افزودن مرخصی
        "4ea9a5a0-0465-4992-85a3-0aaab1d6ec12", // ویرایش مرخصی
        "aba28fa5-b28d-4643-96cc-6367bd3b6f46", // حذف مرخصی
      ],
    },

    // گزارش عملکرد
    "8a374872-ee31-4ece-b2bb-342edbe45bc2": {
      title: "گزارش عملکرد",
      description: "دسترسی به گزارش عملکرد",
      operations: [],
    },
  },

  operations: {
    // عملیات مشکلات
    "a5f9709d-04fc-4d1f-8eef-dc925e0145de": {
      title: "افزودن مشکل",
      description: "امکان افزودن مشکل جدید",
      category: "مشکلات",
      parentAccess: "d8a36b11-b70e-45c8-b3ef-afdaa8261d12",
    },
    "1f189625-a1df-48c5-a67b-90b707efd267": {
      title: "ویرایش مشکل",
      description: "امکان ویرایش مشکل موجود",
      category: "مشکلات",
      parentAccess: "d8a36b11-b70e-45c8-b3ef-afdaa8261d12",
    },
    "8cc75b5a-8be3-4d23-8c71-69b4e64b893d": {
      title: "حذف مشکل",
      description: "امکان حذف مشکل",
      category: "مشکلات",
      parentAccess: "d8a36b11-b70e-45c8-b3ef-afdaa8261d12",
    },

    // عملیات تعمیرات
    "78d1c8c5-21aa-4772-a070-ff43572768cc": {
      title: "افزودن تعمیرات",
      description: "امکان افزودن تعمیر جدید",
      category: "تعمیرات",
      parentAccess: "f36fe06e-8b0c-460f-b84d-badab5243bd0",
    },
    "a9b54cdd-8f69-48ad-a80c-2e3c34c61c4b": {
      title: "ویرایش تعمیرات",
      description: "امکان ویرایش تعمیر موجود",
      category: "تعمیرات",
      parentAccess: "f36fe06e-8b0c-460f-b84d-badab5243bd0",
    },
    "accec800-b88c-469e-8dc1-d62a7057f749": {
      title: "حذف تعمیرات",
      description: "امکان حذف تعمیر",
      category: "تعمیرات",
      parentAccess: "f36fe06e-8b0c-460f-b84d-badab5243bd0",
    },

    // عملیات قطعات
    "5ffd6748-329d-4b1d-a025-9c0c0ba350a4": {
      title: "درخواست قطعه از طرف مکانیک",
      description: "امکان درخواست قطعه توسط مکانیک",
      category: "قطعات",
      parentAccess: "4d87f085-3eb3-4379-84e4-0b1458ee48bc",
    },
    "daa4b4db-d8e4-416c-9a6a-33e97f409810": {
      title: "درخواست قطعه از طرف انباردار",
      description: "امکان درخواست قطعه توسط انباردار",
      category: "قطعات",
      parentAccess: "4d87f085-3eb3-4379-84e4-0b1458ee48bc",
    },
    "05bee620-fdfc-437d-a066-99b2413a342c": {
      title: "نمایش درخواست ها",
      description: "امکان مشاهده درخواست‌های قطعات",
      category: "قطعات",
      parentAccess: "4d87f085-3eb3-4379-84e4-0b1458ee48bc",
    },
    "19a0f770-0ebc-445e-aab1-e612eeff481f": {
      title: "ایجاد فاکتور",
      description: "امکان ایجاد فاکتور",
      category: "قطعات",
      parentAccess: "4d87f085-3eb3-4379-84e4-0b1458ee48bc",
    },
    "aafef540-c7d1-43e4-8507-70b361c44d13": {
      title: "رسید کالا از مشتری",
      description: "امکان ثبت رسید کالا از مشتری",
      category: "قطعات",
      parentAccess: "4d87f085-3eb3-4379-84e4-0b1458ee48bc",
    },
    "c92e5601-bc02-44a8-8215-874fa75f51d6": {
      title: "حذف کالای اسکن شده",
      description: "امکان حذف کالای اسکن شده",
      category: "قطعات",
      parentAccess: "4d87f085-3eb3-4379-84e4-0b1458ee48bc",
    },

    // عملیات درخواست‌ها
    "54049da6-2c41-48d4-8b5b-a82502bfe24f": {
      title: "اعلام کسری کالا",
      description: "امکان اعلام کسری کالا",
      category: "درخواست‌ها",
      parentAccess: "05bee620-fdfc-437d-a066-99b2413a342c",
    },
    "99caac81-e74b-4abb-936c-151ca9d0b404": {
      title: "رد کردن کالای درخواستی",
      description: "امکان رد کردن کالای درخواستی",
      category: "درخواست‌ها",
      parentAccess: "05bee620-fdfc-437d-a066-99b2413a342c",
    },

    // عملیات حذف پذیرش
    "faddee5d-7277-420f-9452-ccb315b15f1e": {
      title: "حذف پذیرش",
      description: "امکان حذف پذیرش",
      category: "گاراژ من",
      parentAccess: "2f326128-473e-4d6e-9d78-efed1eca42c0",
    },
  },
};

// کلاس مدیریت دسترسی
export class AccessControlManager {
  private userAccesses: string[];

  constructor(userAccesses: string[]) {
    this.userAccesses = userAccesses;
  }

  // بررسی دسترسی به یک عملیات خاص
  hasAccess(operationId: string): boolean {
    return this.userAccesses.includes(operationId);
  }

  // بررسی دسترسی به یک دسته عملیات
  hasCategoryAccess(categoryId: string): boolean {
    return this.userAccesses.includes(categoryId);
  }

  // بررسی دسترسی به یک بخش اصلی
  hasMainAccess(mainAccessId: string): boolean {
    return this.userAccesses.includes(mainAccessId);
  }

  // دریافت تمام عملیات‌های مجاز برای یک دسته
  getCategoryOperations(categoryId: string): string[] {
    const category = ACCESS_CONFIG.mainAccesses[categoryId];
    if (!category) return [];

    return category.operations.filter((operationId) =>
      this.userAccesses.includes(operationId)
    );
  }

  // دریافت تمام دسته‌های مجاز
  getAvailableCategories(): string[] {
    return Object.keys(ACCESS_CONFIG.mainAccesses).filter((categoryId) =>
      this.hasMainAccess(categoryId)
    );
  }

  // بررسی دسترسی ترکیبی (دسته + عملیات)
  hasCombinedAccess(categoryId: string, operationId: string): boolean {
    return this.hasMainAccess(categoryId) && this.hasAccess(operationId);
  }

  // دریافت اطلاعات عملیات
  getOperationInfo(operationId: string) {
    return ACCESS_CONFIG.operations[operationId];
  }

  // دریافت اطلاعات دسته
  getCategoryInfo(categoryId: string) {
    return ACCESS_CONFIG.mainAccesses[categoryId];
  }

  // بررسی دسترسی به درخت کامل
  hasTreeAccess(nodeId: string): boolean {
    return this.userAccesses.includes(nodeId);
  }

  // دریافت تمام دسترسی‌های کاربر
  getAllUserAccesses(): string[] {
    return [...this.userAccesses];
  }

  // بررسی دسترسی به چندین عملیات همزمان
  hasMultipleAccess(operationIds: string[]): boolean {
    return operationIds.every((id) => this.userAccesses.includes(id));
  }

  // بررسی دسترسی به حداقل یکی از عملیات
  hasAnyAccess(operationIds: string[]): boolean {
    return operationIds.some((id) => this.userAccesses.includes(id));
  }
}

// Hook برای استفاده آسان در کامپوننت‌ها
export const useAccessControl = () => {
  const { userAccesses } = useStore();

  // ایجاد نمونه از کلاس مدیریت دسترسی
  const accessManager = new AccessControlManager(userAccesses);

  return {
    // متدهای اصلی
    hasAccess: accessManager.hasAccess.bind(accessManager),
    hasCategoryAccess: accessManager.hasCategoryAccess.bind(accessManager),
    hasMainAccess: accessManager.hasMainAccess.bind(accessManager),
    hasCombinedAccess: accessManager.hasCombinedAccess.bind(accessManager),
    hasMultipleAccess: accessManager.hasMultipleAccess.bind(accessManager),
    hasAnyAccess: accessManager.hasAnyAccess.bind(accessManager),

    // متدهای اطلاعاتی
    getCategoryOperations:
      accessManager.getCategoryOperations.bind(accessManager),
    getAvailableCategories:
      accessManager.getAvailableCategories.bind(accessManager),
    getOperationInfo: accessManager.getOperationInfo.bind(accessManager),
    getCategoryInfo: accessManager.getCategoryInfo.bind(accessManager),
    getAllUserAccesses: accessManager.getAllUserAccesses.bind(accessManager),

    // دسترسی مستقیم به آرایه دسترسی‌ها
    userAccesses,
  };
};

// کامپوننت‌های کمکی برای نمایش شرطی
export const AccessGuard: React.FC<{
  accessId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ accessId, children, fallback = null }) => {
  const { hasAccess } = useAccessControl();

  return hasAccess(accessId) ? <>{children}</> : <>{fallback}</>;
};

export const CategoryGuard: React.FC<{
  categoryId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ categoryId, children, fallback = null }) => {
  const { hasCategoryAccess } = useAccessControl();

  return hasCategoryAccess(categoryId) ? <>{children}</> : <>{fallback}</>;
};

export const CombinedAccessGuard: React.FC<{
  categoryId: string;
  operationId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ categoryId, operationId, children, fallback = null }) => {
  const { hasCombinedAccess } = useAccessControl();

  return hasCombinedAccess(categoryId, operationId) ? (
    <>{children}</>
  ) : (
    <>{fallback}</>
  );
};

// ثابت‌های دسترسی برای استفاده آسان
export const ACCESS_IDS = {
  // دسترسی‌های اصلی
  MECHANIC_MANAGEMENT: "b33b23a8-9d34-4375-a05c-94c5b18450b7",
  VEHICLE_MANAGEMENT: "53d81fbe-7fff-4956-a957-6f0fd520325c",
  SERVICE_MANAGEMENT: "3362fe9b-5b43-436e-a440-aefc0d1d00d8",
  PERFORMANCE_REPORT: "8a374872-ee31-4ece-b2bb-342edbe45bc2",
  LEAVE_MANAGEMENT: "c1b563f4-9299-4865-97ba-fe56db6c5d3b",
  MY_GARAGE: "2f326128-473e-4d6e-9d78-efed1eca42c0",
  ADMISSION: "431dbdc6-5e47-4d2c-9c97-8a23162648b8",

  // دسته‌های پذیرش
  EDIT_ADMISSION: "76f03ebb-e5e1-468c-9b1c-3a19396ea29a",
  DOCUMENTS: "0ede3bbe-c307-49e5-afbc-7cda0a1d0310",
  DISCHARGE: "531219f4-4d2e-447c-8d55-83293f70ed54",
  PROBLEMS: "d8a36b11-b70e-45c8-b3ef-afdaa8261d12",
  OLDPART : "f097c2a4-4f33-4a02-b349-8881ff7014f2",
  REPAIRS: "f36fe06e-8b0c-460f-b84d-badab5243bd0",
  PARTS: "4d87f085-3eb3-4379-84e4-0b1458ee48bc",

  // عملیات مشکلات
  DELETE_PROBLEM: "8cc75b5a-8be3-4d23-8c71-69b4e64b893d",
  EDIT_PROBLEM: "1f189625-a1df-48c5-a67b-90b707efd267",
  ADD_PROBLEM: "a5f9709d-04fc-4d1f-8eef-dc925e0145de",

  // عملیات تعمیرات
  DISCHARGE_REPAIR_RECEPTION: "faddee5d-7277-420f-9452-ccb315b15f1e",
  CREATE_FACTOR_REPAIR: "1bb6afa9-bb66-4022-88b7-45b2c3cea518",
  DELETE_FACTOR_REPAIR: "cec6d4b9-4785-405e-9576-73676c3d0262",
  CHANGE_STATUS_REPAIR: "0944249d-0e0a-4155-b0bf-5c939728bd57",
  VIEW_FACTORS_REPAIR: "eff4ef22-146b-481d-a77a-9d68cde01cd6",
  DISCHARGE_REPAIR: "531219f4-4d2e-447c-8d55-83293f70ed54",
  DELETE_REPAIR: "accec800-b88c-469e-8dc1-d62a7057f749",
  EDIT_REPAIR: "a9b54cdd-8f69-48ad-a80c-2e3c34c61c4b",
  TEST_REPAIR: "0e6452e0-6c89-44a6-8f0c-6a9ba61d1584",
  ADD_REPAIR: "78d1c8c5-21aa-4772-a070-ff43572768cc",

  // عملیات قطعات
  WAREHOUSE_PART_REQUEST: "daa4b4db-d8e4-416c-9a6a-33e97f409810",
  CUSTOMER_PART_RECEIPT: "aafef540-c7d1-43e4-8507-70b361c44d13",
  MECHANIC_PART_REQUEST: "5ffd6748-329d-4b1d-a025-9c0c0ba350a4",
  DELETE_SCANNED_PART: "c92e5601-bc02-44a8-8215-874fa75f51d6",
  OLD_PART_DELIVERED: "b0d92fc3-39ce-4c52-abf0-1557ad5256d1",
  VIEW_REQUESTS: "05bee620-fdfc-437d-a066-99b2413a342c",
  CREATE_FACTOR: "19a0f770-0ebc-445e-aab1-e612eeff481f",
  VIEW_FACTORS: "ecb593d0-a8c8-4ba9-84ee-629e2e1e6dee",

  // عملیات درخواست‌ها
  DECLARE_SHORTAGE: "54049da6-2c41-48d4-8b5b-a82502bfe24f",
  REJECT_REQUEST: "99caac81-e74b-4abb-936c-151ca9d0b404",

  // عملیات حذف پذیرش
  DELETE_ADMISSION: "faddee5d-7277-420f-9452-ccb315b15f1e",
} as const;
