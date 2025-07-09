import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Add } from "@mui/icons-material";
import { toast } from "react-toastify";
import { FC, useState } from "react";

import {
  getAllMechanics,
  createMechanic,
  updateMechanic,
  deleteMechanic,
} from "@/service/mechanic/mechanic.service";
import {
  MechanicModal,
  MechanicLedger,
  ConfirmDialog,
  MechanicCard,
  Loading,
  Button,
} from "@/components";

const MechanicManagement: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [selectedMechanic, setSelectedMechanic] =
    useState<IGetAllMechanics | null>(null);
  const [editingMechanic, setEditingMechanic] =
    useState<IGetAllMechanics | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    mechanicId: string | null;
    mechanicName: string | null;
  }>({
    open: false,
    mechanicId: null,
    mechanicName: null,
  });

  const queryClient = useQueryClient();

  const { data: mechanicsData, isLoading } = useQuery({
    queryKey: ["mechanics"],
    queryFn: () => getAllMechanics({ page: 1, size: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: createMechanic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] });
      toast.success("مکانیک با موفقیت ایجاد شد");
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error("خطا در ایجاد مکانیک");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateMechanic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] });
      toast.success("مکانیک با موفقیت بروزرسانی شد");
      setIsModalOpen(false);
      setEditingMechanic(null);
    },
    onError: () => {
      toast.error("خطا در بروزرسانی مکانیک");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMechanic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] });
      toast.success("مکانیک با موفقیت حذف شد");
      setDeleteConfirm({ open: false, mechanicId: null, mechanicName: null });
    },
    onError: () => {
      toast.error("خطا در حذف مکانیک");
    },
  });

  const handleCreateMechanic = (data: ICreateOrUpdateMechanic) => {
    createMutation.mutate(data);
  };

  const handleUpdateMechanic = (data: ICreateOrUpdateMechanic) => {
    updateMutation.mutate(data);
  };

  const handleDeleteMechanic = (id: string, name: string) => {
    setDeleteConfirm({ open: true, mechanicId: id, mechanicName: name });
  };

  const handleViewLedger = (mechanic: IGetAllMechanics) => {
    setSelectedMechanic(mechanic);
    setIsLedgerOpen(true);
  };

  const confirmDelete = () => {
    if (deleteConfirm.mechanicId) {
      deleteMutation.mutate(Number(deleteConfirm.mechanicId));
    }
  };

  const handleEditMechanic = (mechanic: IGetAllMechanics) => {
    setEditingMechanic(mechanic);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMechanic(null);
  };

  const handleCloseLedger = () => {
    setIsLedgerOpen(false);
    setSelectedMechanic(null);
  };

  return (
    <div className="mechanic-management">
      <div className="mechanic-management__create-btn">
        <Button
          onClick={() => setIsModalOpen(true)}
          containerClassName="my-3"
          label="افزودن مکانیک جدید"
          startIcon={<Add />}
          variant="contained"
          color="secondary"
          className=""
        />
      </div>
      {isLoading ? (
        <div className="mechanic-management__loading">
          <Loading />
        </div>
      ) : (
        <div className="mechanic-management__content">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {mechanicsData?.data?.values?.map((mechanic: IGetAllMechanics) => (
              <MechanicCard
                onDelete={(id) => handleDeleteMechanic(id, mechanic.fullName)}
                onEdit={handleEditMechanic}
                onViewLedger={handleViewLedger}
                mechanic={mechanic}
                key={mechanic.id}
              />
            ))}
          </div>
        </div>
      )}
      <MechanicModal
        onSubmit={editingMechanic ? handleUpdateMechanic : handleCreateMechanic}
        loading={createMutation.isPending || updateMutation.isPending}
        editingMechanic={editingMechanic}
        onClose={handleCloseModal}
        open={isModalOpen}
      />
      <MechanicLedger
        open={isLedgerOpen}
        onClose={handleCloseLedger}
        mechanicId={selectedMechanic?.userId}
        mechanicName={selectedMechanic?.fullName}
      />
      <ConfirmDialog
        onCancel={() =>
          setDeleteConfirm({
            open: false,
            mechanicId: null,
            mechanicName: null,
          })
        }
        message={`آیا از حذف ${deleteConfirm.mechanicName} اطمینان دارید؟`}
        loading={deleteMutation.isPending}
        open={deleteConfirm.open}
        onConfirm={confirmDelete}
        title="حذف مکانیک"
      />
    </div>
  );
};

export default MechanicManagement;
