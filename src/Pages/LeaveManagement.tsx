import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Add } from "@mui/icons-material";
import { toast } from "react-toastify";
import { FC, useState } from "react";

import {
  getAllMechanicLeave,
  deleteRepairMechanicLeave,
} from "@/service/repairMechanicLeaves/repairMechanicLeaves.service";
import {
  ConfirmDialog,
  LeaveModal,
  LeaveCard,
  Loading,
  Button,
} from "@/components";

const LeaveManagement: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] =
    useState<IGetAllMechanicLeaves | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    leaveName: string | null;
    leaveId: string | null;
    open: boolean;
  }>({
    leaveName: null,
    leaveId: null,
    open: false,
  });
  const queryClient = useQueryClient();
  const { data: leavesData, isLoading } = useQuery({
    queryKey: ["mechanicLeaves"],
    queryFn: () => getAllMechanicLeave({ page: 1, size: 100 }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteRepairMechanicLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanicLeaves"] });
      toast.success("مرخصی با موفقیت حذف شد");
      setDeleteConfirm({ open: false, leaveId: null, leaveName: null });
    },
    onError: () => {
      toast.error("خطا در حذف مرخصی");
    },
  });
  const handleDeleteLeave = (id: string, name: string) => {
    setDeleteConfirm({ open: true, leaveId: id, leaveName: name });
  };
  const confirmDelete = () => {
    if (deleteConfirm.leaveId) {
      deleteMutation.mutate(Number(deleteConfirm.leaveId));
    }
  };
  const handleEditLeave = (leave: IGetAllMechanicLeaves) => {
    setEditingLeave(leave);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLeave(null);
  };
  const handleOpenCreateModal = () => {
    setEditingLeave(null);
    setIsModalOpen(true);
  };

  return (
    <div className="leave-management">
      <div className="leave-management__create-btn">
        <Button
          onClick={handleOpenCreateModal}
          containerClassName="my-3"
          label="افزودن مرخصی جدید"
          startIcon={<Add />}
          variant="contained"
          color="secondary"
          className=""
        />
      </div>
      {isLoading ? (
        <div className="leave-management__loading">
          <Loading />
        </div>
      ) : (
        <div className="leave-management__content">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {leavesData?.data?.map((leave: IGetAllMechanicLeaves) => (
              <LeaveCard
                onDelete={(id: string) =>
                  handleDeleteLeave(id, leave.mechanicFullName)
                }
                onEdit={handleEditLeave}
                leave={leave}
                key={leave.id}
              />
            ))}
          </div>
        </div>
      )}
      <LeaveModal
        editingLeave={editingLeave}
        onClose={handleCloseModal}
        open={isModalOpen}
      />
      <ConfirmDialog
        onCancel={() =>
          setDeleteConfirm({
            open: false,
            leaveId: null,
            leaveName: null,
          })
        }
        message={`آیا از حذف مرخصی ${deleteConfirm.leaveName} اطمینان دارید؟`}
        loading={deleteMutation.isPending}
        open={deleteConfirm.open}
        onConfirm={confirmDelete}
        title="حذف مرخصی"
      />
    </div>
  );
};

export default LeaveManagement;
