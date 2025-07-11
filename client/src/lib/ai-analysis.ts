import type { InstallationResult, FaultResult } from "@shared/schema";

// Real AI analysis functions using Gemini API
export async function analyzeInstallation(imagePath: string): Promise<InstallationResult> {
  const response = await fetch('/api/ai/analyze-installation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imagePath }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze installation');
  }

  return response.json();
}

export async function analyzeFaults(imagePath: string): Promise<FaultResult> {
  const response = await fetch('/api/ai/analyze-faults', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imagePath }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze faults');
  }

  return response.json();
}

function generateRecommendations(faults: any[]): string[] {
  const recommendations = [];
  
  if (faults.some(f => f.severity === 'Critical')) {
    recommendations.push('Immediate inspection required - disconnect panel and contact certified technician');
  }
  
  if (faults.some(f => f.type === 'Micro-crack')) {
    recommendations.push('Schedule maintenance to repair micro-cracks before they worsen');
  }
  
  if (faults.some(f => f.type === 'Dirt/Debris')) {
    recommendations.push('Clean panel surface to improve efficiency');
  }
  
  if (faults.some(f => f.type === 'Hot Spot')) {
    recommendations.push('Check for electrical issues and ensure proper ventilation');
  }
  
  if (faults.length === 0) {
    recommendations.push('Panel is in good condition - continue routine monitoring');
  }
  
  return recommendations;
}
