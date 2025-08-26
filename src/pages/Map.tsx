
import React from "react";
import OpenLayersMap from "@/components/OpenLayersMap";

const Map = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            Live Map - Andhra Pradesh Delivery Network
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time delivery partner tracking and route visualization with OpenLayers
          </p>
        </div>
      </div>

      {/* OpenLayers Map Component */}
      <OpenLayersMap />
    </div>
  );
};

export default Map;
