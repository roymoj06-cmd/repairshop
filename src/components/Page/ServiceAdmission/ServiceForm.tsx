import { Paper } from "@mui/material";

import { EnhancedSelect, EnhancedInput } from "@/components";
import { formatTimeDisplay, ServiceFormData } from "@/utils";

interface ServiceFormProps {
  problems: SelectOption[];
  repairServices: SelectOption[];
  mechanics: SelectOption[];
  selectedProblem: SelectOption | null;
  currentServices: ServiceFormData[];
  onProblemChange: (value: SelectOption | null) => void;
  onServiceChange: (index: number, field: string, value: any) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  problems,
  repairServices,
  mechanics,
  selectedProblem,
  currentServices,
  onProblemChange,
  onServiceChange,
}) => {
  return (
    <>
      <div style={{ margin: "1rem 0" }}>
        <EnhancedSelect
          onChange={onProblemChange}
          placeholder="مشکل مورد نظر را انتخاب کنید"
          value={selectedProblem}
          label="انتخاب مشکل"
          options={problems}
          name="problemId"
          searchable
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        {currentServices?.map(
          (service, index) =>
            !service.isDeleted && (
              <Paper
                key={index}
                className={`service-item service-item--${
                  index % 2 === 0 ? "even" : "odd"
                } service-item--border-${
                  index % 4 === 0
                    ? "blue"
                    : index % 4 === 1
                    ? "green"
                    : index % 4 === 2
                    ? "orange"
                    : "red"
                }`}
              >
                <div className="service-item__content">
                  <div className="service-item__grid service-item__grid--two-cols">
                    <EnhancedSelect
                      name={`serviceId_${index}`}
                      label="انتخاب سرویس"
                      options={repairServices}
                      value={service.serviceId}
                      onChange={(value) => {
                        onServiceChange(index, "serviceId", value);
                      }}
                      placeholder="سرویس را انتخاب کنید"
                      searchable
                    />

                    <EnhancedSelect
                      name={`mechanicId_${index}`}
                      label="انتخاب مکانیک"
                      options={mechanics}
                      value={service.mechanicId}
                      onChange={(value) =>
                        onServiceChange(index, "mechanicId", value)
                      }
                      placeholder="مکانیک را انتخاب کنید"
                      searchable
                    />
                  </div>

                  <div className="service-item__grid service-item__grid--four-cols">
                    <EnhancedInput
                      value={service.servicePrice?.toString() || ""}
                      name={`servicePrice_${index}`}
                      label="قیمت"
                      type="number"
                      formatNumber={true}
                      onChange={(e) =>
                        onServiceChange(
                          index,
                          "servicePrice",
                          Number(e.target.value)
                        )
                      }
                      placeholder={
                        service.serviceId
                          ? "ویرایش قیمت"
                          : "ابتدا سرویس را انتخاب کنید"
                      }
                      disabled={!service.serviceId}
                    />
                    <EnhancedInput
                      value={service.estimatedMinute?.toString() || ""}
                      name={`estimatedMinute_${index}`}
                      label="تخمین زمان (دقیقه)"
                      type="number"
                      formatNumber={true}
                      onChange={(e) =>
                        onServiceChange(
                          index,
                          "estimatedMinute",
                          Number(e.target.value)
                        )
                      }
                      placeholder={
                        service.serviceId
                          ? "زمان به دقیقه"
                          : "ابتدا سرویس را انتخاب کنید"
                      }
                      disabled={!service.serviceId}
                    />

                    <EnhancedInput
                      value={service.serviceCount.toString()}
                      name={`serviceCount_${index}`}
                      label="تعداد"
                      type="number"
                      onChange={(e) =>
                        onServiceChange(
                          index,
                          "serviceCount",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ min: 1 }}
                    />

                    <EnhancedInput
                      value={service.totalPrice?.toString() || "0"}
                      name={`totalPrice_${index}`}
                      formatNumber={true}
                      label="قیمت کل"
                      disabled={true}
                      type="number"
                    />
                  </div>

                  {/* Time Display Helper */}
                  {service.estimatedMinute && service.estimatedMinute > 0 && (
                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md">
                      <span className="font-medium">نمایش زمان:</span>{" "}
                      {formatTimeDisplay(service.estimatedMinute)}
                    </div>
                  )}
                </div>
              </Paper>
            )
        )}
      </div>
    </>
  );
};

export default ServiceForm;
