import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useState } from "react";

import { getAllRepairServices } from "@/service/repairServices/repairServices.service";
import { getCustomerProblems } from "@/service/repairServices/repairServices.service";
import { ServiceFormData, ExtendedSelectOption, addCommas } from "@/utils";
import {
  updateRepairReceptionServicesForProblems,
  getAllRepairReceptionServices,
  deleteRepairReceptionService,
  createRepairReceptionService,
} from "@/service/repairReceptionService/repairReceptionService.service";
import { getActiveMechanics } from "@/service/mechanic/mechanic.service";

export const useRepairReceptionService = (repairReceptionId?: string) => {
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
  const [currentServices, setCurrentServices] = useState<ServiceFormData[]>([]);
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

  // Mutations
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

  // Handlers
  const handleDelete = (id: number, serviceName: string) => {
    setDeleteConfirm({ open: true, serviceId: id, serviceName });
  };

  const confirmDelete = () => {
    if (deleteConfirm.serviceId) {
      deleteMutation.mutate(deleteConfirm.serviceId);
      setDeleteConfirm({ open: false, serviceId: null, serviceName: null });
    }
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

  const resetForm = () => {
    setSelectedProblem(null);
    setCurrentServices([]);
    setSelectedService(null);
  };

  const openModal = (
    service?: Service | IGetAllRepairReceptionServices,
    problem?: ProblemsService
  ) => {
    if (service) {
      setSelectedService(service);
      if ("serviceTitle" in service && "performedByMechanicId" in service) {
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
      } else {
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
    } else if (problem) {
      // Add new service to specific problem
      const problemOption = problems.find(
        (p: any) => p.value === problem.problemId
      );
      setSelectedProblem(problemOption);
      setSelectedService(null);
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
                  price: Number(service.servicePrice) || 0,
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

  return {
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
    confirmDelete,
    deleteConfirm,
    setShowModal,
    handleDelete,
    handleSubmit,
    showModal,
    isLoading,
    mechanics,
    openModal,
    resetForm,
    problems,
    services,
  };
};
