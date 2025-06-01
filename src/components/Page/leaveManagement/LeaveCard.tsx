import { Delete, Edit } from "@mui/icons-material";
import { IconButton, Paper } from "@mui/material";
import { FC } from "react";

interface LeaveCardProps {
  onEdit: (leave: IGetAllMechanicLeaves) => void;
  onDelete: (id: string) => void;
  leave: IGetAllMechanicLeaves;
}

const LeaveCard: FC<LeaveCardProps> = ({ leave, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "نامشخص";
    
    try {
      // Handle both ISO date strings and regular date strings
      const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString);
      return date.toLocaleDateString("fa-IR");
    } catch (error) {
      return "نامشخص";
    }
  };

  return (
    <Paper className="bg-gray-50 dark:bg-[#222e3c] border border-gray-200 dark:border-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {leave.mechanicFullName}
          </h3>
          <div className="flex items-center gap-2">
            <IconButton
              onClick={() => onEdit(leave)}
              className="!p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="ویرایش"
            >
              <Edit className="text-blue-500 dark:text-blue-400" style={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              onClick={() => onDelete(leave.id.toString())}
              className="!p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="حذف"
            >
              <Delete className="text-red-500 dark:text-red-400" style={{ fontSize: 18 }} />
            </IconButton>
          </div>
        </div>
        <hr className="border-gray-300 dark:border-gray-600 mb-2" />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">تاریخ مرخصی :</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {formatDate(leave.date)}
            </span>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">توضیحات :</span>
            <span className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
              {leave.description || "بدون توضیحات"}
            </span>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default LeaveCard; 