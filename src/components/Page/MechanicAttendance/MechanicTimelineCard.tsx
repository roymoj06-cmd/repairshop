import moment from "moment-jalaali";
import { FC } from "react";
import {
  CalendarToday,
  Person,
  Timeline,
  AccessTime,
  Edit,
  Delete,
  Login,
  Logout,
  Schedule,
} from "@mui/icons-material";
import {
  CardContent,
  IconButton,
  Typography,
  Tooltip,
  Card,
  Box,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";

interface TimelineEntry {
  id: number;
  type: number;
  typeText: string;
  dateTime: string;
  description: string;
}

interface MechanicTimelineCardProps {
  mechanicId: number;
  mechanicName: string;
  date: string;
  entries: TimelineEntry[];
  onEdit?: (attendance: IGetMechanicAttendanceById) => void;
  onDelete?: (id: number, mechanicName: string) => void;
}

const MechanicTimelineCard: FC<MechanicTimelineCardProps> = ({
  mechanicId,
  mechanicName,
  date,
  entries,
  onEdit,
  onDelete,
}) => {
  const getTypeConfig = (type: number | string) => {
    switch (type) {
      case "entry":
        return {
          color: "success" as const,
          icon: <Login className="w-4 h-4" />,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          dotColor: "bg-green-500",
        };
      case "exit":
        return {
          color: "error" as const,
          icon: <Logout className="w-4 h-4" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700",
          dotColor: "bg-red-500",
        };
      default:
        return {
          color: "default" as const,
          icon: <AccessTime className="w-4 h-4" />,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-700",
          dotColor: "bg-gray-500",
        };
    }
  };

  const handleEdit = (entry: TimelineEntry) => {
    if (onEdit) {
      const editData: IGetMechanicAttendanceById = {
        id: entry.id,
        mechanicId: mechanicId,
        mechanicName: mechanicName,
        dateTime: entry.dateTime,
        type: entry.type,
        typeText: entry.typeText,
        description: entry.description,
        shamsiDateTime: moment(entry.dateTime).format("jYYYY/jMM/jDD"),
        mechanicExpertLevel: 0,
        mechanicUserName: "",
        createDm: "",
      };
      onEdit(editData);
    }
  };

  const handleDelete = (entryId: number) => {
    if (onDelete) {
      onDelete(entryId, mechanicName);
    }
  };

  const calculateWorkingHours = () => {
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

    let totalMinutes = 0;
    let lastEntry: TimelineEntry | null = null;

    sortedEntries.forEach((entry) => {
      if (entry.type === 1 && lastEntry?.type === 2) {
        // ورود بعد از خروج - شروع محاسبه جدید
        lastEntry = entry;
      } else if (entry.type === 2 && lastEntry?.type === 1) {
        // خروج بعد از ورود - محاسبه زمان کار
        const entryTime = new Date(lastEntry.dateTime).getTime();
        const exitTime = new Date(entry.dateTime).getTime();
        totalMinutes += (exitTime - entryTime) / (1000 * 60);
        lastEntry = entry;
      } else {
        lastEntry = entry;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return { hours, minutes, totalMinutes };
  };

  const workingTime = calculateWorkingHours();

  return (
    <Card className="mechanic-timeline-card h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardContent className="p-5">
        {/* Header */}
        <Box className="flex justify-between items-start mb-4">
          <Box className="flex items-center gap-3">
            <Avatar className={`
              w-12 h-12 
              bg-gradient-to-r from-blue-500 to-purple-600
              text-white shadow-lg
            `}>
              <Person className="w-6 h-6" />
            </Avatar>
            <Box>
              <Typography variant="h6" className="font-bold text-gray-800 mb-1">
                {mechanicName}
              </Typography>
              <Typography variant="caption" className="text-gray-500 flex items-center gap-1">
                <Schedule className="w-3 h-3" />
                شماره: {mechanicId}
              </Typography>
            </Box>
          </Box>

          <Box className="text-center">
            <Typography variant="caption" className="text-gray-500 block">
              مجموع کارکرد
            </Typography>
            <Typography variant="body2" className="font-bold text-blue-600">
              {workingTime.hours}:{workingTime.minutes.toString().padStart(2, '0')}
            </Typography>
          </Box>
        </Box>

        {/* Date */}
        <Box className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
          <CalendarToday className="text-gray-600 w-4 h-4" />
          <Typography variant="body2" className="font-medium">
            {moment(date).format("jYYYY/jMM/jDD")}
          </Typography>
        </Box>

        {/* Timeline */}
        <Box className="timeline-container">
          <Typography variant="subtitle2" className="text-gray-700 mb-3 flex items-center gap-2">
            <Timeline className="w-4 h-4" />
            Timeline حضور و غیاب
          </Typography>

          <Box className="relative">
            {/* Timeline Line */}
            <Box className="absolute right-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            {entries
              .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
              .map((entry) => {
                const typeConfig = getTypeConfig(entry.type);
                return (
                  <Box key={entry.id} className="relative flex items-start gap-4 pb-4">
                    {/* Timeline Dot */}
                    <Box className={`
                      relative z-10 w-3 h-3 rounded-full 
                      ${typeConfig.dotColor} 
                      flex-shrink-0 mt-2
                      ring-4 ring-white shadow-md
                    `} />

                    {/* Content */}
                    <Box className="flex-1 min-w-0">
                      <Box className="flex justify-between items-start">
                        <Box className="flex-1">
                          <Box className="flex items-center gap-2 mb-1">
                            <Chip
                              icon={typeConfig.icon}
                              label={entry.typeText}
                              color={typeConfig.color}
                              size="small"
                              variant="outlined"
                            />
                            <Typography variant="body2" className="font-medium text-gray-800">
                              {moment(entry.dateTime).format("HH:mm")}
                            </Typography>
                          </Box>

                          {entry.description && (
                            <Typography variant="caption" className="text-gray-600 block mt-1">
                              {entry.description}
                            </Typography>
                          )}
                        </Box>

                        {/* Actions */}
                        <Box className="flex gap-1 ml-2">
                          {onEdit && (
                            <Tooltip title="ویرایش">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(entry)}
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="w-3 h-3" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {onDelete && (
                            <Tooltip title="حذف">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(entry.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Delete className="w-3 h-3" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
          </Box>
        </Box>

        {/* Summary */}
        {entries.length > 1 && (
          <>
            <Divider className="my-3" />
            <Box className="flex justify-between items-center text-sm">
              <Typography variant="caption" className="text-gray-500">
                تعداد ورودها/خروج‌ها: {entries.length}
              </Typography>
              <Typography variant="caption" className={`
                font-medium
                ${workingTime.totalMinutes > 540 ? 'text-green-600' : 'text-orange-600'}
              `}>
                {workingTime.totalMinutes > 540 ? '✓ کارکرد کامل' : '⚠ کارکرد ناقص'}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MechanicTimelineCard;