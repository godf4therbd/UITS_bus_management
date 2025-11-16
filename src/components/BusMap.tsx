import { Bus, BusStop } from '../types';
import { MapPin, Navigation } from 'lucide-react';

interface BusMapProps {
  bus: Bus;
}

export function BusMap({ bus }: BusMapProps) {
  // Simple visual representation of the route
  // In a real app, this would use Google Maps or similar
  
  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-[#E8F5E9] to-[#FFF9C4] rounded-lg p-6 relative overflow-hidden">
      {/* Map Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-8 h-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-gray-400"></div>
          ))}
        </div>
      </div>

      {/* Route Path */}
      <div className="relative h-full flex flex-col justify-between py-8">
        {bus.stops.map((stop, index) => (
          <div key={stop.name} className="flex items-center gap-4 relative z-10">
            {/* Stop Marker */}
            <div className="flex items-center gap-3 flex-1">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-green-500' : 
                index === bus.stops.length - 1 ? 'bg-[#FF6B6B]' : 
                'bg-blue-500'
              } shadow-lg`}>
                {index === bus.stops.length - 1 ? (
                  <MapPin className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1 bg-white rounded-lg px-4 py-3 shadow-md">
                <p className="text-[#333333]">{stop.name}</p>
                <p className="text-sm text-[#666666]">ETA: {stop.estimatedTime}</p>
              </div>
            </div>

            {/* Connection Line */}
            {index < bus.stops.length - 1 && (
              <div className="absolute left-5 top-10 w-0.5 h-16 bg-gray-300 -z-10"></div>
            )}
          </div>
        ))}

        {/* Current Bus Location */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
          <div className="relative">
            <div className="w-12 h-12 bg-[#FF6B6B] rounded-full flex items-center justify-center shadow-xl animate-pulse">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#333333] text-white px-2 py-1 rounded text-xs">
              Bus Location
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-lg text-xs">
        <p className="text-[#666666] mb-2">Legend</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-[#333333]">Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-[#333333]">Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#FF6B6B] rounded-full"></div>
            <span className="text-[#333333]">Destination</span>
          </div>
        </div>
      </div>
    </div>
  );
}
