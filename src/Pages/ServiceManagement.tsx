import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Add } from "@mui/icons-material";
import { toast } from "react-toastify";
import { FC, useState } from "react";

import {
  getAllRepairServices,
  createRepairService,
  UpdateRepairService,
  deleteRepairService,
} from "@/service/repairServices/repairServices.service";
import {
  ConfirmDialog,
  ServiceModal,
  ServiceCard,
  Loading,
  Button,
} from "@/components";

const ServiceManagement: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] =
    useState<IGetAllRepairServices | null>(null);
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
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["repairServices"],
    queryFn: () => getAllRepairServices({ page: 1, size: 10 }),
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

  return (
    <div className="service-management">
      <div className="service-management__create-btn">
        <Button
          onClick={() => setIsModalOpen(true)}
          containerClassName="my-3"
          label="افزودن اجرت جدید"
          startIcon={<Add />}
          variant="contained"
          color="secondary"
          className=""
        />
      </div>
      {isLoading ? (
        <div className="service-management__loading">
          <Loading />
        </div>
      ) : (
        <div className="service-management__content">
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
