import {
  ConfirmDeleteDialog,
  CreateTaskModal,
  DraggableTask,
  DropCell,
  TaskEditModal,
} from "@/components";
import { days, workHours } from "@/utils/statics";
import moment from "moment-jalaali";
import { Fragment, useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { getActiveMechanics } from "@/service/mechanic/mechanic.service";
import { getAllMechanicLeave } from "@/service/repairMechanicLeaves/repairMechanicLeaves.service";

// Configure moment-jalaali
moment.loadPersian({ dialect: "persian-modern" });

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

export default function TaskManagement() {
  // Query برای دریافت مکانیک‌های فعال
  const { data: mechanicsData } = useQuery({
    queryKey: ["activeMechanics"],
    queryFn: getActiveMechanics,
    select: (data: any) =>
      data?.data?.map((mechanic: { fullName: string }) => mechanic.fullName) ||
      [],
  });

  // Query برای دریافت مرخصی‌های مکانیک‌ها
  const { data: mechanicLeavesData } = useQuery({
    queryKey: ["mechanicLeaves"],
    queryFn: () => getAllMechanicLeave({ page: 1, size: 1000 }),
    select: (data: any) => data?.data || [],
    refetchInterval: 30000, // هر 30 ثانیه به‌روزرسانی
  });

  // ایجاد مپینگ بین نام مکانیک و تاریخ‌های مرخصی
  const [mechanicLeavesMap, setMechanicLeavesMap] = useState<{
    [mechanicName: string]: string[];
  }>({});

  useEffect(() => {
    if (!mechanicLeavesData || !mechanicsData) {
      setMechanicLeavesMap({});
      return;
    }

    const leavesMap: { [mechanicName: string]: string[] } = {};

    mechanicLeavesData.forEach((leave: IGetAllMechanicLeaves) => {
      if (!leavesMap[leave.mechanicFullName]) {
        leavesMap[leave.mechanicFullName] = [];
      }
      // تبدیل تاریخ به فرمت ISO string برای مقایسه یکسان
      const leaveDate = moment(leave.date).startOf("day").toISOString();
      leavesMap[leave.mechanicFullName].push(leaveDate);
    });

    setMechanicLeavesMap(leavesMap);
  }, [mechanicLeavesData, mechanicsData]);

  // آرایه روزهای تعطیل (UTC timestamps)
  // برای اضافه کردن روز تعطیل جدید، تاریخ را به فرمت ISO string اضافه کنید
  // مثال: "2024-03-21T00:00:00.000Z" برای نوروز
  const [holidays, setHolidays] = useState<string[]>([
    // مثال: روزهای تعطیل - می‌توانید این‌ها را تغییر دهید
    "2024-01-01T00:00:00.000Z", // روز سال نو میلادی
    "2024-03-21T00:00:00.000Z", // نوروز
    "2024-03-22T00:00:00.000Z", // روز دوم نوروز
    "2024-03-23T00:00:00.000Z", // روز سوم نوروز
    "2024-03-24T00:00:00.000Z", // روز چهارم نوروز
    "2024-04-01T00:00:00.000Z", // روز طبیعت
    "2024-04-02T00:00:00.000Z", // روز شهدا
    "2024-04-09T00:00:00.000Z", // روز ارتش
    "2024-04-10T00:00:00.000Z", // روز ارتش
    "2024-05-01T00:00:00.000Z", // روز کارگر
    "2024-06-04T00:00:00.000Z", // رحلت امام خمینی
    "2024-06-05T00:00:00.000Z", // شهادت امام جعفر صادق
    "2024-07-16T00:00:00.000Z", // عید قربان
    "2024-07-26T00:00:00.000Z", // عید غدیر
    "2024-09-17T00:00:00.000Z", // تاسوعا
    "2024-09-18T00:00:00.000Z", // عاشورا
    "2024-09-27T00:00:00.000Z", // اربعین حسینی
    "2024-10-29T00:00:00.000Z", // میلاد پیامبر
    "2024-11-07T00:00:00.000Z", // میلاد امام جعفر صادق
    "2024-12-19T00:00:00.000Z", // میلاد امام رضا
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      user: "حمیدرضا",
      startDay: 0,
      startHour: 0,
      duration: 4,
      title: "طراحی UI",
    },
    {
      id: "2",
      user: "زهرا",
      startDay: 0,
      startHour: 4,
      duration: 9,
      title: "برنامه‌نویسی",
      endDay: 1,
      endHour: 4, // 4 ساعت در روز بعد (5 ساعت در روز اول)
    },
    {
      id: "3",
      user: "مهدی",
      startDay: 0,
      startHour: 7, // ساعت 15:00
      duration: 9,
      title: "تست تسک 9 ساعته",
      endDay: 1,
      endHour: 7, // 7 ساعت در روز بعد
    },
  ]);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // تنظیم کاربر پیش‌فرض وقتی داده‌ها لود شدند
  useEffect(() => {
    if (mechanicsData && mechanicsData.length > 0 && !selectedUser) {
      setSelectedUser(mechanicsData[0]);
    }
  }, [mechanicsData, selectedUser]);

  // به‌روزرسانی خودکار تسک‌های موجود که در روزهای تعطیل یا مرخصی قرار دارند
  useEffect(() => {
    if (!mechanicsData || !mechanicLeavesMap) return;

    const updatedTasks = tasks.map((task) => {
      // بررسی اینکه آیا تسک در روز تعطیل یا مرخصی قرار دارد
      if (isDayOffForMechanic(task.user, task.startDay)) {
        // پیدا کردن اولین روز در دسترس
        const firstAvailableDay = findFirstAvailableDay(
          task.user,
          task.startDay
        );
        if (firstAvailableDay !== -1) {
          return {
            ...task,
            startDay: firstAvailableDay,
            startHour: 0, // شروع از ساعت اول
            endDay: undefined, // محاسبه مجدد endDay
            endHour: undefined, // محاسبه مجدد endHour
          };
        }
      }
      return task;
    });

    // بررسی تغییرات
    const hasChanges = updatedTasks.some((updatedTask, index) => {
      const originalTask = tasks[index];
      return (
        updatedTask.startDay !== originalTask.startDay ||
        updatedTask.startHour !== originalTask.startHour
      );
    });

    if (hasChanges) {
      setTasks(updatedTasks);
      toast.info(
        "تسک‌های قرار گرفته در روزهای تعطیل یا مرخصی به اولین روز در دسترس منتقل شدند."
      );
    }
  }, [mechanicLeavesMap, mechanicsData, tasks]);

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
  const isMechanicOnLeave = (
    mechanicName: string,
    dayIndex: number
  ): boolean => {
    const dayDate = moment(days[dayIndex]);
    const dayStart = dayDate.startOf("day").toISOString();

    const mechanicLeaves = mechanicLeavesMap[mechanicName] || [];
    return mechanicLeaves.includes(dayStart);
  };

  // تابع کمکی برای بررسی تعطیلی یا مرخصی بودن روز برای مکانیک خاص
  const isDayOffForMechanic = (
    mechanicName: string,
    dayIndex: number
  ): boolean => {
    return isHoliday(dayIndex) || isMechanicOnLeave(mechanicName, dayIndex);
  };

  // تابع کمکی برای بررسی تعطیلی بودن روز با تاریخ
  const isHolidayByDate = (date: string): boolean => {
    const dayStart = moment(date).startOf("day").toISOString();
    return holidays.includes(dayStart);
  };

  // تابع کمکی برای محاسبه ساعات باقی‌مانده در روز
  const getRemainingHoursInDay = (startHour: number) => {
    // startHour از 0 تا 8 است (نماینده ساعت 8 تا 16)
    // ساعات کاری از 8 تا 17 است (9 ساعت)
    const actualStartHour = startHour + 8; // تبدیل به ساعت واقعی
    const remainingHours = 17 - actualStartHour;
    return Math.max(0, remainingHours);
  };

  // تابع کمکی برای محاسبه روز و ساعت پایان تسک با در نظر گرفتن روزهای تعطیل و مرخصی
  const calculateTaskEnd = (
    startDay: number,
    startHour: number,
    duration: number,
    user: string
  ) => {
    let remainingHours = duration;
    let currentDay = startDay;
    let currentHour = startHour;

    // ساعات باقی‌مانده در روز اول
    const hoursInFirstDay = getRemainingHoursInDay(currentHour);
    remainingHours -= Math.min(remainingHours, hoursInFirstDay);

    if (remainingHours <= 0) {
      // تسک در همان روز تمام می‌شود
      return {
        endDay: currentDay,
        endHour: currentHour + Math.min(duration, hoursInFirstDay),
      };
    }

    // ادامه تسک در روزهای بعد
    currentDay++;
    currentHour = 0;

    while (remainingHours > 0) {
      // بررسی تعطیلی یا مرخصی بودن روز
      if (isHoliday(currentDay) || isMechanicOnLeave(user, currentDay)) {
        // اگر روز تعطیل یا مرخصی است، به روز بعد برو
        currentDay++;
        continue;
      }

      if (remainingHours <= 9) {
        // تسک در این روز تمام می‌شود
        return {
          endDay: currentDay,
          endHour: remainingHours,
        };
      } else {
        // تسک به روز بعد ادامه می‌یابد
        remainingHours -= 9;
        currentDay++;
      }
    }

    return {
      endDay: currentDay - 1,
      endHour: 9,
    };
  };

  // بررسی محدودیت 9 ساعت کاری در روز
  const checkDailyHourLimit = (
    user: string,
    day: number,
    startHour: number,
    duration: number,
    excludeTaskId?: string
  ) => {
    const { endDay, endHour } = calculateTaskEnd(
      day,
      startHour,
      duration,
      user
    );

    // بررسی تمام روزهایی که تسک در آن‌ها فعال است
    for (let currentDay = day; currentDay <= endDay; currentDay++) {
      // بررسی تعطیلی یا مرخصی بودن روز - اگر روز تعطیل یا مرخصی است، بررسی نکن
      if (isDayOffForMechanic(user, currentDay)) {
        continue; // به روز بعد برو
      }

      const existingTasksHours = getDailyWorkHours(
        user,
        currentDay,
        excludeTaskId
      );

      let newTaskHoursInDay = 0;
      if (currentDay === day && currentDay === endDay) {
        // تسک در همان روز شروع و پایان می‌یابد
        newTaskHoursInDay = duration;
      } else if (currentDay === day) {
        // روز شروع تسک
        newTaskHoursInDay = getRemainingHoursInDay(startHour);
      } else if (currentDay === endDay) {
        // روز پایان تسک
        newTaskHoursInDay = endHour;
      } else {
        // روزهای میانی - کل روز
        newTaskHoursInDay = 9;
      }

      if (existingTasksHours + newTaskHoursInDay > 9) {
        return false;
      }
    }

    return true;
  };

  // بررسی تداخل تسک‌ها
  const hasTaskOverlap = (
    user: string,
    day: number,
    startHour: number,
    duration: number,
    excludeTaskId?: string
  ) => {
    const { endDay, endHour } = calculateTaskEnd(
      day,
      startHour,
      duration,
      user
    );

    return tasks.some((task) => {
      if (task.id === excludeTaskId) return false;
      if (task.user !== user) return false;

      const taskEndDay = task.endDay || task.startDay;
      const taskEndHour = task.endHour || task.startHour + task.duration;

      // بررسی تداخل در روزها
      if (day > taskEndDay || endDay < task.startDay) return false;

      // بررسی تداخل در ساعات
      if (day === task.startDay && endDay === taskEndDay) {
        // هر دو تسک در همان روز شروع و پایان می‌یابند
        return startHour < taskEndHour && endHour > task.startHour;
      } else if (day === task.startDay) {
        // تسک جدید در روز شروع تسک موجود شروع می‌شود
        return startHour < taskEndHour;
      } else if (endDay === taskEndDay) {
        // تسک جدید در روز پایان تسک موجود پایان می‌یابد
        return endHour > task.startHour;
      } else {
        // تسک‌ها در روزهای مختلف هستند اما تداخل دارند
        return true;
      }
    });
  };

  // تابع کمکی برای نمایش ساعات کاری هر کاربر در هر روز
  const getDailyWorkHours = (
    user: string,
    day: number,
    excludeTaskId?: string
  ) => {
    // اگر روز تعطیل یا مرخصی است، ساعات کاری 0 است
    if (isDayOffForMechanic(user, day)) {
      return 0;
    }

    return tasks
      .filter((task) => {
        if (task.id === excludeTaskId) return false;
        if (task.user !== user) return false;
        const taskEndDay = task.endDay || task.startDay;
        return task.startDay <= day && taskEndDay >= day;
      })
      .reduce((total, task) => {
        const taskEndDay = task.endDay || task.startDay;
        const taskEndHour = task.endHour || task.startHour + task.duration;

        if (task.startDay === day && taskEndDay === day) {
          // تسک تک روزه
          return total + task.duration;
        } else if (task.startDay === day && taskEndDay > day) {
          // تسک چند روزه - فقط ساعات روز اول
          const hoursInFirstDay = getRemainingHoursInDay(task.startHour);
          return total + Math.min(task.duration, hoursInFirstDay);
        } else if (taskEndDay === day && task.startDay < day) {
          // تسک چند روزه - فقط ساعات روز آخر
          return total + taskEndHour;
        } else if (task.startDay < day && taskEndDay > day) {
          // تسک چند روزه - کل روز (9 ساعت)
          return total + 9;
        }
        return total;
      }, 0);
  };

  // پیدا کردن اولین روز در دسترس برای یک مکانیک
  const findFirstAvailableDay = (user: string, startFromDay: number = 0) => {
    for (let day = startFromDay; day < days.length; day++) {
      if (!isDayOffForMechanic(user, day)) {
        return day;
      }
    }
    return -1; // هیچ روز در دسترسی نیست
  };

  // پیدا کردن آخرین تسک برای قرار دادن تسک جدید در ادامه
  const getNextAvailableHour = (user: string, day: number) => {
    // بررسی تعطیلی یا مرخصی بودن روز
    if (isDayOffForMechanic(user, day)) {
      return -1; // نشان‌دهنده تعطیلی یا مرخصی
    }

    const userTasks = tasks.filter((t) => t.user === user);
    if (userTasks.length === 0) return 0;

    // بررسی تسک‌هایی که در این روز یا روزهای قبل شروع شده‌اند و هنوز ادامه دارند
    const relevantTasks = userTasks.filter((task) => {
      const taskEndDay = task.endDay || task.startDay;
      return task.startDay <= day && taskEndDay >= day;
    });

    if (relevantTasks.length === 0) return 0;

    const lastTask = relevantTasks.reduce((latest, task) => {
      let taskEndHour;
      const taskEndDay = task.endDay || task.startDay;
      const taskEndHourValue = task.endHour || task.startHour + task.duration;

      if (task.startDay === day && taskEndDay === day) {
        // تسک تک روزه
        taskEndHour = taskEndHourValue;
      } else if (task.startDay === day && taskEndDay > day) {
        // تسک چند روزه - در روز شروع
        const hoursInFirstDay = getRemainingHoursInDay(task.startHour);
        taskEndHour = Math.min(task.duration, hoursInFirstDay);
      } else if (taskEndDay === day && task.startDay < day) {
        // تسک چند روزه - در روز پایان
        taskEndHour = taskEndHourValue;
      } else if (task.startDay < day && taskEndDay > day) {
        // تسک چند روزه - در روزهای میانی
        taskEndHour = 9; // کل روز
      } else {
        taskEndHour = 0;
      }

      return taskEndHour > latest ? taskEndHour : latest;
    }, 0);

    return lastTask;
  };

  const handleTaskDrop = (
    task: Task,
    newUser: string,
    newDay: number,
    newHour: number
  ) => {
    // بررسی تعطیلی یا مرخصی بودن روز
    if (isDayOffForMechanic(newUser, newDay)) {
      const isOnLeave = isMechanicOnLeave(newUser, newDay);
      const message = isOnLeave
        ? `مکانیک ${newUser} در این روز مرخصی است!`
        : "نمی‌توان در روز تعطیل تسک ایجاد کرد!";
      toast.error(message);
      return;
    }

    // بررسی تداخل
    if (hasTaskOverlap(newUser, newDay, newHour, task.duration, task.id)) {
      toast.error("این زمان با تسک دیگری تداخل دارد!");
      return;
    }

    // بررسی محدودیت ساعات کاری
    if (
      !checkDailyHourLimit(newUser, newDay, newHour, task.duration, task.id)
    ) {
      toast.error("تجاوز از محدودیت 9 ساعت کاری در روز!");
      return;
    }

    // محاسبه روز و ساعت پایان
    const { endDay, endHour } = calculateTaskEnd(
      newDay,
      newHour,
      task.duration,
      newUser
    );

    // ایجاد تسک به‌روزرسانی شده با محاسبه دقیق endDay و endHour
    const updatedTask = {
      ...task,
      user: newUser,
      startDay: newDay,
      startHour: newHour,
      endDay: endDay > newDay ? endDay : undefined,
      endHour: endDay > newDay ? endHour : undefined,
    };

    setTasks((prev) => {
      const filtered = prev.filter((t) => t.id !== task.id);
      return [...filtered, updatedTask];
    });
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setIsDeleteDialogOpen(false);
    handleCloseModal();
    toast.success("تسک با موفقیت حذف شد");
  };

  const handleSaveTask = (updatedTask: Task) => {
    // بررسی تعطیلی یا مرخصی بودن روز
    if (isDayOffForMechanic(updatedTask.user, updatedTask.startDay)) {
      const isOnLeave = isMechanicOnLeave(
        updatedTask.user,
        updatedTask.startDay
      );
      const message = isOnLeave
        ? `مکانیک ${updatedTask.user} در این روز مرخصی است!`
        : "نمی‌توان در روز تعطیل تسک ایجاد کرد!";
      toast.error(message);
      return;
    }

    // بررسی تداخل
    if (
      hasTaskOverlap(
        updatedTask.user,
        updatedTask.startDay,
        updatedTask.startHour,
        updatedTask.duration,
        updatedTask.id
      )
    ) {
      toast.error("این زمان با تسک دیگری تداخل دارد!");
      return;
    }

    // بررسی محدودیت ساعات کاری
    if (
      !checkDailyHourLimit(
        updatedTask.user,
        updatedTask.startDay,
        updatedTask.startHour,
        updatedTask.duration,
        updatedTask.id
      )
    ) {
      toast.error("تجاوز از محدودیت 9 ساعت کاری در روز!");
      return;
    }

    // محاسبه روز و ساعت پایان
    const { endDay, endHour } = calculateTaskEnd(
      updatedTask.startDay,
      updatedTask.startHour,
      updatedTask.duration,
      updatedTask.user
    );

    // ایجاد تسک به‌روزرسانی شده با محاسبه دقیق endDay و endHour
    const taskToUpdate = {
      ...updatedTask,
      endDay: endDay > updatedTask.startDay ? endDay : undefined,
      endHour: endDay > updatedTask.startDay ? endHour : undefined,
    };

    setTasks((prev) => {
      const filtered = prev.filter((t) => t.id !== updatedTask.id);
      return [...filtered, taskToUpdate];
    });
  };

  const handleCreateTask = () => {
    // بررسی اینکه آیا روز انتخاب شده در دسترس است
    if (isDayOffForMechanic(selectedUser, selectedDay)) {
      // پیدا کردن اولین روز در دسترس
      const firstAvailableDay = findFirstAvailableDay(
        selectedUser,
        selectedDay
      );
      if (firstAvailableDay === -1) {
        toast.error("هیچ روز در دسترسی برای این مکانیک وجود ندارد!");
        return;
      }

      // تغییر به اولین روز در دسترس
      setSelectedDay(firstAvailableDay);
      const nextHour = getNextAvailableHour(selectedUser, firstAvailableDay);
      setSelectedHour(nextHour);

      const isOnLeave = isMechanicOnLeave(selectedUser, selectedDay);
      const message = isOnLeave
        ? `مکانیک ${selectedUser} در روز انتخاب شده مرخصی است. تسک به اولین روز در دسترس منتقل شد.`
        : "روز انتخاب شده تعطیل است. تسک به اولین روز در دسترس منتقل شد.";
      toast.info(message);
    } else {
      const nextHour = getNextAvailableHour(selectedUser, selectedDay);
      setSelectedHour(nextHour);
    }

    setIsCreateModalOpen(true);
  };

  const handleCreateNewTask = (newTask: Task) => {
    // بررسی تعطیلی یا مرخصی بودن روز
    if (isDayOffForMechanic(newTask.user, newTask.startDay)) {
      // پیدا کردن اولین روز در دسترس
      const firstAvailableDay = findFirstAvailableDay(
        newTask.user,
        newTask.startDay
      );
      if (firstAvailableDay === -1) {
        toast.error("هیچ روز در دسترسی برای این مکانیک وجود ندارد!");
        return;
      }

      // تغییر تسک به اولین روز در دسترس
      const updatedTask = {
        ...newTask,
        startDay: firstAvailableDay,
        startHour: 0, // شروع از ساعت اول
      };

      const isOnLeave = isMechanicOnLeave(newTask.user, newTask.startDay);
      const message = isOnLeave
        ? `مکانیک ${newTask.user} در روز انتخاب شده مرخصی است. تسک به اولین روز در دسترس منتقل شد.`
        : "روز انتخاب شده تعطیل است. تسک به اولین روز در دسترس منتقل شد.";
      toast.info(message);

      // ادامه با تسک به‌روزرسانی شده
      newTask = updatedTask;
    }

    // بررسی تداخل
    if (
      hasTaskOverlap(
        newTask.user,
        newTask.startDay,
        newTask.startHour,
        newTask.duration
      )
    ) {
      toast.error("این زمان با تسک دیگری تداخل دارد!");
      return;
    }

    // بررسی محدودیت ساعات کاری
    if (
      !checkDailyHourLimit(
        newTask.user,
        newTask.startDay,
        newTask.startHour,
        newTask.duration
      )
    ) {
      toast.error("تجاوز از محدودیت 9 ساعت کاری در روز!");
      return;
    }

    // محاسبه روز و ساعت پایان
    const { endDay, endHour } = calculateTaskEnd(
      newTask.startDay,
      newTask.startHour,
      newTask.duration,
      newTask.user
    );

    // ایجاد تسک جدید با محاسبه دقیق endDay و endHour
    const taskToAdd = {
      ...newTask,
      endDay: endDay > newTask.startDay ? endDay : undefined,
      endHour: endDay > newTask.startDay ? endHour : undefined,
    };

    setTasks((prev) => [...prev, taskToAdd]);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateTaskFromCell = (
    user: string,
    dayIndex: number,
    _hourIndex: number
  ) => {
    // بررسی تعطیلی یا مرخصی بودن روز
    if (isDayOffForMechanic(user, dayIndex)) {
      // پیدا کردن اولین روز در دسترس
      const firstAvailableDay = findFirstAvailableDay(user, dayIndex);
      if (firstAvailableDay === -1) {
        toast.error("هیچ روز در دسترسی برای این مکانیک وجود ندارد!");
        return;
      }

      // تغییر به اولین روز در دسترس
      setSelectedUser(user);
      setSelectedDay(firstAvailableDay);
      const nextHour = getNextAvailableHour(user, firstAvailableDay);
      setSelectedHour(nextHour);

      const isOnLeave = isMechanicOnLeave(user, dayIndex);
      const message = isOnLeave
        ? `مکانیک ${user} در روز انتخاب شده مرخصی است. تسک به اولین روز در دسترس منتقل شد.`
        : "روز انتخاب شده تعطیل است. تسک به اولین روز در دسترس منتقل شد.";
      toast.info(message);
    } else {
      const nextHour = getNextAvailableHour(user, dayIndex);
      setSelectedUser(user);
      setSelectedDay(dayIndex);
      setSelectedHour(nextHour);
    }

    setIsCreateModalOpen(true);
  };

  // Check if a task exists at specific day and hour
  const getTaskAtPosition = (
    user: string,
    dayIndex: number,
    hourIndex: number
  ) => {
    return tasks.find((t) => {
      if (t.user !== user) return false;
      const taskEndDay = t.endDay || t.startDay;
      // روز شروع: فقط ساعت شروع
      if (dayIndex === t.startDay) {
        return hourIndex === t.startHour;
      }
      // روز پایان: فقط ساعات 0 تا endHour
      if (dayIndex === taskEndDay && dayIndex !== t.startDay) {
        const taskEndHour = t.endHour || 0;
        return hourIndex >= 0 && hourIndex < taskEndHour;
      }
      // روزهای میانی: کل ساعات (0 تا 8)
      if (dayIndex > t.startDay && dayIndex < taskEndDay) {
        return true;
      }
      return false;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="overflow-auto">
        {/* کنترل‌های ایجاد تسک */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow flex flex-col sm:flex-row sm:items-end gap-4 border border-gray-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end flex-1">
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-600">
                کاربر
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm min-w-[100px]"
              >
                {mechanicsData?.map((user: string) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-600">
                روز
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm min-w-[120px]"
              >
                {days.map((day, index) => (
                  <option key={index} value={index}>
                    {persianDays[moment(day).day()]} -{" "}
                    {moment(day).format("jMM/jDD")}
                    {isHoliday(index) && " (تعطیل)"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleCreateTask}
            className="flex items-center gap-2 bg-gradient-to-l from-green-500 to-green-400 text-white px-5 py-2.5 rounded-lg shadow hover:from-green-600 hover:to-green-500 transition-all text-base font-bold mt-2 sm:mt-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            ایجاد تسک جدید
          </button>
        </div>

        <div className="relative">
          {/* Scrollable Body */}
          <div className="overflow-auto max-h-[70vh]">
            <table className="table-fixed w-full border-collapse border text-center">
              <thead className="sticky top-0 z-[11] bg-white shadow-sm">
                <tr>
                  <th className="bg-gray-100 w-32">کاربر</th>
                  <th className="bg-gray-100 w-20">ساعت</th>
                  {days.map((day, i) => {
                    // بررسی اینکه آیا در این روز مکانیک‌هایی مرخصی دارند
                    const mechanicsOnLeave =
                      mechanicsData?.filter((mechanic: string) =>
                        isMechanicOnLeave(mechanic, i)
                      ) || [];

                    // تعیین رنگ هدر بر اساس تعطیل یا مرخصی بودن
                    let headerClass = "bg-gray-100 text-sm w-24";
                    if (isHoliday(i)) {
                      headerClass = "bg-red-100 text-red-700 text-sm w-24";
                    } else if (mechanicsOnLeave.length > 0) {
                      headerClass =
                        "bg-orange-100 text-orange-700 text-sm w-24";
                    }

                    return (
                      <th key={i} className={headerClass}>
                        <div>
                          {persianDays[moment(day).day()]} <br />{" "}
                          {moment(day).format("jMM/jDD")}
                          {isHoliday(i) && (
                            <>
                              <br />
                              <span className="text-xs">تعطیل</span>
                            </>
                          )}
                          {mechanicsOnLeave.length > 0 && !isHoliday(i) && (
                            <>
                              <br />
                              <span className="text-xs font-semibold">
                                {mechanicsOnLeave.length} مرخصی
                              </span>
                            </>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {mechanicsData?.map((user: string) => (
                  <Fragment key={user}>
                    {workHours.map((hour) => (
                      <tr
                        key={`${user}-${hour}`}
                        className={`${
                          mechanicsData.indexOf(user) % 2 === 0
                            ? "bg-white/50"
                            : "bg-gray-100/50"
                        }`}
                      >
                        {hour === 0 && (
                          <td
                            rowSpan={9}
                            className="font-semibold border align-middle w-32"
                          >
                            <div className="text-center">
                              <div className="font-bold text-lg">{user}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                ساعات کاری
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                8:00 - 17:00
                              </div>
                              {/* نمایش تعداد روزهای مرخصی */}
                              {(() => {
                                const leaveDays = days.filter((_, dayIndex) =>
                                  isMechanicOnLeave(user, dayIndex)
                                ).length;
                                return leaveDays > 0 ? (
                                  <div className="text-xs text-orange-600 font-semibold mt-1">
                                    {leaveDays} روز مرخصی
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          </td>
                        )}
                        <td
                          className={`font-semibold text-sm border w-20 ${
                            mechanicsData.indexOf(user) % 2 === 0
                              ? "bg-white"
                              : "bg-gray-100"
                          }`}
                        >
                          {hour + 8}:00
                        </td>
                        {days.map((_, dayIdx) => {
                          const taskHere = getTaskAtPosition(
                            user,
                            dayIdx,
                            hour
                          );
                          const isMechanicLeave = isMechanicOnLeave(
                            user,
                            dayIdx
                          );
                          const isHolidayDay = isHoliday(dayIdx);

                          // تعیین رنگ پس‌زمینه سلول
                          let cellBgClass = "";
                          if (isHolidayDay) {
                            cellBgClass = "bg-red-50";
                          } else if (isMechanicLeave) {
                            cellBgClass = "bg-orange-50";
                          }

                          if (taskHere) {
                            // محاسبه طول تسک در این روز
                            let taskLength = 1;
                            if (dayIdx === taskHere.startDay) {
                              // روز شروع: از ساعت شروع تا انتهای روز یا تا پایان تسک
                              const taskEndDay =
                                taskHere.endDay || taskHere.startDay;
                              if (dayIdx === taskEndDay) {
                                // تسک در همان روز تمام می‌شود
                                taskLength = taskHere.duration;
                              } else {
                                // تسک به روز بعد ادامه می‌یابد
                                taskLength = 9 - taskHere.startHour;
                              }
                              // فقط در ساعت شروع نمایش بده
                              if (hour !== taskHere.startHour) return null;
                            } else if (
                              dayIdx === (taskHere.endDay || taskHere.startDay)
                            ) {
                              // روز پایان: فقط ساعات 0 تا endHour
                              taskLength = taskHere.endHour || 0;
                              if (hour !== 0) return null;
                            } else {
                              // روزهای میانی: کل روز
                              taskLength = 9;
                              if (hour !== 0) return null;
                            }

                            return (
                              <DropCell
                                key={dayIdx}
                                dayIndex={dayIdx}
                                hourIndex={hour}
                                user={user}
                                onDropTask={handleTaskDrop}
                                onCreateTask={handleCreateTaskFromCell}
                                holidays={holidays}
                              >
                                <div
                                  className={`w-full h-full relative ${cellBgClass}`}
                                >
                                  <DraggableTask
                                    task={taskHere}
                                    onClick={handleTaskClick}
                                    currentDay={dayIdx}
                                    currentHour={hour}
                                    taskLength={taskLength}
                                    holidays={holidays}
                                    mechanicLeavesMap={mechanicLeavesMap}
                                  />
                                </div>
                              </DropCell>
                            );
                          }

                          // سلول خالی - نمایش مرخصی مکانیک
                          return (
                            <DropCell
                              key={dayIdx}
                              dayIndex={dayIdx}
                              hourIndex={hour}
                              user={user}
                              onDropTask={handleTaskDrop}
                              onCreateTask={handleCreateTaskFromCell}
                              holidays={holidays}
                            >
                              <div className={`w-full h-full ${cellBgClass}`}>
                                {isMechanicLeave && (
                                  <div className="w-full h-full bg-orange-100 border border-orange-300 rounded flex items-center justify-center">
                                    <span className="text-xs text-orange-700 font-semibold">
                                      مرخصی
                                    </span>
                                  </div>
                                )}
                              </div>
                            </DropCell>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* اطلاعات ساعات کاری */}
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-3 text-blue-800">
            ساعات کاری هر کاربر:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mechanicsData?.map((user: string) => (
              <div key={user} className="bg-white p-3 rounded border">
                <h4 className="font-bold text-gray-800 mb-2">{user}</h4>
                <div className="space-y-1">
                  {days.map((_day, dayIndex) => {
                    const workHours = getDailyWorkHours(user, dayIndex);
                    const isOverLimit = workHours > 9;
                    const isHolidayDay = isHoliday(dayIndex);
                    const isMechanicLeaveDay = isMechanicOnLeave(
                      user,
                      dayIndex
                    );
                    const isDayOff = isDayOffForMechanic(user, dayIndex);

                    return (
                      <div
                        key={dayIndex}
                        className="flex justify-between items-center text-sm"
                      >
                        <span
                          className={`${
                            isDayOff
                              ? isMechanicLeaveDay
                                ? "text-orange-600 font-semibold"
                                : "text-red-600 font-semibold"
                              : "text-gray-600"
                          }`}
                        >
                          {persianDays[moment(days[dayIndex]).day()]} -{" "}
                          {moment(days[dayIndex]).format("jMM/jDD")}:
                          {isHolidayDay && " (تعطیل)"}
                          {isMechanicLeaveDay && " (مرخصی)"}
                        </span>
                        <span
                          className={`font-semibold ${
                            isDayOff
                              ? isMechanicLeaveDay
                                ? "text-orange-600"
                                : "text-red-600"
                              : isOverLimit
                              ? "text-red-600"
                              : workHours === 9
                              ? "text-green-600"
                              : "text-gray-800"
                          }`}
                        >
                          {isDayOff
                            ? isMechanicLeaveDay
                              ? "مرخصی"
                              : "تعطیل"
                            : `${workHours}/9 ساعت`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">راهنما:</h3>
          <ul className="text-sm space-y-1">
            <li>• هر روز 9 ساعت کاری (8:00 تا 17:00)</li>
            <li>• برای ایجاد تسک جدید از دکمه بالا استفاده کنید</li>
            <li>• برای ویرایش تسک، روی آن کلیک کنید</li>
            <li>• تسک‌ها را می‌توانید با درگ و دراپ جابجا کنید</li>
            <li>• هر تسک می‌تواند چندین ساعت طول بکشد</li>
            <li>• تسک‌ها نمی‌توانند روی هم بیفتند</li>
            <li>
              • تسک‌هایی که بیش از یک روز طول می‌کشند به صورت خودکار به روز بعد
              منتقل می‌شوند
            </li>
            <li>• تسک‌های عادی با رنگ آبی نمایش داده می‌شوند</li>
            <li>• تسک‌های چند روزه با رنگ بنفش و خط زرد نمایش داده می‌شوند</li>
            <li>
              • تسک‌های قرار گرفته در روزهای تعطیل با رنگ قرمز و عنوان "تعطیل"
              نمایش داده می‌شوند
            </li>
            <li>
              • تسک‌های قرار گرفته در روزهای مرخصی با رنگ نارنجی و عنوان "مرخصی"
              نمایش داده می‌شوند
            </li>
            <li>• ساعات کاری بیش از 9 ساعت با رنگ قرمز نمایش داده می‌شوند</li>
            <li>• روزهای تعطیل با رنگ قرمز نمایش داده می‌شوند</li>
            <li>
              • روزهای مرخصی مکانیک‌ها با رنگ نارنجی نمایش داده می‌شوند (هم در
              هدر و هم در سلول‌ها)
            </li>
            <li>• جمعه‌ها به صورت خودکار تعطیل محسوب می‌شوند</li>
            <li>
              • اگر روز انتخاب شده تعطیل یا مرخصی باشد، تسک به اولین روز در
              دسترس منتقل می‌شود
            </li>
            <li>
              • تسک‌های چند روزه نمی‌توانند از روزهای تعطیل یا مرخصی عبور کنند
            </li>
            <li>
              • تسک‌های موجود که در روزهای تعطیل یا مرخصی قرار دارند به صورت
              خودکار منتقل می‌شوند
            </li>
            <li>• مرخصی‌های مکانیک‌ها از سیستم مدیریت مرخصی دریافت می‌شود</li>
          </ul>
        </div>

        {/* Task Edit Modal */}
        <TaskEditModal
          task={editingTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          onDelete={() => setIsDeleteDialogOpen(true)}
          holidays={holidays}
        />

        {/* Create Task Modal */}
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onCreate={handleCreateNewTask}
          selectedUser={selectedUser}
          selectedDay={selectedDay}
          selectedHour={selectedHour}
          holidays={holidays}
        />
        <ConfirmDeleteDialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => handleDeleteTask(editingTask?.id || "")}
          title="حذف تسک"
          content={`آیا از حذف تسک ${editingTask?.title} اطمینان دارید؟`}
        />
      </div>
    </DndProvider>
  );
}
