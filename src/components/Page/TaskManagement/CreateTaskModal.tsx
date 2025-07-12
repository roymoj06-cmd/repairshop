import { workHours, days } from "@/utils/statics";
import { getActiveMechanics } from "@/service/mechanic/mechanic.service";
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
  // Query برای دریافت مکانیک‌های فعال
  const { data: mechanicsData, isLoading: isLoadingMechanics } = useQuery({
    queryKey: ["activeMechanics"],
    queryFn: getActiveMechanics,
    select: (data: any) =>
      data?.data?.map((mechanic: { fullName: string }) => mechanic.fullName) ||
      [],
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
  }, [selectedUser, selectedDay, selectedHour]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // بررسی تعطیلی بودن روز انتخاب شده
    if (isHoliday(formData.startDay)) {
      alert("نمی‌توان در روز تعطیل تسک ایجاد کرد!");
      return;
    }

    const newTask = {
      ...formData,
      id: Date.now().toString(),
    };
    onCreate(newTask);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <h2 className="text-xl font-bold mb-4">ایجاد تسک جدید</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">عنوان تسک</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">کاربر</label>
            <select
              value={formData.user}
              onChange={(e) =>
                setFormData({ ...formData, user: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoadingMechanics}
            >
              {isLoadingMechanics ? (
                <option>در حال بارگذاری...</option>
              ) : (
                mechanicsData?.map((user: string) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))
              )}
            </select>
          </div>

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

          <div>
            <label className="block text-sm font-medium mb-1">ساعت شروع</label>
            <select
              value={formData.startHour}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startHour: parseInt(e.target.value),
                })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {workHours.map((hour) => (
                <option key={hour} value={hour}>
                  {hour + 8}:00
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              مدت زمان (ساعت)
            </label>
            <select
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {Array.from({ length: 100 }, (_, i) => i + 1).map((duration) => (
                <option key={duration} value={duration}>
                  {duration} ساعت
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
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
