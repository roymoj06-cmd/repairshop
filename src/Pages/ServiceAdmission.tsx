import { Box, Paper } from "@mui/material";
import { FC } from "react";

import { ServiceAdmissionForm } from "@/components";

const ServiceAdmission: FC = () => {
  return (
    <Box className="py-6">
      <Paper className="p-6">
        <ServiceAdmissionForm />
      </Paper>
    </Box>
  );
};

export default ServiceAdmission;
