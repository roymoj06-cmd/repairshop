import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Add, Search } from "@mui/icons-material";
import { Paper, Pagination } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import React, { FC, useState, useEffect } from "react";

import {
  ConfirmDialog,
  ServiceModal,
  Loading,
  Button,
  EnhancedInput,
} from "@/components";
import ServiceCard from "@/components/Page/serviceManagement/ServiceCard";
import {
  getAllRepairServices,
  createRepairService,
  UpdateRepairService,
  deleteRepairService,
} from "@/service/repairServices/repairServices.service";

const ServiceManagement: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] =
    useState<IGetAllRepairServices | null>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    serviceId: string | null;
    serviceName: string | null;
  }>({
    open: false,
    serviceId: null,
    serviceName: null,
  });
  const queryClient = useQueryClient();

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debouncedSearchText) {
      setSearchParams({ page: "1" });
    }
  }, [debouncedSearchText, setSearchParams]);

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["repairServices", currentPage, debouncedSearchText],
    queryFn: () =>
      getAllRepairServices({
        page: currentPage,
        size: 12,
        ...(debouncedSearchText && { searchText: debouncedSearchText }),
      }),
  });
  const createMutation = useMutation({
    mutationFn: createRepairService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repairServices"] });
      toast.success("سرویس با موفقیت ایجاد شد");
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error("خطا در ایجاد سرویس");
    },
  });
  const updateMutation = useMutation({
    mutationFn: UpdateRepairService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repairServices"] });
      toast.success("سرویس با موفقیت بروزرسانی شد");
      setIsModalOpen(false);
      setEditingService(null);
    },
    onError: () => {
      toast.error("خطا در بروزرسانی سرویس");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteRepairService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repairServices"] });
      toast.success("سرویس با موفقیت حذف شد");
      setDeleteConfirm({ open: false, serviceId: null, serviceName: null });
    },
    onError: () => {
      toast.error("خطا در حذف سرویس");
    },
  });
  const handleCreateService = (data: ICreateOrUpdateRepairService) => {
    createMutation.mutate(data);
  };
  const handleUpdateService = (data: ICreateOrUpdateRepairService) => {
    updateMutation.mutate(data);
  };
  const handleDeleteService = (id: string, name: string) => {
    setDeleteConfirm({ open: true, serviceId: id, serviceName: name });
  };
  const confirmDelete = () => {
    if (deleteConfirm.serviceId) {
      deleteMutation.mutate(deleteConfirm.serviceId);
    }
  };
  const handleEditService = (service: IGetAllRepairServices) => {
    setEditingService(service);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setSearchParams({ page: value.toString() });
  };

  return (
    <div className="service-management">
      <Paper className="service-management__header p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 shadow-md rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="service-management__search flex-1 max-w-md">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-1 shadow-sm">
              <EnhancedInput
                name="search"
                label="جست‌وجو در اجرت‌ها"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="نام سرویس را وارد کنید"
                icon={<Search />}
                iconPosition="start"
                className="w-full"
              />
            </div>
          </div>
          <div className="service-management__create-btn">
            <Button
              onClick={() => setIsModalOpen(true)}
              label="افزودن اجرت جدید"
              startIcon={<Add />}
              variant="contained"
              color="secondary"
              className="shadow-lg hover:shadow-xl transition-shadow duration-200"
            />
          </div>
        </div>
      </Paper>
      {isLoading ? (
        <div className="service-management__loading">
          <Loading />
        </div>
      ) : (
        <div className="service-management__content">
          {servicesData?.data?.values?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">
                {debouncedSearchText
                  ? `نتیجه‌ای برای "${debouncedSearchText}" یافت نشد`
                  : "هیچ سرویسی یافت نشد"}
              </div>
              {debouncedSearchText && (
                <div className="text-gray-400 text-sm">
                  لطفاً کلمه کلیدی متفاوتی امتحان کنید
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {servicesData?.data?.values?.map(
                (service: IGetAllRepairServices) => (
                  <ServiceCard
                    onDelete={(id) =>
                      handleDeleteService(id, service.serviceTitle)
                    }
                    onEdit={handleEditService}
                    service={service}
                    key={service.id}
                  />
                )
              )}
            </div>
          )}
          {servicesData?.data?.totalPage &&
            servicesData?.data?.totalPage > 1 && (
              <Paper className="pagination-container flex justify-center mt-12 p-3 rounded">
                <Pagination
                  count={servicesData?.data?.totalPage}
                  onChange={handlePageChange}
                  page={currentPage}
                  boundaryCount={1}
                  siblingCount={1}
                  color="primary"
                  size="large"
                />
              </Paper>
            )}
        </div>
      )}
      <ServiceModal
        onSubmit={editingService ? handleUpdateService : handleCreateService}
        loading={createMutation.isPending || updateMutation.isPending}
        editingService={editingService}
        onClose={handleCloseModal}
        open={isModalOpen}
      />
      <ConfirmDialog
        onCancel={() =>
          setDeleteConfirm({ open: false, serviceId: null, serviceName: null })
        }
        message={`آیا از حذف ${deleteConfirm.serviceName} اطمینان دارید؟`}
        loading={deleteMutation.isPending}
        open={deleteConfirm.open}
        onConfirm={confirmDelete}
        title="حذف سرویس"
      />
    </div>
  );
};

export default ServiceManagement;
