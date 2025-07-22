import { Grid2 as Grid, Paper, Pagination, useMediaQuery, useTheme } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ShoppingCart } from '@mui/icons-material';
import { toast } from 'react-toastify';
import React from 'react';
import {
    TableContainer,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Table,
    Box
} from '@mui/material';

import { getPendingRepairProductRequests, updateStatusToBuyCompleted } from '@/service/repairProductRequest/repairProductRequest.service';
import { convertGeorginaToJalaliOnlyDayByNumber, getIndexRowInPagination, parsePlateNumber } from '@/utils';
import { ProductRequestCard, Loading, PlateNumberDisplay } from '@/components';

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

    const handleBuyRequest = async (id: number) => {
        try {
            await buyRequestMutation.mutateAsync(id);
        } catch (error) {
            // Error handling is done in the mutation
        }
    };

    const renderTableRow = (request: IGetAllRepairProductRequests, index: number) => {
        const canBuy = request.statusId === 1;
        return (
            <TableRow key={index}>
                <TableCell>{getIndexRowInPagination({
                    pageQuery: currentPage,
                    pageSize: 12,
                    index
                })}</TableCell>
                <TableCell>{request.productCode}</TableCell>
                <TableCell sx={{ width: "20%" }}>{request.productName}</TableCell>
                <TableCell>{request.requestedQty}</TableCell>
                <TableCell>
                    {(() => {
                        const plateData = parsePlateNumber(request.plateNumber);
                        return plateData ? (
                            <div style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
                                <PlateNumberDisplay
                                    plateSection1={plateData.plateSection1}
                                    plateSection2={plateData.plateSection2}
                                    plateSection3={plateData.plateSection3}
                                    plateSection4={plateData.plateSection4}
                                />
                            </div>
                        ) : (
                            request.plateNumber
                        );
                    })()}
                </TableCell>
                <TableCell>{request.customerName}</TableCell>
                {/* <TableCell sx={{width :"10%"}}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {request.problemDescription || '-'}
                    </div>
                </TableCell> */}
                <TableCell>{request.requestedByUserFullname || '-'}</TableCell>
                <TableCell>{request.createDate}</TableCell>
                <TableCell>{`${request.buyRequestedByUserFullname || '-'}`}</TableCell>
                <TableCell>{`${request.buyDateTime ? convertGeorginaToJalaliOnlyDayByNumber(request.buyDateTime) : '-'}`}</TableCell>
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
                                    <TableCell>ردیف</TableCell>
                                    <TableCell>کد محصول</TableCell>
                                    <TableCell>نام محصول</TableCell>
                                    <TableCell>تعداد</TableCell>
                                    <TableCell>پلاک</TableCell>
                                    <TableCell>مشتری</TableCell>
                                    {/* <TableCell>شرح مشکل</TableCell> */}
                                    <TableCell>درخواست کننده</TableCell>
                                    <TableCell>تاریخ درخواست</TableCell>
                                    <TableCell>خریدار</TableCell>
                                    <TableCell>تاریخ خرید</TableCell>
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
            )}
        </Box>
    );
};

export default ProductRequests; 