import PlateNumberDisplay from "@/components/common/PlateNumberDisplay";
import { getActiveMechanics } from "@/service/mechanic/mechanic.service";
import { getRepairReceptions } from "@/service/repair/repair.service";
import { getRepairReceptionServices } from "@/service/repairReceptionService/repairReceptionService.service";
import { workHours, days } from "@/utils/statics";
import { useQuery } from "@tanstack/react-query";
import moment from "moment-jalaali";
import { useEffect, useState } from "react";

// Persian day names - mapping from English day of week to Persian
const persianDays = [
  "یکشنبه", // Sunday (0)
  "دوشنبه", // Monday (1)
  "سه‌شنبه", // Tuesday (2)
  "چهارشنبه", // Wednesday (3)
  "پنج‌شنبه", // Thursday (4)
  "جمعه", // Friday (5)
  "شنبه", // Saturday (6)
];

// مودال ویرایش تسک
export default function TaskEditModal({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  holidays = [],
}: {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  holidays?: string[];
}) {
  // State for the workflow
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
  const [startHour, setStartHour] = useState(0);
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
    user: "",
    startDay: 0,
    startHour: 0,
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
    if (task && isOpen) {
      console.log("Task data:", task); // برای دیباگ
      setFormData(task);
      setStartHour(task.startHour);
      setDuration(task.duration);

      // Set plate filter to trigger search
      if (task.plateSection1 && task.plateSection3 && task.plateSection4) {
        console.log(
          "Setting plate filter:",
          task.plateSection1,
          task.plateSection3,
          task.plateSection4
        ); // برای دیباگ
        setPlateFilter({
          plateSection1: task.plateSection1,
          plateSection2: task.plateSection2 || "",
          plateSection3: task.plateSection3,
          plateSection4: task.plateSection4,
        });
      }
    }
  }, [task, isOpen]);

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

  // Set plate when plate filter changes and plates data is available
  useEffect(() => {
    if (task && isOpen && platesData && platesData.length > 0) {
      const taskPlateKey = `${task.plateSection1}${task.plateSection2 || ""}${
        task.plateSection3
      }-ایران${task.plateSection4}`;
      const foundPlate = platesData.find(
        (plate: any) => plate.value === taskPlateKey
      );
      if (foundPlate && !selectedPlate) {
        console.log("Found plate from search results:", foundPlate); // برای دیباگ
        setSelectedPlate(foundPlate);
      }
    }
  }, [platesData, task, isOpen, selectedPlate]);

  // Set reception when receptions data is loaded
  useEffect(() => {
    if (
      task &&
      isOpen &&
      receptionsData &&
      receptionsData.length > 0 &&
      task.receptionId
    ) {
      const foundReception = receptionsData.find(
        (reception: any) => reception.value === task.receptionId
      );
      if (foundReception && !selectedReception) {
        console.log("Found reception from loaded data:", foundReception); // برای دیباگ
        setSelectedReception(foundReception);
      }
    }
  }, [receptionsData, task, isOpen, selectedReception]);

  // Set service when services data is loaded
  useEffect(() => {
    if (
      task &&
      isOpen &&
      servicesData &&
      servicesData.length > 0 &&
      task.serviceId
    ) {
      const foundService = servicesData.find(
        (service: any) => service.value === task.serviceId
      );
      if (foundService && !selectedService) {
        console.log("Found service from loaded data:", foundService); // برای دیباگ
        setSelectedService(foundService);
      }
    }
  }, [servicesData, task, isOpen, selectedService]);

  // Set mechanic when mechanics data is loaded
  useEffect(() => {
    if (task && isOpen && mechanicsData && mechanicsData.length > 0) {
      let foundMechanic = null;

      if (task.mechanicId) {
        foundMechanic = mechanicsData.find(
          (mechanic: any) => mechanic.value === task.mechanicId
        );
      } else if (task.user) {
        foundMechanic = mechanicsData.find(
          (mechanic: any) => mechanic.label === task.user
        );
      }

      if (foundMechanic && !selectedMechanic) {
        console.log("Found mechanic from loaded data:", foundMechanic); // برای دیباگ
        setSelectedMechanic(foundMechanic);
      }
    }
  }, [mechanicsData, task, isOpen, selectedMechanic]);

  // برای تسک‌های قدیمی که اطلاعات اضافی ندارند، حداقل mechanic را تنظیم کنیم
  useEffect(() => {
    if (
      task &&
      isOpen &&
      mechanicsData &&
      mechanicsData.length > 0 &&
      !selectedMechanic
    ) {
      // اگر تسک اطلاعات اضافی ندارد، حداقل mechanic را از نام کاربر پیدا کنیم
      if (task.user && !task.mechanicId) {
        const mechanic = mechanicsData.find(
          (mechanic: any) => mechanic.label === task.user
        );
        if (mechanic) {
          console.log("Found mechanic for old task:", mechanic); // برای دیباگ
          setSelectedMechanic(mechanic);
        }
      }
    }
  }, [task, isOpen, mechanicsData, selectedMechanic]);

  // Reset selections when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
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

    // برای تسک‌های قدیمی فقط mechanic را بررسی کنیم
    if (task && (!task.plateSection1 || !task.receptionId || !task.serviceId)) {
      if (!selectedMechanic) {
        alert("لطفاً مکانیک را انتخاب کنید!");
        return;
      }
    } else {
      // برای تسک‌های جدید همه فیلدها را بررسی کنیم
      if (!selectedService || !selectedMechanic) {
        alert("لطفاً سرویس و مکانیک را انتخاب کنید!");
        return;
      }
    }

    // برای تسک‌های قدیمی فقط mechanic را به‌روزرسانی کنیم
    if (task && (!task.plateSection1 || !task.receptionId || !task.serviceId)) {
      const updatedTask = {
        ...formData,
        user: selectedMechanic.label,
        startHour: startHour,
        duration: duration,
        mechanicId: selectedMechanic?.value,
      };
      onSave(updatedTask);
      onClose();
      return;
    }

    // برای تسک‌های جدید همه اطلاعات را ذخیره کنیم
    const updatedTask = {
      ...formData,
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
    onSave(updatedTask);
    onClose();
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full md:w-3/6 max-w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">ویرایش تسک</h2>

        {/* هشدار برای تسک‌های قدیمی */}
        {task &&
          (!task.plateSection1 || !task.receptionId || !task.serviceId) && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-yellow-600 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-yellow-800 text-sm">
                  این تسک از سیستم قدیمی است و اطلاعات کامل ندارد. لطفاً اطلاعات
                  را مجدداً وارد کنید.
                </span>
              </div>
            </div>
          )}

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
          {(selectedService || (task && !task.plateSection1)) && (
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

          {/* Step 5: Day Selection */}
          {selectedMechanic && (
            <div>
              <label className="block text-sm font-medium mb-1">روز</label>
              <select
                value={formData.startDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startDay: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {days.map((day, index) => {
                  const isHolidayDay = isHoliday(index);
                  return (
                    <option
                      key={index}
                      value={index}
                      disabled={isHolidayDay}
                      className={isHolidayDay ? "text-red-500" : ""}
                    >
                      {persianDays[moment(day).day()]} -{" "}
                      {moment(day).format("jMM/jDD")}
                      {isHolidayDay && " (تعطیل)"}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Step 6: Start Time */}
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

          {/* Step 7: Duration */}
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
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              disabled={
                task &&
                (!task.plateSection1 || !task.receptionId || !task.serviceId)
                  ? !selectedMechanic
                  : !selectedService || !selectedMechanic
              }
            >
              ذخیره
            </button>
            <button
              type="button"
              onClick={() => {
                if (task) {
                  onDelete(task.id);
                }
              }}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
            >
              حذف
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
