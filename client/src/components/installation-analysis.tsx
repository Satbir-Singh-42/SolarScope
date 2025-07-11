import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Download, Share, Settings, FileText, Home, Ruler, ChevronDown, ChevronUp, FileDown } from "lucide-react";

import ImageUpload from "./image-upload";
import AnalysisOverlay from "./analysis-overlay";
import { apiRequest, checkBackendHealth } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import type { InstallationResult, RoofInput } from "@shared/schema";

export default function InstallationAnalysis() {
  const [analysisResult, setAnalysisResult] = useState<InstallationResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [roofInput, setRoofInput] = useState<RoofInput>({
    roofSize: undefined,
    roofShape: 'auto-detect',
    panelSize: 'auto-optimize'
  });
  const [isRoofDetailsOpen, setIsRoofDetailsOpen] = useState(false);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', '1'); // Mock user ID
      
      const response = await apiRequest('POST', '/api/analyze/installation', formData);
      return response.json();
    },
    onSuccess: (data) => {
      // Store the uploaded file path for AI analysis
      setAnalysisResult(null); // Reset previous results
      toast({
        title: "Image Uploaded",
        description: "Click 'Start AI Analysis' to analyze your rooftop image.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload the image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const analysisMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log('Starting analysis for file:', file.name, file.size);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', '1');
      
      // Add roof input data
      if (roofInput.roofSize) {
        formData.append('roofSize', roofInput.roofSize.toString());
      }
      if (roofInput.roofShape) {
        formData.append('roofShape', roofInput.roofShape);
      }
      if (roofInput.panelSize) {
        formData.append('panelSize', roofInput.panelSize);
      }
      
      console.log('FormData created with roof inputs, sending request...');
      
      const response = await apiRequest('POST', '/api/analyze/installation', formData);
      const data = await response.json();
      console.log('Analysis successful:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Analysis complete, setting results:', data);
      setAnalysisResult(data.results);
      
      // Smooth scroll to results after a brief delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
      
      toast({
        title: "Analysis Complete",
        description: "Your rooftop analysis has been completed successfully.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      
      // Extract error message and provide specific validation warnings
      let errorMessage = "Failed to analyze the image. Please try again.";
      let errorTitle = "Analysis Failed";
      
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes('not a rooftop') || errorText.includes('no roof') || errorText.includes('solar panel')) {
          errorTitle = "Invalid Image for Installation Analysis";
          errorMessage = "Please upload a rooftop or building image. This feature analyzes roof structures for solar panel installation planning, not existing solar panels.";
        } else if (errorText.includes('indoor') || errorText.includes('interior')) {
          errorTitle = "Indoor Image Detected";
          errorMessage = "Please upload an outdoor rooftop image. Indoor or interior photos cannot be used for solar installation planning.";
        } else if (errorText.includes('invalid') || errorText.includes('not valid')) {
          errorTitle = "Image Validation Failed";
          errorMessage = "Please upload a clear rooftop image showing the building structure from an aerial or angled view.";
        } else if (errorText.includes('overloaded') || errorText.includes('503') || errorText.includes('unavailable')) {
          errorTitle = "AI Service Temporarily Unavailable";
          errorMessage = "The AI analysis service is currently overloaded. Please wait a few minutes and try again. If the issue persists, try a different image or contact support.";
          
          // Use warning variant for service unavailability
          toast({
            title: errorTitle,
            description: errorMessage,
            variant: "warning",
          });
          return;
        } else if (errorText.includes('network') || errorText.includes('timeout')) {
          errorTitle = "Connection Error";
          errorMessage = "Network connection failed. Please check your internet connection and try again.";
        } else if (errorText.includes('backend not connected') || errorText.includes('server not available')) {
          errorTitle = "Backend Connection Error";
          errorMessage = "The backend server is not connected properly. Please check the server status and try again.";
        } else if (errorText.includes('fetch') || errorText.includes('cors') || errorText.includes('refused')) {
          errorTitle = "Backend Connection Error";
          errorMessage = "Cannot connect to the backend server. Please ensure the server is running and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      // Always show the toast notification
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (file: File) => {
    setImageUrl(URL.createObjectURL(file));
  };

  const handleAnalyze = async (file: File) => {
    // Check backend health before analysis
    const isHealthy = await checkBackendHealth();
    if (!isHealthy) {
      toast({
        title: "Backend Connection Error",
        description: "Cannot connect to the backend server. Please ensure the server is running and try again.",
        variant: "warning",
      });
      return;
    }
    
    analysisMutation.mutate(file);
  };

  const exportToText = () => {
    if (!analysisResult) return;
    
    const reportContent = `
SOLAR PANEL INSTALLATION ANALYSIS REPORT
=========================================

Analysis Date: ${new Date().toLocaleDateString()}
Analysis Time: ${new Date().toLocaleTimeString()}

INSTALLATION METRICS:
- Recommended Panels: ${analysisResult.totalPanels}
- Roof Coverage: ${analysisResult.coverage}%
- Efficiency Score: ${analysisResult.efficiency}%
- Estimated Power Output: ${analysisResult.powerOutput}kW

TECHNICAL DETAILS:
- Optimal Orientation: ${analysisResult.orientation}
- Shading Analysis: ${analysisResult.shadingAnalysis}
- Installation Notes: ${analysisResult.notes}

PANEL PLACEMENT REGIONS:
${analysisResult.regions?.map((region, index) => `
Region ${index + 1}:
  - Position: ${(region.x * 100).toFixed(1)}%, ${(region.y * 100).toFixed(1)}%
  - Dimensions: ${(region.width * 100).toFixed(1)}% × ${(region.height * 100).toFixed(1)}%
`).join('') || 'No regions defined'}

RECOMMENDATIONS:
- Schedule professional inspection for final placement
- Consider local building codes and permits
- Ensure proper ventilation around panels
- Plan for future maintenance access

Generated by SolarScope AI Analysis System
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-installation-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Exported",
      description: "Installation analysis report has been downloaded as a text file.",
    });
  };

  const exportToJson = () => {
    if (!analysisResult) return;
    
    const exportData = {
      analysisDate: new Date().toISOString(),
      type: 'installation',
      results: analysisResult,
      metadata: {
        generatedBy: 'SolarScope AI',
        version: '1.0',
        confidence: '94%'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-installation-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Installation analysis data has been downloaded as a JSON file.",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Roof Input Form */}
      <Card className="shadow-material">
        <CardHeader 
          className="pb-3 sm:pb-4 px-3 sm:px-6 py-3 sm:py-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsRoofDetailsOpen(!isRoofDetailsOpen)}
        >
          <CardTitle className="flex items-center justify-between text-base sm:text-lg md:text-xl">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="truncate">Roof Details (Optional)</span>
            </div>
            <motion.div
              animate={{ rotate: isRoofDetailsOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </motion.div>
          </CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Provide roof details to help our AI create more accurate recommendations
          </p>
        </CardHeader>
        <AnimatePresence>
          {isRoofDetailsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: "easeInOut",
                opacity: { duration: 0.3 }
              }}
              style={{ overflow: "hidden" }}
            >
              <CardContent className="pt-0 px-3 sm:px-6 pb-4 sm:pb-6">
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 items-end"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <motion.div 
                    className="space-y-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                  >
                    <Label htmlFor="roofSize" className="flex items-center gap-2 text-sm font-medium">
                      <Ruler className="w-4 h-4 text-blue-600" />
                      Roof Size (sq ft)
                    </Label>
                    <Input
                      id="roofSize"
                      type="number"
                      placeholder="e.g., 2000"
                      min="100"
                      max="10000"
                      value={roofInput.roofSize || ''}
                      onChange={(e) => setRoofInput({
                        ...roofInput,
                        roofSize: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      className="h-10 sm:h-11 text-sm"
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <Label htmlFor="roofShape" className="text-sm font-medium flex items-center gap-2">
                      <Home className="w-4 h-4 text-green-600" />
                      Roof Shape
                    </Label>
                    <Select 
                      value={roofInput.roofShape} 
                      onValueChange={(value) => setRoofInput({
                        ...roofInput,
                        roofShape: value as RoofInput['roofShape']
                      })}
                    >
                      <SelectTrigger className="h-10 sm:h-11 text-sm">
                        <SelectValue placeholder="Select roof shape" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto-detect">Auto-detect from image</SelectItem>
                        <SelectItem value="gable">Gable (Triangle)</SelectItem>
                        <SelectItem value="hip">Hip (Pyramid)</SelectItem>
                        <SelectItem value="shed">Shed (Single slope)</SelectItem>
                        <SelectItem value="flat">Flat</SelectItem>
                        <SelectItem value="complex">Complex/Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.3 }}
                  >
                    <Label htmlFor="panelSize" className="text-sm font-medium flex items-center gap-2">
                      <Settings className="w-4 h-4 text-orange-600" />
                      Panel Size Preference
                    </Label>
                    <Select 
                      value={roofInput.panelSize} 
                      onValueChange={(value) => setRoofInput({
                        ...roofInput,
                        panelSize: value as RoofInput['panelSize']
                      })}
                    >
                      <SelectTrigger className="h-10 sm:h-11 text-sm">
                        <SelectValue placeholder="Select panel size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto-optimize">Auto-optimize for roof</SelectItem>
                        <SelectItem value="standard">Standard (425W)</SelectItem>
                        <SelectItem value="large">Large (500W+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                </motion.div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <ImageUpload
        onUpload={handleImageUpload}
        onAnalyze={handleAnalyze}
        uploading={analysisMutation.isPending}
        title="Upload Rooftop Image"
        description="Upload a top-view image of your rooftop. After uploading, click 'Start AI Analysis' to get solar panel placement recommendations using Google Gemini AI."
        validationType="installation"
      />

      {(analysisResult || analysisMutation.isPending) && (
        <div
          ref={resultsRef}
          className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 slide-down-fade"
        >
            {/* Image Analysis Display */}
            <div className="order-1 xl:order-1">
              <Card className="shadow-material">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <h4 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 lg:mb-6 text-primary-custom">AI Analysis Results</h4>
                  
                  {analysisMutation.isPending ? (
                    <div className="bg-gray-100 rounded-lg flex items-center justify-center h-40 sm:h-48 md:h-56 lg:h-64 slide-down-grow">
                      <div className="text-center px-3 sm:px-4">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
                        <p className="text-secondary-custom mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">
                          Analyzing your rooftop...
                        </p>
                        <div className="w-32 sm:w-40 md:w-48 h-1.5 sm:h-2 bg-gray-200 rounded-full mx-auto mb-2">
                          <div className="h-1.5 sm:h-2 bg-primary rounded-full progress-animate"></div>
                        </div>
                        <p className="text-xs text-gray-500">AI processing in progress</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <AnalysisOverlay
                        imageUrl={imageUrl || ''}
                        regions={analysisResult?.regions || []}
                        type="installation"
                        ref={analysisCanvasRef}
                      />
                      <div>
                        <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs sm:text-sm">
                          <CheckCircle className="mr-1" size={12} />
                          <span>Analysis Complete</span>
                        </Badge>
                      </div>
                    </div>
                  )}

                  {analysisResult && (
                    <div className="mt-3 sm:mt-4 flex justify-end">
                      <div className="text-xs sm:text-sm text-secondary-custom">
                        Confidence: {analysisResult.confidence}%
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Installation Recommendations */}
            <div className="order-2 xl:order-2">
              <Card className="shadow-material">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <h4 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-primary-custom">Installation Recommendations</h4>
                  
                  {analysisMutation.isPending ? (
                    <div className="space-y-3 sm:space-y-4 slide-down-grow">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`bg-gray-100 animate-pulse rounded-lg p-3 sm:p-4 h-12 sm:h-16 slide-up-stagger stagger-${i + 1}`}
                          />
                        ))}
                      </div>
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`bg-gray-100 animate-pulse rounded h-3 sm:h-4 slide-up-stagger stagger-${i + 5}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : analysisResult && (
                    <div>
                      {/* Metrics Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                        {[
                          { value: analysisResult.totalPanels, label: "Recommended Panels", color: "blue", bgColor: "bg-blue-50", textColor: "text-primary" },
                          { value: `${analysisResult.coverage}%`, label: "Roof Coverage", color: "green", bgColor: "bg-green-50", textColor: "text-green-600" },
                          { value: `${analysisResult.efficiency}%`, label: "Efficiency Score", color: "orange", bgColor: "bg-orange-50", textColor: "text-orange-600" },
                          { value: `${analysisResult.powerOutput}kW`, label: "Est. Power Output", color: "purple", bgColor: "bg-purple-50", textColor: "text-purple-600" }
                        ].map((metric, index) => (
                          <div
                            key={metric.label}
                            className={`${metric.bgColor} p-2 sm:p-3 md:p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer slide-up-stagger stagger-${index + 1}`}
                          >
                            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${metric.textColor}`}>
                              {metric.value}
                            </div>
                            <div className="text-xs sm:text-sm text-secondary-custom">{metric.label}</div>
                          </div>
                        ))}
                      </div>
                  
                  {/* Roof Area Information */}
                  {(analysisResult.estimatedRoofArea || analysisResult.usableRoofArea) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                      {analysisResult.estimatedRoofArea && (
                        <div className="bg-slate-50 p-2 sm:p-3 md:p-4 rounded-lg">
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700">{analysisResult.estimatedRoofArea}</div>
                          <div className="text-xs sm:text-sm text-secondary-custom">Total Roof Area (sq ft)</div>
                        </div>
                      )}
                      {analysisResult.usableRoofArea && (
                        <div className="bg-cyan-50 p-2 sm:p-3 md:p-4 rounded-lg">
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-700">{analysisResult.usableRoofArea}</div>
                          <div className="text-xs sm:text-sm text-secondary-custom">Usable Area (sq ft)</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Technical Details */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="border-l-4 border-green-500 pl-3 sm:pl-4">
                      <h5 className="font-medium text-sm sm:text-base text-primary-custom">Optimal Orientation</h5>
                      <p className="text-xs sm:text-sm text-secondary-custom">{analysisResult.orientation}</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-3 sm:pl-4">
                      <h5 className="font-medium text-sm sm:text-base text-primary-custom">Shading Analysis</h5>
                      <p className="text-xs sm:text-sm text-secondary-custom">{analysisResult.shadingAnalysis}</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-3 sm:pl-4">
                      <h5 className="font-medium text-sm sm:text-base text-primary-custom">Installation Notes</h5>
                      <div className="text-xs sm:text-sm text-secondary-custom">
                        {analysisResult.notes.split('\n')
                          .filter(line => !line.includes('Installation Notes')) // Remove duplicate heading
                          .map((line, index) => {
                          if (line.startsWith('**') && line.endsWith('**') && !line.includes(':')) {
                            return <h6 key={index} className="font-semibold text-primary-custom mt-4 mb-2 text-base">{line.replace(/\*\*/g, '')}</h6>;
                          }
                          if (line.startsWith('**') && line.endsWith(':**')) {
                            return <h6 key={index} className="font-semibold text-primary-custom mt-4 mb-2 text-base">{line.replace(/\*\*/g, '')}</h6>;
                          }
                          if (line.startsWith('•')) {
                            return <div key={index} className="ml-2 mb-1 flex items-start"><span className="text-blue-500 mr-2 font-medium">•</span><span className="flex-1">{line.substring(1).trim()}</span></div>;
                          }
                          if (line.trim() === '') {
                            return <div key={index} className="mb-2"></div>;
                          }
                          return <div key={index} className="mb-1 text-gray-700">{line}</div>;
                        })}
                      </div>
                    </div>
                  </div>

                      {/* Action Buttons */}
                      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm h-10" onClick={exportToText}>
                          <FileText className="mr-1 sm:mr-2" size={14} />
                          TXT Report
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg hover:bg-white text-sm h-10 shadow-md text-black hover:text-black" 
                          onClick={exportToJson}
                        >
                          <FileDown className="mr-1 sm:mr-2" size={14} />
                          JSON Data
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
    </div>
  );
}
