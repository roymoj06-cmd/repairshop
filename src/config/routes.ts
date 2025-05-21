import dir from "@/Router/dir";

export interface RouteConfig {
  path: string;
  title: string;
  children?: RouteConfig[];
}

export const routesConfig: RouteConfig[] = [
  {
    path: dir.dashboard,
    title: "داشبورد",
    children: [
      {
        path: dir.vehicles,
        title: "گاراژ من",
      },
      {
        path: dir.serviceAdmission,
        title: "پذیرش خودرو",
      },
      {
        path: dir.carsManagement,
        title: "مدیریت خودرو ها",
      },
    ],
  },
];
