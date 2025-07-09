import { useDrop } from "react-dnd";
import moment from "moment-jalaali";
import { days } from "@/utils/statics";

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
  const [, drop] = useDrop({
    accept: "TASK",
    drop: (item: { task: Task }) => {
      onDropTask(item.task, user, dayIndex, hourIndex);
    },
  });

  // تابع کمکی برای بررسی تعطیلی بودن روز
  const isHoliday = (dayIndex: number): boolean => {
    const dayDate = moment(days[dayIndex]);

    // بررسی جمعه (روز 6 هفته - شنبه=0، جمعه=6)
    if (dayDate.day() === 6) {
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
      className={`border h-[30px] relative cursor-pointer w-24 group hover:bg-gray-50 overflow-visible ${
        isHolidayDay ? "bg-red-50 hover:bg-red-100" : ""
      }`}
      onDoubleClick={() => onCreateTask(user, dayIndex, hourIndex)}
    >
      {children}
    </td>
  );
}
