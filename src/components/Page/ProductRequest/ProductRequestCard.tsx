import moment from "moment-jalaali";
import React from "react";
import {
    LocalShipping,
    ShoppingCart,
    CheckCircle,
    Inventory,
    DateRange,
    Person,
} from "@mui/icons-material";
import {
    Grid,
    CardContent,
    CardActions,
    Typography,
    useTheme,
    Divider,
    Button,
    Chip,
    Card,
    Box,
} from "@mui/material";

interface ProductRequestCardProps {
    onBuyRequest: () => void;
    request: IGetAllRepairProductRequests;
    isLoading: boolean;
}

export const ProductRequestCard: React.FC<ProductRequestCardProps> = ({
    onBuyRequest,
    request,
    isLoading,
}) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        try {
            return moment(dateString).format("jYYYY/jMM/jDD");
        } catch {
            return "-";
        }
    };
    const getStatusColor = (statusId: number) => {
        switch (statusId) {
            case 0: // درخواست شده
                return "warning";
            case 1: // درخواست خرید شده
                return "info";
            case 2: // خرید انجام شد
                return "success";
            case 3: // عدم موفقیت در خرید
                return "error";
            case 4: // انصراف
                return "error";
            case 5: // تحویل شده
                return "success";
            default:
                return "default";
        }
    };
    const getStatusIcon = (statusId: number) => {
        switch (statusId) {
            case 0: // درخواست شده
                return <Inventory fontSize="small" />;
            case 1: // درخواست خرید شده
                return <ShoppingCart fontSize="small" />;
            case 2: // خرید انجام شد
                return <CheckCircle fontSize="small" />;
            case 3: // عدم موفقیت در خرید
                return <LocalShipping fontSize="small" />;
            case 4: // انصراف
                return <LocalShipping fontSize="small" />;
            case 5: // تحویل شده
                return <LocalShipping fontSize="small" />;
            default:
                return <Inventory fontSize="small" />;
        }
    };
    const isPurchased = request.buyDateTime && request.buyDateTime !== "";
    const canBuy = request.statusId === 1;
    return (
        <Card
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
                boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.1)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: isDarkMode ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.15)",
                },
            }}
        >
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="h3" fontWeight="bold">
                        {request.productName}
                    </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip
                        label={request.statusDescription}
                        color={getStatusColor(request.statusId)}
                        icon={getStatusIcon(request.statusId)}
                        size="small"
                        variant="outlined"
                    />
                </Box>
                <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        کد کالا: {request.productCode}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Inventory fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                تعداد:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {request.requestedQty}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Person fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                درخواست:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" noWrap>
                                {request.requestedByUserFullname}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                <Box mt={2}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <DateRange fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                    تاریخ درخواست:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {formatDate(request.createDate)}
                                </Typography>
                            </Box>
                        </Grid>
                        {isPurchased && (
                            <Grid size={{ xs: 12 }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <ShoppingCart fontSize="small" color="success" />
                                    <Typography variant="body2" color="text.secondary">
                                        خرید شده توسط:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium" color="success.main">
                                        {request.buyRequestedByUserFullname}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                                    تاریخ خرید: {formatDate(request.buyDateTime)}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Box>
                {request.problemDescription && (
                    <Box mt={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            شرح مشکل:
                        </Typography>
                        <Typography variant="body2" sx={{
                            backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                            padding: 1,
                            borderRadius: 1,
                            fontSize: '0.875rem'
                        }}>
                            {request.problemDescription}
                        </Typography>
                    </Box>
                )}
                {request.rejectReason && (
                    <Box mt={2}>
                        <Typography variant="body2" color="error" gutterBottom>
                            دلیل رد درخواست:
                        </Typography>
                        <Typography variant="body2" color="error" sx={{
                            backgroundColor: "rgba(211, 47, 47, 0.1)",
                            padding: 1,
                            borderRadius: 1,
                            fontSize: '0.875rem'
                        }}>
                            {request.rejectReason}
                        </Typography>
                    </Box>
                )}
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                    variant="contained"
                    color={canBuy ? "success" : "primary"}
                    startIcon={<ShoppingCart />}
                    onClick={onBuyRequest}
                    disabled={!canBuy || isLoading}
                    fullWidth
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: "medium",
                    }}
                >
                    {canBuy ? 'تایید خرید' : 'خریداری شده'}
                </Button>
            </CardActions>
        </Card>
    );
};

export default ProductRequestCard; 