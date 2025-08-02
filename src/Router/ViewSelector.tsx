import { Routes, Route, Navigate } from "react-router-dom";
import { FC, lazy, Suspense } from "react";
import { Backdrop } from "@mui/material";

import { DashboardLayout, Loading } from "@/components";
import AuthGuard from "./AuthGuard";
import RouteWrapper from "./RouteWrapper";
import dir from "./dir";

const AddServiceAdmission = lazy(() => import("@/Pages/AddServiceAdmission"));
const MechanicPerformance = lazy(() => import("@/Pages/MechanicPerformance"));
const MechanicsManagement = lazy(() => import("@/Pages/MechanicManagement"));
const ServiceManagement = lazy(() => import("@/Pages/ServiceManagement"));
const ServiceAdmission = lazy(() => import("@/Pages/ServiceAdmission"));
const LeaveManagement = lazy(() => import("@/Pages/LeaveManagement"));
const ProductRequests = lazy(() => import("@/Pages/ProductRequests"));
const CarsManagement = lazy(() => import("@/Pages/CarsManagement"));
const TaskManagement = lazy(() => import("@/Pages/TaskManagement"));
const ResetPassword = lazy(() => import("@/Pages/ResetPassword"));
const AccessDenied = lazy(() => import("@/Pages/AccessDenied"));
const Dashboard = lazy(() => import("@/Pages/Dashboard"));
const Vehicle = lazy(() => import("@/Pages/Vehicle"));
const Login = lazy(() => import("@/Pages/Login"));

const ViewSelector: FC = () => {
  return (
    <Suspense
      fallback={
        <Backdrop
          sx={(theme) => ({
            color: "#fff",
            zIndex: theme.zIndex.drawer + 1,
          })}
          open
        >
          <Loading />
        </Backdrop>
      }
    >
      <Routes>
        {/* مسیرهای عمومی بدون نیاز به authentication */}
        <Route path={dir.login} element={<Login />} />
        <Route path={dir.resetPassword} element={<ResetPassword />} />
        <Route path={dir.accessDenied} element={<AccessDenied />} />

        {/* مسیرهای محافظت شده با authentication */}
        <Route
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route path="/" element={<Navigate to={dir.vehicles} />} />
          
          {/* داشبورد - نیاز به دسترسی دارد */}
          <Route
            path={dir.dashboard}
            element={
              <RouteWrapper path={dir.dashboard}>
                <Dashboard />
              </RouteWrapper>
            }
          />

          {/* گاراژ من - برای همه آزاد است */}
          <Route path={dir.vehicles} element={<Vehicle />} />

          {/* مسیرهای محافظت شده با سطح دسترسی */}
          <Route
            path={dir.serviceAdmission}
            element={
              <RouteWrapper path={dir.serviceAdmission}>
                <ServiceAdmission />
              </RouteWrapper>
            }
          />

          <Route
            path={dir.addServiceAdmission}
            element={
              <RouteWrapper path={dir.addServiceAdmission}>
                <AddServiceAdmission />
              </RouteWrapper>
            }
          />

          <Route
            path={dir.carsManagement}
            element={
              <RouteWrapper path={dir.carsManagement}>
                <CarsManagement />
              </RouteWrapper>
            }
          />

          <Route
            path={dir.serviceManagement}
            element={
              <RouteWrapper path={dir.serviceManagement}>
                <ServiceManagement />
              </RouteWrapper>
            }
          />

          <Route
            path={dir.mechanicsManagement}
            element={
              <RouteWrapper path={dir.mechanicsManagement}>
                <MechanicsManagement />
              </RouteWrapper>
            }
          />

          <Route
            path={dir.leaveManagement}
            element={
              <RouteWrapper path={dir.leaveManagement}>
                <LeaveManagement />
              </RouteWrapper>
            }
          />

          <Route
            path={dir.mechanicPerformance}
            element={
              <RouteWrapper path={dir.mechanicPerformance}>
                <MechanicPerformance />
              </RouteWrapper>
            }
          />

          <Route
            path={dir.productRequests}
            element={
              <RouteWrapper path={dir.productRequests}>
                <ProductRequests />
              </RouteWrapper>
            }
          />

          {/* Task Management - فرض بر این است که برای همه قابل دسترسی است */}
          <Route 
            path={dir.taskManagement} 
            element={
              <RouteWrapper path={dir.taskManagement}>
                <TaskManagement />
              </RouteWrapper>
            } 
          />

          {/* 404 */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </Suspense>
  );
};
export default ViewSelector;
