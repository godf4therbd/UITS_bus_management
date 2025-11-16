import React from 'react';
import uitsLogo from '../assets/uits-logo.png';

interface UitsBusManagementGuideProps {
  className?: string;
}

export function UitsBusManagementGuide({ className }: UitsBusManagementGuideProps) {
  return (
    <div 
      data-layer="UITS Bus Management Guide" 
      className={`UitsBusManagementGuide w-full min-h-screen relative bg-gradient-to-br from-blue-50 to-indigo-100 ${className || ''}`}
    >
      {/* Header Container */}
      <div 
        data-layer="Container" 
        className="Container w-full h-20 px-24 pb-px left-0 top-0 absolute bg-white shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] border-b border-black/10 inline-flex flex-col justify-start items-start"
      >
        <div 
          data-layer="Container" 
          className="Container self-stretch h-20 px-4 inline-flex justify-between items-center"
        >
          {/* Left side - Logo and Text */}
          <div 
            data-layer="Container" 
            className="Container w-60 h-12 flex justify-start items-center gap-4"
          >
            <div 
              data-svg-wrapper 
              data-layer="Image (UITS Logo)" 
              className="ImageUitsLogo relative"
            >
              <img 
                src={uitsLogo} 
                alt="UITS Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900">UITS Bus Management</h1>
              <p className="text-sm text-gray-600">Student Portal</p>
            </div>
          </div>

          {/* Right side - User Info (can be customized) */}
          <div className="flex items-center gap-4">
            {/* Add user dropdown or other content here */}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full pt-20">
        {/* Add your main content here */}
      </div>
    </div>
  );
}


