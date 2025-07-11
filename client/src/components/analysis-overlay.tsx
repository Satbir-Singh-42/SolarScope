import { useEffect, useRef, forwardRef } from "react";

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Fault {
  type: string;
  severity: string;
  x: number;
  y: number;
  description: string;
}

interface AnalysisOverlayProps {
  imageUrl: string;
  regions?: Region[];
  faults?: Fault[];
  type: 'installation' | 'fault-detection';
}

const AnalysisOverlay = forwardRef<HTMLCanvasElement, AnalysisOverlayProps>(({
  imageUrl,
  regions = [],
  faults = [],
  type
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageUrl) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match container
      const containerRect = container.getBoundingClientRect();
      canvas.width = containerRect.width;
      canvas.height = containerRect.height;

      // Calculate scaling factors
      const scaleX = canvas.width / img.width;
      const scaleY = canvas.height / img.height;
      const scale = Math.min(scaleX, scaleY);

      // Calculate centered position
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;

      // Draw the image
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      // Draw overlays based on type
      if (type === 'installation' && regions.length > 0) {
        drawInstallationOverlay(ctx, regions, offsetX, offsetY, scale, scaledWidth, scaledHeight);
      } else if (type === 'fault-detection' && faults.length > 0) {
        drawFaultOverlay(ctx, faults, offsetX, offsetY, scale, scaledWidth, scaledHeight);
      }
    };
    img.src = imageUrl;
  }, [imageUrl, regions, faults, type]);

  const drawInstallationOverlay = (
    ctx: CanvasRenderingContext2D,
    regions: Region[],
    offsetX: number,
    offsetY: number,
    scale: number,
    scaledWidth: number,
    scaledHeight: number
  ) => {
    regions.forEach((region, index) => {
      const x = offsetX + region.x * scaledWidth;
      const y = offsetY + region.y * scaledHeight;
      const width = region.width * scaledWidth;
      const height = region.height * scaledHeight;

      // Draw semi-transparent green rectangle
      ctx.fillStyle = 'rgba(56, 142, 60, 0.3)';
      ctx.fillRect(x, y, width, height);

      // Draw border
      ctx.strokeStyle = 'rgba(56, 142, 60, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw panel number
      ctx.fillStyle = 'rgba(56, 142, 60, 0.9)';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${index + 1}`, x + width / 2, y + height / 2);
    });
  };

  const drawFaultOverlay = (
    ctx: CanvasRenderingContext2D,
    faults: Fault[],
    offsetX: number,
    offsetY: number,
    scale: number,
    scaledWidth: number,
    scaledHeight: number
  ) => {
    faults.forEach(fault => {
      const x = offsetX + fault.x * scaledWidth;
      const y = offsetY + fault.y * scaledHeight;
      const radius = getSeverityRadius(fault.severity);

      // Draw fault marker
      ctx.fillStyle = getSeverityColor(fault.severity);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const getSeverityRadius = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 12;
      case 'high': return 10;
      case 'medium': return 8;
      case 'low': return 6;
      default: return 8;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#eab308';
      default: return '#6b7280';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative bg-gray-100 rounded-lg overflow-hidden w-full h-48 sm:h-56 md:h-64"
    >
      <canvas
        ref={(node) => {
          if (ref) {
            if (typeof ref === 'function') {
              ref(node);
            } else {
              ref.current = node;
            }
          }
          (canvasRef as any).current = node;
        }}
        className="absolute inset-0 w-full h-full object-contain"
      />
    </div>
  );
});

AnalysisOverlay.displayName = 'AnalysisOverlay';

export default AnalysisOverlay;
