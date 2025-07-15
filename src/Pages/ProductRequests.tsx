import { Grid2 as Grid, Paper, Pagination, useMediaQuery, useTheme } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment-jalaali';
import React from 'react';
import {
    TableContainer,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Table,
    Chip,
    Box
} from '@mui/material';
import {
    ShoppingCart,
    CheckCircle,
    Warning,
    Cancel,
    Info,
    Error
} from '@mui/icons-material';

import { getPendingRepairProductRequests, updateStatusToBuyCompleted } from '@/service/repairProductRequest/repairProductRequest.service';
import { ProductRequestCard, Loading } from '@/components';

const ProductRequests: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1');
    const queryClient = useQueryClient();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const { data: requestsData, isLoading } = useQuery({
        queryKey: ["productRequests", currentPage],
        queryFn: () => getPendingRepairProductRequests({
            page: currentPage,
            size: 12,
        }),
    });
    const buyRequestMutation = useMutation({
        mutationFn: updateStatusToBuyCompleted,
        onSuccess: (data: any) => {
            if (data?.isSuccess) {

                queryClient.invalidateQueries({ queryKey: ["productRequests"] });
                toast.success(data?.message);
            } else {
                toast.error(data?.message);
            }
        },
        onError: () => {
            toast.error("خطا در تایید خرید کالا");
        },
    });

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setSearchParams({ page: value.toString() });
    };

    const getStatusConfig = (statusId: number) => {
        switch (statusId) {
            case 0:
                return { label: 'درخواست شده', color: 'warning' as const, icon: <Warning /> };
            case 1:
                return { label: 'درخواست خرید شده', color: 'info' as const, icon: <Info /> };
            case 2:
                return { label: 'خرید انجام شد', color: 'success' as const, icon: <CheckCircle /> };
            case 3:
                return { label: 'عدم موفقیت در خرید', color: 'error' as const, icon: <Error /> };
            case 4:
                return { label: 'انصراف', color: 'error' as const, icon: <Cancel /> };
            case 5:
                return { label: 'تحویل شده', color: 'success' as const, icon: <CheckCircle /> };
            default:
                return { label: 'نامشخص', color: 'default' as const, icon: <Info /> };
        }
    };

    const handleBuyRequest = async (id: number) => {
        try {
            await buyRequestMutation.mutateAsync(id);
        } catch (error) {
            // Error handling is done in the mutation
        }
    };

    const renderTableRow = (request: IGetAllRepairProductRequests, index: number) => {
        const statusConfig = getStatusConfig(request.statusId);
        const canBuy = request.statusId === 1;

        return (
            <TableRow key={index}>
                <TableCell>{request.productCode}</TableCell>
                <TableCell>{request.productName}</TableCell>
                <TableCell>{request.requestedQty}</TableCell>
                <TableCell>{request.plateNumber}</TableCell>
                <TableCell>{request.requestedByUserFullname}</TableCell>
                <TableCell>
                    {request.createDate}
                </TableCell>
                <TableCell>{request.buyRequestedByUserFullname || '-'}</TableCell>
                <TableCell>{request.buyRequestedByUserFullname || '-'}</TableCell>
                <TableCell>
                    {request.buyDateTime ? moment(request.buyDateTime).format('jYYYY/jM/jD') : '-'}
                </TableCell>
                <TableCell>
                    <Chip
                        label={statusConfig.label}
                        color={statusConfig.color}
                        icon={statusConfig.icon}
                        size="small"
                        variant="filled"
                    />
                </TableCell>
                <TableCell>
                    <Button
                        onClick={() => handleBuyRequest(request.requestedId)}
                        disabled={!canBuy || buyRequestMutation.isPending}
                        startIcon={<ShoppingCart />}
                        variant="contained"
                        color="success"
                        size="small"
                    >
                        {canBuy ? 'تایید خرید' : 'خریداری شده'}
                    </Button>
                </TableCell>
            </TableRow>
        );
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <Box className="product-requests-container mt-5">
            {isMobile ? (
                <>
                    <Grid container spacing={3}>
                        {requestsData?.data?.values?.map((request: IGetAllRepairProductRequests, index: number) => (
                            <Grid key={index} size={{ xs: 12, sm: 6 }}>
                                <ProductRequestCard
                                    request={request}
                                    onBuyRequest={() => handleBuyRequest(request.requestedId)}
                                    isLoading={buyRequestMutation.isPending}
                                />
                            </Grid>
                        ))}
                    </Grid>
                    {requestsData?.data?.totalPage && requestsData?.data?.totalPage > 1 && (
                        <Paper className="pagination-container flex justify-center mt-12 p-3 rounded">
                            <Pagination
                                count={requestsData?.data?.totalPage}
                                onChange={handlePageChange}
                                page={currentPage}
                                boundaryCount={1}
                                siblingCount={1}
                                color="primary"
                                size="large"
                            />
                        </Paper>
                    )}
                </>
            ) : (
                <>
                    <TableContainer component={Paper} className="table-container">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>کد محصول</TableCell>
                                    <TableCell>نام محصول</TableCell>
                                    <TableCell>تعداد</TableCell>
                                    <TableCell>پلاک</TableCell>
                                    <TableCell>مشتری</TableCell>
                                    <TableCell>تاریخ درخواست</TableCell>
                                    <TableCell>درخواست کننده</TableCell>
                                    <TableCell>خریدار</TableCell>
                                    <TableCell>تاریخ خرید</TableCell>
                                    <TableCell>وضعیت</TableCell>
                                    <TableCell>عملیات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requestsData?.data?.values?.map((request: IGetAllRepairProductRequests, index: number) => renderTableRow(request, index))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {requestsData?.data?.totalPage && requestsData?.data?.totalPage > 1 && (
                        <Paper className="pagination-container flex justify-center mt-12 p-3 rounded">
                            <Pagination
                                count={requestsData?.data?.totalPage}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                siblingCount={1}
                                boundaryCount={1}
                            />
                        </Paper>
                    )}
                </>
            )}
        </Box>
    );
};

export default ProductRequests; 