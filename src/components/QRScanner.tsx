import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { logger } from '../utils/logger';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export function QRScanner({ isOpen, onClose, onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [fileScanning, setFileScanning] = useState(false);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const scanner = scannerRef.current;
        if (scanner.isScanning) {
          await scanner.stop();
        }
        scanner.clear();
      } catch (err: any) {
        logger.log('Stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    try {
      setError('');
      setIsScanning(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser. Please use Google Chrome on a mobile device.');
      }

      const element = document.getElementById('qr-reader');
      if (!element) {
        throw new Error('QR scanner element not found. Please try again.');
      }

      if (scannerRef.current) {
        await stopScanning();
      }

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      let cameraId: string | { facingMode: string } | undefined;

      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const rearCamera = devices.find(
            (device) =>
              device.label.toLowerCase().includes('back') ||
              device.label.toLowerCase().includes('rear') ||
              device.label.toLowerCase().includes('environment') ||
              device.label.toLowerCase().includes('facing back')
          );
          cameraId = rearCamera ? rearCamera.id : devices[0].id;
        } else {
          cameraId = { facingMode: 'environment' };
        }
      } catch (cameraError: any) {
        logger.warn('Could not enumerate cameras, using facingMode:', cameraError);
        cameraId = { facingMode: 'environment' };
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
      };

      await html5QrCode.start(
        cameraId || { facingMode: 'environment' },
        config,
        (decodedText) => {
          logger.log('QR Code scanned:', decodedText);
          onScanSuccess(decodedText);
          stopScanning();
          onClose();
        },
        () => {}
      );

      setIsScanning(true);
    } catch (err: any) {
      logger.error('Error starting QR scanner:', err);
      setIsScanning(false);

      if (
        err.name === 'NotAllowedError' ||
        err.message?.includes('permission') ||
        err.message?.includes('Permission denied') ||
        err.message?.includes('NotAllowedError')
      ) {
        setError(
          'Camera permission denied. Please allow camera access in your browser settings. On mobile Chrome, tap the camera icon in the address bar and select "Allow".'
        );
      } else if (
        err.name === 'NotFoundError' ||
        err.message?.includes('camera') ||
        err.message?.includes('No camera') ||
        err.message?.includes('NotFoundError')
      ) {
        setError('No camera found. Please ensure your device has a camera or upload an image below.');
      } else if (
        err.name === 'NotReadableError' ||
        err.message?.includes('not readable') ||
        err.message?.includes('NotReadableError')
      ) {
        setError('Camera is already in use by another application. Please close other apps using the camera.');
      } else if (err.name === 'OverconstrainedError' || err.message?.includes('OverconstrainedError')) {
        setError('Camera configuration error. Trying alternative method...');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to access camera. Please try again or upload an image below.');
      }

      if (err.name === 'OverconstrainedError' && scannerRef.current) {
        try {
          await scannerRef.current.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              onScanSuccess(decodedText);
              stopScanning();
              onClose();
            },
            () => {}
          );
          setError('');
          setIsScanning(true);
        } catch (retryErr: any) {
          logger.error('Retry also failed:', retryErr);
        }
      }
    }
  }, [onScanSuccess, onClose, stopScanning]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileError('');
      setFileScanning(true);

      try {
        const scanner = new Html5Qrcode('qr-file-reader');
        const result = await scanner.scanFile(file, false);
        scanner.clear();
        onScanSuccess(result);
        stopScanning();
        onClose();
      } catch (err: any) {
        setFileError('No QR code found in the image. Please try a clearer photo of the QR code.');
        logger.error('File QR scan error:', err);
      } finally {
        setFileScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [onScanSuccess, onClose, stopScanning]
  );

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (!scannerRef.current || !scannerRef.current.isScanning) {
          startScanning();
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        stopScanning();
      };
    } else {
      stopScanning();
    }
  }, [isOpen, startScanning, stopScanning]);

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" aria-hidden="true" />
            Scan QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-2">Camera Access Error</p>
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <div className="text-xs text-red-500 space-y-1">
                <p><strong>Mobile Chrome Instructions:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Look for the camera icon in the address bar</li>
                  <li>Tap it and select "Allow" for camera access</li>
                  <li>Refresh the page and try again</li>
                  <li>Check device settings: Settings → Apps → Chrome → Permissions → Camera</li>
                </ul>
              </div>
            </div>
          )}

          {!error && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Ready to scan:</strong> The rear camera will open automatically. Allow camera access when prompted, then point at the QR code.
              </p>
            </div>
          )}

          <div
            id="qr-reader"
            className="w-full rounded-lg overflow-hidden bg-black"
            style={{ minHeight: '300px' }}
            aria-label="Camera QR code scanner viewfinder"
          />

          {/* Hidden element required by html5-qrcode for file scanning */}
          <div id="qr-file-reader" style={{ display: 'none' }} aria-hidden="true" />

          {!isScanning && !error && (
            <p className="text-center text-sm text-gray-600" aria-live="polite">
              Initializing camera...
            </p>
          )}

          {/* File upload fallback */}
          <div className="border-t pt-3">
            <p className="text-xs text-gray-500 mb-2 text-center">
              No camera? Upload a QR code image instead.
            </p>
            <input
              ref={fileInputRef}
              id="qr-file-input"
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Upload QR code image"
              onChange={handleFileUpload}
              disabled={fileScanning}
            />
            <Button
              variant="outline"
              className="w-full"
              disabled={fileScanning}
              onClick={() => fileInputRef.current?.click()}
              aria-controls="qr-file-input"
            >
              <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
              {fileScanning ? 'Reading image...' : 'Upload QR Image'}
            </Button>
            {fileError && (
              <p role="alert" className="text-xs text-red-600 mt-1 text-center">
                {fileError}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              <X className="w-4 h-4 mr-2" aria-hidden="true" />
              Close
            </Button>
            {error && (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="w-4 h-4 mr-2" aria-hidden="true" />
                Retry Camera
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
