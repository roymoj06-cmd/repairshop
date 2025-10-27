import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/Store/useStore";
import {
  getRepairReceptions,
  getRepairReceptionsByCustomerId,
} from "@/service/repair/repair.service";

export interface VehicleFilters extends plateSection {
  vehicleStatusFilter?: 'Resident' | 'TempReleased' | 'Released' | null;
}

export const useVehicles = (filters: VehicleFilters = { isDischarged: "false" }) => {
  const { user } = useStore();

  return useQuery({
    queryKey: ["repairReceptions", filters],
    queryFn: async () => {
      let result;
      
      // Determine isDischarged filter based on vehicle status filter
      let dischargedFilter: boolean | null | undefined = filters?.isDischarged !== null ? filters?.isDischarged : undefined;
      
      // Override isDischarged filter based on vehicle status
      if (filters.vehicleStatusFilter === 'Resident' || filters.vehicleStatusFilter === 'TempReleased') {
        dischargedFilter = false; // Both are undischarged
      } else if (filters.vehicleStatusFilter === 'Released') {
        dischargedFilter = true; // Released means discharged
      }
      
      const queryParams = {
        page: 1,
        size: 1000,
        ...filters,
        isDischarged: dischargedFilter,
      };

      if (!user?.isDinawinEmployee) {
        result = await getRepairReceptionsByCustomerId(queryParams);
      } else {
        result = await getRepairReceptions(queryParams);
      }
      
      return result?.data;
    },
  });
};

export const useVehiclesKPI = () => {
  const { user } = useStore();

  return useQuery({
    queryKey: ["allVehiclesKPI"],
    queryFn: async () => {
      if (!user?.isDinawinEmployee) {
        return await getRepairReceptionsByCustomerId({
          page: 1,
          size: 10000, // Get all
        });
      } else {
        return await getRepairReceptions({
          page: 1,
          size: 10000, // Get all
        });
      }
    },
  });
};

