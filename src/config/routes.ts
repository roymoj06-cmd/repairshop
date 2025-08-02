import { ACCESS_IDS } from "@/utils/accessControl";
import dir from "@/Router/dir";

export interface RouteConfig {
  requiredPermissions?: string[];
  requireAnyPermission?: boolean;
  requiredMainAccess?: string[];
  children?: RouteConfig[];
  title: string;
  path: string;
}

export const routesConfig: RouteConfig[] = [
  {
    path: dir.dashboard,
    title: "داشبورد",
    requiredMainAccess: [ACCESS_IDS.ADMISSION],
    children: [
      {
        path: dir.vehicles,
        title: "گاراژ من",
      },
      {
        path: dir.serviceAdmission,
        title: "پذیرش خودرو",
        requiredMainAccess: [ACCESS_IDS.ADMISSION],
      },
      {
        path: dir.addServiceAdmission,
        title: "افزودن پذیرش",
        requiredMainAccess: [ACCESS_IDS.ADMISSION],
      },
      {
        path: dir.carsManagement,
        title: "مدیریت خودرو ها",
        requiredMainAccess: [ACCESS_IDS.VEHICLE_MANAGEMENT],
      },
      {
        path: dir.serviceManagement,
        title: "مدیریت اجرت ها",
        requiredMainAccess: [ACCESS_IDS.SERVICE_MANAGEMENT],
      },
      {
        path: dir.mechanicsManagement,
        title: "مدیریت مکانیک ها",
        requiredMainAccess: [ACCESS_IDS.MECHANIC_MANAGEMENT],
      },
      {
        path: dir.leaveManagement,
        title: "مدیریت مرخصی ها",
        requiredMainAccess: [ACCESS_IDS.LEAVE_MANAGEMENT],
      },
      {
        path: dir.taskManagement,
        title: "مدیریت تسک ها",
      },
      {
        path: dir.mechanicPerformance,
        title: "گزارش عملکرد",
        requiredMainAccess: [ACCESS_IDS.PERFORMANCE_REPORT],
      },
      {
        path: dir.productRequests,
        title: "کسری کالا",
        requiredMainAccess: [ACCESS_IDS.ADMISSION],
        requiredPermissions: [ACCESS_IDS.VIEW_REQUESTS],
        requireAnyPermission: true,
      },
    ],
  },
];

export const getRouteConfig = (path: string): RouteConfig | undefined => {
  for (const route of routesConfig) {
    if (route.path === path) return route;
    if (route.children) {
      for (const child of route.children) {
        if (child.path === path) return child;
      }
    }
  }
  return undefined;
};
