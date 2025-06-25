import { Button } from "@mui/material";
import { FC, useState } from "react";

import { RequestProductListModal, RequestProductModal } from "@/components";

interface RepairReceptionProductsProps {
  repairReceptionId?: string;
}
const RepairReceptionProducts: FC<RepairReceptionProductsProps> = ({
  repairReceptionId,
}) => {
  const [showProductRequestModal, setShowProductRequestModal] =
    useState<boolean>();
  const [showProductRequestListModal, setShowProductRequestListModal] =
    useState<boolean>();

  return (
    <div className="">
      <Button
        onClick={() => setShowProductRequestModal(true)}
        variant="contained"
        color="secondary"
        size="large"
        sx={{
          marginRight: "1rem",
        }}
      >
        درخواست قطعه
      </Button>
      <Button
        onClick={() => setShowProductRequestListModal(true)}
        variant="contained"
        color="secondary"
        size="large"
      >
        نمایش درخواست ها
      </Button>
      {showProductRequestModal && (
        <RequestProductModal
          setShowModal={setShowProductRequestModal}
          repairReceptionId={repairReceptionId}
          showModal={showProductRequestModal}
        />
      )}
      {showProductRequestListModal && (
        <RequestProductListModal
          setShowModal={setShowProductRequestListModal}
          showModal={showProductRequestListModal}
          repairReceptionId={repairReceptionId}
        />
      )}
    </div>
  );
};

export default RepairReceptionProducts;
