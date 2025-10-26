import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ExpandMore, FilterList } from "@mui/icons-material";
import { toast } from "react-toastify";
import { FC, useState, useMemo } from "react";
import {
  AccordionSummary,
  AccordionDetails,
  Grid,
  useMediaQuery,
  Accordion,
  Paper,
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import {
  getRepairReceptions,
  getRepairReceptionsByCustomerId,
} from "@/service/repair/repair.service";
import { getCustomers } from "@/service/customer/customer.service";
import { useStore } from "@/Store/useStore";
import dir from "@/Router/dir";
import {
  PlateNumberDisplay,
  EnhancedSelect,
  VehicleCard,
  Loading,
} from "@/components";

const Vehicle: FC = () => {
  const [, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<plateSection>({ isDischarged: "false" });
  const navigate = useNavigate();
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const { user } = useStore();
  const isCustomRange = useMediaQuery(
    "(min-width: 1200px) and (max-width: 1300px)"
  );
  const getGridSize = () => {
    if (isCustomRange) {
      return { xs: 12, sm: 6, md: 3, lg: 3 };
    }
    return { xs: 12, sm: 6, md: 3, lg: 2 };
  };
  const statusOptions = [
    { value: null, label: "همه" },
    { value: "false", label: "ترخیص نشده" },
    { value: "true", label: "ترخیص شده" },
  ];
  const { isPending: isPendingRepairReceptions, data: vehicles } = useQuery({
    queryKey: ["repairReceptions", filter],
    queryFn: () => {
      if (!user?.isDinawinEmployee) {
        return getRepairReceptionsByCustomerId({
          page: 1,
          size: 1000,
          isDischarged:
            filter?.isDischarged !== null ? filter?.isDischarged : undefined,
          plateSection1: filter?.plateSection1,
          plateSection2: filter?.plateSection2,
          plateSection3: filter?.plateSection3,
          plateSection4: filter?.plateSection4,
        });
      } else {
        return getRepairReceptions({
          page: 1,
          size: 1000,
          isDischarged:
            filter?.isDischarged !== null ? filter?.isDischarged : undefined,
          customerId: filter?.customerId,
          plateSection1: filter?.plateSection1,
          plateSection2: filter?.plateSection2,
          plateSection3: filter?.plateSection3,
          plateSection4: filter?.plateSection4,
        });
      }
    },
  });
  const { mutateAsync: searchCustomers, isPending } = useMutation({
    mutationFn: getCustomers,
    onSuccess: (data) => {
      if (data?.isSuccess) {
        const options = data?.data?.map((i: any) => ({
          label: i?.fullName,
          value: i.customerId,
          id: `customer-${i.customerId}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
        }));
        setCustomerOptions(options || []);
      } else {
        toast?.error(data?.message);
      }
    },
  });
  const handleStatusChange = (newValue: any) => {
    setFilter({
      ...filter,
      isDischarged: newValue?.value,
    });
    setSearchParams({ page: "1" });
  };
  const handleCustomerSearch = (newValue: any) => {
    if (newValue?.value) {
      setFilter((prev: any) => ({ ...prev, customerId: newValue.value }));
    } else {
      setFilter((prev: any) => ({ ...prev, customerId: undefined }));
    }
    setSearchParams({ page: "1" });
  };
  const handleInputChange = (newInputValue: string) => {
    if (newInputValue.length >= 2) {
      searchCustomers(newInputValue);
    }
  };
  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const allVehicles = vehicles?.data?.values || [];
    const total = allVehicles.length;
    
    // Calculate delayed vehicles (more than 3 days)
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    const delayed = allVehicles.filter((v: any) => {
      if (!v.receptionDate) return false;
      const [year, month, day] = v.receptionDate.split('/').map(Number);
      const receptionDate = new Date(year, month - 1, day);
      return receptionDate < threeDaysAgo;
    }).length;
    
    // Calculate waiting for parts (based on status or other criteria)
    // For now, we'll use a placeholder - you may need to adjust based on actual data structure
    const waitingForParts = allVehicles.filter((v: any) => 
      v.description?.includes('منتظر قطعه') || 
      v.description?.includes('خرید قطعه')
    ).length;
    
    // Calculate ready for delivery today (factored but not discharged)
    const readyForDelivery = allVehicles.filter((v: any) => 
      v.status === true && !v.isDischarged
    ).length;
    
    return {
      total,
      delayed,
      waitingForParts,
      readyForDelivery
    };
  }, [vehicles?.data?.values]);
  const handleCardClick = (
    receptionId: string | number,
    event?: React.MouseEvent
  ) => {
    // Prevent navigation if the click is on a dialog, modal, or delete button
    if (event) {
      const target = event.target as HTMLElement;
      const clickedElement = target.closest(
        '.MuiDialog-root, .MuiModal-root, .delete-button, [role="dialog"]'
      );
      if (clickedElement) {
        return;
      }
    }

    navigate({
      pathname: `${dir.serviceAdmission}`,
      search: `repairReceptionId=${receptionId}`,
    });
  };

  return (
    <Box className="vehicle-page">
      {isPendingRepairReceptions && <Loading />}
      <Box>
        <Accordion
          defaultExpanded
          style={{ borderRadius: "10px", marginBottom: "10px" }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="filters-content"
            id="filters-header"
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <FilterList />
              <span className="font-16 ms-2">فیلتر ها</span>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} display="flex" alignItems="end">
              <Grid size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                <label className="font-12">شماره پلاک</label>
                <PlateNumberDisplay
                  state={filter}
                  setState={setFilter}
                  setPage={setSearchParams}
                />
              </Grid>
              {user?.isDinawinEmployee && (
                <Grid size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                  <EnhancedSelect
                    onChange={handleCustomerSearch}
                    loading={isPending}
                    onInputChange={(value) => {
                      handleInputChange(value);
                    }}
                    options={customerOptions}
                    enableSpeechToText={true}
                    label="جستجوی مشتری"
                    iconPosition="end"
                    searchable={true}
                    disabled={false}
                    name="customer"
                    isRtl={true}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                <EnhancedSelect
                  value={
                    statusOptions?.find(
                      (option) => option.value === filter?.isDischarged
                    ) || statusOptions[0]
                  }
                  onChange={handleStatusChange}
                  enableSpeechToText={true}
                  options={statusOptions}
                  loading={isPending}
                  name="isDischarged"
                  iconPosition="end"
                  searchable={true}
                  disabled={false}
                  label="وضعیت"
                  isRtl={true}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* KPI Dashboard */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #aa8c78 0%, #98877b 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(170, 140, 120, 0.2)'
            }}>
              <CardContent>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {kpiMetrics.total}
                </Typography>
                <Typography variant="body2">
                  خودروهای داخل تعمیرگاه
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              color: '#991b1b',
              boxShadow: '0 4px 12px rgba(254, 202, 202, 0.3)'
            }}>
              <CardContent>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {kpiMetrics.delayed}
                </Typography>
                <Typography variant="body2">
                  بیش از ۳ روز خوابیده
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              color: '#92400e',
              boxShadow: '0 4px 12px rgba(253, 230, 138, 0.3)'
            }}>
              <CardContent>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {kpiMetrics.waitingForParts}
                </Typography>
                <Typography variant="body2">
                  منتظر قطعه / خرید
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              color: '#065f46',
              boxShadow: '0 4px 12px rgba(167, 243, 208, 0.3)'
            }}>
              <CardContent>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {kpiMetrics.readyForDelivery}
                </Typography>
                <Typography variant="body2">
                  آماده تحویل امروز
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box className="vehicle-cards-container p-2">
        <Grid container spacing={2}>
          {vehicles?.data?.values?.map((vehicle: any) => (
            <Grid size={getGridSize()} key={vehicle.id}>
              <Paper
                className="vehicle-card-container cursor-pointer"
                onClick={(e) => handleCardClick(vehicle.id, e)}
              >
                <VehicleCard vehicle={vehicle} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Vehicle;
