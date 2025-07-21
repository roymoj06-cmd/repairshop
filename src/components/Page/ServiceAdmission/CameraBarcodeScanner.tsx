import { FC, useRef, useEffect, useState } from "react";
import { Box, Button, Typography, Alert, CircularProgress } from "@mui/material";
import { CameraAlt, Close } from "@mui/icons-material";
import Quagga from "@ericblade/quagga2";

interface ICameraBarcodeScanner {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isActive: boolean;
}

const CameraBarcodeScanner: FC<ICameraBarcodeScanner> = ({
  onScan,
  onClose,
  isActive,
}) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isProcessingBarcode, setIsProcessingBarcode] = useState(false);

  useEffect(() => {
    if (isActive && !isInitialized && !isInitializing) {
      initializeScanner();
    } else if (!isActive && isInitialized) {
      stopScanner();
    }

    return () => {
      // Cleanup function - همیشه listener ها را پاک می‌کند
      try {
        Quagga.offDetected();
        if (isInitialized) {
          Quagga.stop();
        }
      } catch (error) {
        console.error("Error in cleanup:", error);
      }
    };
  }, [isActive]); // فقط isActive را dependency قرار می‌دهیم

  const initializeScanner = async () => {
    if (!scannerRef.current || isInitializing) return;

    setIsInitializing(true);
    setError("");

    try {
      // پاک کردن تمام listener های قبلی
      Quagga.offDetected();
      
      await Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: 640,
              height: 480,
              aspectRatio: { min: 1, max: 2 },
              facingMode: "environment", // دوربین پشت گوشی
            },
          },
          locator: {
            patchSize: "medium",
            halfSample: true,
          },
          numOfWorkers: 2,
          frequency: 10,
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader",
              "code_39_reader",
              "code_39_vin_reader",
              "codabar_reader",
              "upc_reader",
              "upc_e_reader",
              "i2of5_reader",
            ],
          },
          locate: true,
        },
        (err) => {
          if (err) {
            console.error("Error initializing Quagga:", err);
            setError("خطا در راه‌اندازی دوربین. لطفاً دسترسی به دوربین را بررسی کنید.");
            setIsInitializing(false);
            return;
          }
          
          setIsInitialized(true);
          setIsInitializing(false);
          Quagga.start();
        }
      );

      // Event listener برای تشخیص بارکد - فقط یک بار اضافه می‌شود
      Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        
        // جلوگیری از پردازش همزمان چندین بارکد
        if (isProcessingBarcode) return;
        
        if (code && code.trim()) {
          // اعتبارسنجی ساده برای بارکد
          if (code.length >= 4) {
            setIsProcessingBarcode(true);
            // توقف اسکنر قبل از پردازش
            Quagga.pause();
            
            onScan(code.trim());
            
            // شروع مجدد اسکنر بعد از 2 ثانیه
            setTimeout(() => {
              setIsProcessingBarcode(false);
              if (isInitialized) {
                Quagga.start();
              }
            }, 2000);
          }
        }
      });
    } catch (error) {
      console.error("Error setting up camera:", error);
      setError("خطا در راه‌اندازی دوربین");
      setIsInitializing(false);
    }
  };

  const stopScanner = () => {
    try {
      // پاک کردن تمام listener ها
      Quagga.offDetected();
      // توقف کامل اسکنر
      Quagga.stop();
      setIsInitialized(false);
      setIsInitializing(false);
      setIsProcessingBarcode(false);
    } catch (error) {
      console.error("Error stopping scanner:", error);
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  if (!isActive) return null;

  return (
    <Box className="camera-barcode-scanner">
      <Box className="camera-barcode-scanner__header">
        <Typography variant="h6" className="camera-barcode-scanner__title">
          اسکن بارکد با دوربین
        </Typography>
        <Button
          onClick={handleClose}
          className="camera-barcode-scanner__close-button"
          startIcon={<Close />}
          variant="outlined"
          size="small"
        >
          بستن
        </Button>
      </Box>

      {error && (
        <Alert severity="error" className="camera-barcode-scanner__error">
          {error}
        </Alert>
      )}

      {isInitializing && (
        <Box className="camera-barcode-scanner__loading">
          <CameraAlt sx={{ fontSize: 48, color: "text.secondary" }} />
          <Typography variant="body1">در حال راه‌اندازی دوربین...</Typography>
        </Box>
      )}

      <Box className="camera-barcode-scanner__container">
        <div
          ref={scannerRef}
          className="camera-barcode-scanner__viewport"
          style={{
            width: "100%",
            height: "300px",
            position: "relative",
            border: "2px solid #2196f3",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        />
        
        {isInitialized && !isProcessingBarcode && (
          <Box className="camera-barcode-scanner__instructions">
            <Typography variant="body2" color="text.secondary" align="center">
              بارکد کالا را در قاب دوربین قرار دهید
            </Typography>
          </Box>
        )}
        
        {isProcessingBarcode && (
          <Box className="camera-barcode-scanner__processing">
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="primary" align="center">
              در حال پردازش بارکد...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CameraBarcodeScanner;