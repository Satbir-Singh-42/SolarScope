import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Search, Menu, CloudSun, MessageCircle, Bot, X, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import InstallationAnalysis from "@/components/installation-analysis";
import FaultDetection from "@/components/fault-detection";
import AIChatWidget from "@/components/mobile-ai-chat-widget";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'installation' | 'fault-detection'>('installation');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface pt-16">
      {/* Header */}
      <header className="bg-white shadow-material fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center">
                <CloudSun className="text-white" size={20} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">SolarScope AI</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setActiveTab('installation')}
                className={`transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  activeTab === 'installation' 
                    ? 'text-primary font-medium' 
                    : 'text-secondary-custom hover:text-primary'
                }`}
              >
                Installation Planning
              </button>
              <button 
                onClick={() => setActiveTab('fault-detection')}
                className={`transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  activeTab === 'fault-detection' 
                    ? 'text-primary font-medium' 
                    : 'text-secondary-custom hover:text-primary'
                }`}
              >
                Fault Detection
              </button>
              <Link href="/chat">
                <button className="text-secondary-custom hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-105">
                  AI Assistant
                </button>
              </Link>
              <Link href="/about">
                <button className="text-secondary-custom hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-105">
                  About
                </button>
              </Link>
            </nav>
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-white hover:bg-blue-50 text-black hover:text-blue-600 border-gray-300 hover:border-blue-400 active:scale-95 transition-all duration-200 ease-in-out">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">Main navigation menu for SolarScope AI</SheetDescription>
                  <nav className="flex flex-col space-y-6 mt-8">
                    <div className="flex flex-col space-y-4">
                      <h3 className="font-semibold text-lg text-primary">Analysis Tools</h3>
                      <button
                        onClick={() => {
                          setActiveTab('installation');
                          setIsMenuOpen(false);
                        }}
                        className={`flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base ${
                          activeTab === 'installation'
                            ? 'bg-primary text-white'
                            : 'text-secondary-custom hover:bg-gray-100'
                        }`}
                      >
                        <Home size={20} />
                        <span>Installation Planning</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('fault-detection');
                          setIsMenuOpen(false);
                        }}
                        className={`flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base ${
                          activeTab === 'fault-detection'
                            ? 'bg-primary text-white'
                            : 'text-secondary-custom hover:bg-gray-100'
                        }`}
                      >
                        <Search size={20} />
                        <span>Fault Detection</span>
                      </button>
                    </div>
                    
                    <div className="flex flex-col space-y-4">
                      <h3 className="font-semibold text-lg text-primary">AI Services</h3>
                      <Link href="/chat">
                        <Button variant="outline" className="w-full justify-start space-x-3 transition-all duration-300 ease-in-out transform hover:scale-105" onClick={() => setIsMenuOpen(false)}>
                          <MessageCircle size={20} />
                          <span>AI Assistant</span>
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="flex flex-col space-y-4">
                      <h3 className="font-semibold text-lg text-primary">Information</h3>
                      <Link href="/about">
                        <Button variant="outline" className="w-full justify-start space-x-3 transition-all duration-300 ease-in-out transform hover:scale-105" onClick={() => setIsMenuOpen(false)}>
                          <HelpCircle size={20} />
                          <span>About</span>
                        </Button>
                      </Link>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-600 text-white py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">AI-Powered Solar Analysis</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 opacity-90 px-2">
              Plan installations and detect faults with advanced computer vision
            </p>
          </div>
        </div>
      </section>

      {/* Main Application Interface */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        
        {/* Navigation Tabs */}
        <Card className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('installation')}
              className={`flex-1 py-3 sm:py-4 px-3 sm:px-4 md:px-6 text-center font-medium transition-colors text-sm sm:text-base ${
                activeTab === 'installation'
                  ? 'text-primary border-b-2 border-primary bg-blue-50'
                  : 'text-secondary-custom hover:text-primary'
              }`}
            >
              <Home className="inline mr-1 sm:mr-2" size={16} />
              <span>Installation</span>
              <span className="hidden sm:inline"> Planning</span>
            </button>
            <button
              onClick={() => setActiveTab('fault-detection')}
              className={`flex-1 py-3 sm:py-4 px-3 sm:px-4 md:px-6 text-center font-medium transition-colors text-sm sm:text-base ${
                activeTab === 'fault-detection'
                  ? 'text-primary border-b-2 border-primary bg-blue-50'
                  : 'text-secondary-custom hover:text-primary'
              }`}
            >
              <Search className="inline mr-1 sm:mr-2" size={16} />
              <span>Fault</span>
              <span className="hidden sm:inline"> Detection</span>
            </button>
          </div>
        </Card>

        {/* Content Sections */}
        {activeTab === 'installation' && <InstallationAnalysis />}
        {activeTab === 'fault-detection' && <FaultDetection />}
      </main>

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
}
