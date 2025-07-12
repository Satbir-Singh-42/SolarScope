import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InstallationResult, FaultResult } from '../../../shared/schema';

// Professional color scheme with enhanced contrast
const colors = {
  primary: [34, 197, 94], // Green
  secondary: [59, 130, 246], // Blue
  accent: [168, 85, 247], // Purple
  danger: [239, 68, 68], // Red
  warning: [245, 158, 11], // Amber
  success: [34, 197, 94], // Green
  text: [17, 24, 39], // Gray-900 - Darker for better readability
  textLight: [55, 65, 81], // Gray-700 - Better contrast
  textMuted: [107, 114, 128], // Gray-500 - Still readable
  background: [249, 250, 251], // Gray-50
  cardBg: [255, 255, 255], // Pure white for cards
  border: [229, 231, 235], // Gray-200
  white: [255, 255, 255]
};

function addProfessionalHeader(pdf: jsPDF, title: string, subtitle: string, color: number[]) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Header background with gradient effect
  pdf.setFillColor(...colors.background);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  // Brand accent bar
  pdf.setFillColor(...color);
  pdf.rect(0, 0, pageWidth, 4, 'F');
  
  // Main title with better spacing
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...color);
  pdf.text(title, pageWidth / 2, 22, { align: 'center' });
  
  // Subtitle with improved typography
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.textLight);
  pdf.text(subtitle, pageWidth / 2, 32, { align: 'center' });
  
  // Company branding with better positioning
  pdf.setFontSize(9);
  pdf.setTextColor(...colors.textMuted);
  pdf.text('Powered by SolarScope AI • Professional Solar Analysis', pageWidth / 2, 42, { align: 'center' });
  
  // Enhanced decorative elements
  pdf.setDrawColor(...color);
  pdf.setLineWidth(0.8);
  pdf.line(50, 45, pageWidth - 50, 45);
  
  // Corner accents
  pdf.setFillColor(...color);
  pdf.circle(25, 25, 2, 'F');
  pdf.circle(pageWidth - 25, 25, 2, 'F');
  
  return 65; // Return next Y position with more space
}

function addSectionHeader(pdf: jsPDF, title: string, yPos: number, color: number[] = colors.primary): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Enhanced section background with subtle shadow effect
  pdf.setFillColor(...colors.background);
  pdf.roundedRect(20, yPos - 3, pageWidth - 40, 18, 2, 2, 'F');
  
  // Section accent bar
  pdf.setFillColor(...color);
  pdf.rect(20, yPos - 3, 4, 18, 'F');
  
  // Section title with better typography
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...color);
  pdf.text(title, 30, yPos + 8);
  
  // Subtle decorative line
  pdf.setDrawColor(...colors.border);
  pdf.setLineWidth(0.3);
  pdf.line(30, yPos + 12, pageWidth - 30, yPos + 12);
  
  return yPos + 28; // More spacing for better readability
}

function addMetricCard(pdf: jsPDF, x: number, y: number, width: number, height: number, title: string, value: string, unit: string = '', color: number[] = colors.primary) {
  // Enhanced card with shadow effect
  pdf.setFillColor(...colors.cardBg);
  pdf.setDrawColor(...colors.border);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(x, y, width, height, 3, 3, 'FD');
  
  // Card accent top border
  pdf.setFillColor(...color);
  pdf.roundedRect(x, y, width, 3, 3, 3, 'F');
  
  // Large value display
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...color);
  const valueY = unit ? y + height/2 - 3 : y + height/2 + 2;
  pdf.text(value, x + width/2, valueY, { align: 'center' });
  
  // Unit with better positioning
  if (unit) {
    pdf.setFontSize(10);
    pdf.setTextColor(...colors.textLight);
    pdf.text(unit, x + width/2, y + height/2 + 6, { align: 'center' });
  }
  
  // Title with improved spacing
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.textMuted);
  const titleLines = pdf.splitTextToSize(title, width - 4);
  const titleY = y + height - (titleLines.length * 3) - 2;
  pdf.text(titleLines, x + width/2, titleY, { align: 'center' });
}

function addKeyValuePair(pdf: jsPDF, x: number, y: number, key: string, value: string, keyColor: number[] = colors.textLight, valueColor: number[] = colors.text): number {
  // Key with improved formatting
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...keyColor);
  pdf.text(`${key}:`, x, y);
  
  // Value with proper text wrapping
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...valueColor);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const maxWidth = pageWidth - x - 60;
  const valueLines = pdf.splitTextToSize(value, maxWidth);
  pdf.text(valueLines, x + 55, y);
  
  return y + Math.max(valueLines.length * 5, 8) + 2;
}

function checkPageSpace(pdf: jsPDF, currentY: number, neededSpace: number): number {
  const pageHeight = pdf.internal.pageSize.getHeight();
  if (currentY + neededSpace > pageHeight - 30) {
    pdf.addPage();
    
    // Add professional page header for continuation pages
    const pageWidth = pdf.internal.pageSize.getWidth();
    pdf.setFillColor(...colors.background);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    pdf.setFontSize(10);
    pdf.setTextColor(...colors.textMuted);
    pdf.text('SolarScope AI Report - Continued', 20, 15);
    pdf.text(`Page ${pdf.getNumberOfPages()}`, pageWidth - 20, 15, { align: 'right' });
    
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.3);
    pdf.line(20, 20, pageWidth - 20, 20);
    
    return 40; // Top margin for new page with header
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
    
    // Improved metrics layout with better spacing
    const cardWidth = 42;
    const cardHeight = 32;
    const cardSpacing = 8;
    const startX = 25;
    
    // Top row metrics
    addMetricCard(pdf, startX, yPosition, cardWidth, cardHeight, 'Solar Panels Recommended', result.totalPanels.toString(), 'units', colors.primary);
    addMetricCard(pdf, startX + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight, 'System Power Output', result.powerOutput.toString(), 'kW', colors.secondary);
    
    // Bottom row metrics  
    const secondRowY = yPosition + cardHeight + 8;
    addMetricCard(pdf, startX, secondRowY, cardWidth, cardHeight, 'System Efficiency', `${result.efficiency}%`, 'efficiency', colors.accent);
    addMetricCard(pdf, startX + cardWidth + cardSpacing, secondRowY, cardWidth, cardHeight, 'Analysis Confidence', `${result.confidence}%`, 'accuracy', colors.success);
    
    yPosition = secondRowY + cardHeight + 20;
    
    // System overview with improved layout
    yPosition = checkPageSpace(pdf, yPosition, 60);
    yPosition = addSectionHeader(pdf, 'SYSTEM OVERVIEW', yPosition, colors.secondary);
    
    // Two-column layout for system details
    const leftCol = 30;
    const rightCol = pageWidth / 2 + 10;
    let leftY = yPosition;
    let rightY = yPosition;
    
    // Left column
    leftY = addKeyValuePair(pdf, leftCol, leftY, 'Roof Coverage', `${result.coverage}%`);
    leftY = addKeyValuePair(pdf, leftCol, leftY, 'Roof Type', result.roofType || 'Standard Residential');
    
    // Right column  
    rightY = addKeyValuePair(pdf, rightCol, rightY, 'Usable Area', `${result.usableRoofArea || 'Auto-calculated'} sq ft`);
    rightY = addKeyValuePair(pdf, rightCol, rightY, 'System Orientation', result.orientation || 'Optimized for Maximum Solar Gain');
    
    yPosition = Math.max(leftY, rightY) + 15;

    // Visual Analysis Section
    yPosition = checkPageSpace(pdf, yPosition, 120);
    yPosition = addSectionHeader(pdf, 'VISUAL ANALYSIS', yPosition, colors.accent);

    // Improved two-column layout for images with better spacing
    const imageWidth = (pageWidth - 70) / 2;
    const leftColumnX = 30;
    const rightColumnX = leftColumnX + imageWidth + 20;
    
    // Original rooftop image
    if (imageUrl) {
      try {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...colors.text);
        pdf.text('Original Rooftop Image', leftColumnX, yPosition);
        
        // Image frame background
        pdf.setFillColor(...colors.background);
        pdf.roundedRect(leftColumnX - 2, yPosition + 2, imageWidth + 4, 60, 2, 2, 'F');
        
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
        
        // Enhanced image border with professional styling
        pdf.setDrawColor(...colors.border);
        pdf.setLineWidth(1);
        pdf.roundedRect(leftColumnX, yPosition + 5, imageWidth, imgHeight, 2, 2, 'D');
        
        // Add image with proper clipping
        pdf.addImage(imgData, 'JPEG', leftColumnX + 2, yPosition + 7, imageWidth - 4, imgHeight - 4);
        
        // Analysis visualization with enhanced styling
        if (analysisCanvasRef?.current) {
          pdf.text('Panel Layout Analysis', rightColumnX, yPosition);
          
          // Analysis frame background
          pdf.setFillColor(...colors.background);
          pdf.roundedRect(rightColumnX - 2, yPosition + 2, imageWidth + 4, 60, 2, 2, 'F');
          
          const overlayCanvas = await html2canvas(analysisCanvasRef.current, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false
          });
          
          const overlayData = overlayCanvas.toDataURL('image/png');
          const overlayHeight = (overlayCanvas.height / overlayCanvas.width) * imageWidth;
          
          // Enhanced analysis border
          pdf.setDrawColor(...colors.border);
          pdf.setLineWidth(1);
          pdf.roundedRect(rightColumnX, yPosition + 5, imageWidth, overlayHeight, 2, 2, 'D');
          pdf.addImage(overlayData, 'PNG', rightColumnX + 2, yPosition + 7, imageWidth - 4, overlayHeight - 4);
        }
        
        yPosition += Math.max(imgHeight, 60) + 20;
      } catch (error) {
        console.warn('Could not add images to PDF:', error);
        yPosition += 20;
      }
    }

    // Performance Projections with enhanced layout
    yPosition = checkPageSpace(pdf, yPosition, 100);
    yPosition = addSectionHeader(pdf, 'PERFORMANCE PROJECTIONS', yPosition, colors.secondary);
    
    // Enhanced calculations with more realistic values
    const monthlyProduction = (result.powerOutput * 120).toFixed(0); // More realistic calculation
    const annualProduction = (result.powerOutput * 1450).toFixed(0); // Average annual hours
    const co2Reduction = (parseFloat(annualProduction) * 0.0007).toFixed(1); // More accurate CO2 factor
    const estimatedSavings = (parseFloat(annualProduction) * 0.12).toFixed(0); // Estimated annual savings
    
    // Three-card layout with better spacing
    const perfCardWidth = 48;
    const perfCardHeight = 28;
    const perfSpacing = 8;
    const perfStartX = 25;
    
    // Top row performance cards
    addMetricCard(pdf, perfStartX, yPosition, perfCardWidth, perfCardHeight, 'Monthly Production', monthlyProduction, 'kWh', colors.primary);
    addMetricCard(pdf, perfStartX + perfCardWidth + perfSpacing, yPosition, perfCardWidth, perfCardHeight, 'Annual Production', annualProduction, 'kWh/year', colors.secondary);
    addMetricCard(pdf, perfStartX + 2*(perfCardWidth + perfSpacing), yPosition, perfCardWidth, perfCardHeight, 'Annual Savings', `$${estimatedSavings}`, 'estimated', colors.success);
    
    // Environmental impact card centered below
    const envCardY = yPosition + perfCardHeight + 10;
    const centerX = pageWidth / 2 - perfCardWidth / 2;
    addMetricCard(pdf, centerX, envCardY, perfCardWidth, perfCardHeight, 'CO₂ Reduction', co2Reduction, 'tons/year', colors.accent);
    
    yPosition = envCardY + perfCardHeight + 20;

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

    // Technical Specifications with improved layout
    yPosition = checkPageSpace(pdf, yPosition, 80);
    yPosition = addSectionHeader(pdf, 'TECHNICAL SPECIFICATIONS', yPosition, colors.accent);
    
    // Two-column technical layout
    const techLeftCol = 30;
    const techRightCol = pageWidth / 2 + 15;
    let techLeftY = yPosition;
    let techRightY = yPosition;
    
    // Left column - System specifications
    techLeftY = addKeyValuePair(pdf, techLeftCol, techLeftY, 'Panel Type', 'Monocrystalline Silicon (300W each)');
    techLeftY = addKeyValuePair(pdf, techLeftCol, techLeftY, 'System Efficiency', `${result.efficiency}% module efficiency`);
    techLeftY = addKeyValuePair(pdf, techLeftCol, techLeftY, 'System Lifespan', '25+ years with manufacturer warranty');
    
    // Right column - Performance data
    techRightY = addKeyValuePair(pdf, techRightCol, techRightY, 'Annual Production', `${annualProduction} kWh/year`);
    techRightY = addKeyValuePair(pdf, techRightCol, techRightY, 'Payback Period', '6-8 years (estimated)');
    techRightY = addKeyValuePair(pdf, techRightCol, techRightY, 'Analysis Confidence', `${result.confidence}% accuracy`);
    
    yPosition = Math.max(techLeftY, techRightY) + 20;
    
    // Enhanced professional footer
    const footerHeight = 35;
    const footerY = pageHeight - footerHeight;
    
    // Footer background with gradient effect
    pdf.setFillColor(...colors.background);
    pdf.rect(0, footerY, pageWidth, footerHeight, 'F');
    
    // Footer accent line
    pdf.setDrawColor(...colors.primary);
    pdf.setLineWidth(2);
    pdf.line(0, footerY, pageWidth, footerY);
    
    // Footer content with better typography
    pdf.setFontSize(9);
    pdf.setTextColor(...colors.textMuted);
    pdf.text('This comprehensive analysis was generated by SolarScope AI using advanced computer vision and machine learning algorithms.', pageWidth / 2, footerY + 12, { align: 'center' });
    pdf.text('For installation questions, please consult with a certified solar professional. Report generated on ' + new Date().toLocaleDateString(), pageWidth / 2, footerY + 20, { align: 'center' });
    
    // Footer logo placeholders (small decorative elements)
    pdf.setFillColor(...colors.primary);
    pdf.circle(30, footerY + 15, 1.5, 'F');
    pdf.circle(pageWidth - 30, footerY + 15, 1.5, 'F');

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
    
    // Enhanced severity metrics layout
    const cardWidth = 42;
    const cardHeight = 32;
    const cardSpacing = 8;
    const startX = 25;
    
    const criticalColor = faultCounts.Critical > 0 ? colors.danger : colors.textLight;
    const highColor = faultCounts.High > 0 ? colors.warning : colors.textLight;
    
    // Top row fault severity cards
    addMetricCard(pdf, startX, yPosition, cardWidth, cardHeight, 'Total Faults Detected', result.faults.length.toString(), 'issues', colors.textLight);
    addMetricCard(pdf, startX + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight, 'Critical Severity', (faultCounts.Critical || 0).toString(), 'urgent', criticalColor);
    
    // Bottom row additional metrics
    const secondRowY = yPosition + cardHeight + 8;
    addMetricCard(pdf, startX, secondRowY, cardWidth, cardHeight, 'High Priority', (faultCounts.High || 0).toString(), 'faults', highColor);
    addMetricCard(pdf, startX + cardWidth + cardSpacing, secondRowY, cardWidth, cardHeight, 'Analysis Confidence', `${result.confidence.toFixed(1)}%`, 'accuracy', colors.secondary);
    
    yPosition = secondRowY + cardHeight + 20;
    
    // System Health Overview with improved layout
    yPosition = checkPageSpace(pdf, yPosition, 60);
    yPosition = addSectionHeader(pdf, 'SYSTEM HEALTH OVERVIEW', yPosition, colors.secondary);
    
    // Two-column health overview layout
    const healthLeftCol = 30;
    const healthRightCol = pageWidth / 2 + 10;
    let healthLeftY = yPosition;
    let healthRightY = yPosition;
    
    // Left column - System condition
    healthLeftY = addKeyValuePair(pdf, healthLeftCol, healthLeftY, 'Overall Condition', result.overallCondition || 'System Health Evaluated');
    healthLeftY = addKeyValuePair(pdf, healthLeftCol, healthLeftY, 'Medium Priority', `${faultCounts.Medium || 0} maintenance items`);
    
    // Right column - Additional details
    healthRightY = addKeyValuePair(pdf, healthRightCol, healthRightY, 'Low Priority', `${faultCounts.Low || 0} minor issues`);
    healthRightY = addKeyValuePair(pdf, healthRightCol, healthRightY, 'Inspection Date', new Date().toLocaleDateString());
    
    yPosition = Math.max(healthLeftY, healthRightY) + 15;

    // Visual Analysis Section with enhanced layout
    yPosition = checkPageSpace(pdf, yPosition, 120);
    yPosition = addSectionHeader(pdf, 'VISUAL ANALYSIS', yPosition, colors.accent);

    // Improved image layout with better spacing
    const imageWidth = (pageWidth - 70) / 2;
    const leftColumnX = 30;
    const rightColumnX = leftColumnX + imageWidth + 20;
    
    if (imageUrl) {
      try {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...colors.text);
        pdf.text('Solar Panel System Image', leftColumnX, yPosition);
        
        // Image frame background
        pdf.setFillColor(...colors.background);
        pdf.roundedRect(leftColumnX - 2, yPosition + 2, imageWidth + 4, 60, 2, 2, 'F');
        
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
        
        // Enhanced image border with professional styling
        pdf.setDrawColor(...colors.border);
        pdf.setLineWidth(1);
        pdf.roundedRect(leftColumnX, yPosition + 5, imageWidth, imgHeight, 2, 2, 'D');
        pdf.addImage(imgData, 'JPEG', leftColumnX + 2, yPosition + 7, imageWidth - 4, imgHeight - 4);
        
        if (analysisCanvasRef?.current) {
          pdf.text('Fault Detection Analysis', rightColumnX, yPosition);
          
          const overlayCanvas = await html2canvas(analysisCanvasRef.current, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false
          });
          
          const overlayData = overlayCanvas.toDataURL('image/png');
          const overlayHeight = (overlayCanvas.height / overlayCanvas.width) * imageWidth;
          
          // Analysis frame background
          pdf.setFillColor(...colors.background);
          pdf.roundedRect(rightColumnX - 2, yPosition + 2, imageWidth + 4, 60, 2, 2, 'F');
          
          // Enhanced analysis border
          pdf.setDrawColor(...colors.border);
          pdf.setLineWidth(1);
          pdf.roundedRect(rightColumnX, yPosition + 5, imageWidth, overlayHeight, 2, 2, 'D');
          pdf.addImage(overlayData, 'PNG', rightColumnX + 2, yPosition + 7, imageWidth - 4, overlayHeight - 4);
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
    
    // Enhanced professional footer for fault detection
    const footerHeight = 35;
    const footerY = pageHeight - footerHeight;
    
    // Footer background with danger accent for fault reports
    pdf.setFillColor(...colors.background);
    pdf.rect(0, footerY, pageWidth, footerHeight, 'F');
    
    // Footer accent line in danger color for fault reports
    pdf.setDrawColor(...colors.danger);
    pdf.setLineWidth(2);
    pdf.line(0, footerY, pageWidth, footerY);
    
    // Enhanced footer content
    pdf.setFontSize(9);
    pdf.setTextColor(...colors.textMuted);
    pdf.text('This comprehensive fault detection analysis was generated by SolarScope AI using advanced computer vision algorithms.', pageWidth / 2, footerY + 12, { align: 'center' });
    pdf.text('For Critical or High priority faults, consult with a certified solar technician immediately. Report generated on ' + new Date().toLocaleDateString(), pageWidth / 2, footerY + 20, { align: 'center' });
    
    // Footer logo placeholders with danger accent
    pdf.setFillColor(...colors.danger);
    pdf.circle(30, footerY + 15, 1.5, 'F');
    pdf.circle(pageWidth - 30, footerY + 15, 1.5, 'F');

    // Save PDF with professional naming
    const fileName = `SolarScope-Fault-Detection-Report-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF report');
  }
}