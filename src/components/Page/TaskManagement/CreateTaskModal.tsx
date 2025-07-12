import PlateNumberDisplay from "@/components/common/PlateNumberDisplay";
import { getActiveMechanics } from "@/service/mechanic/mechanic.service";
import { getRepairReceptions } from "@/service/repair/repair.service";
import { getRepairReceptionServices } from "@/service/repairReceptionService/repairReceptionService.service";
import { days, workHours } from "@/utils/statics";
import { useQuery } from "@tanstack/react-query";
import moment from "moment-jalaali";
import { useEffect, useState } from "react";

// مودال ایجاد تسک جدید
export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
  selectedUser,
  selectedDay,
  selectedHour,
  holidays = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Task) => void;
  selectedUser: string;
  selectedDay: number;
  selectedHour: number;
  holidays?: string[];
}) {
  // State for the workflow
  const [plateSearch, setPlateSearch] = useState("");
  const [plateFilter, setPlateFilter] = useState<plateSection>({
    plateSection1: "",
    plateSection2: "",
    plateSection3: "",
    plateSection4: "",
  });
  const [selectedPlate, setSelectedPlate] = useState<any>(null);
  const [selectedReception, setSelectedReception] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedMechanic, setSelectedMechanic] = useState<any>(null);
  const [startHour, setStartHour] = useState(selectedHour);
  const [duration, setDuration] = useState(1);

  // Query برای دریافت مکانیک‌های فعال
  const { data: mechanicsData, isLoading: isLoadingMechanics } = useQuery({
    queryKey: ["activeMechanics"],
    queryFn: getActiveMechanics,
    select: (data: any) =>
      data?.data?.map((mechanic: { fullName: string; id: number }) => ({
        label: mechanic.fullName,
        value: mechanic.id,
      })) || [],
  });

  // Query برای جستجوی پلاک‌ها
  const { data: platesData, isLoading: isLoadingPlates } = useQuery({
    queryKey: ["plates", plateFilter],
    queryFn: () =>
      getRepairReceptions({
        page: 1,
        size: 50,
        plateSection1: plateFilter.plateSection1,
        plateSection2: plateFilter.plateSection2,
        plateSection3: plateFilter.plateSection3,
        plateSection4: plateFilter.plateSection4,
      }),
    enabled:
      (plateFilter.plateSection1?.length || 0) >= 2 ||
      (plateFilter.plateSection3?.length || 0) >= 2 ||
      (plateFilter.plateSection4?.length || 0) >= 2,
    select: (data: any) => {
      if (!data?.data?.values) return [];

      // Group by unique plates
      const uniquePlates = new Map();
      data.data.values.forEach((reception: any) => {
        const plateKey = `${reception.plateSection1}${reception.plateSection2}${reception.plateSection3}-ایران${reception.plateSection4}`;
        if (!uniquePlates.has(plateKey)) {
          uniquePlates.set(plateKey, {
            label: plateKey,
            value: plateKey,
            plateSection1: reception.plateSection1,
            plateSection2: reception.plateSection2,
            plateSection3: reception.plateSection3,
            plateSection4: reception.plateSection4,
          });
        }
      });
      return Array.from(uniquePlates.values());
    },
  });

  // Query برای دریافت پذیرش‌های پلاک انتخاب شده
  const { data: receptionsData, isLoading: isLoadingReceptions } = useQuery({
    queryKey: ["receptions", selectedPlate],
    queryFn: () =>
      getRepairReceptions({
        page: 1,
        size: 50,
        plateSection1: selectedPlate?.plateSection1,
        plateSection2: selectedPlate?.plateSection2,
        plateSection3: selectedPlate?.plateSection3,
        plateSection4: selectedPlate?.plateSection4,
      }),
    enabled: !!selectedPlate,
    select: (data: any) =>
      data?.data?.values?.map((reception: any) => ({
        label: `پذیرش ${reception.code} - ${reception.customerName} -${reception.receptionDate} -${reception.receptionTime}`,
        value: reception.id,
        reception: reception,
      })) || [],
  });

  // Query برای دریافت سرویس‌های پذیرش انتخاب شده
  const { data: servicesData, isLoading: isLoadingServices } = useQuery({
    queryKey: ["receptionServices", selectedReception],
    queryFn: () => getRepairReceptionServices(selectedReception?.value),
    enabled: !!selectedReception,
    select: (data: any) => {
      if (!data?.data?.services) return [];

      const allServices: any[] = [];
      data.data.services.forEach((service: IGetRepairReceptionServices) => {
        allServices.push({
          label: service.serviceTitle,
          value: service.id,
          service: service,
        });
      });
      return allServices;
    },
  });

  const [formData, setFormData] = useState<Task>({
    id: "",
    user: selectedUser,
    startDay: selectedDay,
    startHour: selectedHour,
    duration: 1,
    title: "",
  });

  // تابع کمکی برای بررسی تعطیلی بودن روز
  const isHoliday = (dayIndex: number): boolean => {
    const dayDate = moment(days[dayIndex]);

    // بررسی جمعه (روز 5 هفته - یکشنبه=0، جمعه=5)
    if (dayDate.day() === 5) {
      return true; // جمعه تعطیل است
    }

    // بررسی روزهای تعطیل اضافی
    const dayStart = dayDate.startOf("day").toISOString();
    return holidays.includes(dayStart);
  };

  useEffect(() => {
    setFormData({
      id: "",
      user: selectedUser,
      startDay: selectedDay,
      startHour: selectedHour,
      duration: 1,
      title: "",
    });
    setStartHour(selectedHour);
  }, [selectedUser, selectedDay, selectedHour]);

  // Update duration, start time, and mechanic when service is selected
  useEffect(() => {
    if (selectedService?.service) {
      const service = selectedService.service;

      // Update duration based on estimated minutes
      if (service.estimatedMinute) {
        const hours = Math.ceil(service.estimatedMinute / 60);
        setDuration(hours);
      } else {
        setDuration(1);
      }

      // Auto-select mechanic based on service data
      if (service.performedByMechanicId && mechanicsData) {
        const mechanic = mechanicsData.find(
          (m: any) => m.value === service.performedByMechanicId
        );
        if (mechanic) {
          setSelectedMechanic(mechanic);
        }
      }

      // Auto-select start time based on service start date
      if (service.startDate) {
        const startDate = moment(service.startDate);
        const startHourFromService = startDate.hour() - 8; // Convert to work hours (0-7)

        // Ensure the hour is within valid work hours range
        if (
          startHourFromService >= 0 &&
          startHourFromService < workHours.length
        ) {
          setStartHour(startHourFromService);
        }
      }
    } else {
      setDuration(1);
    }
  }, [selectedService, mechanicsData]);

  // Reset selections when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPlateSearch("");
      setPlateFilter({
        plateSection1: "",
        plateSection2: "",
        plateSection3: "",
        plateSection4: "",
      });
      setSelectedPlate(null);
      setSelectedReception(null);
      setSelectedService(null);
      setSelectedMechanic(null);
      setDuration(1);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // بررسی تعطیلی بودن روز انتخاب شده
    if (isHoliday(formData.startDay)) {
      alert("نمی‌توان در روز تعطیل تسک ایجاد کرد!");
      return;
    }

    if (!selectedService || !selectedMechanic) {
      alert("لطفاً سرویس و مکانیک را انتخاب کنید!");
      return;
    }

    const newTask = {
      ...formData,
      id: Date.now().toString(),
      user: selectedMechanic.label,
      title: selectedService.label,
      startHour: startHour,
      duration: duration,
      // ذخیره اطلاعات اضافی برای ویرایش
      plateSection1: selectedPlate?.plateSection1,
      plateSection2: selectedPlate?.plateSection2,
      plateSection3: selectedPlate?.plateSection3,
      plateSection4: selectedPlate?.plateSection4,
      receptionId: selectedReception?.value,
      serviceId: selectedService?.value,
      mechanicId: selectedMechanic?.value,
    };
    onCreate(newTask);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full  md:w-3/6  max-w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">ایجاد تسک جدید</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Plate Search */}
          <div className="max-w-72">
            <label className="font-12">شماره پلاک</label>
            <PlateNumberDisplay
              state={plateFilter}
              setState={setPlateFilter}
              setPage={() => {}}
            />
            {isLoadingPlates && (
              <div className="text-sm text-gray-500 mt-1">در حال جستجو...</div>
            )}
            {platesData && platesData.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded">
                {platesData.map((plate: any) => (
                  <div
                    key={plate.value}
                    onClick={() => setSelectedPlate(plate)}
                    className={`p-2 cursor-pointer hover:bg-gray-100 ${
                      selectedPlate?.value === plate.value ? "bg-blue-100" : ""
                    }`}
                  >
                    {plate.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Reception Selection */}
          {selectedPlate && (
            <div>
              <label className="block text-sm font-medium mb-1">
                انتخاب پذیرش
              </label>
              {isLoadingReceptions ? (
                <div className="text-sm text-gray-500">
                  در حال بارگذاری پذیرش‌ها...
                </div>
              ) : (
                <select
                  value={selectedReception?.value || ""}
                  onChange={(e) => {
                    const reception = receptionsData?.find(
                      (r: any) => r.value === parseInt(e.target.value)
                    );
                    setSelectedReception(reception);
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">انتخاب پذیرش</option>
                  {receptionsData?.map((reception: any) => (
                    <option key={reception.value} value={reception.value}>
                      {reception.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Step 3: Service Selection */}
          {selectedReception && (
            <div>
              <label className="block text-sm font-medium mb-1">
                انتخاب سرویس
              </label>
              {isLoadingServices ? (
                <div className="text-sm text-gray-500">
                  در حال بارگذاری سرویس‌ها...
                </div>
              ) : (
                <select
                  value={selectedService?.value || ""}
                  onChange={(e) => {
                    const service = servicesData?.find(
                      (s: any) => s.value === parseInt(e.target.value)
                    );
                    setSelectedService(service);
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">انتخاب سرویس</option>
                  {servicesData?.map((service: any) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Step 4: Mechanic Selection */}
          {selectedService && (
            <div>
              <label className="block text-sm font-medium mb-1">
                انتخاب مکانیک
                {selectedService?.service?.performedByMechanicName && (
                  <span className="text-xs text-green-600 mr-2">
                    (اتوماتیک انتخاب شده)
                  </span>
                )}
              </label>
              <select
                value={selectedMechanic?.value || ""}
                onChange={(e) => {
                  const mechanic = mechanicsData?.find(
                    (m: any) => m.value === parseInt(e.target.value)
                  );
                  setSelectedMechanic(mechanic);
                }}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedService?.service?.performedByMechanicId &&
                  selectedMechanic?.value ===
                    selectedService.service.performedByMechanicId
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300"
                }`}
                required
                disabled={isLoadingMechanics}
              >
                <option value="">انتخاب مکانیک</option>
                {isLoadingMechanics ? (
                  <option>در حال بارگذاری...</option>
                ) : (
                  mechanicsData?.map((mechanic: any) => (
                    <option key={mechanic.value} value={mechanic.value}>
                      {mechanic.label}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Step 5: Start Time */}
          {selectedMechanic && (
            <div>
              <label className="block text-sm font-medium mb-1">
                ساعت شروع
                {selectedService?.service?.startDate && (
                  <span className="text-xs text-green-600 mr-2">
                    (اتوماتیک انتخاب شده)
                  </span>
                )}
              </label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(parseInt(e.target.value))}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedService?.service?.startDate
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300"
                }`}
                required
              >
                {workHours.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour + 8}:00
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 6: Duration */}
          {selectedMechanic && (
            <div>
              <label className="block text-sm font-medium mb-1">
                مدت زمان (ساعت)
              </label>
              <div className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-700">
                {duration} ساعت
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
              disabled={!selectedService || !selectedMechanic}
            >
              ایجاد
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
