import { users, workHours, days } from "@/utils/statics";
import { useEffect, useState } from "react";

// مودال ایجاد تسک جدید
export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
  selectedUser,
  selectedDay,
  selectedHour,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Task) => void;
  selectedUser: string;
  selectedDay: number;
  selectedHour: number;
}) {
  const [formData, setFormData] = useState<Task>({
    id: "",
    user: selectedUser,
    startDay: selectedDay,
    startHour: selectedHour,
    duration: 1,
    title: "",
  });

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
            >
              {users.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
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
              {days.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
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
