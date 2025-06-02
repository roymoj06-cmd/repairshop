import { Box, Paper } from "@mui/material";
import { FC } from "react";

import { ServiceAdmissionForm } from "@/components";
import { useSearchParams } from "react-router-dom";

const ServiceAdmission: FC = () => {
  const [searchParams] = useSearchParams();
  const repairReceptionId = searchParams.get("repairReceptionId") || undefined;
  
  return (
    <Box className="py-6">
      <Paper className="p-6">
        <ServiceAdmissionForm repairReceptionId={repairReceptionId} />
      </Paper>
    </Box>
  );
};

export default ServiceAdmission;
