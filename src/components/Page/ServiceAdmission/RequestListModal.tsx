import { Close, Visibility, QrCodeScanner, Image, Download, CameraAlt, Keyboard } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
    CircularProgress,
    TableContainer,
    DialogContent,
    DialogActions,
    useMediaQuery,
    Grid2 as Grid,
    DialogTitle,
    CardContent,
    CardActions,
    Typography,
    IconButton,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    useTheme,
    Dialog,
    Table,
    Paper,
    Box,
    Chip,
    Card,
} from '@mui/material';

import { addApprovedProductsToReceptionDirect, getProductDetailsByProblem } from '@/service/repairProductRequest/repairProductRequest.service';
import { getMechanicProductRequestByProblemId } from '@/service/RepairMechanicProductRequest/RepairMechanicProductRequest.service';
import { getCustomerProblems } from '@/service/repairServices/repairServices.service';
import { Button, Loading, EmptyList } from '@/components';
import CameraBarcodeScanner from './CameraBarcodeScanner';
import { getFileSource } from '@/utils';

interface RequestListModalProps {
    open?: boolean;
    onClose?: () => void;
    showModal?: boolean;
    setShowModal?: (show: boolean) => void;
    repairReceptionId?: string;
    onScanProduct?: (problemId: number) => void;
    onRefresh?: () => void;
}
interface MechanicRequestModalProps {
    open: boolean;
    onClose: () => void;
    problemId: number | null;
    problemDescription?: string;
}
interface ScanProductModalProps {
    open: boolean;
    onClose: () => void;
    problemId: number | null;
    problemDescription?: string;
}

// Component to display uploaded image with preview modal
const ImageDisplay: FC<{
    variant?: 'mobile' | 'desktop';
    productTitle: string;
    showLabel?: boolean;
    fileId: number;
}> = ({
    variant = 'mobile',
    showLabel = true,
    productTitle,
    fileId,
}) => {
        const [imageError, setImageError] = useState(false);
        const [showPreview, setShowPreview] = useState(false);

        if (!fileId || fileId === 0) {
            if (variant === 'desktop') {
                return (
                    <Typography variant="body2" color="text.secondary">
                        بدون تصویر
                    </Typography>
                );
            }
            return null;
        }

        const imageUrl = getFileSource(fileId);

        const handleDownload = () => {
            try {
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `${productTitle}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('دانلود شروع شد');
            } catch (error) {
                toast.error('خطا در دانلود فایل');
            }
        };

        const renderImage = () => {
            if (variant === 'mobile') {
                return (
                    <Box
                        sx={{
                            width: 50,
                            height: 50,
                            border: '2px solid #e0e0e0',
                            borderRadius: 1,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                                border: '2px solid #1976d2',
                            }
                        }}
                        onClick={() => !imageError && setShowPreview(true)}
                    >
                        {imageError ? (
                            <Image sx={{ color: '#ccc' }} />
                        ) : (
                            <img
                                src={imageUrl}
                                alt={productTitle}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                                onError={() => setImageError(true)}
                            />
                        )}
                    </Box>
                );
            } else {
                // Desktop variant
                return (
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            '&:hover': {
                                border: '1px solid #1976d2',
                            }
                        }}
                        onClick={() => !imageError && setShowPreview(true)}
                    >
                        {imageError ? (
                            <Image sx={{ color: '#ccc' }} />
                        ) : (
                            <img
                                src={imageUrl}
                                alt={productTitle}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                                onError={() => setImageError(true)}
                            />
                        )}
                    </Box>
                );
            }
        };

        return (
            <>
                <Box sx={{
                    display: variant === 'mobile' ? 'inline-flex' : 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: variant === 'mobile' ? 1 : 0,
                    flexDirection: variant === 'mobile' ? 'row' : 'column'
                }}>
                    {renderImage()}
                    {showLabel && variant === 'mobile' && (
                        <Typography variant="caption" color="text.secondary">
                            {imageError ? 'خطا در بارگیری تصویر' : 'تصویر کالا'}
                        </Typography>
                    )}
                </Box>

                {/* Image Preview Modal */}
                <Dialog
                    open={showPreview}
                    onClose={() => setShowPreview(false)}
                    maxWidth="md"
                    fullWidth
                    sx={{
                        zIndex: 2000,
                        '& .MuiDialog-paper': {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        }
                    }}
                >
                    <DialogContent
                        sx={{
                            p: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '400px',
                            position: 'relative',
                        }}
                    >
                        <IconButton
                            onClick={() => setShowPreview(false)}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                color: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                }
                            }}
                        >
                            <Close />
                        </IconButton>
                        <IconButton
                            onClick={handleDownload}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                color: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                }
                            }}
                        >
                            <Download />
                        </IconButton>
                        <img
                            src={imageUrl}
                            alt={productTitle}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                            }}
                            onError={() => setImageError(true)}
                        />
                    </DialogContent>
                    <DialogActions
                        sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            color: 'white',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="body2" sx={{ color: 'white' }}>
                            {productTitle}
                        </Typography>
                        <Button
                            startIcon={<Download />}
                            onClick={handleDownload}
                            sx={{ color: 'white' }}
                        >
                            دانلود
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    };
const ScanProductModal: FC<ScanProductModalProps> = ({
    problemDescription,
    problemId,
    onClose,
    open,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('lg'));
    const barcodeInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const [scanMode, setScanMode] = useState<"keyboard" | "camera">("keyboard");
    const [currentBarcode, setCurrentBarcode] = useState<string>("");
    const [isScanning, setIsScanning] = useState<boolean>(false);

    // Get scanned products for this problem
    const { data: scannedProducts } = useQuery({
        queryKey: ['scannedProducts', problemId],
        queryFn: () => getProductDetailsByProblem(problemId!),
        enabled: !!problemId && open,
        select: (data) => data?.data || []
    });

    const addApprovedProductMutation = useMutation({
        mutationFn: addApprovedProductsToReceptionDirect,
        onSuccess: (data: any) => {
            if (data?.isSuccess) {
                toast.success(data?.message || "کالا با موفقیت اضافه شد");
                // Refresh scanned products list
                queryClient.invalidateQueries({
                    queryKey: ["scannedProducts", problemId],
                });
            } else {
                toast.error(data?.message || "خطا در اضافه کردن کالا");
            }
            setCurrentBarcode("");
            setIsScanning(false);
        },
        onError: (_: any) => {
            toast.error("خطا در ارتباط با سرور");
            setCurrentBarcode("");
            setIsScanning(false);
        },
    });
    const handleScanBarcode = useCallback(
        (barcode: string) => {
            if (!problemId) {
                toast.error("مشکل انتخاب نشده است");
                return;
            }
            setCurrentBarcode(barcode);
            setIsScanning(true);
            addApprovedProductMutation.mutate({
                problemId: problemId,
                barcode: barcode,
            });
        },
        [problemId, addApprovedProductMutation]
    );
    const handleCameraScan = useCallback(
        (barcode: string) => {
            handleScanBarcode(barcode);
        },
        [handleScanBarcode]
    );
    const handleCloseCameraScanner = useCallback(() => {
        setScanMode("keyboard");
    }, []);
    const handleBarcodeInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setCurrentBarcode(value);

            // اگر بارکد به Enter ختم شود (دستگاه بارکد خوان معمولاً Enter می‌زند)
            if (value.includes('\n') || value.includes('\r')) {
                const cleanBarcode = value.replace(/[\r\n]/g, '').trim();
                if (cleanBarcode) {
                    handleScanBarcode(cleanBarcode);
                    setCurrentBarcode("");
                    if (barcodeInputRef.current) {
                        barcodeInputRef.current.value = "";
                    }
                }
            }
        },
        [handleScanBarcode]
    );
    const handleBarcodeInputKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
                event.preventDefault();
                const barcode = currentBarcode.trim();
                if (barcode) {
                    handleScanBarcode(barcode);
                    setCurrentBarcode("");
                    if (barcodeInputRef.current) {
                        barcodeInputRef.current.value = "";
                    }
                }
            }
        },
        [currentBarcode, handleScanBarcode]
    );
    useEffect(() => {
        if (open && scanMode === "keyboard" && barcodeInputRef.current) {
            setTimeout(() => {
                barcodeInputRef.current?.focus();
            }, 100);
        }
    }, [open, scanMode]);
    useEffect(() => {
        if (!open) {
            setCurrentBarcode("");
            setIsScanning(false);
            setScanMode("keyboard");
            // Clear the input field when modal closes
            if (barcodeInputRef.current) {
                barcodeInputRef.current.value = "";
            }
        }
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            fullScreen={isMobile}
            sx={{ zIndex: 1500 }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: isMobile ? '1rem' : '1.25rem',
                    padding: isMobile ? '12px 16px' : '16px 24px'
                }}
            >
                <Typography variant="h6" component="div">
                    اسکن کالا برای مشکل: {problemDescription}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ padding: isMobile ? '8px' : '16px' }}>
                {addApprovedProductMutation.isPending ? (
                    <Loading />
                ) : (
                    <>
                        <Box sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 1, position: "relative" }}>
                            {/* Toggle buttons for scan mode */}
                            <Box sx={{ display: "flex", gap: 1, mb: 2, justifyContent: "center" }}>
                                <Button
                                    variant={scanMode === "keyboard" ? "contained" : "outlined"}
                                    onClick={() => setScanMode("keyboard")}
                                    startIcon={<Keyboard />}
                                    size="small"
                                >
                                    اسکنر
                                </Button>
                                <Button
                                    variant={scanMode === "camera" ? "contained" : "outlined"}
                                    onClick={() => setScanMode("camera")}
                                    startIcon={<CameraAlt />}
                                    size="small"
                                >
                                    دوربین
                                </Button>
                            </Box>

                            {/* Keyboard Scanner */}
                            {scanMode === "keyboard" && (
                                <>
                                    {/* Hidden input for barcode scanner */}
                                    <input
                                        onKeyDown={handleBarcodeInputKeyDown}
                                        onChange={handleBarcodeInputChange}
                                        ref={barcodeInputRef}
                                        name="barcode"
                                        type="text"
                                        style={{
                                            overflow: "hidden !important",
                                            pointerEvents: 'none',
                                            position: 'absolute',
                                            bottom: "15px",
                                            opacity: 0,
                                            right: "0",
                                            left: "0",
                                        }}
                                        autoFocus
                                    />

                                    {isScanning ? (
                                        <Box sx={{ textAlign: "center" }}>
                                            <CircularProgress size={24} sx={{ mb: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                در حال پردازش بارکد...
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: "center", cursor: "pointer" }} onClick={() => barcodeInputRef.current?.focus()}>
                                            <Typography variant="body1" sx={{ mb: 1 }}>
                                                آماده برای اسکن بارکد با دستگاه بارکد خوان
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                کلیک کنید و سپس بارکد کالا را اسکن کنید
                                            </Typography>
                                            {currentBarcode && (
                                                <Typography variant="body2" sx={{
                                                    mt: 1,
                                                    fontFamily: "monospace",
                                                    backgroundColor: "#f5f5f5",
                                                    padding: "4px 8px",
                                                    borderRadius: "4px",
                                                    display: "inline-block"
                                                }}>
                                                    {currentBarcode}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </>
                            )}

                            {/* Camera Scanner */}
                            {scanMode === "camera" && (
                                <CameraBarcodeScanner
                                    isActive={true}
                                    onScan={handleCameraScan}
                                    onClose={handleCloseCameraScanner}
                                />
                            )}
                        </Box>

                        {/* Scanned Products List */}
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                                کالاهای اسکن شده ({scannedProducts?.length || 0})
                            </Typography>

                            {!scannedProducts?.length ? (
                                <Box sx={{ p: 3, border: "1px dashed #ccc", borderRadius: 1, textAlign: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        هنوز کالایی اسکن نشده است
                                    </Typography>
                                </Box>
                            ) : isMobileOrTablet ? (
                                // Mobile & Tablet Card View
                                <Grid container spacing={2}>
                                    {scannedProducts.map((product: IGetProductDetailsByProblem, index: number) => (
                                        <Grid size={{ xs: 12, }} key={product.repairReceptionDetailId || index}>
                                            <Card variant="outlined" sx={{ borderColor: 'success.main', borderWidth: 2 }}>
                                                <CardContent>
                                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                        <Box flex={1}>
                                                            <Typography variant="subtitle1" color="primary" gutterBottom>
                                                                {product.productName}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                کد محصول: {product.productCode}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                برند: {product.brand}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                کشور: {product.countryName}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                بارکد: {product.productCode} - {product.barcodeCode}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                شماره فنی: {product.partNumber}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                // Desktop Table View
                                <TableContainer component={Paper} sx={{ maxHeight: '50vh', border: '2px solid', borderColor: 'success.main' }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">ردیف</TableCell>
                                                <TableCell align="center">کد کالا</TableCell>
                                                <TableCell align="center">نام محصول</TableCell>
                                                <TableCell align="center">برند</TableCell>
                                                <TableCell align="center">کشور</TableCell>
                                                <TableCell align="center">شماره فنی</TableCell>
                                                <TableCell align="center">بارکد</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {scannedProducts.map((product: IGetProductDetailsByProblem, index: number) => (
                                                <TableRow key={product.repairReceptionDetailId || index} hover>
                                                    <TableCell align="center">
                                                        <Typography variant="body2">
                                                            {index + 1}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography variant="body2">
                                                            {product?.productCode}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography variant="body2" color="primary">
                                                            {product.productName}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography variant="body2">
                                                            {product.brand}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography variant="body2">
                                                            {product.countryName}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography variant="body2">
                                                            {product.partNumber}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography variant="body2">
                                                            {product.productCode} - {product.barcodeCode}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ padding: isMobile ? '8px 16px' : '16px 24px' }}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    size={isMobile ? 'small' : 'medium'}
                >
                    بستن
                </Button>
            </DialogActions>
        </Dialog>
    );
};
const MechanicRequestModal: FC<MechanicRequestModalProps> = ({
    problemDescription,
    problemId,
    onClose,
    open,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { data: requestsData, isLoading } = useQuery({
        queryKey: ['mechanicProductRequests', problemId],
        queryFn: () => getMechanicProductRequestByProblemId(problemId!),
        enabled: !!problemId && open,
        select: (data) => data?.data || []
    });

    return (
        <Dialog
            sx={{ zIndex: 1400 }}
            fullScreen={isMobile}
            onClose={onClose}
            maxWidth="md"
            open={open}
            fullWidth
        >
            <DialogTitle
                sx={{
                    padding: isMobile ? '12px 16px' : '16px 24px',
                    fontSize: isMobile ? '1rem' : '1.25rem',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    display: 'flex',
                }}
            >
                <Typography variant="h6" component="div">
                    درخواست‌ های مکانیک - {problemDescription}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ padding: isMobile ? '8px' : '16px' }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <Loading />
                    </Box>
                ) : !requestsData?.length ? (
                    <EmptyList message="هیچ درخواستی برای این مشکل ثبت نشده است" />
                ) : isMobile ? (
                    // Mobile Card View
                    <Grid container spacing={2}>
                        {requestsData.map((request: IGetMechanicProductRequestByProblemId, index: number) => (
                            <Grid size={{ xs: 12 }} key={request.id || index}>
                                <Card variant="outlined">
                                    <CardContent sx={{ pb: 1 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                            <Box flex={1}>
                                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                                    {request.productTitle}
                                                </Typography>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2" color="text.secondary">
                                                        وضعیت:
                                                    </Typography>
                                                    <Chip
                                                        label={request.registered ? 'ثبت شده' : 'در انتظار'}
                                                        color={request.registered ? 'success' : 'warning'}
                                                        size="small"
                                                    />
                                                </Box>
                                            </Box>
                                            <Box ml={2}>
                                                <ImageDisplay
                                                    fileId={request.fileId}
                                                    productTitle={request.productTitle}
                                                    variant="mobile"
                                                    showLabel={false}
                                                />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    // Desktop Table View
                    <TableContainer component={Paper} sx={{ maxHeight: '60vh' }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">ردیف</TableCell>
                                    <TableCell align="center">عنوان محصول</TableCell>
                                    <TableCell align="center">مستندات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requestsData.map((request: IGetMechanicProductRequestByProblemId, index: number) => (
                                    <TableRow key={request.id || index} hover>
                                        <TableCell align="center">{index + 1}</TableCell>
                                        <TableCell align="center">{request.productTitle}</TableCell>
                                        <TableCell align="center">
                                            <ImageDisplay
                                                fileId={request.fileId}
                                                productTitle={request.productTitle}
                                                variant="desktop"
                                                showLabel={false}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>

            <DialogActions sx={{ padding: isMobile ? '8px 16px' : '16px 24px' }}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    size={isMobile ? 'small' : 'medium'}
                >
                    بستن
                </Button>
            </DialogActions>
        </Dialog>
    );
};
const RequestListModal: FC<RequestListModalProps> = ({
    repairReceptionId,
    onScanProduct,
    setShowModal,
    showModal,
    onClose,
    open,
}) => {
    const theme = useTheme();
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isOpen = open !== undefined ? open : (showModal || false);
    const handleClose = onClose || (() => setShowModal?.(false));
    const [mechanicRequestModal, setMechanicRequestModal] = useState<{
        open: boolean;
        problemId: number | null;
        problemDescription?: string;
    }>({
        open: false,
        problemId: null,
        problemDescription: undefined
    });

    const [scanProductModal, setScanProductModal] = useState<{
        open: boolean;
        problemId: number | null;
        problemDescription?: string;
    }>({
        open: false,
        problemId: null,
        problemDescription: undefined
    });
    const { data: problemsData, isLoading } = useQuery({
        queryKey: ['customerProblems', repairReceptionId],
        queryFn: () =>
            getCustomerProblems({
                repairReceptionId: repairReceptionId || '',
                size: 100,
                page: 1,
            }),
        enabled: !!repairReceptionId && isOpen,
        select: (data) => data?.data?.values || [],
    });
    const handleShowRequests = (problemId: number, problemDescription: string) => {
        setMechanicRequestModal({
            open: true,
            problemId,
            problemDescription
        });
    };
    const handleCloseMechanicModal = () => {
        setMechanicRequestModal({
            open: false,
            problemId: null,
            problemDescription: undefined
        });
    };
    const handleScanProduct = (problemId: number, problemDescription?: string) => {
        setScanProductModal({
            open: true,
            problemId,
            problemDescription
        });

        if (onScanProduct) {
            onScanProduct(problemId);
        }
    };

    const handleCloseScanModal = () => {
        setScanProductModal({
            open: false,
            problemId: null,
            problemDescription: undefined
        });
    };

    return (
        <>
            <Dialog
                onClose={handleClose}
                fullScreen={isMobile}
                sx={{ zIndex: 1300 }}
                open={isOpen}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle
                    sx={{
                        padding: isMobile ? '12px 16px' : '16px 24px',
                        fontSize: isMobile ? '1rem' : '1.25rem',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        display: 'flex',
                    }}
                >
                    <Typography variant="h6" component="div">
                        لیست درخواست‌های مکانیک
                    </Typography>
                    <IconButton onClick={handleClose} size="small">
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ padding: isMobile ? '8px' : '16px' }}>
                    {isLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <Loading />
                        </Box>
                    ) : !problemsData?.length ? (
                        <EmptyList message="هیچ مشکلی برای این پذیرش ثبت نشده است" />
                    ) : isMobile || isTablet ? (
                        // Mobile & Tablet Card View
                        <Grid container spacing={2}>
                            {problemsData.map((problem: any, index: number) => (
                                <Grid size={{ xs: 12 }} key={problem.id || index}>
                                    <Card variant="outlined" sx={{ position: 'relative' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" gutterBottom>
                                                مشکل #{problem.id}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {problem.description}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<Visibility />}
                                                onClick={() => handleShowRequests(problem.id, problem.description)}
                                                sx={{ mr: 1 }}
                                            >
                                                درخواست‌ها
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<QrCodeScanner />}
                                                onClick={() => handleScanProduct(problem.id, problem.description)}
                                                color="secondary"
                                            >
                                                اسکن کالا
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        // Desktop Table View
                        <TableContainer component={Paper} className="table-container">
                            <Table size="medium" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">ردیف</TableCell>
                                        <TableCell align="center">شرح مشکل</TableCell>
                                        <TableCell align="center">عملیات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {problemsData.map((problem: any, index: number) => (
                                        <TableRow key={problem.id || index} hover>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight="medium">
                                                    {index + 1}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2">
                                                    {problem.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box display="flex" gap={1} justifyContent="center">
                                                    <Button
                                                        onClick={() => handleShowRequests(problem.id, problem.description)}
                                                        startIcon={<Visibility />}
                                                        variant="outlined"
                                                        size="small"
                                                    >
                                                        مشاهده درخواست‌ها
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleScanProduct(problem.id, problem.description)}
                                                        startIcon={<QrCodeScanner />}
                                                        variant="contained"
                                                        color="secondary"
                                                        size="small"
                                                    >
                                                        اسکن کالا
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>

                <DialogActions sx={{ padding: isMobile ? '8px 16px' : '16px 24px' }}>
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                        size={isMobile ? 'small' : 'medium'}
                    >
                        بستن
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Mechanic Request Modal */}
            <MechanicRequestModal
                problemDescription={mechanicRequestModal.problemDescription}
                problemId={mechanicRequestModal.problemId}
                onClose={handleCloseMechanicModal}
                open={mechanicRequestModal.open}
            />

            {/* Scan Product Modal */}
            <ScanProductModal
                open={scanProductModal.open}
                onClose={handleCloseScanModal}
                problemId={scanProductModal.problemId}
                problemDescription={scanProductModal.problemDescription}
            />
        </>
    );
};

export default RequestListModal;