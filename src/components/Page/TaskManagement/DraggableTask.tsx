import { useDrag } from "react-dnd";
import moment from "moment-jalaali";
import { days } from "@/utils/statics";
import { useTheme } from "@/context/ThemeContext";

export default function DraggableTask({
  task,
  onClick,
  isContinuing = false,
  currentDay,
  taskLength,
  holidays = [],
  mechanicLeavesMap = {},
}: {
  task: Task;
  onClick: (task: Task) => void;
  isContinuing?: boolean;
  currentDay?: number;
  currentHour?: number;
  taskLength?: number;
  holidays?: string[];
  mechanicLeavesMap?: { [mechanicName: string]: string[] };
}) {
  const { mode } = useTheme();

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

  // تابع کمکی برای بررسی مرخصی بودن مکانیک در روز خاص
  const isMechanicOnLeave = (dayIndex: number): boolean => {
    const dayDate = moment(days[dayIndex]);
    const dayStart = dayDate.startOf("day").toISOString();
    const mechanicLeaves = mechanicLeavesMap[task.user] || [];
    return mechanicLeaves.includes(dayStart);
  };

  // تابع کمکی برای محاسبه ساعات باقی‌مانده در روز
  const getRemainingHoursInDay = (startHour: number) => {
    const actualStartHour = startHour + 8; // تبدیل به ساعت واقعی
    return Math.max(0, 17 - actualStartHour);
  };

  // تابع کمکی برای محاسبه ساعات تسک در روز مشخص
  const getTaskHoursInDay = (day: number) => {
    const taskEndDay = task.endDay || task.startDay;

    // اگر تسک ادامه‌دار نیست (در یک روز تمام می‌شود)
    if (task.startDay === taskEndDay) {
      if (day === task.startDay) {
        // برای تسک‌های تک روزه، فقط duration را برگردان
        return task.duration;
      }
      return 0;
    }

    // برای تسک‌های ادامه‌دار
    if (day === task.startDay) {
      // در روز شروع تسک
      const hoursInFirstDay = Math.min(
        getRemainingHoursInDay(task.startHour),
        task.duration
      );
      return hoursInFirstDay;
    } else if (
      day === taskEndDay &&
      task.endDay &&
      task.endDay > task.startDay
    ) {
      // در روز پایان تسک
      return task.endHour || 0;
    } else if (day > task.startDay && day < taskEndDay) {
      // در روزهای میانی
      return 9; // کل روز
    }

    return 0;
  };
  const [, drag] = useDrag({
    type: "TASK",
    item: { task },
  });

  const getTaskStyle = () => {
    // چون تسک در سلول مربوط به ساعت شروع خودش قرار دارد، top باید 0 باشد
    const top = 0;

    let height;
    if (taskLength !== undefined) {
      // اگر taskLength از بیرون ارسال شده، از آن استفاده کن
      height = taskLength * 30;
    } else if (isContinuing && currentDay !== undefined) {
      // برای تسک‌های ادامه‌دار، ارتفاع را بر اساس روز فعلی محاسبه کن
      const hoursInDay = getTaskHoursInDay(currentDay);
      height = hoursInDay * 30;
    } else {
      // برای تسک‌های عادی
      const hoursInDay = getTaskHoursInDay(task.startDay);
      height = hoursInDay * 30;
    }

    // بررسی تعطیلی یا مرخصی بودن روز فعلی
    const isHolidayDay = currentDay !== undefined && isHoliday(currentDay);
    const isMechanicLeaveDay =
      currentDay !== undefined && isMechanicOnLeave(currentDay);

    return {
      top: `${top}px`,
      height: `${height}px`,
      minHeight: "30px", // حداقل ارتفاع
      // تسک‌ها در روزهای تعطیل یا مرخصی شفاف‌تر باشند اما کاملاً مخفی نباشند
      opacity: isHolidayDay || isMechanicLeaveDay ? 0.7 : 1,
    };
  };

  const getTaskClassName = () => {
    // بررسی تعطیلی یا مرخصی بودن روز فعلی
    const isHolidayDay = currentDay !== undefined && isHoliday(currentDay);
    const isMechanicLeaveDay =
      currentDay !== undefined && isMechanicOnLeave(currentDay);

    let baseClass =
      "absolute left-0 rounded px-2 py-1 w-full cursor-pointer text-xs overflow-hidden transition-colors z-10";

    if (isHolidayDay) {
      // برای روزهای تعطیل، تسک را با رنگ قرمز نمایش بده
      if (isContinuing) {
        return `${baseClass} bg-red-600/90 text-white hover:bg-red-700/90 border-l-4 ${
          mode === "dark" ? "border-red-400" : "border-red-300"
        }`;
      }
      return `${baseClass} bg-red-600/90 text-white hover:bg-red-700/90`;
    } else if (isMechanicLeaveDay) {
      // برای روزهای مرخصی، تسک را با رنگ نارنجی نمایش بده
      if (isContinuing) {
        return `${baseClass} bg-orange-600/90 text-white hover:bg-orange-700/90 border-l-4 ${
          mode === "dark" ? "border-orange-400" : "border-orange-300"
        }`;
      }
      return `${baseClass} bg-orange-600/90 text-white hover:bg-orange-700/90`;
    } else {
      // برای روزهای عادی
      if (isContinuing) {
        return `${baseClass} bg-purple-500 text-white hover:bg-purple-600 border-l-4 ${
          mode === "dark" ? "border-yellow-400" : "border-yellow-300"
        }`;
      }
      return `${baseClass} bg-blue-500 text-white hover:bg-blue-600`;
    }
  };

  // بررسی تعطیلی یا مرخصی بودن روز فعلی
  const isHolidayDay = currentDay !== undefined && isHoliday(currentDay);
  const isMechanicLeaveDay =
    currentDay !== undefined && isMechanicOnLeave(currentDay);

  return (
    <div
      ref={drag}
      className={getTaskClassName()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
      style={getTaskStyle()}
      onClick={(e) => {
        e.stopPropagation();
        onClick(task);
      }}
    >
      <div className="font-semibold">
        {isHolidayDay ? "تعطیل" : isMechanicLeaveDay ? "مرخصی" : task.title}
      </div>
      <div className="text-xs opacity-90">
        {isContinuing ? (
          <>
            {task.startDay !== (task.endDay || task.startDay) && (
              <span className="text-yellow-200">ادامه</span>
            )}
          </>
        ) : (
          <>
            {task.startHour + 8}:00 - {task.startHour + task.duration + 8}:00
          </>
        )}
      </div>
    </div>
  );
}
