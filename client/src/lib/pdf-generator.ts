import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InstallationResult, FaultResult } from '../../../shared/schema';

export async function generateInstallationPDF(
  result: InstallationResult,
  imageUrl: string,
  analysisCanvasRef?: React.RefObject<HTMLCanvasElement>
): Promise<void> {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(34, 197, 94);
    pdf.text('SolarScope AI - Installation Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Analysis Summary
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Installation Analysis Summary', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    const summaryItems = [
      `Total Panels Recommended: ${result.totalPanels}`,
      `Roof Coverage: ${result.coverage}%`,
      `System Efficiency: ${result.efficiency}%`,
      `Confidence Score: ${result.confidence}%`,
      `Estimated Power Output: ${result.powerOutput} kW`,
      `Roof Type: ${result.roofType || 'Standard'}`,
      `Usable Roof Area: ${result.usableRoofArea || 'Calculated'} sq ft`
    ];

    summaryItems.forEach(item => {
      if (yPosition > pageHeight - 15) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(item, 25, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Analysis Image (if available)
    if (imageUrl) {
      try {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.text('Original Rooftop Image', 20, yPosition);
        yPosition += 10;
        
        // Create image element and convert to base64
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const imgWidth = 80;
        const imgHeight = (img.height / img.width) * imgWidth;
        
        pdf.addImage(imgData, 'JPEG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
      } catch (error) {
        console.warn('Could not add image to PDF:', error);
      }
    }

    // Analysis Visualization (if available)
    if (analysisCanvasRef?.current) {
      try {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.text('Panel Layout Analysis', 20, yPosition);
        yPosition += 10;

        const overlayCanvas = await html2canvas(analysisCanvasRef.current, {
          backgroundColor: '#f3f4f6',
          scale: 1,
          logging: false
        });
        
        const overlayData = overlayCanvas.toDataURL('image/png');
        const overlayWidth = 80;
        const overlayHeight = (overlayCanvas.height / overlayCanvas.width) * overlayWidth;

        pdf.addImage(overlayData, 'PNG', 20, yPosition, overlayWidth, overlayHeight);
        yPosition += overlayHeight + 15;
      } catch (error) {
        console.warn('Could not add analysis visualization to PDF:', error);
      }
    }

    // Recommendations
    if (result.recommendations && result.recommendations.length > 0) {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.text('Recommendations', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      result.recommendations.forEach((rec, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const lines = pdf.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
        pdf.text(lines, 25, yPosition);
        yPosition += lines.length * 7 + 5;
      });
    }

    // Technical Details
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.text('Technical Details', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    const technicalDetails = [
      `Roof Type: ${result.roofType || 'Standard'}`,
      `Orientation: ${result.orientation || 'Optimal'}`,
      `Shading Analysis: ${result.shadingAnalysis || 'Minimal shading detected'}`,
      `Panel Efficiency: Standard residential solar panels`,
      `Estimated Annual Production: ${(result.powerOutput * 1.2 * 365).toFixed(0)} kWh`,
      `System Confidence: ${result.confidence}% analysis accuracy`
    ];

    technicalDetails.forEach(detail => {
      if (yPosition > pageHeight - 15) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(detail, 25, yPosition);
      yPosition += 7;
    });

    // Save PDF
    pdf.save(`SolarScope-Installation-Analysis-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF report');
  }
}

export async function generateFaultDetectionPDF(
  result: FaultResult,
  imageUrl: string,
  analysisCanvasRef?: React.RefObject<HTMLCanvasElement>
): Promise<void> {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(220, 38, 38);
    pdf.text('SolarScope AI - Fault Detection Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Analysis Summary
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Fault Detection Summary', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    const faultCounts = result.faults.reduce((acc, fault) => {
      acc[fault.severity] = (acc[fault.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summaryItems = [
      `Total Faults Detected: ${result.faults.length}`,
      `Critical Issues: ${faultCounts.Critical || 0}`,
      `High Priority: ${faultCounts.High || 0}`,
      `Medium Priority: ${faultCounts.Medium || 0}`,
      `Low Priority: ${faultCounts.Low || 0}`,
      `Overall System Health: ${result.overallCondition || 'Analysis Complete'}`,
      `Confidence Score: ${result.confidence.toFixed(1)}%`
    ];

    summaryItems.forEach(item => {
      if (yPosition > pageHeight - 15) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(item, 25, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Analysis Image (if available)
    if (imageUrl) {
      try {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.text('Solar Panel System Image', 20, yPosition);
        yPosition += 10;
        
        // Create image element and convert to base64
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const imgWidth = 80;
        const imgHeight = (img.height / img.width) * imgWidth;
        
        pdf.addImage(imgData, 'JPEG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
      } catch (error) {
        console.warn('Could not add image to PDF:', error);
      }
    }

    // Fault Detection Visualization (if available)
    if (analysisCanvasRef?.current) {
      try {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.text('Fault Detection Analysis', 20, yPosition);
        yPosition += 10;

        const overlayCanvas = await html2canvas(analysisCanvasRef.current, {
          backgroundColor: '#f3f4f6',
          scale: 1,
          logging: false
        });
        
        const overlayData = overlayCanvas.toDataURL('image/png');
        const overlayWidth = 80;
        const overlayHeight = (overlayCanvas.height / overlayCanvas.width) * overlayWidth;

        pdf.addImage(overlayData, 'PNG', 20, yPosition, overlayWidth, overlayHeight);
        yPosition += overlayHeight + 15;
      } catch (error) {
        console.warn('Could not add analysis visualization to PDF:', error);
      }
    }

    // Detailed Fault List
    if (result.faults.length > 0) {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.text('Detected Faults', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      result.faults.forEach((fault, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${index + 1}. ${fault.type} (${fault.severity})`, 25, yPosition);
        yPosition += 7;
        
        if (fault.description) {
          pdf.setTextColor(80, 80, 80);
          const lines = pdf.splitTextToSize(fault.description, pageWidth - 50);
          pdf.text(lines, 30, yPosition);
          yPosition += lines.length * 5 + 5;
        }
      });
    }

    // Recommendations
    if (result.recommendations && result.recommendations.length > 0) {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Maintenance Recommendations', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      result.recommendations.forEach((rec, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const lines = pdf.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
        pdf.text(lines, 25, yPosition);
        yPosition += lines.length * 7 + 5;
      });
    }

    // Technical Details
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.text('Technical Details', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    const technicalDetails = [
      `Analysis Confidence: ${result.confidence.toFixed(1)}%`,
      `System Health Status: ${result.overallCondition || 'Evaluated'}`,
      `Total Issues Found: ${result.faults.length}`,
      `Inspection Date: ${new Date().toLocaleDateString()}`,
      `Report Generated by: SolarScope AI Analysis System`
    ];

    technicalDetails.forEach(detail => {
      if (yPosition > pageHeight - 15) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(detail, 25, yPosition);
      yPosition += 7;
    });

    // Save PDF
    pdf.save(`SolarScope-Fault-Detection-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF report');
  }
}