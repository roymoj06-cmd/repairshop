import { FC, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TableContainer,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  Table,
  Paper,
  Box,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

import { getMechanicAccountBalance } from "@/service/mechanic/mechanic.service";
import { addCommas } from "@/utils";

interface IMechanicLedger {
  sourceSystemTypeText: string;
  balanceText: string;
  description: string;
  systemName: string;
  createDs: string;
  createDm: string;
  headerId: number;
  balance: number;
  shTime: string;
  credit: number;
  debit: number;
  row: number;
  id: number;
}

interface IMechanicLedgerProps {
  open: boolean;
  onClose: () => void;
  mechanicId?: number;
  mechanicName?: string;
}

const MechanicLedger: FC<IMechanicLedgerProps> = ({
  open,
  onClose,
  mechanicId,
  mechanicName,
}) => {
  const [selectedRow, setSelectedRow] = useState<IMechanicLedger | null>(null);

  const {
    data: ledgerData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mechanicAccountBalance", mechanicId],
    queryFn: () => getMechanicAccountBalance(mechanicId!),
    enabled: !!mechanicId && open,
  });

  useEffect(() => {
    if (!open) {
      setSelectedRow(null);
    }
  }, [open]);

  const handleRowClick = (item: IMechanicLedger) => {
    setSelectedRow(selectedRow?.id === item.id ? null : item);
  };

  const isLastRow = (index: number) => {
    return index === (ledgerData?.data?.length || 0) - 1;
  };

  const getRowStyle = (index: number) => {
    return isLastRow(index)
      ? {
          backgroundColor: "#1976d2",
          color: "white",
        }
      : {};
  };

  if (error) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: "80vh",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="div">
          دفتر حساب {mechanicName}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <Typography>در حال بارگذاری...</Typography>
          </Box>
        ) : (
          <>
            {/* Desktop View */}
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        ردیف
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        سیستم
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        تاریخ
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        شرح
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        بدهکار
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        بستانکار
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        مانده
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ledgerData?.data?.map(
                      (item: IMechanicLedger, index: number) => (
                        <TableRow
                          key={index}
                          onClick={() => handleRowClick(item)}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "rgba(255, 255, 255, 0.08)"
                                  : "rgba(0, 0, 0, 0.04)",
                            },
                            ...getRowStyle(index),
                          }}
                        >
                          <TableCell align="center" sx={getRowStyle(index)}>
                            <span>{index + 1}</span>
                          </TableCell>
                          <TableCell align="left" sx={getRowStyle(index)}>
                            {item.systemName}
                          </TableCell>
                          <TableCell align="right" sx={getRowStyle(index)}>
                            {item.createDs}
                          </TableCell>
                          <TableCell align="left" sx={getRowStyle(index)}>
                            {item.description}
                          </TableCell>
                          <TableCell
                            align="right"
                            dir="ltr"
                            sx={getRowStyle(index)}
                          >
                            {addCommas(item.debit)}
                          </TableCell>
                          <TableCell
                            align="right"
                            dir="ltr"
                            sx={getRowStyle(index)}
                          >
                            {addCommas(item.credit)}
                          </TableCell>
                          <TableCell
                            align="right"
                            dir="ltr"
                            sx={getRowStyle(index)}
                          >
                            {addCommas(item.balance)}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Mobile/Tablet View - Optimized for Quick Reading */}
            <Box sx={{ display: { xs: "block", md: "none" }, p: 1 }}>
              <Box sx={{ maxHeight: "70vh", overflowY: "auto" }}>
                {ledgerData?.data?.map(
                  (item: IMechanicLedger, index: number) => {
                    const isLast = isLastRow(index);
                    return (
                      <Box
                        key={index}
                        onClick={() => handleRowClick(item)}
                        sx={{
                          mb: 1,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          border:
                            selectedRow?.id === item.id
                              ? "2px solid #1976d2"
                              : "1px solid",
                          borderColor: (theme) =>
                            theme.palette.mode === "dark"
                              ? "#424242"
                              : "#e0e0e0",
                          borderRadius: 1,
                          background: isLast
                            ? "#1976d2"
                            : (theme) =>
                                theme.palette.mode === "dark"
                                  ? index % 2 === 0
                                    ? "#2d2d2d"
                                    : "#1e1e1e"
                                  : index % 2 === 0
                                  ? "#fafafa"
                                  : "#ffffff",
                          color: isLast ? "white" : "inherit",
                          p: 1.5,
                          "&:hover": {
                            backgroundColor: isLast
                              ? "#1565c0"
                              : (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "#424242"
                                    : "#f5f5f5",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        {/* Row Header - Compact */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "bold",
                                color: isLast
                                  ? "white"
                                  : (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "#b0b0b0"
                                        : "#666",
                                fontSize: "0.75rem",
                                minWidth: 20,
                              }}
                            >
                              #{index + 1}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: isLast
                                  ? "rgba(255,255,255,0.9)"
                                  : (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "#888"
                                        : "#999",
                                fontSize: "0.7rem",
                              }}
                            >
                              {item.createDs}
                            </Typography>
                          </Box>
                          {item.systemName && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "bold",
                                color: isLast ? "white" : "#1976d2",
                                fontSize: "0.7rem",
                                bgcolor: isLast
                                  ? "rgba(255,255,255,0.2)"
                                  : (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "#1a237e"
                                        : "#e3f2fd",
                                px: 1,
                                py: 0.25,
                                borderRadius: 0.5,
                              }}
                            >
                              {item.systemName || "نامشخص"}
                            </Typography>
                          )}
                        </Box>

                        {/* Description - Compact */}
                        <Typography
                          variant="caption"
                          sx={{
                            color: isLast
                              ? "rgba(255,255,255,0.9)"
                              : (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "#e0e0e0"
                                    : "#333",
                            fontSize: "0.75rem",
                            lineHeight: 1.3,
                            display: "block",
                            mb: 1,
                            fontWeight: isLast ? "normal" : "medium",
                          }}
                        >
                          {item.description}
                        </Typography>

                        {/* Financial Summary - Horizontal Layout */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box textAlign="center" flex={1}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: isLast
                                  ? "rgba(255,255,255,0.7)"
                                  : (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "#ff9800"
                                        : "#f57c00",
                                fontSize: "0.65rem",
                                display: "block",
                                fontWeight: "bold",
                              }}
                            >
                              بدهکار
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: isLast
                                  ? "white"
                                  : (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "#ff9800"
                                        : "#f57c00",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                direction: "ltr",
                              }}
                            >
                              {addCommas(item.debit)}
                            </Typography>
                          </Box>

                          <Box textAlign="center" flex={1}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: isLast
                                  ? "rgba(255,255,255,0.7)"
                                  : (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "#4caf50"
                                        : "#2e7d32",
                                fontSize: "0.65rem",
                                display: "block",
                                fontWeight: "bold",
                                direction: "ltr",
                              }}
                            >
                              بستانکار
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: isLast
                                  ? "white"
                                  : (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "#4caf50"
                                        : "#2e7d32",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                direction: "ltr",
                              }}
                            >
                              {addCommas(item.credit)}
                            </Typography>
                          </Box>

                          <Box textAlign="center" flex={1}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: isLast
                                  ? "rgba(255,255,255,0.7)"
                                  : (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "#64b5f6"
                                        : "#1976d2",
                                fontSize: "0.65rem",
                                display: "block",
                                fontWeight: "bold",
                                direction: "ltr",
                              }}
                            >
                              مانده
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: isLast
                                  ? "white"
                                  : (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "#64b5f6"
                                        : "#1976d2",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                direction: "ltr",
                              }}
                            >
                              {addCommas(item.balance)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Selection Indicator */}
                        {selectedRow?.id === item.id && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: "#1976d2",
                              border: "1px solid white",
                            }}
                          />
                        )}
                      </Box>
                    );
                  }
                )}
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Typography variant="body2" color="textSecondary">
            تعداد رکوردها: {ledgerData?.data?.length - 1 || 0}
          </Typography>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default MechanicLedger;
