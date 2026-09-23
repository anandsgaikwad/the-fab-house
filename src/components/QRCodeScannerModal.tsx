import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, Camera, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface QRCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (sku: string) => void;
}

export const QRCodeScannerModal: React.FC<QRCodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const { products } = useApp();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sample swatches that dealers frequently scan from physical sample cards
  const sampleCodes = [
    { sku: 'AMH0011', name: 'Onyx Dimout 801 (Raw Ecru)' },
    { sku: 'AMH0014', name: 'Onyx Dimout 804 (Warm Taupe)' },
    { sku: 'BLK1011', name: 'Chelmsford Blackout 101 (Pure Ivory)' },
    { sku: 'SOL4001', name: 'Solis View 3% 401 (White/Grey)' },
    { sku: 'CUR2001', name: 'Velvet Touch Sheer 201 (Champagne)' },
  ];

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } else {
        setCameraError('Camera access not supported on this device/browser.');
      }
    } catch (err: any) {
      console.warn('Camera stream could not be initialized:', err);
      setCameraError('Camera unavailable in current sandbox. You can click any swatch QR tag below to test scanning!');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#2C2417]/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-md w-full p-5 shadow-2xl z-10 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#DACBAA]/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#E9D9C5] rounded-lg text-[#8B5A3C]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-bold text-base text-[#2C2417]">
                  Scan Swatch QR / Barcode
                </h3>
                <span className="text-[9px] bg-[#E7DAC0] text-[#8B5A3C] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                  Live Feed / Swatch Test
                </span>
              </div>
              <p className="text-[11px] text-[#766A57]">
                Camera viewfinder with interactive swatch codes for testing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#766A57] hover:bg-[#E7DAC0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder simulation / Camera feed */}
        <div className="relative w-full aspect-square bg-[#2C2417] rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-[#8B5A3C]">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4 text-[#FBF7EE] space-y-2">
              <Camera className="w-10 h-10 mx-auto text-[#DACBAA] opacity-60 animate-pulse" />
              <p className="text-xs text-[#DACBAA] max-w-[240px]">
                {cameraError || 'Initializing optical camera sensor...'}
              </p>
            </div>
          )}

          {/* Reticle / Target lines */}
          <div className="absolute inset-8 border-2 border-[#E9D9C5]/80 rounded-xl pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between">
              <span className="w-4 h-4 border-t-2 border-l-2 border-[#8B5A3C]" />
              <span className="w-4 h-4 border-t-2 border-r-2 border-[#8B5A3C]" />
            </div>
            {/* Animated Laser Scanning Line */}
            <div className="w-full h-0.5 bg-[#5F6B4A] shadow-[0_0_8px_#5F6B4A] animate-bounce" />
            <div className="flex justify-between">
              <span className="w-4 h-4 border-b-2 border-l-2 border-[#8B5A3C]" />
              <span className="w-4 h-4 border-b-2 border-r-2 border-[#8B5A3C]" />
            </div>
          </div>
        </div>

        {/* Quick Swatch Click-to-Scan Simulator (Crucial for testing without a real physical fabric card) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#2C2417]">Or Tap a Physical Swatch Card to Scan:</span>
            <span className="text-[11px] text-[#5F6B4A] font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> Ready
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {sampleCodes.map(sample => (
              <button
                key={sample.sku}
                onClick={() => {
                  stopCamera();
                  onScanSuccess(sample.sku);
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-[#E7DAC0]/70 hover:bg-[#E9D9C5] border border-[#DACBAA]/60 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-[#8B5A3C]">{sample.sku}</span>
                  <span className="text-[#766A57] ml-2">{sample.name}</span>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#FBF7EE] text-[#2C2417] border border-[#DACBAA]">
                  Scan
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-center text-[#766A57] pt-1">
          QR codes are printed on all THE FAB HOUSE sample cards, binders, and dispatched roll tags.
        </p>
      </div>
    </div>
  );
};
