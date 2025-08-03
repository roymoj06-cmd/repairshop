import moment from "moment-jalaali";
import { FC } from "react";
import {
  CalendarToday,
  WorkHistory,
  Description,
  AccessTime,
  Delete,
  Person,
  Logout,
  Login,
  Edit,
} from "@mui/icons-material";
import {
  CardContent,
  IconButton,
  Typography,
  Tooltip,
  Avatar,
  Chip,
  Card,
  Box,
} from "@mui/material";

interface AttendanceCardProps {
  onEdit?: (attendance: IGetMechanicAttendanceById) => void;
  onDelete?: (id: number, mechanicName: string) => void;
  attendance: IGetMechanicAttendanceByMechanicId;
}

const AttendanceCard: FC<AttendanceCardProps> = ({
  attendance,
  onDelete,
  onEdit,
}) => {
  const getTypeConfig = (type: any) => {
    switch (type) {
      case "entry":
        return {
          color: "success" as const,
          icon: <Login className="w-4 h-4" />,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          gradient: "from-green-400 to-green-600",
        };
      case "exit":
        return {
          color: "error" as const,
          icon: <Logout className="w-4 h-4" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          gradient: "from-red-400 to-red-600",
        };
      default:
        return {
          color: "default" as const,
          icon: <AccessTime className="w-4 h-4" />,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          gradient: "from-gray-400 to-gray-600",
        };
    }
  };

  const typeConfig = getTypeConfig(attendance.type);

  const handleEdit = () => {
    if (onEdit) {
      const editData: IGetMechanicAttendanceById = {
        shamsiDateTime: attendance.shamsiDateTime,
        mechanicName: attendance.mechanicName,
        description: attendance.description,
        mechanicId: attendance.mechanicId,
        dateTime: attendance.dateTime,
        typeText: attendance.typeText,
        mechanicExpertLevel: 0,
        type: attendance.type,
        mechanicUserName: "",
        id: attendance.id,
        createDm: "",
      };
      onEdit(editData);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(attendance.id, attendance.mechanicName);
    }
  };

  return (
    <Card
      className={`
      attendance-card
      h-full 
      hover:shadow-xl 
      transition-all 
      duration-300 
      transform 
      hover:-translate-y-1 
      border-l-4 
      ${typeConfig.borderColor}
      bg-gradient-to-br 
      from-white 
      to-gray-50
      hover:from-white 
      hover:to-${typeConfig.bgColor.replace("bg-", "")}-50
    `}
    >
      <CardContent className="p-5">
        {/* Header with Status Badge */}
        <Box className="relative mb-4">
          {/* Status Badge */}
          <Box
            className={`
            attendance-card__status-badge
            absolute 
            -top-2 
            -right-2 
            w-3 
            h-3 
            rounded-full 
            bg-gradient-to-r 
            ${typeConfig.gradient}
          `}
          />

          <Box className="flex justify-between items-start">
            <Box className="flex items-center gap-3">
              <Avatar
                className={`
                attendance-card__avatar
                w-10 
                h-10 
                bg-gradient-to-r 
                ${typeConfig.gradient} 
                text-white
                shadow-lg
              `}
              >
                <Person className="w-5 h-5" />
              </Avatar>
              <Box>
                <Typography variant="h6" className="attendance-card__name mb-1">
                  {attendance.mechanicName}
                </Typography>
                <Typography
                  variant="caption"
                  className="attendance-card__id flex items-center gap-1"
                >
                  <WorkHistory className="w-3 h-3" />
                  شماره: {attendance.mechanicId}
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={typeConfig.icon}
              label={attendance.typeText}
              color={typeConfig.color}
              size="small"
              className="shadow-sm font-medium"
              sx={{
                fontWeight: "bold",
                "& .MuiChip-label": {
                  fontSize: "0.75rem",
                },
              }}
            />
          </Box>
        </Box>

        {/* Date and Time Section */}
        <Box
          className={`
          attendance-card__info-section
          ${attendance.type === 1 ? "entry" : "exit"}
          rounded-lg 
          p-3 
          mb-4
        `}
        >
          <Box className="attendance-card__datetime-grid grid grid-cols-2 gap-3">
            <Box className="flex items-center gap-2">
              <CalendarToday className="text-gray-600 w-4 h-4" />
              <Box>
                <Typography variant="caption" className="text-gray-500 block">
                  تاریخ
                </Typography>
                <Typography
                  variant="body2"
                  className="font-medium text-gray-800"
                >
                  {moment(attendance.dateTime).format("jYYYY/jMM/jDD")}
                </Typography>
              </Box>
            </Box>

            <Box className="flex items-center gap-2">
              <AccessTime className="text-gray-600 w-4 h-4" />
              <Box>
                <Typography variant="caption" className="text-gray-500 block">
                  زمان
                </Typography>
                <Typography
                  variant="body2"
                  className="font-medium text-gray-800"
                >
                  {moment(attendance.dateTime).format("HH:mm")}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Description */}
        {attendance.description && (
          <Box className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <Box className="flex items-start gap-2">
              <Description className="text-gray-500 w-4 h-4 mt-1 flex-shrink-0" />
              <Box>
                <Typography
                  variant="caption"
                  className="text-gray-500 block mb-1"
                >
                  توضیحات
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-700 leading-relaxed"
                >
                  {attendance.description}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Actions */}
        {(onEdit || onDelete) && (
          <Box className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            {onEdit && (
              <Tooltip title="ویرایش حضور/غیاب" arrow>
                <IconButton
                  size="small"
                  onClick={handleEdit}
                  className="
                    attendance-card__action-button
                    text-blue-600 
                    hover:bg-blue-50 
                    border 
                    border-blue-200 
                    hover:border-blue-300
                  "
                >
                  <Edit className="w-4 h-4" />
                </IconButton>
              </Tooltip>
            )}

            {onDelete && (
              <Tooltip title="حذف حضور/غیاب" arrow>
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  className="
                    attendance-card__action-button
                    text-red-600 
                    hover:bg-red-50 
                    border 
                    border-red-200 
                    hover:border-red-300
                  "
                >
                  <Delete className="w-4 h-4" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceCard;
