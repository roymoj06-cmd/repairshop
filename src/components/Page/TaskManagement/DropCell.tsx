import { useDrop } from "react-dnd";
import moment from "moment-jalaali";
import { days } from "@/utils/statics";
import { useTheme } from "@/context/ThemeContext";

export default function DropCell({
  dayIndex,
  hourIndex,
  user,
  onDropTask,
  children,
  onCreateTask,
  holidays = [],
}: {
  dayIndex: number;
  hourIndex: number;
  user: string;
  onDropTask: (
    task: Task,
    newUser: string,
    newDay: number,
    newHour: number
  ) => void;
  onCreateTask: (user: string, dayIndex: number, hourIndex: number) => void;
  children?: React.ReactNode;
  holidays?: string[];
}) {
  const { mode } = useTheme();

  const [, drop] = useDrop({
    accept: "TASK",
    drop: (item: { task: Task }) => {
      onDropTask(item.task, user, dayIndex, hourIndex);
    },
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

  const isHolidayDay = isHoliday(dayIndex);

  return (
    <td
      ref={drop}
      className={`border h-[30px] relative cursor-pointer w-24 group overflow-visible ${
        mode === "dark" ? "border-gray-600" : "border-gray-300"
      } ${mode === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"} ${
        isHolidayDay
          ? mode === "dark"
            ? "bg-red-900/20 hover:bg-red-900/30"
            : "bg-red-50 hover:bg-red-100"
          : ""
      }`}
      onDoubleClick={() => onCreateTask(user, dayIndex, hourIndex)}
    >
      {children}
    </td>
  );
}
