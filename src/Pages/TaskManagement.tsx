import {
  CreateTaskModal,
  DraggableTask,
  DropCell,
  TaskEditModal,
} from "@/components";
import { days, users, workHours } from "@/utils/statics";
import moment from "moment-jalaali";
import { Fragment, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "react-toastify";

// Configure moment-jalaali
moment.loadPersian({ dialect: "persian-modern" });

// Persian day names
const persianDays = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];

export default function TaskManagement() {
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
  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState(0);

  // تابع کمکی برای محاسبه ساعات باقی‌مانده در روز
  const getRemainingHoursInDay = (startHour: number) => {
    // startHour از 0 تا 8 است (نماینده ساعت 8 تا 16)
    // ساعات کاری از 8 تا 17 است (9 ساعت)
    const actualStartHour = startHour + 8; // تبدیل به ساعت واقعی
    const remainingHours = 17 - actualStartHour;
    return Math.max(0, remainingHours);
  };

  // تابع کمکی برای محاسبه روز و ساعت پایان تسک با در نظر گرفتن
  const calculateTaskEnd = (
    startDay: number,
    startHour: number,
    duration: number,
    _user: string
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

  // پیدا کردن آخرین تسک برای قرار دادن تسک جدید در ادامه
  const getNextAvailableHour = (user: string, day: number) => {
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

  const handleSaveTask = (updatedTask: Task) => {
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
    const nextHour = getNextAvailableHour(selectedUser, selectedDay);
    setSelectedHour(nextHour);
    setIsCreateModalOpen(true);
  };

  const handleCreateNewTask = (newTask: Task) => {
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
    const nextHour = getNextAvailableHour(user, dayIndex);
    setSelectedUser(user);
    setSelectedDay(dayIndex);
    setSelectedHour(nextHour);
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
                {users.map((user) => (
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
                  {days.map((day, i) => (
                    <th key={i} className="bg-gray-100 text-sm w-24 ">
                      {persianDays[moment(day).day()]} <br />{" "}
                      {moment(day).format("jMM/jDD")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <Fragment key={user}>
                    {workHours.map((hour) => (
                      <tr
                        key={`${user}-${hour}`}
                        className={`${
                          users.indexOf(user) % 2 === 0
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
                            </div>
                          </td>
                        )}
                        <td
                          className={`font-semibold text-sm border w-20 ${
                            users.indexOf(user) % 2 === 0
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
                              >
                                <DraggableTask
                                  task={taskHere}
                                  onClick={handleTaskClick}
                                  currentDay={dayIdx}
                                  currentHour={hour}
                                  taskLength={taskLength}
                                />
                              </DropCell>
                            );
                          }

                          // سلول خالی
                          return (
                            <DropCell
                              key={dayIdx}
                              dayIndex={dayIdx}
                              hourIndex={hour}
                              user={user}
                              onDropTask={handleTaskDrop}
                              onCreateTask={handleCreateTaskFromCell}
                            />
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
            {users.map((user) => (
              <div key={user} className="bg-white p-3 rounded border">
                <h4 className="font-bold text-gray-800 mb-2">{user}</h4>
                <div className="space-y-1">
                  {days.map((_day, dayIndex) => {
                    const workHours = getDailyWorkHours(user, dayIndex);
                    const isOverLimit = workHours > 9;
                    return (
                      <div
                        key={dayIndex}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600">
                          {persianDays[moment(days[dayIndex]).day()]} -{" "}
                          {moment(days[dayIndex]).format("jMM/jDD")}:
                        </span>
                        <span
                          className={`font-semibold ${
                            isOverLimit
                              ? "text-red-600"
                              : workHours === 9
                              ? "text-green-600"
                              : "text-gray-800"
                          }`}
                        >
                          {`${workHours}/9 ساعت`}
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
            <li>• ساعات کاری بیش از 9 ساعت با رنگ قرمز نمایش داده می‌شوند</li>
          </ul>
        </div>

        {/* Task Edit Modal */}
        <TaskEditModal
          task={editingTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
        />

        {/* Create Task Modal */}
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onCreate={handleCreateNewTask}
          selectedUser={selectedUser}
          selectedDay={selectedDay}
          selectedHour={selectedHour}
        />
      </div>
    </DndProvider>
  );
}
