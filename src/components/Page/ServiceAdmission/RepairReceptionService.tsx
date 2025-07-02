import { FC } from "react";
import {
  ServiceManagementModal,
  ProjectSummary,
  ConfirmDialog,
  ProblemHeader,
  AddServiceBox,
  ServiceCard,
  Loading,
} from "@/components";

// import ServiceCard from "./ServiceCard";
import { useRepairReceptionService } from "@/hooks/useRepairReceptionService";

interface IRepairReceptionServiceProps {
  repairReceptionId?: string;
}

const RepairReceptionService: FC<IRepairReceptionServiceProps> = ({
  repairReceptionId,
}) => {
  const {
    handleServiceChange,
    setSelectedProblem,
    setDeleteConfirm,
    selectedProblem,
    selectedService,
    currentServices,
    repairServices,
    createMutation,
    updateMutation,
    deleteMutation,
    deleteConfirm,
    confirmDelete,
    setShowModal,
    handleDelete,
    handleSubmit,
    isLoading,
    showModal,
    openModal,
    mechanics,
    services,
    problems,
  } = useRepairReceptionService(repairReceptionId);

  return (
    <div className="service-management">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="service-management__content">
          {services?.problems?.length > 0 ? (
            <div className="space-y-6">
              {services.problems.map(
                (problem: ProblemsService, problemIndex: number) => (
                  <div
                    key={problem.problemId}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    <ProblemHeader
                      problem={problem}
                      problemIndex={problemIndex}
                    />
                    <div className="p-6">
                      {problem.services?.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                          {problem.services.map(
                            (service: Service, serviceIndex: number) => (
                              <ServiceCard
                                serviceIndex={serviceIndex}
                                onDelete={handleDelete}
                                onEdit={openModal}
                                service={service}
                                key={service.id}
                              />
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-500 dark:text-gray-400">
                            هیچ سرویسی برای این مشکل ثبت نشده است
                          </div>
                        </div>
                      )}

                      <AddServiceBox
                        onAddService={() => openModal(undefined, problem)}
                      />
                    </div>
                  </div>
                )
              )}

              {/* Total Summary */}
              <ProjectSummary problems={services.problems} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl text-gray-400 dark:text-gray-500">
                  ⚙️
                </span>
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400 text-center mb-2">
                هیچ سرویسی یافت نشد
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                برای شروع، یک مشکل ایجاد کنید
              </p>
            </div>
          )}
        </div>
      )}

      <ServiceManagementModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        selectedService={selectedService}
        selectedProblem={selectedProblem}
        currentServices={currentServices}
        problems={problems}
        repairServices={repairServices}
        mechanics={mechanics}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onProblemChange={setSelectedProblem}
        onServiceChange={handleServiceChange}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onCancel={() =>
          setDeleteConfirm({ open: false, serviceId: null, serviceName: null })
        }
        onConfirm={confirmDelete}
        title="حذف سرویس"
        message={`آیا مطمئن هستید که می‌خواهید این سرویس را حذف کنید؟
سرویس: ${deleteConfirm.serviceName}`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default RepairReceptionService;
