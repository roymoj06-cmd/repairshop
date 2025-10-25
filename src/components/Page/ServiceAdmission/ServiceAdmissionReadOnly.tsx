import persian from "react-date-object/calendars/persian";
import { DateObject } from "react-multi-date-picker";
import { FC, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Grid,
  Typography,
  Divider,
  Tabs,
  Tab,
  Box,
  TextField,
  Paper,
} from "@mui/material";

import { getRepairReceptionForUpdateById } from "@/service/repair/repair.service";
import {
  RepairReceptionProducts,
  RepairReceptionService,
  RepairReceptionOldPart,
  CustomerProblems,
  UploaderDocs,
  Loading,
} from "@/components";

interface IServiceAdmissionReadOnlyProps {
  repairReceptionId?: string;
}

const ServiceAdmissionReadOnly: FC<IServiceAdmissionReadOnlyProps> = ({
  repairReceptionId,
}) => {
  const [repairData, setRepairData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [receptionDate, setReceptionDate] = useState<string>("");

  const {
    mutateAsync: fetchRepairReception,
    isPending: isFetchingRepairReception,
  } = useMutation({
    mutationFn: getRepairReceptionForUpdateById,
    onSuccess: (data: any) => {
      if (data?.isSuccess && data?.data) {
        const repair = data.data;
        setRepairData(repair);

        // Format reception date
        if (repair.receptionDateTime) {
          const receptionDateValue = new DateObject({
            calendar: persian,
            date: new Date(repair.receptionDateTime),
          });
          setReceptionDate(receptionDateValue.format("YYYY/MM/DD HH:mm"));
        }

        // Format delivery date
        if (repair.returnDateTime) {
          const deliveryDateValue = new DateObject({
            calendar: persian,
            date: new Date(repair.returnDateTime),
          });
          setDeliveryDate(deliveryDateValue.format("YYYY/MM/DD HH:mm"));
        }
      }
    },
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (repairReceptionId) {
      fetchRepairReception(+repairReceptionId);
    }
  }, [repairReceptionId, fetchRepairReception]);

  if (isFetchingRepairReception) {
    return <Loading />;
  }

  if (!repairData) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          اطلاعات پذیرش یافت نشد
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        مشاهده اطلاعات پذیرش
      </Typography>

      <Grid container spacing={2}>
        {/* بخش اطلاعات مشتری و خودرو */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
            اطلاعات مشتری و خودرو
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <TextField
            label="مشتری"
            value={repairData.customerName || ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <TextField
            label="پلاک"
            value={repairData.plateNumber || ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>
        
        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <TextField
            label="رنگ"
            value={repairData.carColor || ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>

        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <TextField
            label="تاریخ و زمان پذیرش"
            value={receptionDate}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>

        <Grid size={{ xs: 6, md: 6, lg: 2 }}>
          <TextField
            label="زمان تخمینی (روز)"
            value={repairData.customerEstimatedTime || ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>

        <Grid size={{ xs: 6, md: 6, lg: 2 }}>
          <TextField
            label="کیلومتر"
            value={repairData.carKilometers || ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>

        <Grid size={{ xs: 6, md: 6, lg: 4 }}>
          <TextField
            label="نام تحویل دهنده"
            value={repairData.driverNameAtDelivery || ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>

        <Grid size={{ xs: 6, md: 6, lg: 4 }}>
          <TextField
            label="تلفن تحویل دهنده"
            value={repairData.driverPhoneAtDelivery || ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>

        <Grid size={{ xs: 6, md: 6, lg: 4 }}>
          <TextField
            label="نام پذیرش کننده"
            value={repairData.receiverNameAtReception || ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>

        {/* جداکننده بین بخش پذیرش و ترخیص */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              اطلاعات ترخیص
            </Typography>
          </Divider>
        </Grid>

        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <TextField
            label="تاریخ و زمان ترخیص"
            value={deliveryDate}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>

        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <TextField
            label="ترخیص کننده"
            value={repairData.staffNameAtReturn || ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>

        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <TextField
            label="نام تحویل گیرنده"
            value={repairData.customerNameAtReturn || ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>

        <Grid size={{ xs: 6, md: 6, lg: 3 }}>
          <TextField
            label="تلفن تحویل گیرنده"
            value={repairData.customerPhoneAtReturn || ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>

        {/* جداکننده برای توضیحات */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              توضیحات
            </Typography>
          </Divider>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            label="توضیحات"
            value={repairData.description || ""}
            fullWidth
            multiline
            rows={3}
            size="small"
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>

        {/* تب‌های مختلف */}
        <Grid size={{ xs: 12 }} sx={{ mt: 4 }}>
          <Paper sx={{ p: 0 }}>
            <Box
              sx={{
                borderColor: "divider",
                borderBottom: 1,
                mb: 3,
              }}
            >
              <Tabs
                onChange={handleTabChange}
                aria-label="service tabs"
                value={activeTab}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  '& .MuiTabs-flexContainer': {
                    gap: { xs: 0.5, sm: 1 }
                  },
                  '& .MuiTab-root': {
                    minWidth: { xs: 80, sm: 90 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '8px 12px', sm: '12px 16px' },
                    whiteSpace: 'nowrap'
                  },
                  '& .MuiTabs-scrollButtons': {
                    '&.Mui-disabled': {
                      opacity: 0.3
                    }
                  }
                }}
              >
                <Tab label="مشکلات" />
                <Tab label="تعمیرات" />
                <Tab label="قطعات" />
                <Tab label="مستندات" />
                <Tab label="داغی" />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              {/* تب مشکلات */}
              {activeTab === 0 && (
                <CustomerProblems 
                  repairReceptionId={repairReceptionId} 
                  readOnly={true}
                />
              )}

              {/* تب تعمیرات */}
              {activeTab === 1 && (
                <RepairReceptionService
                  repairReceptionId={repairReceptionId}
                  customerId={repairData.customerId}
                  carId={repairData.carId}
                  details={{
                    customerName: repairData.customerName || "",
                    plateNumber: repairData.plateNumber || "",
                    receptionDate: receptionDate,
                  }}
                  readOnly={true}
                />
              )}

              {/* تب قطعات */}
              {activeTab === 2 && (
                <RepairReceptionProducts 
                  repairReceptionId={repairReceptionId}
                  readOnly={true}
                />
              )}

              {/* تب مستندات */}
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    مستندات
                  </Typography>
                  <UploaderDocs 
                    repairReceptionId={repairReceptionId}
                    readOnly={true}
                  />
                </Box>
              )}

              {/* تب داغی */}
              {activeTab === 4 && (
                <RepairReceptionOldPart 
                  repairReceptionId={repairReceptionId}
                  readOnly={true}
                />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServiceAdmissionReadOnly;