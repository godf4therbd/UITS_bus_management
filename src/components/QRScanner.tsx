import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export function QRScanner({ isOpen, onClose, onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const scanner = scannerRef.current;
        if (scanner.isScanning) {
          await scanner.stop();
        }
        scanner.clear();
      } catch (err: any) {
        // Ignore errors when stopping
        console.debug('Stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    try {
      setError('');
      setIsScanning(true);

      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser. Please use Google Chrome on a mobile device.');
      }

      // Ensure the element exists
      const element = document.getElementById('qr-reader');
      if (!element) {
        throw new Error('QR scanner element not found. Please try again.');
      }

      // Stop any existing scanner
      if (scannerRef.current) {
        await stopScanning();
      }

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      let cameraId: string | { facingMode: string } | undefined;

      try {
        // Try to get available cameras
        const devices = await Html5Qrcode.getCameras();
        
        if (devices && devices.length > 0) {
          // Try to find rear camera
          const rearCamera = devices.find(
            (device) =>
              device.label.toLowerCase().includes('back') ||
              device.label.toLowerCase().includes('rear') ||
              device.label.toLowerCase().includes('environment') ||
              device.label.toLowerCase().includes('facing back')
          );
          
          if (rearCamera) {
            cameraId = rearCamera.id;
          } else {
            // Use first available camera
            cameraId = devices[0].id;
          }
        } else {
          // No cameras found, use facingMode
          cameraId = { facingMode: 'environment' };
        }
      } catch (cameraError: any) {
        console.warn('Could not enumerate cameras, using facingMode:', cameraError);
        // Fallback to facingMode
        cameraId = { facingMode: 'environment' };
      }

      // Scanner configuration
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
      };

      // Start scanning
      await html5QrCode.start(
        cameraId || { facingMode: 'environment' },
        config,
        (decodedText) => {
          // Success callback
          console.log('QR Code scanned:', decodedText);
          onScanSuccess(decodedText);
          stopScanning();
          onClose();
        },
        (errorMessage) => {
          // Error callback - ignore common scanning errors
          // These are just attempts to find QR codes
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Error starting QR scanner:', err);
      
      let errorMessage = '';
      
      if (err.name === 'NotAllowedError' || 
          err.message?.includes('permission') || 
          err.message?.includes('Permission denied') ||
          err.message?.includes('NotAllowedError')) {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings. On mobile Chrome, tap the camera icon in the address bar and select "Allow".';
      } else if (err.name === 'NotFoundError' || 
                 err.message?.includes('camera') || 
                 err.message?.includes('No camera') ||
                 err.message?.includes('NotFoundError')) {
        errorMessage = 'No camera found. Please ensure your device has a camera.';
      } else if (err.name === 'NotReadableError' || 
                 err.message?.includes('not readable') ||
                 err.message?.includes('NotReadableError')) {
        errorMessage = 'Camera is already in use by another application. Please close other apps using the camera.';
      } else if (err.name === 'OverconstrainedError' ||
                 err.message?.includes('OverconstrainedError')) {
        // Try with simpler config
        errorMessage = 'Camera configuration error. Trying alternative method...';
        // Will retry below
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Failed to access camera. Please try again.';
      }
      
      setError(errorMessage);
      setIsScanning(false);
      
      // If OverconstrainedError, try with just facingMode
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
          console.error('Retry also failed:', retryErr);
        }
      }
    }
  }, [onScanSuccess, onClose, stopScanning]);

  useEffect(() => {
    if (isOpen) {
      // Delay to ensure DOM is ready
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
            <Camera className="w-5 h-5" />
            Scan QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
              <p className="text-sm text-blue-700">
                <strong>Ready to scan:</strong> The rear camera will open automatically. Allow camera access when prompted, then point at the QR code.
              </p>
            </div>
          )}

          <div
            id="qr-reader"
            className="w-full rounded-lg overflow-hidden bg-black"
            style={{ minHeight: '300px' }}
          />

          {!isScanning && !error && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">
                Initializing camera...
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            {error && (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
