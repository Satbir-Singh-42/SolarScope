import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationCardProps {
  type: "validating" | "success" | "error" | "warning" | "info";
  title: string;
  description: string;
  className?: string;
}

export default function ValidationCard({ type, title, description, className }: ValidationCardProps) {
  const getIcon = () => {
    switch (type) {
      case "validating":
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "validating":
        return "border-blue-200 bg-blue-50 text-blue-900";
      case "success":
        return "border-green-200 bg-green-50 text-green-900";
      case "error":
        return "border-red-200 bg-red-50 text-red-900";
      case "warning":
        return "border-orange-200 bg-orange-50 text-orange-900";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-900";
      default:
        return "border-gray-200 bg-gray-50 text-gray-900";
    }
  };

  const getBadgeVariant = () => {
    switch (type) {
      case "validating":
        return "secondary";
      case "success":
        return "default";
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card className={cn("border-l-4 transition-all duration-300", getStyles(), className)}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{title}</h3>
              <Badge variant={getBadgeVariant()} className="text-xs">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}