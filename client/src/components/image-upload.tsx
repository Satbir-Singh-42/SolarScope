import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, X, Zap } from "lucide-react";

interface ImageUploadProps {
  onUpload: (file: File) => void;
  onAnalyze?: (file: File) => void;
  uploading?: boolean;
  accept?: string;
  maxSize?: number;
  title: string;
  description: string;
}

export default function ImageUpload({
  onUpload,
  onAnalyze,
  uploading = false,
  accept = "image/*",
  maxSize = 50 * 1024 * 1024, // 50MB
  title,
  description
}: ImageUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setPreview(URL.createObjectURL(file));
      onUpload(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    maxSize,
    multiple: false,
    disabled: uploading
  });

  const removeFile = () => {
    setUploadedFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  return (
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
                className="w-full h-48 sm:h-56 md:h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
              />
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
  );
}
