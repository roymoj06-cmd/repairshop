import { Outlet } from "react-router-dom";
import { FC, useState } from "react";

import { Breadcrumb } from "@/components";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout: FC = () => {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="DashboardLayout-root bg-white dark:bg-gray-900">
      <div className="block xl:hidden">
        <Header onMenuClick={() => setOpenSidebar(true)} />
      </div>
      <Sidebar open={openSidebar} onClose={() => setOpenSidebar(false)} />
      <main className="DashboardLayout-main dark:bg-gray-800 dark:text-white">
        <Breadcrumb />
        <Outlet />
      </main>
    </div>
  );
};
export default DashboardLayout;
