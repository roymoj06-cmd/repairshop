import { Delete, Edit } from "@mui/icons-material";
import { IconButton, Paper } from "@mui/material";
import { FC } from "react";

import { addCommas, formatDuration } from "@/utils";

interface ServiceCardProps {
  onEdit: (service: IGetAllRepairServices) => void;
  onDelete: (id: string) => void;
  service: IGetAllRepairServices;
}

const ServiceCard: FC<ServiceCardProps> = ({ service, onEdit, onDelete }) => {
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

  return (
    <Paper className="bg-gray-50 dark:bg-[#222e3c] border border-gray-200 dark:border-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {service.serviceTitle}
          </h3>
          <div className="flex items-center gap-2">
            <IconButton
              onClick={() => onEdit(service)}
              className="!p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="ویرایش"
            >
              <Edit
                className="text-blue-500 dark:text-blue-400"
                style={{ fontSize: 18 }}
              />
            </IconButton>
            <IconButton
              onClick={() => onDelete(service.id.toString())}
              className="!p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="حذف"
            >
              <Delete
                className="text-red-500 dark:text-red-400"
                style={{ fontSize: 18 }}
              />
            </IconButton>
          </div>
        </div>
        <hr className="border-gray-300 dark:border-gray-600 mb-2" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              قیمت :
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {addCommas(service.price)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              کمیسیون :
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              %{service.commissionPercent}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              تخمین زمانی :
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {formatDuration(service.estimatedMinute)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              سطح تخصص مورد نیاز :
            </span>
            <span
              className={`text-sm font-medium px-2 py-1 rounded-full ${
                service.expertLevel === 2
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              }`}
            >
              {getExpertLevelText(service.expertLevel)}
            </span>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default ServiceCard;
