import gregorian_en from "react-date-object/locales/gregorian_en";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import {
  TableContainer,
  Grid2 as Grid,
  CardContent,
  Typography,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Table,
  Chip,
  Card,
  Box,
} from "@mui/material";
import {
  AttachMoney,
  TrendingUp,
  AccessTime,
  Person,
} from "@mui/icons-material";

import { getMechanicPerformance } from "@/service/mechanicPerformance/mechanicPerformance.service";
import { getAllRepairServices } from "@/service/repairServices/repairServices.service";
import { getActiveMechanics } from "@/service/mechanic/mechanic.service";
import { EnhancedSelect, Loading } from "@/components";
import { addCommas, formatDateTime } from "@/utils";

const MechanicPerformance: FC = () => {
  const [filters, setFilters] = useState<{
    fromDate: DateObject | null;
    toDate: DateObject | null;
    selectedMechanic: SelectOption | null;
    selectedService: SelectOption | null;
  }>({
    fromDate: null,
    toDate: null,
    selectedMechanic: null,
    selectedService: null,
  });

  const [reportData, setReportData] =
    useState<IMechanicPerformanceResponse | null>(null);
  const { data: mechanicsData, isLoading: isLoadingMechanics } = useQuery({
    queryKey: ["activeMechanics"],
    queryFn: getActiveMechanics,
    select: (data) =>
      data?.data?.map((mechanic: IGetActiveMechanics) => ({
        value: mechanic.userId,
        label: mechanic.fullName,
      })) || [],
  });
  const { data: servicesData, isLoading: isLoadingServices } = useQuery({
    queryKey: ["repairServices"],
    queryFn: () => getAllRepairServices({ page: 1, size: 100 }),
    select: (data) =>
      data?.data?.values?.map((service: IGetAllRepairServices) => ({
        value: service.id,
        label: service.serviceTitle,
      })) || [],
  });
  const { isLoading: isLoadingPerformance } = useQuery({
    queryKey: ["getMechanicPerformance", filters],
    queryFn: async () => {
      if (!filters.selectedMechanic) {
        return null;
      }

      const requestData: IMechanicPerformance = {
        fromDate: filters.fromDate
          ? filters.fromDate
              .convert(gregorian, gregorian_en)
              .format("YYYY-MM-DDT00:00:00")
          : undefined,
        toDate: filters.toDate
          ? filters.toDate
              .convert(gregorian, gregorian_en)
              .format("YYYY-MM-DDT23:59:59")
          : undefined,
        userId: Number(filters.selectedMechanic.value),
        serviceId: filters.selectedService
          ? Number(filters.selectedService.value)
          : undefined,
      };

      const result = await getMechanicPerformance(requestData);
      setReportData(result?.data || null);
      return result;
    },
    enabled: !!filters.selectedMechanic,
  });

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ساعت و ${mins} دقیقه`;
  };

  return (
    <div className="mechanic-performance">
      <Paper className="mechanic-performance__filters">
        <Grid
          container
          spacing={3}
          sx={{ alignItems: "center", display: "flex" }}
        >
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <EnhancedSelect
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, selectedMechanic: value }))
              }
              placeholder="مکانیک را انتخاب کنید"
              value={filters.selectedMechanic}
              options={mechanicsData || []}
              loading={isLoadingMechanics}
              storeValueOnly={true}
              label="انتخاب مکانیک"
              searchable={true}
              name="mechanic"
              isRtl
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <EnhancedSelect
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, selectedService: value }))
              }
              placeholder="سرویس را انتخاب کنید"
              value={filters.selectedService}
              options={servicesData || []}
              loading={isLoadingServices}
              storeValueOnly={true}
              label="انتخاب سرویس"
              searchable={true}
              name="service"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box className="mechanic-performance__date-field">
              <DatePicker
                className="custom-datepicker"
                containerClassName="w-full custom-datepicker-container"
                value={filters.fromDate}
                onChange={(date: DateObject) =>
                  setFilters((prev) => ({ ...prev, fromDate: date }))
                }
                placeholder="انتخاب تاریخ شروع"
                calendarPosition="bottom-left"
                onOpenPickNewDate={false}
                locale={persian_fa}
                calendar={persian}
                format="YYYY/MM/DD"
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
            <Box className="mechanic-performance__date-field">
              <DatePicker
                className="custom-datepicker"
                containerClassName="w-full custom-datepicker-container"
                value={filters.toDate}
                onChange={(date: DateObject) =>
                  setFilters((prev) => ({ ...prev, toDate: date }))
                }
                placeholder="انتخاب تاریخ پایان"
                calendarPosition="bottom-left"
                onOpenPickNewDate={false}
                locale={persian_fa}
                calendar={persian}
                format="YYYY/MM/DD"
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
      </Paper>

      {/* Results Section */}
      {isLoadingPerformance && (
        <Box className="mechanic-performance__loading">
          <Loading />
        </Box>
      )}

      {reportData && !isLoadingPerformance && (
        <div className="mechanic-performance__results">
          {/* Summary Cards */}
          <Grid container spacing={3} className="mechanic-performance__summary">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className="mechanic-performance__summary-card">
                <CardContent>
                  <Box className="mechanic-performance__summary-icon">
                    <Person color="primary" />
                  </Box>
                  <Typography
                    variant="h6"
                    className="mechanic-performance__summary-value"
                  >
                    {reportData.mechanicName}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="mechanic-performance__summary-label"
                  >
                    نام مکانیک
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className="mechanic-performance__summary-card">
                <CardContent>
                  <Box className="mechanic-performance__summary-icon">
                    <AccessTime color="primary" />
                  </Box>
                  <Typography
                    variant="h6"
                    className="mechanic-performance__summary-value"
                  >
                    {formatTime(reportData.totalTimeSpentMinutes)}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="mechanic-performance__summary-label"
                  >
                    کل زمان صرف شده
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className="mechanic-performance__summary-card">
                <CardContent>
                  <Box className="mechanic-performance__summary-icon">
                    <AttachMoney color="primary" />
                  </Box>
                  <Typography
                    variant="h6"
                    className="mechanic-performance__summary-value"
                  >
                    {addCommas(reportData.totalProfit)}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="mechanic-performance__summary-label"
                  >
                    کل سود
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className="mechanic-performance__summary-card">
                <CardContent>
                  <Box className="mechanic-performance__summary-icon">
                    <TrendingUp color="primary" />
                  </Box>
                  <Typography
                    variant="h6"
                    className="mechanic-performance__summary-value"
                  >
                    {reportData?.services?.length || 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="mechanic-performance__summary-label"
                  >
                    تعداد سرویس‌ها
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Services Table */}
          {reportData?.services?.length > 0 && (
            <Paper className="mechanic-performance__table-container">
              <Typography
                variant="h6"
                className="mechanic-performance__table-title"
              >
                جزئیات سرویس‌ها
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>نام سرویس</TableCell>
                      <TableCell>تاریخ شروع</TableCell>
                      <TableCell>تاریخ پایان</TableCell>
                      <TableCell>زمان صرف شده</TableCell>
                      <TableCell>قیمت پایه</TableCell>
                      <TableCell>قیمت نهایی</TableCell>
                      <TableCell>درصد کمیسیون</TableCell>
                      <TableCell>سود</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData?.services?.map((service, index) => (
                      <TableRow key={index}>
                        <TableCell>{service.serviceName}</TableCell>
                        <TableCell>
                          {formatDateTime(service.startDate)}
                        </TableCell>
                        <TableCell>{formatDateTime(service.endDate)}</TableCell>
                        <TableCell>
                          {formatTime(service.timeSpentMinutes)}
                        </TableCell>
                        <TableCell>{addCommas(service.basePrice)} </TableCell>
                        <TableCell>
                          {addCommas(service.servicePrice)}{" "}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${service.commissionPercent}%`}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="success.main"
                            fontWeight="bold"
                          >
                            {addCommas(service.profit)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {reportData?.services?.length === 0 && (
            <Paper className="mechanic-performance__empty">
              <Typography variant="h6" color="textSecondary" align="center">
                هیچ سرویسی در بازه زمانی انتخاب شده یافت نشد
              </Typography>
            </Paper>
          )}
        </div>
      )}
    </div>
  );
};

export default MechanicPerformance;
