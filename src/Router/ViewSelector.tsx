import { Routes, Route, Navigate } from "react-router-dom";
import { FC, lazy, Suspense } from "react";
import { Backdrop } from "@mui/material";

import { DashboardLayout, Loading } from "@/components";
import AuthGuard from "./AuthGuard";
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
const Dashboard = lazy(() => import("@/Pages/Dashboard"));
const Vehicle = lazy(() => import("@/Pages/Vehicle"));
const Login = lazy(() => import("@/Pages/Login"));
const ResetPassword = lazy(() => import("@/Pages/ResetPassword"));

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
        <Route path={dir.login} element={<Login />} />
        <Route path={dir.resetPassword} element={<ResetPassword />} />
        <Route
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route path="/" element={<Navigate to={dir.dashboard} />} />
          <Route
            path={dir.mechanicsManagement}
            element={<MechanicsManagement />}
          />
          <Route path={dir.serviceManagement} element={<ServiceManagement />} />
          <Route path={dir.serviceAdmission} element={<ServiceAdmission />} />
          <Route
            path={dir.addServiceAdmission}
            element={<AddServiceAdmission />}
          />
          <Route
            path={dir.mechanicPerformance}
            element={<MechanicPerformance />}
          />
          <Route path={dir.leaveManagement} element={<LeaveManagement />} />
          <Route path={dir.productRequests} element={<ProductRequests />} />
          <Route path={dir.carsManagement} element={<CarsManagement />} />
          <Route path={dir.taskManagement} element={<TaskManagement />} />
          <Route path={dir.dashboard} element={<Dashboard />} />
          <Route path={dir.vehicles} element={<Vehicle />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </Suspense>
  );
};
export default ViewSelector;
