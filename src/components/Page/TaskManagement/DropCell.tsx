import { useDrop } from "react-dnd";

export default function DropCell({
  dayIndex,
  hourIndex,
  user,
  onDropTask,
  children,
  onCreateTask,
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
}) {
  const [, drop] = useDrop({
    accept: "TASK",
    drop: (item: { task: Task }) => {
      onDropTask(item.task, user, dayIndex, hourIndex);
    },
  });

  return (
    <td
      ref={drop}
      className="border h-[30px] relative cursor-pointer w-24 group hover:bg-gray-50 overflow-visible"
      onDoubleClick={() => onCreateTask(user, dayIndex, hourIndex)}
    >
      {children}
    </td>
  );
}
