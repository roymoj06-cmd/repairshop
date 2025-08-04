import { Edit, Delete } from "@mui/icons-material";
import { IconButton, Chip } from "@mui/material";

import { useAccessControl, ACCESS_IDS } from "@/utils/accessControl";
import {
  formatTimeDisplay,
  getStatusColor,
  formatDateTime,
  getStatusText,
  addCommas,
} from "@/utils";

interface ServiceCardProps {
  onUpdateStatus: (serviceId: number, newStatus: number) => void;
  onDelete: (id: number, serviceName: string) => void;
  onEdit: (service: Service) => void;
  isUpdatingStatus?: boolean;
  serviceIndex: number;
  readOnly?: boolean;
  isTested?: boolean;
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  isUpdatingStatus = false,
  readOnly = false,
  onUpdateStatus,
  serviceIndex,
  isTested,
  onDelete,
  service,
  onEdit,
}) => {
  const { hasAccess } = useAccessControl();

  const getStatusButtonInfo = (statusId: number) => {
    switch (statusId) {
      case 0:
        return {
          text: "شروع به انجام سرویس",
          nextStatus: 1,
          color: "bg-indigo-500 hover:bg-indigo-600",
          textColor: "text-white",
        };
      case 1:
        return {
          text: "اتمام سرویس",
          nextStatus: 3,
          color: "bg-teal-500 hover:bg-teal-600",
          textColor: "text-white",
        };
      case 3:
        return {
          text: isTested === false ? "تست رد شد" : "آماده تست",
          nextStatus: 4,
          color:
            isTested === false
              ? "bg-red-500 hover:bg-red-600"
              : "bg-emerald-500 hover:bg-emerald-600",
          textColor: "text-white",
        };
      default:
        return null;
    }
  };

  const statusButtonInfo = getStatusButtonInfo(service.statusId);

  const handleStatusUpdate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (statusButtonInfo) {
      onUpdateStatus(service.id, statusButtonInfo.nextStatus);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {serviceIndex + 1}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                {service.serviceTitle}
              </h3>
              <div className="mt-1">
                <Chip
                  label={getStatusText(service.statusId)}
                  color={getStatusColor(service.statusId)}
                  size="small"
                  className="!text-xs !h-5"
                />
              </div>
            </div>
          </div>
          {!readOnly && !isTested && (
            <div className="flex items-center gap-1">
              {hasAccess(ACCESS_IDS.EDIT_REPAIR) && (
                <IconButton
                  onClick={() => onEdit(service)}
                  className="!p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="ویرایش"
                  size="small"
                >
                  <Edit
                    className="text-blue-500 dark:text-blue-400"
                    style={{ fontSize: 16 }}
                  />
                </IconButton>
              )}
              {hasAccess(ACCESS_IDS.DELETE_REPAIR) && (
                <IconButton
                  onClick={() => onDelete(service.id, service.serviceTitle)}
                  className="!p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="حذف"
                  size="small"
                >
                  <Delete
                    className="text-red-500 dark:text-red-400"
                    style={{ fontSize: 16 }}
                  />
                </IconButton>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
              مکانیک
            </div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
              {service.performedByMechanicName}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
            <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
              ایجاد کننده
            </div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
              {service.createdByUserName}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {!readOnly && (
            <div className="flex items-center justify-between py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                قیمت واحد:
              </span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {addCommas(service.servicePrice)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              تعداد:
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {service.serviceCount}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
              تاریخ شروع
            </div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {formatDateTime(service.startDate)}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
              تاریخ پایان
            </div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {formatDateTime(service.endDate)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            زمان تخمینی:
          </span>
          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
            {formatTimeDisplay(service.estimatedMinute)}
          </span>
        </div>
        {!readOnly && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3 border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                قیمت کل سرویس:
              </span>
              <span className="text-base font-bold text-green-600 dark:text-green-400">
                {addCommas(service.totalPrice)} ریال
              </span>
            </div>
          </div>
        )}

        {!readOnly &&
          statusButtonInfo &&
          hasAccess(ACCESS_IDS.CHANGE_STATUS_REPAIR) &&
          !isTested && (
            <button
              onClick={handleStatusUpdate}
              disabled={service.statusId === 3}
              className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                isUpdatingStatus
                  ? "bg-gray-400 cursor-not-allowed"
                  : statusButtonInfo?.color
              } ${
                statusButtonInfo?.textColor
              } shadow-sm hover:shadow-md disabled:hover:shadow-sm`}
            >
              {isUpdatingStatus
                ? "در حال بروزرسانی..."
                : statusButtonInfo?.text}
            </button>
          )}
      </div>
    </div>
  );
};

export default ServiceCard;
