import { Add, Edit, Delete, Close } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FC, useState } from "react";
import {
  DialogContent,
  DialogActions,
  DialogTitle,
  IconButton,
  Dialog,
  Paper,
  Chip,
} from "@mui/material";

import { getAllRepairServices } from "@/service/repairServices/repairServices.service";
import { getCustomerProblems } from "@/service/repairServices/repairServices.service";
import {
  updateRepairReceptionServicesForProblems,
  getAllRepairReceptionServices,
  deleteRepairReceptionService,
  createRepairReceptionService,
} from "@/service/repairReceptionService/repairReceptionService.service";
import { getActiveMechanics } from "@/service/mechanic/mechanic.service";
import { addCommas } from "@/utils";
import {
  EnhancedSelect,
  EnhancedInput,
  ConfirmDialog,
  Loading,
  Button,
} from "@/components";

interface IRepairReceptionServiceProps {
  repairReceptionId?: string;
}
interface ExtendedSelectOption extends SelectOption {
  estimatedMinute?: number;
  price?: number;
}
const RepairReceptionService: FC<IRepairReceptionServiceProps> = ({
  repairReceptionId,
}) => {
  const queryClient = useQueryClient();
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<
    Service | IGetAllRepairReceptionServices | null
  >(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    serviceName: string | null;
    serviceId: number | null;
    open: boolean;
  }>({
    serviceName: null,
    serviceId: null,
    open: false,
  });
  const [currentServices, setCurrentServices] = useState<
    {
      mechanicId: SelectOption | undefined;
      serviceId: SelectOption | undefined;
      estimatedMinute: number | undefined;
      servicePrice: number | undefined;
      totalPrice: number | undefined;
      serviceCount: number;
      originalServiceId?: number;
      isDeleted?: boolean;
    }[]
  >([]);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["repairReceptionServices", repairReceptionId],
    queryFn: () => getAllRepairReceptionServices(Number(repairReceptionId)),
    enabled: !!repairReceptionId,
    select: (data) => data?.data || [],
  });
  const { data: repairServices = [] } = useQuery({
    queryKey: ["repairServices"],
    queryFn: () => getAllRepairServices({ page: 1, size: 100 }),
    select: (data) =>
      data?.data?.values?.map((service: IGetAllRepairServices) => ({
        value: service.id,
        label: `${service.serviceTitle} - ${addCommas(service.price)}`,
        price: service.price,
        estimatedMinute: service.estimatedMinute,
      })) || [],
  });
  const { data: mechanics = [] } = useQuery({
    queryKey: ["activeMechanics"],
    queryFn: getActiveMechanics,
    select: (data) =>
      data?.data?.map((mechanic: IGetActiveMechanics) => ({
        value: mechanic.id,
        label: mechanic.fullName,
      })) || [],
  });
  const { data: problems = [] } = useQuery({
    queryKey: ["customerProblems", repairReceptionId],
    queryFn: () =>
      getCustomerProblems({
        repairReceptionId: repairReceptionId && repairReceptionId,
        page: 1,
        size: 100,
      }),
    enabled: !!repairReceptionId,
    select: (data) =>
      data?.data?.values?.map((problem: any) => ({
        value: problem.id,
        label: problem.description,
      })) || [],
  });
  const createMutation = useMutation({
    mutationFn: createRepairReceptionService,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["repairReceptionServices", repairReceptionId],
      });
      if (data?.isSuccess) {
        toast.success("سرویس با موفقیت ایجاد شد");
        setShowModal(false);
        resetForm();
      } else {
        toast.error(data?.message || "خطا در ایجاد سرویس");
      }
    },
    onError: () => {
      toast.error("خطا در ایجاد سرویس");
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateRepairReceptionServicesForProblems,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["repairReceptionServices", repairReceptionId],
      });
      if (data?.isSuccess) {
        toast.success("سرویس با موفقیت بروزرسانی شد");
        setShowModal(false);
        resetForm();
      } else {
        toast.error(data?.message || "خطا در بروزرسانی سرویس");
      }
    },
    onError: () => {
      toast.error("خطا در بروزرسانی سرویس");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteRepairReceptionService,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["repairReceptionServices", repairReceptionId],
      });
      toast.success("سرویس با موفقیت حذف شد");
    },
    onError: () => {
      toast.error("خطا در حذف سرویس");
    },
  });
  const handleDelete = (id: number, serviceName: string) => {
    setDeleteConfirm({ open: true, serviceId: id, serviceName });
  };
  const confirmDelete = () => {
    if (deleteConfirm.serviceId) {
      deleteMutation.mutate(deleteConfirm.serviceId);
      setDeleteConfirm({ open: false, serviceId: null, serviceName: null });
    }
  };

  const handleAddService = () => {
    const newService = {
      estimatedMinute: undefined,
      servicePrice: undefined,
      mechanicId: undefined,
      totalPrice: undefined,
      serviceId: undefined,
      serviceCount: 1,
      originalServiceId: undefined,
      isDeleted: false,
    };
    setCurrentServices([...currentServices, newService]);
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    const updatedServices = [...currentServices];
    updatedServices[index] = { ...updatedServices[index], [field]: value };

    if (field === "serviceId") {
      const selectedService = repairServices.find(
        (s: ExtendedSelectOption) => s.value === value?.value
      );
      if (selectedService && selectedService.price !== undefined) {
        updatedServices[index].servicePrice = selectedService.price;
        updatedServices[index].totalPrice =
          selectedService.price * updatedServices[index].serviceCount;
        updatedServices[index].estimatedMinute =
          selectedService.estimatedMinute;
      } else {
        updatedServices[index].servicePrice = undefined;
        updatedServices[index].totalPrice = undefined;
        updatedServices[index].estimatedMinute = undefined;
      }
    }

    if (field === "serviceCount" || field === "servicePrice") {
      const servicePrice = updatedServices[index].servicePrice || 0;
      const serviceCount = updatedServices[index].serviceCount || 0;
      updatedServices[index].totalPrice = servicePrice * serviceCount;
    }

    setCurrentServices(updatedServices);
  };

  const handleRemoveService = (index: number) => {
    const serviceToRemove = currentServices[index];

    // If this is an existing service (has originalServiceId), mark it as deleted
    if (serviceToRemove.originalServiceId) {
      // Instead of removing from UI, we'll mark it for deletion
      // The service will be marked as isDeleted: true when submitting
      const updatedServices = [...currentServices];
      updatedServices[index] = {
        ...updatedServices[index],
        isDeleted: true, // Mark for deletion
      };
      setCurrentServices(updatedServices);
    } else {
      // For new services, just remove from the array
      const newServices = currentServices.filter((_, i) => i !== index);
      setCurrentServices(newServices);
    }
  };

  const handleSubmit = async () => {
    try {
      for (const service of currentServices) {
        if (!service.serviceId || !service.mechanicId) {
          toast.error("لطفاً تمام فیلدهای ضروری را پر کنید");
          return;
        }
      }
      if (!selectedProblem) {
        toast.error("لطفاً یک مشکل انتخاب کنید");
        return;
      }

      if (selectedService) {
        // Edit existing service
        const updateData: IUpdateRepairReceptionServicesForProblems = {
          request: {
            repairReceptionId: Number(repairReceptionId),
            problemServices: [
              {
                repairCustomerProblemId: selectedProblem?.value,
                services: currentServices.map((service) => {
                  const serviceData: any = {
                    serviceId: Number(service.serviceId?.value) || 0,
                    serviceCount: service.serviceCount || 1,
                    performedByMechanicId:
                      Number(service.mechanicId?.value) || 0,
                    price: Number(service.servicePrice) || 0,
                    estimatedMinute: Number(service.estimatedMinute) || 0,
                    status:
                      "status" in selectedService ? selectedService.status : 0,
                    isDeleted: false,
                  };

                  // Only add id if this is an existing service
                  if ("id" in selectedService && selectedService.id) {
                    serviceData.id = selectedService.id;
                  }

                  return serviceData;
                }),
              },
            ],
          },
        };

        updateMutation.mutate(updateData);
      } else if (currentServices.some((service) => service.originalServiceId)) {
        // Edit entire problem (multiple services)
        const updateData: IUpdateRepairReceptionServicesForProblems = {
          request: {
            repairReceptionId: Number(repairReceptionId),
            problemServices: [
              {
                repairCustomerProblemId: selectedProblem?.value,
                services: currentServices
                  .filter((service) => !service.isDeleted)
                  .map((service) => {
                    const serviceData: any = {
                      serviceId: Number(service.serviceId?.value) || 0,
                      serviceCount: service.serviceCount || 1,
                      performedByMechanicId:
                        Number(service.mechanicId?.value) || 0,
                      price: Number(service.servicePrice) || 0,
                      estimatedMinute: Number(service.estimatedMinute) || 0,
                      status: 0,
                      isDeleted: false,
                    };
                    if (service.originalServiceId) {
                      serviceData.id = service.originalServiceId;
                    }
                    return serviceData;
                  }),
              },
            ],
          },
        };

        // Add deleted services to the request with isDeleted: true
        const deletedServices = currentServices.filter(
          (service) => service.isDeleted && service.originalServiceId
        );
        if (deletedServices.length > 0) {
          updateData.request.problemServices[0].services.push(
            ...deletedServices.map((service) => ({
              id: service.originalServiceId || 0,
              serviceId: Number(service.serviceId?.value) || 0,
              serviceCount: service.serviceCount || 1,
              performedByMechanicId: Number(service.mechanicId?.value) || 0,
              price: Number(service.servicePrice) || 0,
              estimatedMinute: Number(service.estimatedMinute) || 0,
              status: 0,
              isDeleted: true,
            }))
          );
        }

        updateMutation.mutate(updateData);
      } else {
        // Create new service
        const serviceData: ICreateOrUpdateRepairReceptionService = {
          request: {
            repairReceptionId: Number(repairReceptionId),
            problemServices: [
              {
                repairCustomerProblemId: selectedProblem?.value,
                services: currentServices.map((service) => ({
                  performedByMechanicId: Number(service.mechanicId?.value) || 0,
                  serviceCount: service.serviceCount || 1,
                  serviceId: Number(service.serviceId?.value) || 0,
                  estimatedMinute: Number(service.estimatedMinute) || 0,
                })),
              },
            ],
          },
        };

        createMutation.mutate(serviceData);
      }
    } catch (error) {
      console.error("خطا در ذخیره سرویس:", error);
    }
  };

  const resetForm = () => {
    setSelectedProblem(null);
    setCurrentServices([]);
    setSelectedService(null);
  };

  const openModal = (service?: Service | IGetAllRepairReceptionServices) => {
    if (service) {
      setSelectedService(service);

      // Handle Service type (from the new structure)
      if ("serviceTitle" in service && "performedByMechanicId" in service) {
        // Find the problem that contains this service
        const problem = services?.problems?.find((p: ProblemsService) =>
          p.services?.some((s: Service) => s.id === service.id)
        );
        if (problem) {
          const problemOption = problems.find(
            (p: any) => p.value === problem.problemId
          );
          setSelectedProblem(problemOption);
        }

        const serviceOption = repairServices.find((s: any) =>
          s.label.includes(service.serviceTitle)
        );
        const mechanicOption = mechanics.find(
          (m: any) => m.value === service.performedByMechanicId
        );

        setCurrentServices([
          {
            serviceId: serviceOption,
            mechanicId: mechanicOption,
            servicePrice: service.servicePrice,
            serviceCount: service.serviceCount,
            totalPrice: service.totalPrice,
            estimatedMinute: service.estimatedMinute,
            originalServiceId: service.id,
            isDeleted: false,
          },
        ]);
      }
      // Handle old IGetAllRepairReceptionServices type (fallback)
      else {
        const legacyService = service as any;
        const serviceOption = repairServices.find(
          (s: any) => s.value === legacyService.serviceId
        );
        const mechanicOption = mechanics.find(
          (m: any) => m.value === legacyService.performedByMechanicId
        );

        setCurrentServices([
          {
            serviceId: serviceOption,
            mechanicId: mechanicOption,
            servicePrice: legacyService.servicePrice,
            serviceCount: legacyService.serviceCount,
            totalPrice: legacyService.totalPrice,
            estimatedMinute: legacyService.estimatedMinute,
            originalServiceId: legacyService.id,
            isDeleted: false,
          },
        ]);
      }
    } else {
      resetForm();
      setCurrentServices([
        {
          serviceId: undefined,
          mechanicId: undefined,
          servicePrice: undefined,
          serviceCount: 1,
          totalPrice: undefined,
          estimatedMinute: undefined,
          originalServiceId: undefined,
          isDeleted: false,
        },
      ]);
    }
    setShowModal(true);
  };

  const openProblemEditModal = (problem: ProblemsService) => {
    // Set the selected problem
    const problemOption = problems.find(
      (p: any) => p.value === problem.problemId
    );
    setSelectedProblem(problemOption);

    // Convert all services in the problem to the currentServices format
    const problemServices =
      problem.services?.map((service: Service) => {
        const serviceOption = repairServices.find((s: any) =>
          s.label.includes(service.serviceTitle)
        );
        const mechanicOption = mechanics.find(
          (m: any) => m.value === service.performedByMechanicId
        );

        return {
          serviceId: serviceOption,
          mechanicId: mechanicOption,
          servicePrice: service.servicePrice,
          serviceCount: service.serviceCount,
          totalPrice: service.totalPrice,
          estimatedMinute: service.estimatedMinute,
          originalServiceId: service.id, // Keep track of original service ID for updates
          isDeleted: false,
        };
      }) || [];

    setCurrentServices(problemServices);
    setSelectedService(null); // This indicates we're editing a problem, not a single service
    setShowModal(true);
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "در انتظار";
      case 1:
        return "در حال انجام";
      case 2:
        return "تکمیل شده";
      default:
        return "نامشخص";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "warning";
      case 1:
        return "info";
      case 2:
        return "success";
      default:
        return "default";
    }
  };

  return (
    <div className="service-management">
      <div className="service-management__create-btn">
        <Button
          onClick={() => openModal()}
          containerClassName="my-3"
          label="تعمیر جدید"
          startIcon={<Add />}
          variant="contained"
          color="secondary"
        />
      </div>

      {isLoading ? (
        <div className="service-management__loading">
          <Loading />
        </div>
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
                    {/* Problem Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-3 sm:p-4 md:p-6 relative">
                      {/* Edit Button - Top Right Corner */}
                      <div className="absolute top-2 right-2">
                        <IconButton
                          onClick={() => openProblemEditModal(problem)}
                          sx={{
                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                            color: "white",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.25)",
                              border: "1px solid rgba(255, 255, 255, 0.5)",
                            },
                            width: 36,
                            height: 36,
                          }}
                          title="ویرایش مشکل"
                        >
                          <Edit sx={{ fontSize: 18 }} />
                        </IconButton>
                      </div>

                      <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                              {problemIndex + 1}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-sm sm:text-base md:text-xl font-bold text-white mb-1 leading-tight">
                              مشکل: {problem.problemDescription}
                            </h2>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-blue-100">
                              <span className="text-xs sm:text-sm whitespace-nowrap">
                                تعداد سرویس‌ها: {problem.services?.length || 0}
                              </span>
                              <span className="text-xs sm:text-sm whitespace-nowrap">
                                زمان کل: {problem.totalEstimatedMinutes} دقیقه
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <div className="text-white text-xs sm:text-sm opacity-90 mb-1 whitespace-nowrap">
                            قیمت کل مشکل
                          </div>
                          <div className="text-sm sm:text-lg md:text-2xl font-bold text-white">
                            {addCommas(problem.totalProblemPrice)} ریال
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Services List */}
                    <div className="p-6">
                      {problem.services?.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                          {problem.services.map(
                            (service: Service, serviceIndex: number) => (
                              <div
                                key={service.id}
                                className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden"
                              >
                                {/* Service Header */}
                                <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-4 border-b border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                          {serviceIndex + 1}
                                        </span>
                                      </div>
                                      <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                                          {service.serviceTitle}
                                        </h3>
                                        <div className="mt-1">
                                          <Chip
                                            label={getStatusText(
                                              service.status
                                            )}
                                            color={getStatusColor(
                                              service.status
                                            )}
                                            size="small"
                                            className="!text-xs !h-5"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <IconButton
                                        onClick={() =>
                                          handleDelete(
                                            service.id,
                                            service.serviceTitle
                                          )
                                        }
                                        className="!p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        title="حذف"
                                        size="small"
                                      >
                                        <Delete
                                          className="text-red-500 dark:text-red-400"
                                          style={{ fontSize: 16 }}
                                        />
                                      </IconButton>
                                    </div>
                                  </div>
                                </div>

                                {/* Service Details */}
                                <div className="p-4 space-y-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                                        مکانیک
                                      </div>
                                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                                        {service.performedByMechanicName}
                                      </div>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                                      <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                                        ایجاد کننده
                                      </div>
                                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                                        {service.createdByUserName}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-center justify-between py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                      <span className="text-xs text-gray-600 dark:text-gray-400">
                                        قیمت واحد:
                                      </span>
                                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                        {addCommas(service.servicePrice)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                      <span className="text-xs text-gray-600 dark:text-gray-400">
                                        تعداد:
                                      </span>
                                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {service.serviceCount}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      زمان تخمینی:
                                    </span>
                                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                      {service.estimatedMinute} دقیقه
                                    </span>
                                  </div>

                                  {/* Total Price - Prominent */}
                                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                        قیمت کل سرویس:
                                      </span>
                                      <span className="text-base font-bold text-green-600 dark:text-green-400">
                                        {addCommas(service.totalPrice)} ریال
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
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
                    </div>
                  </div>
                )
              )}

              {/* Total Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
                  خلاصه کل پروژه
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {services.problems.length}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      تعداد مشکلات
                    </div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {services.problems.reduce(
                        (total: number, problem: ProblemsService) =>
                          total + (problem.services?.length || 0),
                        0
                      )}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                      تعداد کل سرویس‌ها
                    </div>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {services.problems.reduce(
                        (total: number, problem: ProblemsService) =>
                          total + problem.totalEstimatedMinutes,
                        0
                      )}{" "}
                      دقیقه
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      زمان کل تخمینی
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                  <div className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {addCommas(
                        services.problems.reduce(
                          (total: number, problem: ProblemsService) =>
                            total + problem.totalProblemPrice,
                          0
                        )
                      )}{" "}
                      ریال
                    </div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                      مجموع قیمت کل پروژه
                    </div>
                  </div>
                </div>
              </div>
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
                برای شروع، یک تعمیر جدید اضافه کنید
              </p>
            </div>
          )}
        </div>
      )}

      <Dialog
        onClose={() => setShowModal(false)}
        className="service-modal"
        open={showModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="service-modal__title">
          {selectedService
            ? "ویرایش سرویس"
            : selectedProblem
            ? "ویرایش مشکل"
            : "افزودن تعمیر جدید"}
          <IconButton
            onClick={() => setShowModal(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="service-modal__content">
          <div style={{ margin: "1rem 0" }}>
            <EnhancedSelect
              onChange={(value) => setSelectedProblem(value)}
              placeholder="مشکل مورد نظر را انتخاب کنید"
              value={selectedProblem}
              label="انتخاب مشکل"
              options={problems}
              name="problemId"
              searchable
            />
          </div>

          {selectedProblem && !selectedService && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.5rem",
                backgroundColor: "#e3f2fd",
                borderRadius: "4px",
                border: "1px solid #2196f3",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#1976d2" }}>
                💡 در حال ویرایش مشکل: <strong>{selectedProblem.label}</strong>
              </p>
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  fontSize: "0.75rem",
                  color: "#1976d2",
                }}
              >
                می‌توانید سرویس‌های موجود را ویرایش، حذف یا سرویس‌های جدید اضافه
                کنید.
              </p>
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <h4>سرویس‌های مرتبط با این مشکل:</h4>
            {currentServices?.map(
              (service, index) =>
                !service.isDeleted && (
                  <Paper
                    key={index}
                    className={`service-item service-item--${
                      index % 2 === 0 ? "even" : "odd"
                    } service-item--border-${
                      index % 4 === 0
                        ? "blue"
                        : index % 4 === 1
                        ? "green"
                        : index % 4 === 2
                        ? "orange"
                        : "red"
                    }`}
                  >
                    <div className="service-item__content">
                      <div className="service-item__header">
                        <h5>سرویس شماره {index + 1}</h5>
                        <IconButton
                          onClick={() => handleRemoveService(index)}
                          color="error"
                          title="حذف سرویس"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </div>

                      <div className="service-item__grid service-item__grid--two-cols">
                        <EnhancedSelect
                          name={`serviceId_${index}`}
                          label="انتخاب سرویس"
                          options={repairServices}
                          value={service.serviceId}
                          onChange={(value) => {
                            handleServiceChange(index, "serviceId", value);
                          }}
                          placeholder="سرویس را انتخاب کنید"
                          searchable
                        />

                        <EnhancedSelect
                          name={`mechanicId_${index}`}
                          label="انتخاب مکانیک"
                          options={mechanics}
                          value={service.mechanicId}
                          onChange={(value) =>
                            handleServiceChange(index, "mechanicId", value)
                          }
                          placeholder="مکانیک را انتخاب کنید"
                          searchable
                        />
                      </div>

                      <div className="service-item__grid service-item__grid--four-cols">
                        <EnhancedInput
                          value={service.servicePrice?.toString() || ""}
                          name={`servicePrice_${index}`}
                          label="قیمت پیشنهادی"
                          type="number"
                          formatNumber={true}
                          onChange={(e) =>
                            handleServiceChange(
                              index,
                              "servicePrice",
                              Number(e.target.value)
                            )
                          }
                          placeholder={
                            service.serviceId
                              ? "ویرایش قیمت"
                              : "ابتدا سرویس را انتخاب کنید"
                          }
                          disabled={!service.serviceId}
                        />
                        <EnhancedInput
                          value={service.estimatedMinute?.toString() || ""}
                          name={`estimatedMinute_${index}`}
                          label="تخمین زمان"
                          type="number"
                          formatNumber={true}
                          onChange={(e) =>
                            handleServiceChange(
                              index,
                              "estimatedMinute",
                              Number(e.target.value)
                            )
                          }
                          placeholder={
                            service.serviceId
                              ? "ویرایش زمان"
                              : "ابتدا سرویس را انتخاب کنید"
                          }
                          disabled={!service.serviceId}
                        />

                        <EnhancedInput
                          value={service.serviceCount.toString()}
                          name={`serviceCount_${index}`}
                          label="تعداد"
                          type="number"
                          onChange={(e) =>
                            handleServiceChange(
                              index,
                              "serviceCount",
                              Number(e.target.value)
                            )
                          }
                          inputProps={{ min: 1 }}
                        />

                        <EnhancedInput
                          value={service.totalPrice?.toString() || "0"}
                          name={`totalPrice_${index}`}
                          formatNumber={true}
                          label="قیمت کل"
                          disabled={true}
                          type="number"
                        />
                      </div>
                    </div>
                  </Paper>
                )
            )}

            <Button
              onClick={handleAddService}
              label="افزودن سرویس جدید"
              startIcon={<Add />}
              variant="outlined"
              containerClassName="mb-3"
            />

            {currentServices.length > 0 && (
              <Paper className="service-summary">
                <h5 className="service-summary__title">خلاصه سرویس‌ها</h5>
                <div className="service-summary__grid">
                  <div>
                    <span className="service-summary__item-label">
                      تعداد سرویس‌ها:
                    </span>
                    <div className="service-summary__item-value service-summary__item-value--primary">
                      {currentServices.length}
                    </div>
                  </div>
                  <div>
                    <span className="service-summary__item-label">
                      مجموع قیمت:
                    </span>
                    <div className="service-summary__item-value service-summary__item-value--success">
                      {addCommas(
                        currentServices.reduce(
                          (total, service) => total + (service.totalPrice || 0),
                          0
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="service-summary__item-label">
                      مجموع زمان تخمینی:
                    </span>
                    <div className="service-summary__item-value service-summary__item-value--info">
                      {currentServices.reduce(
                        (total, service) =>
                          total + (service.estimatedMinute || 0),
                        0
                      )}{" "}
                      دقیقه
                    </div>
                  </div>
                  <div>
                    <span className="service-summary__item-label">وضعیت:</span>
                    <div
                      className={`service-summary__item-value service-summary__item-value--small ${
                        currentServices.every(
                          (s) => s.serviceId && s.mechanicId
                        )
                          ? "service-summary__item-value--success"
                          : "service-summary__item-value--warning"
                      }`}
                    >
                      {currentServices.every((s) => s.serviceId && s.mechanicId)
                        ? "آماده ثبت"
                        : "نیاز به تکمیل"}
                    </div>
                  </div>
                </div>
              </Paper>
            )}
          </div>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setShowModal(false)}
            label="انصراف"
            variant="outlined"
          />
          <Button
            onClick={handleSubmit}
            label={selectedService ? "بروزرسانی" : "ذخیره"}
            variant="contained"
            color="primary"
            disabled={
              currentServices.length === 0 ||
              currentServices.every(
                (service) => !service.serviceId || !service.mechanicId
              ) ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          />
        </DialogActions>
      </Dialog>

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
