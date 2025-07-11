import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, X, Zap } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import ValidationCard from "./validation-card";
import { validateImageForInstallation, validateImageForFaultDetection, ValidationResult } from "@/lib/image-validation";

interface ImageUploadProps {
  onUpload: (file: File) => void;
  onAnalyze?: (file: File) => void;
  uploading?: boolean;
  accept?: string;
  maxSize?: number;
  title: string;
  description: string;
  validationType: "installation" | "fault-detection";
}

export default function ImageUpload({
  onUpload,
  onAnalyze,
  uploading = false,
  accept = "image/*",
  maxSize = 50 * 1024 * 1024, // 50MB
  title,
  description,
  validationType
}: ImageUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showValidationCard, setShowValidationCard] = useState(false);
  const [showThinkingAnimation, setShowThinkingAnimation] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Show preview immediately with thinking animation
      setUploadedFile(file);
      setPreview(URL.createObjectURL(file));
      setShowThinkingAnimation(true);
      
      setIsValidating(true);
      setValidationResult({
        isValid: false,
        type: "validating",
        title: "Validating Image",
        description: "Please wait while we validate your image..."
      });

      try {
        const result = validationType === "installation" 
          ? await validateImageForInstallation(file)
          : await validateImageForFaultDetection(file);

        setValidationResult(result);
        setShowValidationCard(true);
        
        if (result.isValid) {
          onUpload(file);
        } else {
          // If validation fails, remove the preview
          setUploadedFile(null);
          if (preview) {
            URL.revokeObjectURL(preview);
          }
          setPreview(null);
        }

        // Auto-hide validation card after 2.5 seconds
        setTimeout(() => {
          setShowValidationCard(false);
        }, 2500);
      } catch (error) {
        console.error('Validation error:', error);
        setValidationResult({
          isValid: false,
          type: "error",
          title: "Validation Failed",
          description: "Unable to validate the image. Please try again."
        });
        setShowValidationCard(true);
        
        // Auto-hide validation card after 2.5 seconds
        setTimeout(() => {
          setShowValidationCard(false);
        }, 2500);
      } finally {
        setIsValidating(false);
        setShowThinkingAnimation(false);
      }
    }
  }, [onUpload, validationType, preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    maxSize,
    multiple: false,
    disabled: uploading
  });

  const removeFile = () => {
    setUploadedFile(null);
    setValidationResult(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  return (
    <>
      {/* Validation Card - Fixed position overlay */}
      <AnimatePresence>
        {showValidationCard && validationResult && (
          <ValidationCard
            type={validationResult.type}
            title={validationResult.title}
            description={validationResult.description}
            onClose={() => setShowValidationCard(false)}
          />
        )}
      </AnimatePresence>

      <Card className="shadow-material">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-primary-custom">{title}</h3>
        
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-10 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-primary bg-blue-50'
                : 'border-gray-300 hover:border-primary'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <CloudUpload className="mx-auto text-gray-400 mb-3 sm:mb-4" size={32} />
            <p className="text-sm sm:text-base text-secondary-custom mb-2">
              {isDragActive ? 'Drop the image here' : 'Drag and drop your image here'}
            </p>
            <p className="text-xs sm:text-sm text-secondary-custom mb-3 sm:mb-4">or click to browse files</p>
            <p className="text-xs sm:text-sm text-secondary-custom mb-2">
              Supported formats: JPG, PNG, TIFF (Max 50MB)
            </p>
            <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 mb-3 sm:mb-4 px-2">
              {title.includes('Installation') || title.includes('Rooftop')
                ? 'Upload rooftop or building images only (aerial/angled views)'
                : 'Upload solar panel or photovoltaic equipment images only'
              }
            </p>
            <Button 
              type="button" 
              className="bg-primary hover:bg-blue-700 text-white text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-6"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Select Image'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview || ''}
                alt="Upload preview"
                className={`w-full h-48 sm:h-56 md:h-64 object-contain rounded-lg border border-gray-200 bg-gray-50 transition-all duration-300 ${
                  showThinkingAnimation ? 'opacity-70' : 'opacity-100'
                }`}
              />
              
              {/* Thinking Animation Overlay */}
              {showThinkingAnimation && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                  <div className="bg-white bg-opacity-90 rounded-lg p-4 flex items-center space-x-3 shadow-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">Thinking...</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={removeFile}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="text-sm text-secondary-custom space-y-1">
              <p><strong>File:</strong> {uploadedFile.name}</p>
              <p><strong>Size:</strong> {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {onAnalyze && (
              <Button 
                onClick={() => onAnalyze(uploadedFile)}
                disabled={uploading}
                className="w-full bg-primary hover:bg-blue-700 text-white h-11 sm:h-12 text-sm sm:text-base"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2" size={16} />
                    Start AI Analysis
                  </>
                )}
              </Button>
            )}
          </div>
        )}
        
        <p className="text-xs sm:text-sm text-secondary-custom mt-4 px-2">{description}</p>
      </CardContent>
    </Card>
    </>
  );
}
