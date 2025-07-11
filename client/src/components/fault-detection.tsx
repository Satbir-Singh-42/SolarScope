import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Eye, Download, Calendar, Share, FileText, X, Trash2, FileDown } from "lucide-react";

import ImageUpload from "./image-upload";
import AnalysisOverlay from "./analysis-overlay";
import { apiRequest, checkBackendHealth } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateFaultDetectionPDF } from "@/lib/pdf-generator";
import type { FaultResult } from "@shared/schema";

export default function FaultDetection() {
  const [analysisResults, setAnalysisResults] = useState<FaultResult[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);

  const analysisMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log('Starting fault detection for file:', file.name, file.size);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', '1');
      
      console.log('FormData created, sending request...');
      
      const response = await apiRequest('POST', '/api/analyze/fault-detection', formData);
      const data = await response.json();
      console.log('Fault detection successful:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Fault detection complete, setting results:', data);
      setAnalysisResults(prev => [...prev, data.results]);
      
      // Only add image URL when analysis succeeds
      if (currentImageFile) {
        const imageUrl = URL.createObjectURL(currentImageFile);
        setImageUrls(prev => [...prev, imageUrl]);
        setCurrentImageFile(null);
      }
      
      // Smooth scroll to results after a brief delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
      
      toast({
        title: "Fault Detection Complete",
        description: "Your solar panel analysis has been completed successfully.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error('Fault detection error:', error);
      
      // Clear the current image file when analysis fails
      setCurrentImageFile(null);
      
      // Extract error message and provide specific validation warnings
      let errorMessage = "Failed to analyze the image. Please try again.";
      let errorTitle = "Analysis Failed";
      
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes('not solar panel') || errorText.includes('no solar') || errorText.includes('rooftop')) {
          errorTitle = "Invalid Image for Fault Detection";
          errorMessage = "Please upload a solar panel image. This feature analyzes existing solar panel installations for defects and performance issues, not rooftops.";
        } else if (errorText.includes('indoor') || errorText.includes('interior')) {
          errorTitle = "Indoor Image Detected";
          errorMessage = "Please upload an outdoor solar panel image. Indoor or interior photos cannot be used for fault detection analysis.";
        } else if (errorText.includes('invalid') || errorText.includes('not valid')) {
          errorTitle = "Image Validation Failed";
          errorMessage = "Please upload a clear image showing solar panels or photovoltaic equipment for fault detection analysis.";
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
    // Store the file for later use when analysis succeeds
    setCurrentImageFile(file);
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
    
    setCurrentImageFile(file);
    analysisMutation.mutate(file);
  };

  const removeResult = (indexToRemove: number) => {
    setAnalysisResults(prev => prev.filter((_, index) => index !== indexToRemove));
    setImageUrls(prev => {
      // Clean up the object URL to prevent memory leaks
      const urlToRemove = prev[indexToRemove];
      if (urlToRemove) {
        URL.revokeObjectURL(urlToRemove);
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
    
    toast({
      title: "Result Removed",
      description: "Fault detection result has been removed successfully.",
      variant: "success",
    });
  };

  const clearAllResults = () => {
    // Clean up all object URLs to prevent memory leaks
    imageUrls.forEach(url => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });
    
    setAnalysisResults([]);
    setImageUrls([]);
    
    toast({
      title: "All Results Cleared",
      description: "All fault detection results have been cleared.",
      variant: "success",
    });
  };

  const exportToText = () => {
    if (analysisResults.length === 0) return;
    
    const reportContent = `
SOLAR PANEL FAULT DETECTION REPORT
===================================

Analysis Date: ${new Date().toLocaleDateString()}
Analysis Time: ${new Date().toLocaleTimeString()}

SUMMARY:
- Total Panels Analyzed: ${analysisResults.length}
- Total Issues Found: ${getTotalIssues()}
- Critical Issues: ${getIssuesByType('critical')}
- High Priority Issues: ${getIssuesByType('high')}
- Medium Priority Issues: ${getIssuesByType('medium')}
- Low Priority Issues: ${getIssuesByType('low')}

DETAILED ANALYSIS:
${analysisResults.map((result, index) => `
Panel ${index + 1}: ${result.panelId}
Overall Health: ${result.overallHealth}
Faults Found: ${result.faults.length}

${result.faults.map((fault, faultIndex) => `
  Fault ${faultIndex + 1}:
  - Type: ${fault.type}
  - Severity: ${fault.severity}

  - Description: ${fault.description}
`).join('')}

Recommendations:
${result.recommendations.map(rec => `- ${rec}`).join('\n')}
`).join('\n')}

IMMEDIATE ACTION REQUIRED:
${analysisResults.some(r => r.faults.some(f => f.severity === 'Critical')) ? 
  '- Critical issues detected - immediate professional inspection required' : 
  '- No critical issues found - continue regular monitoring'}

Generated by SolarScope AI Fault Detection System
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-fault-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Exported",
      description: "Fault detection report has been downloaded as a text file.",
    });
  };

  const exportToJson = () => {
    if (analysisResults.length === 0) return;
    
    const exportData = {
      analysisDate: new Date().toISOString(),
      type: 'fault-detection',
      summary: {
        totalPanels: analysisResults.length,
        totalIssues: getTotalIssues(),
        criticalIssues: getIssuesByType('critical'),
        highPriorityIssues: getIssuesByType('high'),
        mediumPriorityIssues: getIssuesByType('medium'),
        lowPriorityIssues: getIssuesByType('low')
      },
      results: analysisResults,
      metadata: {
        generatedBy: 'SolarScope AI',
        version: '1.0'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-fault-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Fault detection data has been downloaded as a JSON file.",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-50 text-red-700';
      case 'high': return 'bg-red-50 text-red-600';
      case 'medium': return 'bg-yellow-50 text-yellow-700';
      case 'low': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="text-red-500" size={16} />;
      case 'medium':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      default:
        return <CheckCircle className="text-green-500" size={16} />;
    }
  };

  const getTotalIssues = () => {
    return analysisResults.reduce((total, result) => total + result.faults.length, 0);
  };

  const getIssuesByType = (type: string) => {
    return analysisResults.reduce((total, result) => {
      return total + result.faults.filter(fault => fault.severity.toLowerCase() === type).length;
    }, 0);
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-0">
      <ImageUpload
        onUpload={handleImageUpload}
        onAnalyze={handleAnalyze}
        uploading={analysisMutation.isPending}
        title="Upload Solar Panel Images"
        description="Upload images showing solar panels or photovoltaic equipment. After uploading, click 'Start AI Analysis' to detect defects, cracks, and performance issues using Google Gemini AI."
        validationType="fault-detection"
      />

      {(analysisResults.length > 0 || analysisMutation.isPending) && (
        <>
          {/* Fault Analysis Results */}
          <div 
            ref={resultsRef}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 slide-down-bounce"
          >
            {analysisResults.map((result, index) => (
              <Card key={index} className={`shadow-material slide-up-stagger stagger-${(index % 3) + 1}`}>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="relative mb-3 sm:mb-4">
                    <AnalysisOverlay
                      imageUrl={imageUrls[index] || ''}
                      faults={result.faults}
                      type="fault-detection"
                      ref={index === 0 ? analysisCanvasRef : undefined}
                    />
                    <Badge 
                      className={`absolute top-1 right-1 sm:top-2 sm:right-2 ${
                        result.faults.length > 0 ? 'bg-red-500' : 'bg-green-500'
                      } text-white text-xs`}
                    >
                      {result.faults.length > 0 ? (
                        <>
                          <AlertTriangle className="mr-1" size={10} />
                          <span className="text-xs">{result.faults.length} Issues</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-1" size={10} />
                          <span className="text-xs">No Issues</span>
                        </>
                      )}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeResult(index)}
                      className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-white/90 hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 p-1 h-6 w-6 rounded-full"
                      title="Remove this result"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3 lg:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 sm:mb-2 gap-1 sm:gap-2">
                        <h5 className="font-semibold text-sm sm:text-base lg:text-lg text-primary-custom">Panel {result.panelId}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${
                          result.overallHealth === 'Excellent' ? 'bg-green-100 text-green-800' :
                          result.overallHealth === 'Good' ? 'bg-blue-100 text-blue-800' :
                          result.overallHealth === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                          result.overallHealth === 'Poor' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.overallHealth}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Analysis completed on {new Date().toLocaleDateString()}</p>
                    </div>
                    
                    {result.faults.map((fault, faultIndex) => (
                      <div key={faultIndex} className={`p-2 sm:p-3 lg:p-4 rounded-lg border-l-4 ${
                        fault.severity === 'Critical' ? 'border-red-500 bg-red-50' :
                        fault.severity === 'High' ? 'border-orange-500 bg-orange-50' :
                        fault.severity === 'Medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-green-500 bg-green-50'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 sm:mb-1.5 gap-1">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {getSeverityIcon(fault.severity)}
                            <span className="text-xs sm:text-sm font-medium">{fault.type}</span>
                          </div>
                          <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded self-start ${
                            fault.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                            fault.severity === 'High' ? 'bg-orange-200 text-orange-800' :
                            fault.severity === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-green-200 text-green-800'
                          }`}>
                            {fault.severity}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{fault.description}</p>

                      </div>
                    ))}
                    
                    {/* Performance Impact Section */}
                    {result.faults.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                        <h6 className="font-semibold text-sm mb-2 text-gray-800">Performance Impact Analysis</h6>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <div className={`bg-white rounded p-2 border-l-4 ${
                            result.faults.some(f => f.severity === 'Critical') ? 'border-red-500' :
                            result.faults.some(f => f.severity === 'High') ? 'border-orange-500' :
                            'border-yellow-500'
                          }`}>
                            <div className="font-medium text-gray-800 text-xs">Expected Loss</div>
                            <div className={`text-xs font-semibold ${
                              result.faults.some(f => f.severity === 'Critical') ? 'text-red-600' :
                              result.faults.some(f => f.severity === 'High') ? 'text-orange-600' :
                              'text-yellow-600'
                            }`}>
                              {result.faults.some(f => f.severity === 'Critical') ? '25-40%' :
                               result.faults.some(f => f.severity === 'High') ? '10-25%' :
                               '5-10%'}
                            </div>
                          </div>
                          <div className={`bg-white rounded p-2 border-l-4 ${
                            result.faults.some(f => f.severity === 'Critical') ? 'border-red-500' :
                            result.faults.some(f => f.severity === 'High') ? 'border-orange-500' :
                            'border-yellow-500'
                          }`}>
                            <div className="font-medium text-gray-800 text-xs">Action Priority</div>
                            <div className={`text-xs font-semibold ${
                              result.faults.some(f => f.severity === 'Critical') ? 'text-red-600' :
                              result.faults.some(f => f.severity === 'High') ? 'text-orange-600' :
                              'text-yellow-600'
                            }`}>
                              {result.faults.some(f => f.severity === 'Critical') ? 'Urgent' :
                               result.faults.some(f => f.severity === 'High') ? 'High' :
                               'Medium'}
                            </div>
                          </div>
                          <div className={`bg-white rounded p-2 border-l-4 ${
                            result.faults.some(f => f.severity === 'Critical') ? 'border-red-500' :
                            result.faults.some(f => f.severity === 'High') ? 'border-orange-500' :
                            'border-yellow-500'
                          }`}>
                            <div className="font-medium text-gray-800 text-xs">Timeline</div>
                            <div className={`text-xs font-semibold ${
                              result.faults.some(f => f.severity === 'Critical') ? 'text-red-600' :
                              result.faults.some(f => f.severity === 'High') ? 'text-orange-600' :
                              'text-yellow-600'
                            }`}>
                              {result.faults.some(f => f.severity === 'Critical') ? '24-48 hrs' :
                               result.faults.some(f => f.severity === 'High') ? '1-2 weeks' :
                               '1-3 months'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {result.faults.length === 0 && (
                      <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="text-white" size={12} />
                          </div>
                          <div>
                            <h6 className="font-semibold text-green-800 text-xs sm:text-sm lg:text-base">No Issues Detected</h6>
                            <p className="text-xs text-green-600">Panel is operating in excellent condition</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <div className="bg-white/70 rounded p-2 border-l-4 border-green-500">
                            <div className="font-medium text-green-800 text-xs">Performance</div>
                            <div className="text-green-600 text-xs font-semibold">100%</div>
                            <div className="text-green-500 text-xs">Excellent</div>
                          </div>
                          <div className="bg-white/70 rounded p-2 border-l-4 border-green-500">
                            <div className="font-medium text-green-800 text-xs">Power Output</div>
                            <div className="text-green-600 text-xs font-semibold">Normal</div>
                            <div className="text-green-500 text-xs">No degradation</div>
                          </div>
                          <div className="bg-white/70 rounded p-2 border-l-4 border-green-500">
                            <div className="font-medium text-green-800 text-xs">Next Check</div>
                            <div className="text-green-600 text-xs font-semibold">6 months</div>
                            <div className="text-green-500 text-xs">Routine only</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 sm:mt-4 lg:mt-6 flex flex-col sm:flex-row gap-2">
                    <Button 
                      className="flex-1 bg-primary hover:bg-blue-700 text-white text-xs sm:text-sm h-8 sm:h-10"
                      onClick={() => {
                        const detailsModal = document.createElement('div');
                        detailsModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
                        
                        // Add click outside to close functionality
                        detailsModal.addEventListener('click', (e) => {
                          if (e.target === detailsModal) {
                            detailsModal.remove();
                          }
                        });
                        
                        detailsModal.innerHTML = `
                          <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div class="p-6">
                              <div class="flex items-center justify-between mb-4">
                                <h3 class="text-xl font-bold text-primary-custom">Detailed Analysis: Panel ${result.panelId}</h3>
                                <button class="text-gray-500 hover:text-gray-700 text-2xl" onclick="this.closest('.fixed').remove()">&times;</button>
                              </div>
                              
                              <div class="space-y-6">
                                <div class="bg-gray-50 rounded-lg p-4">
                                  <h4 class="font-semibold mb-2">Panel Information</h4>
                                  <div class="grid grid-cols-2 gap-4 text-sm">
                                    <div><span class="font-medium">Panel ID:</span> ${result.panelId}</div>
                                    <div><span class="font-medium">Analysis Date:</span> ${new Date().toLocaleDateString()}</div>
                                    <div><span class="font-medium">Overall Health:</span> 
                                      <span class="px-2 py-1 rounded text-xs ml-2 ${
                                        result.overallHealth === 'Excellent' ? 'bg-green-100 text-green-800' :
                                        result.overallHealth === 'Good' ? 'bg-blue-100 text-blue-800' :
                                        result.overallHealth === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                        result.overallHealth === 'Poor' ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800'
                                      }">${result.overallHealth}</span>
                                    </div>
                                    <div><span class="font-medium">Issues Found:</span> ${result.faults.length}</div>
                                  </div>
                                </div>
                                
                                ${result.faults.length > 0 ? `
                                <div>
                                  <h4 class="font-semibold mb-3">Detected Issues</h4>
                                  <div class="space-y-3">
                                    ${result.faults.map((fault, i) => `
                                      <div class="border rounded-lg p-4 ${
                                        fault.severity === 'Critical' ? 'border-red-300 bg-red-50' :
                                        fault.severity === 'High' ? 'border-orange-300 bg-orange-50' :
                                        fault.severity === 'Medium' ? 'border-yellow-300 bg-yellow-50' :
                                        'border-green-300 bg-green-50'
                                      }">
                                        <div class="flex justify-between items-start mb-2">
                                          <h5 class="font-medium">${fault.type}</h5>
                                          <span class="text-xs px-2 py-1 rounded ${
                                            fault.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                                            fault.severity === 'High' ? 'bg-orange-200 text-orange-800' :
                                            fault.severity === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                                            'bg-green-200 text-green-800'
                                          }">${fault.severity}</span>
                                        </div>
                                        <p class="text-sm text-gray-600 mb-2">${fault.description}</p>

                                      </div>
                                    `).join('')}
                                  </div>
                                </div>
                                ` : `
                                <div class="bg-green-50 rounded-lg p-6 text-center">
                                  <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  </div>
                                  <h4 class="font-semibold text-green-800 mb-2">Panel in Excellent Condition</h4>
                                  <p class="text-green-600">No defects, cracks, or performance issues detected. This panel is operating optimally.</p>
                                </div>
                                `}
                                
                                <div>
                                  <h4 class="font-semibold mb-3">Maintenance Recommendations</h4>
                                  <div class="bg-blue-50 rounded-lg p-4">
                                    <ul class="space-y-2">
                                      ${result.recommendations.map(rec => `
                                        <li class="flex items-start space-x-2">
                                          <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                          <span class="text-sm">${rec.replace(/[\*\*\•]/g, '').trim()}</span>
                                        </li>
                                      `).join('')}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              
                              <div class="mt-6 pt-4 border-t">
                                <button class="w-full bg-primary hover:bg-blue-700 text-white py-2 px-4 rounded" onclick="this.closest('.fixed').remove()">
                                  Close Details
                                </button>
                              </div>
                            </div>
                          </div>
                        `;
                        document.body.appendChild(detailsModal);
                      }}
                    >
                      <Eye className="mr-1 sm:mr-2" size={14} />
                      <span className="hidden sm:inline">View </span>Details
                    </Button>
                    {result.faults.length > 0 && (
                      <Button 
                        variant="outline" 
                        className="flex-1 text-xs sm:text-sm h-8 sm:h-10"
                        onClick={() => {
                          const reportData = `
Panel Analysis Report: ${result.panelId}
Overall Health: ${result.overallHealth}
Faults Detected: ${result.faults.length}

${result.faults.map((fault, i) => `
Fault ${i + 1}: ${fault.type}
Severity: ${fault.severity}
Location: ${(fault.x * 100).toFixed(1)}%, ${(fault.y * 100).toFixed(1)}%
Description: ${fault.description}
`).join('')}

Recommendations:
${result.recommendations.map(rec => `- ${rec}`).join('\n')}
                          `.trim();
                          
                          const blob = new Blob([reportData], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${result.panelId}-report.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download className="mr-1" size={12} />
                        <span className="hidden sm:inline">Export</span><span className="sm:hidden">Save</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Show loading card if analysis is pending */}
            {analysisMutation.isPending && (
              <Card className="shadow-material slide-down-grow">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="bg-gray-100 rounded-lg flex items-center justify-center h-32 sm:h-40 lg:h-48 mb-3 sm:mb-4">
                    <div className="text-center px-3">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
                      <p className="text-secondary-custom text-xs sm:text-sm mb-3 sm:mb-4">Analyzing solar panel...</p>
                      <div className="w-24 sm:w-32 lg:w-48 h-1 sm:h-1.5 lg:h-2 bg-gray-200 rounded-full mx-auto mb-2">
                        <div className="h-1 sm:h-1.5 lg:h-2 bg-primary rounded-full progress-animate"></div>
                      </div>
                      <p className="text-xs text-gray-500">AI fault detection in progress</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className={`bg-gray-100 animate-pulse rounded h-2 sm:h-3 lg:h-4 slide-up-stagger stagger-${i + 1}`}></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Diagnostic Summary */}
          {analysisResults.length > 0 && (
            <Card className="shadow-material slide-down-fade">
              <CardContent className="p-3 sm:p-4 lg:p-6 xl:p-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 lg:mb-6 text-primary-custom">Diagnostic Summary</h3>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                  <div className="text-center slide-up-stagger stagger-1">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-500 mb-1 sm:mb-2">{getIssuesByType('critical')}</div>
                    <div className="text-xs sm:text-sm text-secondary-custom">Critical Issues</div>
                  </div>
                  <div className="text-center slide-up-stagger stagger-2">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500 mb-1 sm:mb-2">{getIssuesByType('medium')}</div>
                    <div className="text-xs sm:text-sm text-secondary-custom">Medium Issues</div>
                  </div>
                  <div className="text-center slide-up-stagger stagger-3">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 mb-1 sm:mb-2">{getIssuesByType('low')}</div>
                    <div className="text-xs sm:text-sm text-secondary-custom">Low Issues</div>
                  </div>
                  <div className="text-center slide-up-stagger stagger-4">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-500 mb-1 sm:mb-2">
                      {analysisResults.filter(r => r.faults.length === 0).length}
                    </div>
                    <div className="text-xs sm:text-sm text-secondary-custom">Healthy Panels</div>
                  </div>
                </div>

                {/* Enhanced Maintenance Recommendations */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-blue-900">Professional Maintenance Plan</h4>
                  </div>
                  
                  {/* Categorized Recommendations */}
                  <div className="space-y-4">
                    {/* Immediate Actions - AI Generated */}
                    {analysisResults.some(r => r.faults.some(f => f.severity === 'Critical')) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <h5 className="font-semibold text-red-800 text-sm">Critical Issues - Immediate Action Required</h5>
                        </div>
                        <ul className="space-y-1 text-xs sm:text-sm text-red-700">
                          {analysisResults
                            .filter(r => r.faults.some(f => f.severity === 'Critical'))
                            .flatMap(r => r.recommendations.filter(rec => 
                              rec.toLowerCase().includes('immediate') || 
                              rec.toLowerCase().includes('turn off') || 
                              rec.toLowerCase().includes('24 hours') ||
                              rec.toLowerCase().includes('hazard')
                            ))
                            .slice(0, 4)
                            .map((rec, index) => (
                              <li key={index}>• {rec}</li>
                            ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Short-term Actions - AI Generated */}
                    {analysisResults.some(r => r.faults.some(f => f.severity === 'High' || f.severity === 'Medium')) && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">⚠</span>
                          </div>
                          <h5 className="font-semibold text-orange-800 text-sm">High/Medium Priority Actions</h5>
                        </div>
                        <ul className="space-y-1 text-xs sm:text-sm text-orange-700">
                          {analysisResults
                            .filter(r => r.faults.some(f => f.severity === 'High' || f.severity === 'Medium'))
                            .flatMap(r => r.recommendations.filter(rec => 
                              rec.toLowerCase().includes('schedule') || 
                              rec.toLowerCase().includes('weeks') || 
                              rec.toLowerCase().includes('monitor') ||
                              rec.toLowerCase().includes('inspection') ||
                              rec.toLowerCase().includes('check')
                            ))
                            .slice(0, 4)
                            .map((rec, index) => (
                              <li key={index}>• {rec}</li>
                            ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Preventive Maintenance - AI & Risk-Based */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <h5 className="font-semibold text-green-800 text-sm">
                          {analysisResults.some(r => r.faults.some(f => f.severity === 'Low')) 
                            ? 'Low Priority & Preventive Maintenance' 
                            : 'Preventive Maintenance'}
                        </h5>
                      </div>
                      <ul className="space-y-1 text-xs sm:text-sm text-green-700">
                        {analysisResults.some(r => r.faults.some(f => f.severity === 'Low')) ? (
                          <>
                            {analysisResults
                              .filter(r => r.faults.some(f => f.severity === 'Low'))
                              .flatMap(r => r.recommendations.filter(rec => 
                                rec.toLowerCase().includes('monthly') || 
                                rec.toLowerCase().includes('quarterly') || 
                                rec.toLowerCase().includes('routine') ||
                                rec.toLowerCase().includes('clean') ||
                                rec.toLowerCase().includes('document')
                              ))
                              .slice(0, 3)
                              .map((rec, index) => (
                                <li key={index}>• {rec}</li>
                              ))}
                          </>
                        ) : (
                          <>
                            <li>• Look for cracks or damage monthly</li>
                            <li>• Check if panels are clean</li>
                            <li>• Monitor power output numbers</li>
                            <li>• Call professional every 6 months</li>
                          </>
                        )}
                      </ul>
                    </div>
                    
                    {/* Performance Optimization - AI Adaptive */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">⚡</span>
                        </div>
                        <h5 className="font-semibold text-blue-800 text-sm">
                          {analysisResults.some(r => r.faults.length > 0) 
                            ? 'Performance Recovery & Optimization' 
                            : 'Performance Optimization'}
                        </h5>
                      </div>
                      <ul className="space-y-1 text-xs sm:text-sm text-blue-700">
                        {analysisResults.some(r => r.faults.length > 0) ? (
                          <>
                            <li>• Install monitoring system to track repair effectiveness</li>
                            <li>• Consider panel-level optimizers for damaged units</li>
                            <li>• Monitor power output before and after repairs</li>
                            <li>• Implement enhanced inspection schedule for affected panels</li>
                          </>
                        ) : (
                          <>
                            <li>• Install monitoring system for real-time performance tracking</li>
                            <li>• Review shading patterns and trim vegetation as needed</li>
                            <li>• Update system firmware and software regularly</li>
                            <li>• Consider efficiency upgrades for older panels</li>
                          </>
                        )}
                      </ul>
                    </div>
                    
                    {/* Cost-Benefit Analysis - AI Risk-Based */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">$</span>
                        </div>
                        <h5 className="font-semibold text-purple-800 text-sm">Risk-Based Cost Analysis</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-purple-700">
                        <div>
                          <div className="font-medium mb-1">Immediate Impact:</div>
                          <ul className="space-y-1">
                            {analysisResults.some(r => r.faults.some(f => f.severity === 'Critical')) && (
                              <li>• Critical issues: 25-40% power loss risk</li>
                            )}
                            {analysisResults.some(r => r.faults.some(f => f.severity === 'High')) && (
                              <li>• High priority: 15-25% efficiency reduction</li>
                            )}
                            {analysisResults.some(r => r.faults.some(f => f.severity === 'Medium')) && (
                              <li>• Medium priority: 5-15% output decrease</li>
                            )}
                            {analysisResults.every(r => r.faults.length === 0) && (
                              <li>• No issues detected: Maintain 100% efficiency</li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <div className="font-medium mb-1">Action Priority:</div>
                          <ul className="space-y-1">
                            {analysisResults.some(r => r.faults.some(f => f.severity === 'Critical')) && (
                              <li>• Critical: Immediate repair required</li>
                            )}
                            {analysisResults.some(r => r.faults.some(f => f.severity === 'High')) && (
                              <li>• High: Schedule within 1-2 weeks</li>
                            )}
                            {analysisResults.some(r => r.faults.some(f => f.severity === 'Medium')) && (
                              <li>• Medium: Plan within 30 days</li>
                            )}
                            {analysisResults.some(r => r.faults.some(f => f.severity === 'Low')) && (
                              <li>• Low: Include in routine maintenance</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Export Options */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-800 text-sm">Export & Management</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm h-11 shadow-md hover:shadow-lg" onClick={exportToText}>
                      <Download className="mr-1 sm:mr-2" size={14} />
                      <div className="text-left">
                        <div className="font-medium">TXT Report</div>
                        <div className="text-xs opacity-90">Detailed analysis</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg hover:bg-white text-sm h-11 shadow-md text-black hover:text-black" 
                      onClick={async () => {
                        if (analysisResults.length === 0 || imageUrls.length === 0) return;
                        
                        try {
                          // Use the first result and image for PDF generation
                          await generateFaultDetectionPDF(analysisResults[0], imageUrls[0], analysisCanvasRef);
                          toast({
                            title: "PDF Generated",
                            description: "Professional fault detection report has been downloaded.",
                            variant: "success",
                          });
                        } catch (error) {
                          console.error('PDF generation error:', error);
                          toast({
                            title: "PDF Generation Failed",
                            description: "Could not generate PDF report. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <FileDown className="mr-1 sm:mr-2" size={14} />
                      <div className="text-left">
                        <div className="font-medium">PDF Report</div>
                        <div className="text-xs opacity-70">Professional analysis</div>
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:shadow-lg hover:bg-white text-sm h-11 shadow-md text-black hover:text-black"
                      onClick={() => {
                        const summary = `
Solar Panel Analysis Summary
Generated: ${new Date().toLocaleString()}

Total Panels Analyzed: ${analysisResults.length}
Critical Issues: ${analysisResults.filter(r => r.faults.some(f => f.severity === 'Critical')).length}
High Priority Issues: ${analysisResults.filter(r => r.faults.some(f => f.severity === 'High')).length}
Medium Priority Issues: ${analysisResults.filter(r => r.faults.some(f => f.severity === 'Medium')).length}
Healthy Panels: ${analysisResults.filter(r => r.faults.length === 0).length}

Performance Impact:
- Critical panels may experience 25-40% power loss
- High priority panels may experience 10-25% power loss  
- Medium priority panels may experience 5-10% power loss

Recommended Actions:
${analysisResults.some(r => r.faults.some(f => f.severity === 'Critical')) ? '• URGENT: Address critical issues within 24-48 hours' : ''}
${analysisResults.some(r => r.faults.some(f => f.severity === 'High')) ? '• Schedule professional inspection within 1-2 weeks' : ''}
• Implement regular monitoring and maintenance schedule
• Consider professional cleaning service for optimal performance

Next Steps:
1. Address critical issues immediately
2. Schedule maintenance for high/medium priority items
3. Implement preventive maintenance schedule
4. Monitor performance metrics regularly
                        `.trim();
                        
                        const blob = new Blob([summary], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `solar-analysis-summary-${new Date().toISOString().split('T')[0]}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <svg className="mr-1 sm:mr-2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10,9 9,9 8,9"></polyline>
                      </svg>
                      <div className="text-left">
                        <div className="font-medium">Summary</div>
                        <div className="text-xs opacity-70">Executive brief</div>
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:from-red-100 hover:to-pink-100 hover:border-red-300 hover:shadow-lg text-red-600 hover:text-red-700 text-sm h-11 shadow-md" 
                      onClick={clearAllResults}
                    >
                      <Trash2 className="mr-1 sm:mr-2" size={14} />
                      <div className="text-left">
                        <div className="font-medium">Clear All</div>
                        <div className="text-xs opacity-70">Reset results</div>
                      </div>
                    </Button>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    All exports include timestamp and analysis metadata for professional documentation
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
