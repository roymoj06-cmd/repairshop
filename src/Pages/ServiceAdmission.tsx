import { useSearchParams } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import { FC } from "react";

import { ServiceAdmissionForm, ServiceAdmissionReadOnly } from "@/components";
import { useStore } from "@/Store/useStore";

const ServiceAdmission: FC = () => {
  const { user } = useStore();
  const [searchParams] = useSearchParams();
  const repairReceptionId = searchParams.get("repairReceptionId") || undefined;

  return (
    <Box className="py-6">
      <Paper className="p-4">
        {user?.isDinawinEmployee ? (
          <ServiceAdmissionForm repairReceptionId={repairReceptionId} />
        ) : (
          <ServiceAdmissionReadOnly repairReceptionId={repairReceptionId} />
        )}
      </Paper>
    </Box>
  );
};

export default ServiceAdmission;
