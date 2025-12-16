import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { X, ScanLine } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScanner = ({ onScanSuccess, onClose }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScanSuccess(decodedText);
            stopScanner();
          },
          () => {
            // Error callback - ignore frame processing errors
          }
        );
        setIsScanning(true);
      } catch (err) {
        setError("Unable to access camera. Please grant camera permissions.");
        console.error("Error starting scanner:", err);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    if (scannerRef.current) {
      // Check if scanner is running before attempting to stop
      const state = scannerRef.current.getState();
      if (state === 2) { // State 2 means SCANNING
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current = null;
            setIsScanning(false);
          })
          .catch((err) => {
            console.error("Error stopping scanner:", err);
            scannerRef.current = null;
            setIsScanning(false);
          });
      } else {
        // Scanner not running, just cleanup
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in">
      <Card className="relative w-full max-w-md mx-4 p-6 shadow-glow">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="space-y-4">
          <div className="text-center space-y-2">
            <ScanLine className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-2xl font-bold">Scan QR Code</h2>
            <p className="text-muted-foreground">
              Position the QR code within the frame
            </p>
          </div>

          <div className="relative rounded-lg overflow-hidden border-2 border-primary">
            <div id="qr-reader" className="w-full" />
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Camera access is required to scan QR codes
          </p>
        </div>
      </Card>
    </div>
  );
};
