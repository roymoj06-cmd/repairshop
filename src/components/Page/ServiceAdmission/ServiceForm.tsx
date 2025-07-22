import TimePicker from "react-multi-date-picker/plugins/time_picker";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian_fa from "react-date-object/locales/persian_fa";
import persian from "react-date-object/calendars/persian";
import { Paper } from "@mui/material";

import { EnhancedSelect, EnhancedInput } from "@/components";
import { formatTimeDisplay, ServiceFormData } from "@/utils";

interface ServiceFormProps {
  onServiceChange: (index: number, field: string, value: any) => void;
  onProblemChange: (value: SelectOption | null) => void;
  selectedProblem: SelectOption | null;
  currentServices: ServiceFormData[];
  repairServices: SelectOption[];
  mechanics: SelectOption[];
  problems: SelectOption[];
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  selectedProblem,
  currentServices,
  onProblemChange,
  onServiceChange,
  repairServices,
  mechanics,
  problems,
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
                className={`service-item service-item--${index % 2 === 0 ? "even" : "odd"
                  } service-item--border-${index % 4 === 0
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
                      formatNumber={true}
                      label="قیمت"
                      type="number"
                      isRtl={true}
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
                      required={true}
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
                      inputProps={{ 
                        min: 1,
                        step: 1
                      }}
                      error={service.serviceId && (!service.estimatedMinute || service.estimatedMinute <= 0)}
                      // helperText={
                      //   service.serviceId && (!service.estimatedMinute || service.estimatedMinute <= 0)
                      //     ? "تخمین زمان باید بیشتر از صفر باشد"
                      //     : ""
                      // }
                    />

                    <EnhancedInput
                      value={service.serviceCount.toString()}
                      name={`serviceCount_${index}`}
                      label="تعداد"
                      type="number"
                      required={true}
                      error={service.serviceId && (!service.serviceCount || service.serviceCount <= 0)}
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

                  {/* Date/Time Section */}
                  <div className="service-item__grid service-item__grid--two-cols mt-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        تاریخ و ساعت شروع
                      </label>
                      <DatePicker
                        className="custom-datepicker"
                        containerClassName="w-full custom-datepicker-container"
                        value={
                          service.startDate
                            ? new DateObject({
                              calendar: persian,
                              date: new Date(service.startDate),
                            })
                            : null
                        }
                        onChange={(date: DateObject) => {
                          onServiceChange(
                            index,
                            "startDate",
                            date ? date.toDate().toISOString() : ""
                          );
                        }}
                        plugins={[<TimePicker position="bottom" />]}
                        placeholder="انتخاب تاریخ و ساعت شروع"
                        calendarPosition="bottom"
                        onOpenPickNewDate={false}
                        format="YYYY/MM/DD HH:mm"
                        locale={persian_fa}
                        calendar={persian}
                        portal={true}
                        zIndex={2001}
                        style={{
                          width: "100%",
                          height: "56px",
                        }}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        تاریخ و ساعت پایان
                      </label>
                      <DatePicker
                        className="custom-datepicker"
                        containerClassName="w-full custom-datepicker-container"
                        value={
                          service.endDate
                            ? new DateObject({
                              calendar: persian,
                              date: new Date(service.endDate),
                            })
                            : null
                        }
                        onChange={(date: DateObject) => {
                          onServiceChange(
                            index,
                            "endDate",
                            date ? date.toDate().toISOString() : ""
                          );
                        }}
                        placeholder="انتخاب تاریخ و ساعت پایان"
                        calendarPosition="bottom-left"
                        onOpenPickNewDate={false}
                        locale={persian_fa}
                        calendar={persian}
                        format="YYYY/MM/DD HH:mm"
                        plugins={[<TimePicker position="bottom" />]}
                        portal={true}
                        zIndex={2001}
                        style={{
                          width: "100%",
                          height: "56px",
                        }}
                      />
                    </div>
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
