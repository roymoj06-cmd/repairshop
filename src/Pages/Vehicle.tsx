import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import {
  SelectChangeEvent,
  Grid2 as Grid,
  Autocomplete,
  FormControl,
  InputLabel,
  Pagination,
  TextField,
  MenuItem,
  Select,
  Box,
} from "@mui/material";

import { VehicleCard, PlateNumberDisplay, Loading } from "@/components";
import { getRepairReceptions } from "@/service/repair/repair.service";
import { getCustomers } from "@/service/customer/customer.service";

const Vehicle: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get("page") ?? 1;
  const [filter, setFilter] = useState<plateSection>();
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const statusOptions = [
    { value: undefined, label: "همه" },
    { value: "false", label: "ترخیص نشده" },
    { value: "true", label: "ترخیص شده" },
  ];
  const {
    isPending: isPendingRepairReceptions,
    data: vehicles,
    refetch,
  } = useQuery({
    queryKey: ["repairReceptions", page, filter],
    queryFn: () =>
      getRepairReceptions({
        page: page ? +page : 1,
        size: 12,
        isDischarged: filter?.isDischarged,
        customerId: filter?.customerId,
        plateSection1: filter?.plateSection1,
        plateSection2: filter?.plateSection2,
        plateSection3: filter?.plateSection3,
        plateSection4: filter?.plateSection4,
      }),
  });
  const { mutateAsync: searchCustomers, isPending } = useMutation({
    mutationFn: getCustomers,
    onSuccess: (data) => {
      setCustomerOptions(data?.data);
    },
  });
  const handleStatusChange = (e: SelectChangeEvent) => {
    setFilter({
      ...filter,
      isDischarged: e.target.value === undefined ? undefined : e.target.value,
    });
    setSearchParams({ page: "1" });
  };
  const handleCustomerSearch = (_: any, newValue: any) => {
    if (newValue) {
      setFilter((prev) => ({ ...prev, customerId: newValue.customerId }));
      setSearchParams({ page: "1" });
      refetch();
    } else {
      setFilter((prev) => ({ ...prev, customerId: undefined }));
      setSearchParams({ page: "1" });
      refetch();
    }
  };
  const handleInputChange = (_: any, newInputValue: string) => {
    if (newInputValue.length >= 2) {
      searchCustomers(newInputValue);
    }
  };
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setSearchParams({ page: value.toString() });
  };
  useEffect(() => {
    refetch();
  }, [filter, page, refetch]);

  return (
    <Box className="vehicle-page">
      {isPendingRepairReceptions && <Loading />}
      <Box className="filters-container">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <PlateNumberDisplay
              state={filter}
              setState={setFilter}
              setPage={setSearchParams}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Autocomplete
              getOptionLabel={(option) => `${option.fullName}`}
              onInputChange={handleInputChange}
              onChange={handleCustomerSearch}
              ListboxProps={{ dir: "rtl" }}
              options={customerOptions}
              loading={isPending}
              renderInput={(params) => (
                <TextField
                  {...params}
                  style={{
                    minHeight: "56px",
                    maxHeight: "fit-content",
                  }}
                  label="جستجوی مشتری"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <FormControl fullWidth>
              <InputLabel>وضعیت</InputLabel>
              <Select
                onChange={handleStatusChange}
                value={filter?.isDischarged}
                defaultValue="false"
                label="وضعیت"
                size="small"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Box className="vehicle-cards-container p-2">
        <Grid container spacing={2}>
          {vehicles?.data?.values?.map((vehicle: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={vehicle.id}>
              <VehicleCard vehicle={vehicle} />
            </Grid>
          ))}
        </Grid>
      </Box>
      {vehicles?.data?.totalPage && vehicles?.data?.totalPage > 1 && (
        <Box className="pagination-container flex justify-center mt-12">
          <Pagination
            count={vehicles?.data?.totalPage}
            onChange={handlePageChange}
            boundaryCount={1}
            siblingCount={1}
            showFirstButton
            color="primary"
            showLastButton
            size="large"
            page={+page}
          />
        </Box>
      )}
    </Box>
  );
};

export default Vehicle;
