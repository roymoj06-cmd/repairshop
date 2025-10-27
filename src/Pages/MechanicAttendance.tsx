import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import gregorian_en from "react-date-object/locales/gregorian_en";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import { Add, Today, DateRange, ViewList, Timeline } from "@mui/icons-material";
import persian from "react-date-object/calendars/persian";
import { toast } from "react-toastify";
import moment from "moment-jalaali";
import { useState } from "react";
import {
  Grid,
  Autocomplete,
  CardContent,
  Typography,
  TextField,
  Card,
  Box,
} from "@mui/material";

import { getAllMechanics } from "@/service/mechanic/mechanic.service";
import { ACCESS_IDS, useAccessControl } from "@/utils/accessControl";
import {
  getMechanicAttendanceByDateRange,
  createMechanicAttendance,
  updateMechanicAttendance,
  deleteMechanicAttendance,
} from "@/service/mechanicAttendance/MechanicAttendance.service";
import { ConfirmDeleteDialog, Loading, Button } from "@/components";
import AttendanceModal from "@/components/Page/MechanicAttendance/AttendanceModal";
import AttendanceCard from "@/components/Page/MechanicAttendance/AttendanceCard";
import MechanicTimelineCard from "@/components/Page/MechanicAttendance/MechanicTimelineCard";

const MechanicAttendance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] =
    useState<IGetMechanicAttendanceById | null>(null);
  const [selectedMechanic, setSelectedMechanic] =
    useState<IGetAllMechanics | null>(null);
  const [fromDate, setFromDate] = useState<DateObject>(
    new DateObject({ calendar: persian, locale: persian_fa })
  );
  const [toDate, setToDate] = useState<DateObject>(
    new DateObject({ calendar: persian, locale: persian_fa })
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    attendanceId: number | null;
    mechanicName: string | null;
  }>({
    open: false,
    attendanceId: null,
    mechanicName: null,
  });
  const [viewMode, setViewMode] = useState<"individual" | "timeline">(
    "timeline"
  );

  const queryClient = useQueryClient();
  const { hasAnyAccess } = useAccessControl();

  // Get list of mechanics for filter
  const { data: mechanicsData } = useQuery({
    queryKey: ["mechanics"],
    queryFn: () => getAllMechanics({ page: 1, size: 100 }),
  });

  const { isLoading, data: mechanicAttendance } = useQuery({
    queryKey: [
      "mechanicAttendance",
      selectedMechanic?.id,
      fromDate.convert(gregorian, gregorian_en).format("YYYY-MM-DD"),
      toDate.convert(gregorian, gregorian_en).format("YYYY-MM-DD"),
    ],
    queryFn: () => {
      // Convert Persian dates to Gregorian for API
      const startDate = fromDate
        .convert(gregorian, gregorian_en)
        .format("YYYY-MM-DD");
      const endDate = toDate
        .convert(gregorian, gregorian_en)
        .format("YYYY-MM-DD");

      const params: any = {
        startDate,
        endDate,
      };

      // Only add mechanicId if a mechanic is selected
      if (selectedMechanic) {
        params.mechanicId = selectedMechanic.id;
      }

      return getMechanicAttendanceByDateRange(params);
    },
    enabled: true,
  });

  // Create attendance mutation
  const createMutation = useMutation({
    mutationFn: createMechanicAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanicAttendance"] });
      toast.success("حضور/غیاب با موفقیت ثبت شد");
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error("خطا در ثبت حضور/غیاب");
    },
  });

  // Update attendance mutation
  const updateMutation = useMutation({
    mutationFn: updateMechanicAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanicAttendance"] });
      toast.success("حضور/غیاب با موفقیت بروزرسانی شد");
      setIsModalOpen(false);
      setEditingAttendance(null);
    },
    onError: () => {
      toast.error("خطا در بروزرسانی حضور/غیاب");
    },
  });

  // Delete attendance mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMechanicAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanicAttendance"] });
      toast.success("حضور/غیاب با موفقیت حذف شد");
      setDeleteConfirm({ open: false, attendanceId: null, mechanicName: null });
    },
    onError: () => {
      toast.error("خطا در حذف حضور/غیاب");
    },
  });

  const handleCreateAttendance = (data: ICreateMechanicAttendance) => {
    createMutation.mutate(data);
  };

  const handleUpdateAttendance = (data: ICreateMechanicAttendance) => {
    updateMutation.mutate(data);
  };

  const handleDeleteAttendance = (id: number, mechanicName: string) => {
    setDeleteConfirm({ open: true, attendanceId: id, mechanicName });
  };

  const handleEditAttendance = (attendance: IGetMechanicAttendanceById) => {
    setEditingAttendance(attendance);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteConfirm.attendanceId) {
      deleteMutation.mutate(deleteConfirm.attendanceId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAttendance(null);
  };

  // Group attendance data by mechanic and date
  const groupAttendanceByMechanic = (
    data: IGetMechanicAttendanceByMechanicId[]
  ) => {
    const grouped: {
      [key: string]: {
        mechanicName: string;
        mechanicId: number;
        date: string;
        entries: {
          type: number | string;
          description: string;
          typeText: string;
          dateTime: string;
          id: number;
        }[];
      };
    } = {};

    data.forEach((item) => {
      const dateKey = moment(item.dateTime).format("YYYY-MM-DD");
      const groupKey = `${item.mechanicId}-${dateKey}`;

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          mechanicId: item.mechanicId,
          mechanicName: item.mechanicName,
          date: dateKey,
          entries: [],
        };
      }

      grouped[groupKey].entries.push({
        id: item.id,
        type: item.type,
        typeText: item.typeText,
        dateTime: item.dateTime,
        description: item.description,
      });
    });

    return Object.values(grouped);
  };

  // Quick date filters
  const handleTodayClick = () => {
    const today = new DateObject({ calendar: persian, locale: persian_fa });
    setFromDate(today);
    setToDate(today);
  };

  const handleThisWeekClick = () => {
    const today = new DateObject({ calendar: persian, locale: persian_fa });
    const weekDayNumber = Number(today.weekDay);
    const startOfWeek = new DateObject(today).subtract(weekDayNumber, "day");
    setFromDate(startOfWeek);
    setToDate(today);
  };

  const handleThisMonthClick = () => {
    const today = new DateObject({ calendar: persian, locale: persian_fa });
    const startOfMonth = new DateObject(today).setDay(1);
    setFromDate(startOfMonth);
    setToDate(today);
  };

  const canAdd = hasAnyAccess([ACCESS_IDS.ADD_MECHANIC_ATTENDANCE]);
  const canEdit = hasAnyAccess([ACCESS_IDS.EDIT_MECHANIC_ATTENDANCE]);
  const canDelete = hasAnyAccess([ACCESS_IDS.DELETE_MECHANIC_ATTENDANCE]);

  return (
    <div className="mechanic-attendance">
      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={mechanicsData?.data?.values || []}
                getOptionLabel={(option: IGetAllMechanics) => option.fullName}
                value={selectedMechanic}
                onChange={(_, newValue) => setSelectedMechanic(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="انتخاب مکانیک"
                    variant="outlined"
                    fullWidth
                    placeholder="همه مکانیک‌ها"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box className="mechanic-attendance__date-field">
                <DatePicker
                  containerClassName="w-full custom-datepicker-container"
                  onChange={(date: DateObject) => setFromDate(date)}
                  calendarPosition="bottom-left"
                  className="custom-datepicker"
                  placeholder="از تاریخ"
                  onOpenPickNewDate={false}
                  value={fromDate}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  calendar={persian}
                  portal={true}
                  zIndex={2001}
                  style={{
                    width: "100%",
                    height: "56px",
                  }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box className="mechanic-attendance__date-field">
                <DatePicker
                  containerClassName="w-full custom-datepicker-container"
                  onChange={(date: DateObject) => setToDate(date)}
                  calendarPosition="bottom-left"
                  className="custom-datepicker"
                  placeholder="تا تاریخ"
                  onOpenPickNewDate={false}
                  value={toDate}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  calendar={persian}
                  portal={true}
                  zIndex={2001}
                  style={{
                    width: "100%",
                    height: "56px",
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Quick date filters */}
          <Box className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <Button
              onClick={handleTodayClick}
              label="امروز"
              startIcon={<Today />}
              variant="outlined"
              size="small"
            />
            <Button
              onClick={handleThisWeekClick}
              label="این هفته"
              startIcon={<DateRange />}
              variant="outlined"
              size="small"
            />
            <Button
              onClick={handleThisMonthClick}
              label="این ماه"
              startIcon={<DateRange />}
              variant="outlined"
              size="small"
            />
            {canAdd && (
              <Button
                onClick={() => setIsModalOpen(true)}
                containerClassName="mr-auto"
                label="ثبت حضور/غیاب جدید"
                startIcon={<Add />}
                variant="contained"
                color="secondary"
              />
            )}
          </Box>

          {/* View Mode Toggle */}
          <Box className="flex justify-center gap-2 mt-4 pt-4 border-t">
            <Button
              onClick={() => setViewMode("timeline")}
              label="نمایش Timeline"
              startIcon={<Timeline />}
              variant={viewMode === "timeline" ? "contained" : "outlined"}
              color={viewMode === "timeline" ? "primary" : "secondary"}
              size="small"
            />
            <Button
              onClick={() => setViewMode("individual")}
              label="نمایش جداگانه"
              startIcon={<ViewList />}
              variant={viewMode === "individual" ? "contained" : "outlined"}
              color={viewMode === "individual" ? "primary" : "secondary"}
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading || deleteMutation.isPending ? (
        <div className="flex justify-center items-center py-12">
          <Loading />
        </div>
      ) : (
        <div className="attendance-list">
          {mechanicAttendance?.data?.length > 0 ? (
            <Grid container spacing={3}>
              {viewMode === "timeline"
                ? // Timeline View - Group by mechanic and date
                  groupAttendanceByMechanic(mechanicAttendance?.data || []).map(
                    (group: any) => (
                      <Grid
                        size={{ xs: 12, md: 6, lg: 4 }}
                        key={`${group.mechanicId}-${group.date}`}
                      >
                        <MechanicTimelineCard
                          mechanicId={group.mechanicId}
                          mechanicName={group.mechanicName}
                          date={group.date}
                          entries={group.entries}
                          onEdit={canEdit ? handleEditAttendance : undefined}
                          onDelete={
                            canDelete ? handleDeleteAttendance : undefined
                          }
                        />
                      </Grid>
                    )
                  )
                : // Individual View - Show each entry separately
                  mechanicAttendance?.data?.map(
                    (attendance: IGetMechanicAttendanceByMechanicId) => (
                      <Grid size={{ xs: 12, md: 6, lg: 4 }} key={attendance.id}>
                        <AttendanceCard
                          attendance={attendance}
                          onEdit={canEdit ? handleEditAttendance : undefined}
                          onDelete={
                            canDelete ? handleDeleteAttendance : undefined
                          }
                        />
                      </Grid>
                    )
                  )}
            </Grid>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Typography variant="h6" color="textSecondary">
                  هیچ رکورد حضور و غیابی برای این بازه تاریخی یافت نشد
                </Typography>
              </CardContent>
            </Card>
          )}
          {/* Modals */}
          <AttendanceModal
            open={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={
              editingAttendance
                ? handleUpdateAttendance
                : handleCreateAttendance
            }
            editingAttendance={editingAttendance}
            loading={createMutation.isPending || updateMutation.isPending}
            mechanics={mechanicsData?.data?.values || []}
          />

          <ConfirmDeleteDialog
            open={deleteConfirm.open}
            onClose={() =>
              setDeleteConfirm({
                open: false,
                attendanceId: null,
                mechanicName: null,
              })
            }
            onConfirm={confirmDelete}
            title="حذف رکورد حضور/غیاب"
            content={`آیا از حذف رکورد حضور/غیاب ${deleteConfirm.mechanicName} اطمینان دارید؟`}
          />
        </div>
      )}
    </div>
  );
};

export default MechanicAttendance;
