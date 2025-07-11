import { apiRequest } from "@/lib/queryClient";

export type ValidationResult = {
  isValid: boolean;
  type: "validating" | "success" | "error" | "warning" | "info";
  title: string;
  description: string;
};

export async function validateImageForInstallation(file: File): Promise<ValidationResult> {
  try {
    // First validate file type and size
    if (!file.type.startsWith('image/')) {
      return {
        isValid: false,
        type: "error",
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPG, PNG, or TIFF format)."
      };
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      return {
        isValid: false,
        type: "error",
        title: "File Too Large",
        description: "Please upload an image smaller than 50MB."
      };
    }

    // Create a quick validation endpoint call
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'installation');

    const response = await apiRequest('POST', '/api/validate-image', formData);
    const data = await response.json();

    if (data.isValid) {
      return {
        isValid: true,
        type: "success",
        title: "Image Validated Successfully",
        description: "Rooftop image uploaded successfully. Ready for AI analysis."
      };
    } else {
      return {
        isValid: false,
        type: "error",
        title: "Invalid Image for Installation Analysis",
        description: "Please upload a rooftop or building image. This feature analyzes roof structures for solar panel installation planning."
      };
    }
  } catch (error) {
    console.error('Image validation error:', error);
    
    if (error instanceof Error) {
      const errorText = error.message.toLowerCase();
      
      if (errorText.includes('not a rooftop') || errorText.includes('no roof')) {
        return {
          isValid: false,
          type: "error",
          title: "Invalid Image for Installation Analysis",
          description: "Please upload a rooftop or building image. This feature analyzes roof structures for solar panel installation planning."
        };
      }
      
      if (errorText.includes('network') || errorText.includes('timeout')) {
        return {
          isValid: false,
          type: "warning",
          title: "Connection Error",
          description: "Network connection failed. Please check your internet connection and try again."
        };
      }
      
      if (errorText.includes('backend not connected') || errorText.includes('server not available')) {
        return {
          isValid: false,
          type: "warning",
          title: "Server Unavailable",
          description: "The server is currently unavailable. Please try again later."
        };
      }
    }
    
    return {
      isValid: false,
      type: "error",
      title: "Validation Failed",
      description: "Unable to validate the image. Please try again or contact support if the problem persists."
    };
  }
}

export async function validateImageForFaultDetection(file: File): Promise<ValidationResult> {
  try {
    // First validate file type and size
    if (!file.type.startsWith('image/')) {
      return {
        isValid: false,
        type: "error",
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPG, PNG, or TIFF format)."
      };
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      return {
        isValid: false,
        type: "error",
        title: "File Too Large",
        description: "Please upload an image smaller than 50MB."
      };
    }

    // Create a quick validation endpoint call
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'fault-detection');

    const response = await apiRequest('POST', '/api/validate-image', formData);
    const data = await response.json();

    if (data.isValid) {
      return {
        isValid: true,
        type: "success",
        title: "Image Validated Successfully",
        description: "Solar panel image uploaded successfully. Ready for fault detection analysis."
      };
    } else {
      return {
        isValid: false,
        type: "error",
        title: "Invalid Image for Fault Detection",
        description: "Please upload a solar panel image. This feature analyzes existing solar panel installations for defects and performance issues."
      };
    }
  } catch (error) {
    console.error('Image validation error:', error);
    
    if (error instanceof Error) {
      const errorText = error.message.toLowerCase();
      
      if (errorText.includes('not solar panel') || errorText.includes('no solar')) {
        return {
          isValid: false,
          type: "error",
          title: "Invalid Image for Fault Detection",
          description: "Please upload a solar panel image. This feature analyzes existing solar panel installations for defects and performance issues."
        };
      }
      
      if (errorText.includes('network') || errorText.includes('timeout')) {
        return {
          isValid: false,
          type: "warning",
          title: "Connection Error",
          description: "Network connection failed. Please check your internet connection and try again."
        };
      }
      
      if (errorText.includes('backend not connected') || errorText.includes('server not available')) {
        return {
          isValid: false,
          type: "warning",
          title: "Server Unavailable",
          description: "The server is currently unavailable. Please try again later."
        };
      }
    }
    
    return {
      isValid: false,
      type: "error",
      title: "Validation Failed",
      description: "Unable to validate the image. Please try again or contact support if the problem persists."
    };
  }
}