import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import uitsLogo from '../assets/uits-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, []); // Removed onComplete from dependencies to prevent re-renders

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#FF6B6B] via-[#FFB8B8] to-white">
      <div className="flex flex-col items-center gap-8">
        {/* UITS Logo */}
        <div className="w-40 h-40 bg-white rounded-full shadow-lg flex items-center justify-center p-4">
          <img src={uitsLogo} alt="UITS Logo" className="w-full h-full object-contain" />
        </div>

        {/* App Name */}
        <h1 className="text-[#333333] text-center">
          UITS Bus Management
        </h1>

        {/* Loading Animation */}
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 text-[#FF6B6B] animate-spin" />
          <span className="text-[#333333]">Loading...</span>
        </div>
      </div>
    </div>
  );
}
