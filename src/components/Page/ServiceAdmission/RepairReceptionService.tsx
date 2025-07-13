import { FC, useState } from "react";
import {
  ServiceManagementModal,
  CreateFactorForService,
  ProjectSummary,
  ConfirmDialog,
  ProblemHeader,
  AddServiceBox,
  ServiceCard,
  Loading,
  Button,
} from "@/components";

import { useRepairReceptionService } from "@/hooks/useRepairReceptionService";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";

interface IRepairReceptionServiceProps {
  repairReceptionId?: string;
  customerId?: number;
  carId?: number;
  details?: {
    receptionDate: string;
    customerName: string;
    plateNumber: string;
  };
}

const RepairReceptionService: FC<IRepairReceptionServiceProps> = ({
  repairReceptionId,
  customerId,
  carId,
  details,
}) => {
  const [showFactorModal, setShowFactorModal] = useState(false);

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
          {/* Service Factor Button */}
          <AccessGuard accessId={ACCESS_IDS.CREATE_FACTOR}>
            <Button
              onClick={() => setShowFactorModal(true)}
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                maxWidth: "calc(50% - 8px)",
                minWidth: "fit-content",
                marginBottom: "1rem",
                flex: "1 1 auto",
              }}
            >
              ایجاد فاکتور خدمات
            </Button>
          </AccessGuard>

          {services?.problems?.length > 0 ? (
            <div className="space-y-6">
              {services.problems.map(
                (problem: ProblemsService, problemIndex: number) => (
                  <div
                    key={problem.problemId}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    <ProblemHeader
                      problemIndex={problemIndex}
                      problem={problem}
                    />
                    <div className="p-2">
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

                      <AccessGuard accessId={ACCESS_IDS.ADD_REPAIR}>
                        <AddServiceBox
                          onAddService={() => openModal(undefined, problem)}
                        />
                      </AccessGuard>
                    </div>
                  </div>
                )
              )}
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
        isLoading={createMutation.isPending || updateMutation.isPending}
        onServiceChange={handleServiceChange}
        onProblemChange={setSelectedProblem}
        onClose={() => setShowModal(false)}
        selectedService={selectedService}
        selectedProblem={selectedProblem}
        currentServices={currentServices}
        repairServices={repairServices}
        onSubmit={handleSubmit}
        mechanics={mechanics}
        problems={problems}
        open={showModal}
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

      {/* Service Factor Modal */}
      {repairReceptionId && customerId && carId && details && (
        <CreateFactorForService
          repairReceptionId={Number(repairReceptionId)}
          customerId={customerId}
          carId={carId}
          details={details}
          open={showFactorModal}
          onClose={() => setShowFactorModal(false)}
          // onSuccess={handleFactorSuccess}
        />
      )}
    </div>
  );
};

export default RepairReceptionService;
