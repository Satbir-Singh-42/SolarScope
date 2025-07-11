import { CloudSun } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center text-white max-w-lg w-full">
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center animate-pulse">
              <CloudSun className="text-primary" size={32} />
            </div>
            <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">SolarScope AI</h1>
        <p className="text-base sm:text-lg lg:text-xl opacity-90 mb-6 sm:mb-8 px-2">Loading AI-Powered Solar Analysis Platform</p>
        
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}