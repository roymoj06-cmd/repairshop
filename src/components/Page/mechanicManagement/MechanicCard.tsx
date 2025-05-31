import { Delete, Edit } from "@mui/icons-material";
import { IconButton, Paper } from "@mui/material";
import { FC } from "react";

interface MechanicCardProps {
  onEdit: (mechanic: IGetAllMechanics) => void;
  onDelete: (id: string) => void;
  mechanic: IGetAllMechanics;
}

const MechanicCard: FC<MechanicCardProps> = ({ mechanic, onEdit, onDelete }) => {
  const getExpertLevelText = (level: number) => {
    switch (level) {
      case 1:
        return "مبتدی";
      case 2:
        return "متخصص";
      default:
        return "نامشخص";
    }
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "فعال" : "غیرفعال";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "نامشخص";
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  return (
    <Paper className="bg-gray-50 dark:bg-[#222e3c] border border-gray-200 dark:border-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {mechanic.fullName}
          </h3>
          <div className="flex items-center gap-2">
            <IconButton
              onClick={() => onEdit(mechanic)}
              className="!p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="ویرایش"
            >
              <Edit className="text-blue-500 dark:text-blue-400" style={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              onClick={() => onDelete(mechanic.id.toString())}
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
            <span className="text-sm text-gray-600 dark:text-gray-400">نام کاربری :</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {mechanic.userName}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">سطح تخصص :</span>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              mechanic.expertLevel === 2 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {getExpertLevelText(mechanic.expertLevel)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">وضعیت :</span>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              mechanic.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {getStatusText(mechanic.isActive)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">تاریخ ایجاد :</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">
              {formatDate(mechanic.createDm)}
            </span>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default MechanicCard; 