import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InstallationResult, FaultResult } from '../../../shared/schema';

// Professional color scheme
const colors = {
  primary: [34, 197, 94], // Green
  secondary: [59, 130, 246], // Blue
  accent: [168, 85, 247], // Purple
  danger: [239, 68, 68], // Red
  warning: [245, 158, 11], // Amber
  text: [31, 41, 55], // Gray-800
  textLight: [75, 85, 99], // Gray-600
  textMuted: [156, 163, 175], // Gray-400
  background: [249, 250, 251], // Gray-50
  white: [255, 255, 255]
};

function addProfessionalHeader(pdf: jsPDF, title: string, subtitle: string, color: number[]) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Header background
  pdf.setFillColor(...colors.background);
  pdf.rect(0, 0, pageWidth, 45, 'F');
  
  // Main title
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...color);
  pdf.text(title, pageWidth / 2, 18, { align: 'center' });
  
  // Subtitle
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.textLight);
  pdf.text(subtitle, pageWidth / 2, 28, { align: 'center' });
  
  // Company branding
  pdf.setFontSize(10);
  pdf.setTextColor(...colors.textMuted);
  pdf.text('Powered by SolarScope AI | Professional Solar Analysis', pageWidth / 2, 38, { align: 'center' });
  
  // Decorative line
  pdf.setDrawColor(...color);
  pdf.setLineWidth(1);
  pdf.line(40, 42, pageWidth - 40, 42);
  
  return 55; // Return next Y position
}

function addSectionHeader(pdf: jsPDF, title: string, yPos: number, color: number[] = colors.primary): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Section background
  pdf.setFillColor(...colors.background);
  pdf.rect(15, yPos - 5, pageWidth - 30, 15, 'F');
  
  // Section title
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...color);
  pdf.text(title, 20, yPos + 5);
  
  // Decorative line
  pdf.setDrawColor(...color);
  pdf.setLineWidth(0.5);
  pdf.line(20, yPos + 8, pageWidth - 20, yPos + 8);
  
  return yPos + 18;
}

function addMetricCard(pdf: jsPDF, x: number, y: number, width: number, height: number, title: string, value: string, unit: string = '', color: number[] = colors.primary) {
  // Card background
  pdf.setFillColor(...colors.white);
  pdf.setDrawColor(...colors.textMuted);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(x, y, width, height, 2, 2, 'FD');
  
  // Value
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...color);
  pdf.text(value, x + width/2, y + height/2 - 2, { align: 'center' });
  
  // Unit (if provided)
  if (unit) {
    pdf.setFontSize(12);
    pdf.setTextColor(...colors.textLight);
    pdf.text(unit, x + width/2, y + height/2 + 5, { align: 'center' });
  }
  
  // Title
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.textLight);
  pdf.text(title, x + width/2, y + height - 5, { align: 'center' });
}

function addKeyValuePair(pdf: jsPDF, x: number, y: number, key: string, value: string, keyColor: number[] = colors.textLight, valueColor: number[] = colors.text): number {
  // Key
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...keyColor);
  pdf.text(`${key}:`, x, y);
  
  // Value
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...valueColor);
  pdf.text(value, x + 50, y);
  
  return y + 8;
}

function checkPageSpace(pdf: jsPDF, currentY: number, neededSpace: number): number {
  const pageHeight = pdf.internal.pageSize.getHeight();
  if (currentY + neededSpace > pageHeight - 20) {
    pdf.addPage();
    return 30; // Top margin for new page
  }
  return currentY;
}

export async function generateInstallationPDF(
  result: InstallationResult,
  imageUrl: string,
  analysisCanvasRef?: React.RefObject<HTMLCanvasElement>
): Promise<void> {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Professional header
    let yPosition = addProfessionalHeader(
      pdf, 
      'SOLAR INSTALLATION ANALYSIS',
      'Comprehensive Rooftop Assessment Report',
      colors.primary
    );
    
    // Date and report info
    pdf.setFontSize(10);
    pdf.setTextColor(...colors.textMuted);
    const reportDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Report Generated: ${reportDate}`, 20, yPosition);
    pdf.text(`Report ID: INS-${Date.now().toString().slice(-8)}`, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 20;

    // Executive Summary Section
    yPosition = addSectionHeader(pdf, 'EXECUTIVE SUMMARY', yPosition, colors.primary);
    
    // Key metrics cards
    const cardWidth = 35;
    const cardHeight = 25;
    const cardSpacing = 5;
    const startX = 20;
    
    addMetricCard(pdf, startX, yPosition, cardWidth, cardHeight, 'Solar Panels', result.totalPanels.toString(), 'units', colors.primary);
    addMetricCard(pdf, startX + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight, 'Power Output', result.powerOutput.toString(), 'kW', colors.secondary);
    addMetricCard(pdf, startX + 2*(cardWidth + cardSpacing), yPosition, cardWidth, cardHeight, 'Efficiency', `${result.efficiency}%`, '', colors.accent);
    addMetricCard(pdf, startX + 3*(cardWidth + cardSpacing), yPosition, cardWidth, cardHeight, 'Confidence', `${result.confidence}%`, '', colors.primary);
    
    yPosition += cardHeight + 15;
    
    // System overview
    yPosition = checkPageSpace(pdf, yPosition, 40);
    yPosition = addSectionHeader(pdf, 'SYSTEM OVERVIEW', yPosition, colors.secondary);
    
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Roof Coverage', `${result.coverage}%`);
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Roof Type', result.roofType || 'Standard Residential');
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Usable Area', `${result.usableRoofArea || 'Auto-calculated'} sq ft`);
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'System Orientation', result.orientation || 'Optimized');
    yPosition += 15;

    // Visual Analysis Section
    yPosition = checkPageSpace(pdf, yPosition, 100);
    yPosition = addSectionHeader(pdf, 'VISUAL ANALYSIS', yPosition, colors.accent);

    // Two-column layout for images
    const imageWidth = (pageWidth - 50) / 2;
    const leftColumnX = 20;
    const rightColumnX = leftColumnX + imageWidth + 10;
    
    // Original rooftop image
    if (imageUrl) {
      try {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...colors.text);
        pdf.text('Original Rooftop Image', leftColumnX, yPosition);
        
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
        
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const imgHeight = (img.height / img.width) * imageWidth;
        
        // Image border
        pdf.setDrawColor(...colors.textMuted);
        pdf.setLineWidth(0.5);
        pdf.rect(leftColumnX, yPosition + 5, imageWidth, imgHeight);
        
        pdf.addImage(imgData, 'JPEG', leftColumnX + 1, yPosition + 6, imageWidth - 2, imgHeight - 2);
        
        // Analysis visualization
        if (analysisCanvasRef?.current) {
          pdf.text('Panel Layout Analysis', rightColumnX, yPosition);
          
          const overlayCanvas = await html2canvas(analysisCanvasRef.current, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false
          });
          
          const overlayData = overlayCanvas.toDataURL('image/png');
          const overlayHeight = (overlayCanvas.height / overlayCanvas.width) * imageWidth;
          
          // Image border
          pdf.rect(rightColumnX, yPosition + 5, imageWidth, overlayHeight);
          pdf.addImage(overlayData, 'PNG', rightColumnX + 1, yPosition + 6, imageWidth - 2, overlayHeight - 2);
        }
        
        yPosition += Math.max(imgHeight, 60) + 20;
      } catch (error) {
        console.warn('Could not add images to PDF:', error);
        yPosition += 20;
      }
    }

    // Performance Projections
    yPosition = checkPageSpace(pdf, yPosition, 80);
    yPosition = addSectionHeader(pdf, 'PERFORMANCE PROJECTIONS', yPosition, colors.secondary);
    
    const monthlyProduction = (result.powerOutput * 1.2 * 30.4).toFixed(0);
    const annualProduction = (result.powerOutput * 1.2 * 365).toFixed(0);
    const co2Reduction = (result.powerOutput * 1.2 * 365 * 0.0004).toFixed(1);
    
    // Performance metrics grid
    const perfCardWidth = 42;
    const perfCardHeight = 20;
    const perfSpacing = 4;
    
    addMetricCard(pdf, 20, yPosition, perfCardWidth, perfCardHeight, 'Monthly Output', monthlyProduction, 'kWh', colors.primary);
    addMetricCard(pdf, 20 + perfCardWidth + perfSpacing, yPosition, perfCardWidth, perfCardHeight, 'Annual Output', annualProduction, 'kWh', colors.secondary);
    addMetricCard(pdf, 20 + 2*(perfCardWidth + perfSpacing), yPosition, perfCardWidth, perfCardHeight, 'CO₂ Reduction', co2Reduction, 'tons/year', colors.accent);
    
    yPosition += perfCardHeight + 20;

    // Professional Recommendations
    if (result.recommendations && result.recommendations.length > 0) {
      yPosition = checkPageSpace(pdf, yPosition, 60);
      yPosition = addSectionHeader(pdf, 'PROFESSIONAL RECOMMENDATIONS', yPosition, colors.primary);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      result.recommendations.forEach((rec, index) => {
        yPosition = checkPageSpace(pdf, yPosition, 25);
        
        // Recommendation number circle
        pdf.setFillColor(...colors.primary);
        pdf.circle(25, yPosition + 3, 3, 'F');
        pdf.setTextColor(...colors.white);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text((index + 1).toString(), 25, yPosition + 4.5, { align: 'center' });
        
        // Recommendation text
        pdf.setTextColor(...colors.text);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(rec, pageWidth - 50);
        pdf.text(lines, 32, yPosition + 4);
        yPosition += Math.max(lines.length * 5, 8) + 8;
      });
    }

    // Technical Specifications
    yPosition = checkPageSpace(pdf, yPosition, 60);
    yPosition = addSectionHeader(pdf, 'TECHNICAL SPECIFICATIONS', yPosition, colors.accent);
    
    // Left column - System Details
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Panel Type', 'Standard residential solar panels (300W each)');
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Estimated Annual Production', `${annualProduction} kWh/year`);
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'System Payback Period', '6-8 years (estimated)');
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'System Lifespan', '25+ years with warranty');
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Analysis Confidence', `${result.confidence}% accuracy`);
    
    yPosition += 15;
    
    // Footer with professional formatting
    yPosition = checkPageSpace(pdf, yPosition, 30);
    
    // Footer background
    pdf.setFillColor(...colors.background);
    pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
    
    // Footer content
    pdf.setFontSize(9);
    pdf.setTextColor(...colors.textMuted);
    pdf.text('This report was generated by SolarScope AI using advanced computer vision and machine learning algorithms.', pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text('For questions about this analysis, please consult with a certified solar installation professional.', pageWidth / 2, pageHeight - 8, { align: 'center' });

    // Save PDF with professional naming
    const fileName = `SolarScope-Installation-Report-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
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
    
    // Professional header
    let yPosition = addProfessionalHeader(
      pdf, 
      'SOLAR FAULT DETECTION REPORT',
      'Comprehensive System Health Assessment',
      colors.danger
    );
    
    // Date and report info
    pdf.setFontSize(10);
    pdf.setTextColor(...colors.textMuted);
    const reportDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Report Generated: ${reportDate}`, 20, yPosition);
    pdf.text(`Report ID: FLT-${Date.now().toString().slice(-8)}`, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 20;

    // Executive Summary Section
    yPosition = addSectionHeader(pdf, 'EXECUTIVE SUMMARY', yPosition, colors.danger);
    
    const faultCounts = result.faults.reduce((acc, fault) => {
      acc[fault.severity] = (acc[fault.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Severity metrics cards
    const cardWidth = 35;
    const cardHeight = 25;
    const cardSpacing = 5;
    const startX = 20;
    
    const criticalColor = faultCounts.Critical > 0 ? colors.danger : colors.primary;
    const highColor = faultCounts.High > 0 ? colors.warning : colors.primary;
    
    addMetricCard(pdf, startX, yPosition, cardWidth, cardHeight, 'Total Faults', result.faults.length.toString(), 'detected', colors.textLight);
    addMetricCard(pdf, startX + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight, 'Critical', (faultCounts.Critical || 0).toString(), 'issues', criticalColor);
    addMetricCard(pdf, startX + 2*(cardWidth + cardSpacing), yPosition, cardWidth, cardHeight, 'High Priority', (faultCounts.High || 0).toString(), 'faults', highColor);
    addMetricCard(pdf, startX + 3*(cardWidth + cardSpacing), yPosition, cardWidth, cardHeight, 'Confidence', `${result.confidence.toFixed(1)}%`, '', colors.secondary);
    
    yPosition += cardHeight + 15;
    
    // System Health Overview
    yPosition = checkPageSpace(pdf, yPosition, 40);
    yPosition = addSectionHeader(pdf, 'SYSTEM HEALTH OVERVIEW', yPosition, colors.secondary);
    
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Overall Condition', result.overallCondition || 'System Evaluated');
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Medium Priority', `${faultCounts.Medium || 0} faults`);
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Low Priority', `${faultCounts.Low || 0} faults`);
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Inspection Date', new Date().toLocaleDateString());
    yPosition += 15;

    // Visual Analysis Section (similar to installation)
    yPosition = checkPageSpace(pdf, yPosition, 100);
    yPosition = addSectionHeader(pdf, 'VISUAL ANALYSIS', yPosition, colors.accent);

    const imageWidth = (pageWidth - 50) / 2;
    const leftColumnX = 20;
    const rightColumnX = leftColumnX + imageWidth + 10;
    
    if (imageUrl) {
      try {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...colors.text);
        pdf.text('Solar Panel System Image', leftColumnX, yPosition);
        
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
        
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const imgHeight = (img.height / img.width) * imageWidth;
        
        pdf.setDrawColor(...colors.textMuted);
        pdf.setLineWidth(0.5);
        pdf.rect(leftColumnX, yPosition + 5, imageWidth, imgHeight);
        pdf.addImage(imgData, 'JPEG', leftColumnX + 1, yPosition + 6, imageWidth - 2, imgHeight - 2);
        
        if (analysisCanvasRef?.current) {
          pdf.text('Fault Detection Analysis', rightColumnX, yPosition);
          
          const overlayCanvas = await html2canvas(analysisCanvasRef.current, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false
          });
          
          const overlayData = overlayCanvas.toDataURL('image/png');
          const overlayHeight = (overlayCanvas.height / overlayCanvas.width) * imageWidth;
          
          pdf.rect(rightColumnX, yPosition + 5, imageWidth, overlayHeight);
          pdf.addImage(overlayData, 'PNG', rightColumnX + 1, yPosition + 6, imageWidth - 2, overlayHeight - 2);
        }
        
        yPosition += Math.max(imgHeight, 60) + 20;
      } catch (error) {
        console.warn('Could not add images to PDF:', error);
        yPosition += 20;
      }
    }

    // Detailed Fault Analysis
    if (result.faults.length > 0) {
      yPosition = checkPageSpace(pdf, yPosition, 60);
      yPosition = addSectionHeader(pdf, 'DETAILED FAULT ANALYSIS', yPosition, colors.danger);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      result.faults.forEach((fault, index) => {
        yPosition = checkPageSpace(pdf, yPosition, 30);
        
        // Severity color coding
        let severityColor = colors.textLight;
        if (fault.severity.toLowerCase() === 'critical') severityColor = colors.danger;
        else if (fault.severity.toLowerCase() === 'high') severityColor = colors.warning;
        else if (fault.severity.toLowerCase() === 'medium') severityColor = colors.secondary;
        
        // Fault number circle
        pdf.setFillColor(...severityColor);
        pdf.circle(25, yPosition + 3, 3, 'F');
        pdf.setTextColor(...colors.white);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text((index + 1).toString(), 25, yPosition + 4.5, { align: 'center' });
        
        // Fault type and severity
        pdf.setTextColor(...colors.text);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${fault.type}`, 32, yPosition + 4);
        
        // Severity badge
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...severityColor);
        const severityText = `[${fault.severity.toUpperCase()}]`;
        const faultTypeWidth = pdf.getTextWidth(fault.type);
        pdf.text(severityText, 35 + faultTypeWidth, yPosition + 4);
        
        yPosition += 8;
        
        // Description
        if (fault.description) {
          pdf.setTextColor(...colors.textLight);
          pdf.setFontSize(10);
          const lines = pdf.splitTextToSize(fault.description, pageWidth - 50);
          pdf.text(lines, 32, yPosition);
          yPosition += Math.max(lines.length * 4, 6) + 6;
        }
      });
    }

    // Professional Maintenance Recommendations
    if (result.recommendations && result.recommendations.length > 0) {
      yPosition = checkPageSpace(pdf, yPosition, 60);
      yPosition = addSectionHeader(pdf, 'MAINTENANCE RECOMMENDATIONS', yPosition, colors.primary);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      result.recommendations.forEach((rec, index) => {
        yPosition = checkPageSpace(pdf, yPosition, 25);
        
        // Recommendation number circle
        pdf.setFillColor(...colors.primary);
        pdf.circle(25, yPosition + 3, 3, 'F');
        pdf.setTextColor(...colors.white);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text((index + 1).toString(), 25, yPosition + 4.5, { align: 'center' });
        
        // Recommendation text
        pdf.setTextColor(...colors.text);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(rec, pageWidth - 50);
        pdf.text(lines, 32, yPosition + 4);
        yPosition += Math.max(lines.length * 5, 8) + 8;
      });
    }

    // Priority Actions Section
    const criticalFaults = result.faults.filter(f => f.severity.toLowerCase() === 'critical').length;
    const highFaults = result.faults.filter(f => f.severity.toLowerCase() === 'high').length;
    
    if (criticalFaults > 0 || highFaults > 0) {
      yPosition = checkPageSpace(pdf, yPosition, 60);
      yPosition = addSectionHeader(pdf, 'PRIORITY ACTIONS REQUIRED', yPosition, colors.danger);
      
      if (criticalFaults > 0) {
        yPosition = addKeyValuePair(pdf, 25, yPosition, 'IMMEDIATE ACTION', `${criticalFaults} critical issue(s) require immediate attention`, colors.danger, colors.danger);
      }
      if (highFaults > 0) {
        yPosition = addKeyValuePair(pdf, 25, yPosition, 'URGENT REPAIR', `${highFaults} high-priority issue(s) need prompt repair`, colors.warning, colors.warning);
      }
      yPosition += 10;
    }
    
    // Technical Specifications
    yPosition = checkPageSpace(pdf, yPosition, 60);
    yPosition = addSectionHeader(pdf, 'TECHNICAL SPECIFICATIONS', yPosition, colors.accent);
    
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Analysis Method', 'Computer vision and machine learning');
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Report Version', '2.0');
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Next Inspection', 'Recommended in 6-12 months');
    yPosition = addKeyValuePair(pdf, 25, yPosition, 'Generated by', 'SolarScope AI Analysis System');
    
    yPosition += 15;
    
    // Footer with professional formatting
    yPosition = checkPageSpace(pdf, yPosition, 30);
    
    // Footer background
    pdf.setFillColor(...colors.background);
    pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
    
    // Footer content
    pdf.setFontSize(9);
    pdf.setTextColor(...colors.textMuted);
    pdf.text('This fault detection report was generated by SolarScope AI using advanced computer vision and machine learning algorithms.', pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text('For immediate safety concerns with Critical or High priority faults, please consult with a certified solar technician.', pageWidth / 2, pageHeight - 8, { align: 'center' });

    // Save PDF with professional naming
    const fileName = `SolarScope-Fault-Detection-Report-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF report');
  }
}