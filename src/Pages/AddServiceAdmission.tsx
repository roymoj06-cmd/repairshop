import { Box, Paper } from "@mui/material";
import { FC } from "react";

import AddServiceAdmissionForm from "@/components/Page/ServiceAdmission/AddServiceAdmissionForm";

const AddServiceAdmission: FC = () => {
  return (
    <Box className="py-6">
      <Paper className="p-6">
        <AddServiceAdmissionForm />
      </Paper>
    </Box>
  );
};

export default AddServiceAdmission;
