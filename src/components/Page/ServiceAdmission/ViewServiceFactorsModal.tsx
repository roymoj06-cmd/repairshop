import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Close as CloseIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon
} from "@mui/icons-material";
import { useState } from "react";
import { toast } from "react-toastify";
import {
    AccordionSummary,
    AccordionDetails,
    TableContainer,
    DialogContent,
    useMediaQuery,
    DialogTitle,
    IconButton,
    Typography,
    TableBody,
    TableCell,
    TableHead,
    Accordion,
    TableRow,
    useTheme,
    Dialog,
    Table,
    Paper,
    Card,
    Box,
    Chip,
} from "@mui/material";

import { getAllRepairServiceFactor, deleteRepairServiceFactor } from "@/service/repairServiceFactor/repairServiceFactor.service";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";
import { Loading, EmptyList, ConfirmDialog } from "@/components";
import { addCommas } from "@/utils";

interface ViewServiceFactorsModalProps {
    repairReceptionId: number;
    onClose: () => void;
    open: boolean;
}

const ViewServiceFactorsModal: React.FC<ViewServiceFactorsModalProps> = ({
    repairReceptionId,
    onClose,
    open,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const queryClient = useQueryClient();
    const [deleteConfirm, setDeleteConfirm] = useState<{
        open: boolean;
        factorId: number | null;
        factorCode: number | null;
    }>({
        open: false,
        factorId: null,
        factorCode: null,
    });

    const { data: factorsData, isLoading } = useQuery({
        queryKey: ["getAllRepairServiceFactor", repairReceptionId],
        queryFn: () => getAllRepairServiceFactor(repairReceptionId),
        enabled: open && !!repairReceptionId,
    });

    const deleteFactorMutation = useMutation({
        mutationFn: deleteRepairServiceFactor,
        onSuccess: (data: any) => {
            if (data?.isSuccess) {
                toast.success(data?.message || "فاکتور با موفقیت حذف شد");
                queryClient.invalidateQueries({
                    queryKey: ["getAllRepairServiceFactor", repairReceptionId],
                });
            } else {
                toast.error(data?.message || "خطا در حذف فاکتور");
            }
        },
        onError: (_: any) => {
            toast.error("خطا در حذف فاکتور");
        },
    });

    const handleDeleteFactor = (factorId: number, factorCode: number) => {
        setDeleteConfirm({
            open: true,
            factorId,
            factorCode,
        });
    };

    const confirmDelete = () => {
        if (deleteConfirm.factorId) {
            deleteFactorMutation.mutate(deleteConfirm.factorId);
            setDeleteConfirm({ open: false, factorId: null, factorCode: null });
        }
    };

    const renderFactorDetails = (factor: IGetAllRepairServiceFactor) => {
        if (isMobile) {
            return (
                <Box sx={{ p: 2 }}>
                    {factor.details.map((detail, index) => (
                        <Card key={index} sx={{ mb: 2, p: 2 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        سرویس:
                                    </Typography>
                                    <Typography variant="body2">
                                        {detail.overridedServiceTitle || detail.serviceTitle}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        مکانیک:
                                    </Typography>
                                    <Typography variant="body2">
                                        {detail.mechanicName}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        تعداد:
                                    </Typography>
                                    <Typography variant="body2">
                                        {detail.serviceCount}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        قیمت واحد:
                                    </Typography>
                                    <Typography variant="body2">
                                        {addCommas(detail.unitPrice)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        قیمت کل:
                                    </Typography>
                                    <Typography variant="body2">
                                        {addCommas(detail.totalPrice)}
                                    </Typography>
                                </Box>
                                {detail.problemDescription && (
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            بابت مشکل:
                                        </Typography>
                                        <Typography variant="body2" sx={{ maxWidth: "60%" }}>
                                            {detail.problemDescription}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Card>
                    ))}
                    
                    {/* کارت مجموع برای موبایل */}
                    <Card sx={{ mt: 2, p: 2, backgroundColor: 'grey.100' }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                مجموع فاکتور:
                            </Typography>
                            <Typography variant="subtitle2" fontWeight="bold">
                                {addCommas(factor.totalPrice)}
                            </Typography>
                        </Box>
                    </Card>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>سرویس</TableCell>
                            <TableCell>مکانیک</TableCell>
                            <TableCell>تعداد</TableCell>
                            <TableCell>قیمت واحد</TableCell>
                            <TableCell>قیمت کل</TableCell>
                            <TableCell>بابت مشکل</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {factor.details.map((detail, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    {detail.overridedServiceTitle || detail.serviceTitle}
                                </TableCell>
                                <TableCell>{detail.mechanicName}</TableCell>
                                <TableCell>{detail.serviceCount}</TableCell>
                                <TableCell>{addCommas(detail.unitPrice)}</TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {addCommas(detail.totalPrice)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {detail.problemDescription && (
                                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                            {detail.problemDescription}
                                        </Typography>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {/* ردیف مجموع */}
                        <TableRow sx={{ backgroundColor: 'grey.100', fontWeight: 'bold' }}>
                            <TableCell colSpan={4} align="right">
                                <Typography variant="subtitle2" fontWeight="bold">
                                    مجموع فاکتور:
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {addCommas(factor.totalPrice)}
                                </Typography>
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderFactorSummary = (factor: IGetAllRepairServiceFactor) => (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                    شماره فاکتور: {factor.code}
                </Typography>
                <Chip
                    label={`${addCommas(factor.totalPrice)}`}
                    color="primary"
                    size="small"
                />
            </Box>
            <AccessGuard accessId={ACCESS_IDS.DELETE_FACTOR_REPAIR}>
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFactor(factor.id, factor.code);
                    }}
                    color="error"
                    size="small"
                    disabled={deleteFactorMutation.isPending}
                >
                    <DeleteIcon />
                </IconButton>
            </AccessGuard>
        </Box>
    );

    return (
        <Dialog
            onClose={onClose}
            open={open}
            fullScreen={isMobile}
            fullWidth
            maxWidth="lg"
            PaperProps={{
                sx: { minHeight: isMobile ? "100vh" : "80vh" },
            }}
        >
            {isLoading && <Loading />}

            <DialogTitle
                sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    display: "flex",
                    m: 0,
                    p: 2,
                }}
            >
                <Typography variant="h6" fontSize={12}>
                    مشاهده فاکتورهای خدمات
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

            <DialogContent dividers>
                {factorsData?.isSuccess && factorsData.data && factorsData.data.length > 0 ? (
                    <Box sx={{ p: 2 }}>
                        <Accordion defaultExpanded sx={{ boxShadow: "none" }}>
                            {factorsData.data.map((factor: IGetAllRepairServiceFactor, index: number) => (
                                <Accordion
                                    key={factor.id}
                                    sx={{
                                        mb: 0.5,
                                        "&:not(:last-child)": {
                                            mb: 0.5,
                                        },
                                    }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        {renderFactorSummary(factor)}
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {renderFactorDetails(factor)}
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Accordion>
                    </Box>
                ) : (
                    <EmptyList />
                )}
            </DialogContent>

            <ConfirmDialog
                message={`آیا مطمئن هستید که می‌خواهید این فاکتور را حذف کنید؟شماره فاکتور: ${deleteConfirm.factorCode}`}
                onCancel={() =>
                    setDeleteConfirm({ open: false, factorId: null, factorCode: null })
                }
                loading={deleteFactorMutation.isPending}
                open={deleteConfirm.open}
                onConfirm={confirmDelete}
                title="حذف فاکتور"
            />
        </Dialog>
    );
};

export default ViewServiceFactorsModal; 