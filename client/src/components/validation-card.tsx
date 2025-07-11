import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationCardProps {
  type: "validating" | "success" | "error" | "warning" | "info";
  title: string;
  description: string;
  className?: string;
  onClose?: () => void;
}

export default function ValidationCard({ type, title, description, className, onClose }: ValidationCardProps) {
  const getIcon = () => {
    switch (type) {
      case "validating":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "validating":
        return "bg-white border-blue-200 shadow-lg";
      case "success":
        return "bg-white border-green-200 shadow-lg";
      case "error":
        return "bg-white border-red-200 shadow-lg";
      case "warning":
        return "bg-white border-orange-200 shadow-lg";
      case "info":
        return "bg-white border-blue-200 shadow-lg";
      default:
        return "bg-white border-gray-200 shadow-lg";
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case "validating":
        return "text-blue-700";
      case "success":
        return "text-green-700";
      case "error":
        return "text-red-700";
      case "warning":
        return "text-orange-700";
      case "info":
        return "text-blue-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.95 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={cn(
        "fixed top-4 left-4 z-50 rounded-lg border-2 p-4 max-w-sm shadow-xl",
        getStyles(),
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn("text-sm font-semibold", getTitleColor())}>
            {title}
          </h3>
          <p className="mt-1 text-xs text-gray-600">
            {description}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
    </motion.div>
  );
}