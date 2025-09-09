import gregorian_en from "react-date-object/locales/gregorian_en";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import { useQuery } from "@tanstack/react-query";
import { FC, useState, useEffect } from "react";
import { Box } from "@mui/material";
import {
  CalendarToday,
  DirectionsCar,
  AccessTime,
  TrendingUp,
  Schedule,
  Warning,
} from "@mui/icons-material";

import {
  getAverageEstimatedTime,
  getReceptionsCount,
  getAverageStayTime,
  getCurrentVehicles,
  getDelayedRepairs,
} from "@/service/repairReport/repairReport.service";
import { Button } from "@/components";

interface DateShortcut {
  label: string;
  value: string;
  getDates: () => { from: string; to: string };
}

const Dashboard: FC = () => {
  const [fromDatePicker, setFromDatePicker] = useState<DateObject | null>(null);
  const [toDatePicker, setToDatePicker] = useState<DateObject | null>(null);
  const [dateRange, setDateRange] = useState<{
    fromDate: string;
    toDate: string;
  }>({
    fromDate: "",
    toDate: "",
  });
  const [activeShortcut, setActiveShortcut] = useState<string>("today");
  const shortcuts: DateShortcut[] = [
    {
      label: "امروز",
      value: "today",
      getDates: () => {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        return { from: todayStr, to: todayStr };
      },
    },
    {
      label: "یک هفته",
      value: "week",
      getDates: () => {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {
          from: weekAgo.toISOString().split("T")[0],
          to: today.toISOString().split("T")[0],
        };
      },
    },

    {
      label: "یک ماه",
      value: "month",
      getDates: () => {
        const today = new Date();
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return {
          from: monthAgo.toISOString().split("T")[0],
          to: today.toISOString().split("T")[0],
        };
      },
    },
    {
      label: "سه ماه",
      value: "threeMonths",
      getDates: () => {
        const today = new Date();
        const threeMonthsAgo = new Date(
          today.getTime() - 90 * 24 * 60 * 60 * 1000
        );
        return {
          from: threeMonthsAgo.toISOString().split("T")[0],
          to: today.toISOString().split("T")[0],
        };
      },
    },
  ];
  const handleShortcutClick = (shortcut: DateShortcut) => {
    const dates = shortcut.getDates();
    setDateRange({ fromDate: dates.from, toDate: dates.to });
    setActiveShortcut(shortcut.value);

    // Update date pickers
    const fromDate = new DateObject({ date: dates.from, calendar: gregorian });
    const toDate = new DateObject({ date: dates.to, calendar: gregorian });
    setFromDatePicker(fromDate.convert(persian, persian_fa));
    setToDatePicker(toDate.convert(persian, persian_fa));
  };
  const {
    data: delayedRepairs,
    isLoading: isLoadingDelayed,
    error: delayedError,
  } = useQuery({
    queryKey: ["delayedRepairs"],
    queryFn: () => getDelayedRepairs(),
  });
  const {
    data: averageEstimatedTime,
    isLoading: isLoadingEstimated,
    error: estimatedError,
  } = useQuery({
    queryKey: ["averageEstimatedTime"],
    queryFn: () => getAverageEstimatedTime(),
  });
  const {
    data: receptionsCount,
    isLoading: isLoadingReceptions,
    error: receptionsError,
  } = useQuery({
    queryKey: ["receptionsCount", dateRange],
    queryFn: () => getReceptionsCount(dateRange),
    enabled: !!(dateRange.fromDate && dateRange.toDate),
  });
  const {
    data: averageStayTime,
    isLoading: isLoadingStayTime,
    error: stayTimeError,
  } = useQuery({
    queryKey: ["averageStayTime"],
    queryFn: () => getAverageStayTime(),
  });
  const {
    data: currentVehicles,
    isLoading: isLoadingVehicles,
    error: vehiclesError,
  } = useQuery({
    queryKey: ["currentVehicles"],
    queryFn: () => getCurrentVehicles(),
  });
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return "0";
    return new Intl.NumberFormat("fa-IR").format(num);
  };
  const formatTime = (minutes: number | undefined): string => {
    if (!minutes) return "0 دقیقه";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${formatNumber(hours)} ساعت و ${formatNumber(mins)} دقیقه`;
    }
    return `${formatNumber(mins)} دقیقه`;
  };
  useEffect(() => {
    const todayShortcut = shortcuts.find((s) => s.value === "today");
    if (todayShortcut) {
      const dates = todayShortcut.getDates();
      setDateRange({ fromDate: dates.from, toDate: dates.to });
    }
  }, []);
  useEffect(() => {
    if (fromDatePicker) {
      const gregorianDate = fromDatePicker.convert(gregorian, gregorian_en);
      const dateStr = gregorianDate.format("YYYY-MM-DD");
      setDateRange((prev) => ({ ...prev, fromDate: dateStr }));
    }
  }, [fromDatePicker]);
  useEffect(() => {
    if (toDatePicker) {
      const gregorianDate = toDatePicker.convert(gregorian, gregorian_en);
      const dateStr = gregorianDate.format("YYYY-MM-DD");
      setDateRange((prev) => ({ ...prev, toDate: dateStr }));
    }
  }, [toDatePicker]);

  return (
    <Box className="dashboard">
      <div className="dashboard__filters">
        <div className="dashboard__filters-wrapper">
          <div className="dashboard__filters-date-section">
            <div className="dashboard__filters-date-range">
              <div className="dashboard__filters-date-range-item">
                <label>از تاریخ</label>
                <DatePicker
                  containerClassName="w-full custom-datepicker-container"
                  onChange={(e: DateObject) => setFromDatePicker(e)}
                  placeholder="انتخاب تاریخ شروع"
                  calendarPosition="bottom-right"
                  className="custom-datepicker"
                  value={fromDatePicker}
                  locale={persian_fa}
                  calendar={persian}
                  zIndex={2001}
                />
              </div>
              <div className="dashboard__filters-date-range-item">
                <label>تا تاریخ</label>
                <DatePicker
                  containerClassName="w-full custom-datepicker-container"
                  onChange={(e: DateObject) => setToDatePicker(e)}
                  placeholder="انتخاب تاریخ پایان"
                  calendarPosition="bottom-right"
                  className="custom-datepicker"
                  value={toDatePicker}
                  locale={persian_fa}
                  calendar={persian}
                  zIndex={2001}
                />
              </div>
            </div>
          </div>
          <div className="dashboard__filters-shortcuts">
            <span className="dashboard__filters-shortcuts-label">
              دوره‌های آماده:
            </span>
            {shortcuts.map((shortcut) => (
              <Button
                key={shortcut.value}
                variant={
                  activeShortcut === shortcut.value ? "contained" : "outlined"
                }
                color="primary"
                className="dashboard__filters-shortcut"
                onClick={() => handleShortcutClick(shortcut)}
              >
                {shortcut.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="dashboard__stats">
        <div
          className={`dashboard__card ${
            isLoadingDelayed ? "dashboard__card--loading" : ""
          }`}
        >
          <div className="dashboard__card-header">
            <h3>تعمیرات با تأخیر</h3>
            <div className="icon">
              <Warning />
            </div>
          </div>
          <div className="dashboard__card-content">
            {delayedError ? (
              <span className="value value--small">خطا</span>
            ) : (
              <span className="value">
                {formatNumber(delayedRepairs?.data?.delayedRepairs?.length)}
              </span>
            )}
          </div>
        </div>
        <div
          className={`dashboard__card ${
            isLoadingEstimated ? "dashboard__card--loading" : ""
          }`}
        >
          <div className="dashboard__card-header">
            <h3>میانگین زمان خواب خودرو</h3>
            <div className="icon">
              <AccessTime />
            </div>
          </div>
          <div className="dashboard__card-content">
            {estimatedError ? (
              <span className="value value--small">خطا</span>
            ) : (
              <span className="value value--small">
                {formatTime(averageEstimatedTime?.data)}
              </span>
            )}
          </div>
        </div>
        <div
          className={`dashboard__card ${
            isLoadingReceptions ? "dashboard__card--loading" : ""
          }`}
        >
          <div className="dashboard__card-header">
            <h3>پذیرش‌های دوره</h3>
            <div className="icon">
              <TrendingUp />
            </div>
          </div>
          <div className="dashboard__card-content">
            {receptionsError ? (
              <span className="value value--small">خطا</span>
            ) : (
              <span className="value">
                {formatNumber(receptionsCount?.data)}
              </span>
            )}
          </div>
        </div>
        <div
          className={`dashboard__card ${
            isLoadingStayTime ? "dashboard__card--loading" : ""
          }`}
        >
          <div className="dashboard__card-header">
            <h3>میانگین زمان تعمیر هر خودرو</h3>
            <div className="icon">
              <Schedule />
            </div>
          </div>
          <div className="dashboard__card-content">
            {stayTimeError ? (
              <span className="value value--small">خطا</span>
            ) : (
              <span className="value value--small">
                {formatTime(averageStayTime?.averageMinutes)}
              </span>
            )}
          </div>
        </div>
        <div
          className={`dashboard__card ${
            isLoadingVehicles ? "dashboard__card--loading" : ""
          }`}
        >
          <div className="dashboard__card-header">
            <h3>خودروهای حاضر</h3>
            <div className="icon">
              <DirectionsCar />
            </div>
          </div>
          <div className="dashboard__card-content">
            {vehiclesError ? (
              <span className="value value--small">خطا</span>
            ) : (
              <span className="value">{currentVehicles?.data}</span>
            )}
          </div>
        </div>
      </div>
      {!dateRange.fromDate || !dateRange.toDate ? (
        <div className="dashboard__empty">
          <CalendarToday />
          <h3>بازه زمانی انتخاب نشده</h3>
          <p>لطفاً بازه زمانی مورد نظر خود را انتخاب کنید</p>
        </div>
      ) : null}
    </Box>
  );
};

export default Dashboard;
