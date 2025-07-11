import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import * as fs from 'fs';
import * as os from 'os';
import { storage } from "./storage";
import { insertAnalysisSchema, insertChatMessageSchema } from "@shared/schema";
import { analyzeInstallationWithAI, analyzeFaultsWithAI } from "./ai-service";

// AI Chat service function with conversation history
async function generateSolarAdvice(message: string, conversationHistory: string[] = []): Promise<{ response: string; category: string }> {
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

    // Include conversation history for context
    const historyContext = conversationHistory.length > 0 
      ? `\nCONVERSATION HISTORY:\n${conversationHistory.slice(-6).join('\n')}\n` // Last 6 messages for context
      : '';

    const solarAdvicePrompt = `
    You are SolarScope AI, a knowledgeable solar panel expert and advisor. Provide helpful, accurate, and practical advice about solar panels based on the user's question.

    EXPERTISE AREAS:
    - Solar panel installation planning and design
    - Fault detection and troubleshooting
    - System maintenance and optimization
    - Performance analysis and monitoring
    - Weather impact assessment
    - Cost analysis and ROI calculations
    - Safety guidelines and best practices
    - Energy efficiency recommendations
    - Indian solar energy helpline numbers and support

    RESPONSE GUIDELINES:
    - Be conversational but professional
    - Provide specific, actionable advice
    - Use bullet points for clarity when listing steps
    - Include safety warnings when relevant
    - Reference technical specifications when helpful
    - Suggest when professional consultation is needed
    - Reference previous conversation context when relevant
    - Include Indian helpline numbers when users ask for help or support

    INDIAN SOLAR HELPLINE NUMBERS:
    - Ministry of New and Renewable Energy (MNRE) Helpline: 1800-180-3333
    - Solar Energy Corporation of India (SECI) Helpline: 011-2436-0707
    - National Solar Mission Support: 1800-11-3003
    - Bureau of Energy Efficiency (BEE) Helpline: 1800-11-2722
    - State Electricity Regulatory Commission Helpline: 1912
    - PM Surya Ghar Muft Bijli Yojana Support: 1800-11-4455

    RESPONSE FORMAT:
    Provide a JSON response with:
    {
      "response": "Your detailed advice and recommendations",
      "category": "installation|fault|maintenance|performance|general|helpline"
    }

    ${historyContext}

    USER QUESTION: ${message}

    Provide comprehensive, expert advice based on your solar panel knowledge and conversation history.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [solarAdvicePrompt],
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response from AI");
    }

    const cleanedText = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .trim();
    
    try {
      const result = JSON.parse(cleanedText);
      return {
        response: result.response || "I'm here to help with solar panel questions. Could you please provide more details about what you'd like to know?",
        category: result.category || "general"
      };
    } catch (parseError) {
      // If JSON parsing fails, return the cleaned text directly
      console.log('JSON parsing failed, returning cleaned text directly:', parseError);
      return {
        response: cleanedText,
        category: "general"
      };
    }

  } catch (error) {
    console.error('AI Chat generation error:', error);
    
    // Fallback response based on message keywords
    const lowerMessage = message.toLowerCase();
    let category = "general";
    let response = "I'm here to help with your solar panel questions. ";

    if (lowerMessage.includes("install") || lowerMessage.includes("placement") || lowerMessage.includes("roof")) {
      category = "installation";
      response += "For installation questions, I recommend:\n\n• Ensure your roof can support the weight (typically 2-4 lbs per sq ft)\n• Choose south-facing surfaces with minimal shading\n• Maintain proper setbacks from roof edges (typically 3 feet)\n• Consider roof condition and age before installation\n• Get multiple quotes from certified installers\n\nWould you like specific guidance on any of these areas?";
    } else if (lowerMessage.includes("fault") || lowerMessage.includes("problem") || lowerMessage.includes("defect")) {
      category = "fault";
      response += "For fault detection, look for:\n\n• Visible cracks or damage on panel surface\n• Discoloration or hot spots\n• Reduced power output\n• Corrosion on connections\n• Delamination or bubbling\n\nI recommend regular visual inspections and monitoring system performance. Would you like help identifying specific issues?";
    } else if (lowerMessage.includes("help") || lowerMessage.includes("support") || lowerMessage.includes("helpline") || lowerMessage.includes("contact")) {
      category = "helpline";
      response += "Here are Indian solar energy helpline numbers for support:\n\n• **MNRE Helpline**: 1800-180-3333 (Ministry of New and Renewable Energy)\n• **SECI Support**: 011-2436-0707 (Solar Energy Corporation of India)\n• **National Solar Mission**: 1800-11-3003\n• **BEE Helpline**: 1800-11-2722 (Bureau of Energy Efficiency)\n• **State Electricity Commission**: 1912\n• **PM Surya Ghar Scheme**: 1800-11-4455 (Free rooftop solar)\n\nThese numbers can help with subsidies, installations, grid connections, and technical support. What specific help do you need?";
    } else if (lowerMessage.includes("maintenance") || lowerMessage.includes("clean") || lowerMessage.includes("care")) {
      category = "maintenance";
      response += "Regular maintenance includes:\n\n• Visual inspection every 6 months\n• Cleaning panels 2-4 times per year\n• Checking electrical connections annually\n• Monitoring system performance\n• Trimming vegetation to prevent shading\n\nMost cleaning can be done with water and a soft brush. Would you like specific maintenance schedules?";
    } else if (lowerMessage.includes("performance") || lowerMessage.includes("efficiency") || lowerMessage.includes("output")) {
      category = "performance";
      response += "To optimize performance:\n\n• Keep panels clean and unshaded\n• Ensure proper ventilation behind panels\n• Monitor system output regularly\n• Check for loose connections\n• Consider weather impact on production\n\nTypical efficiency is 15-20% for residential panels. Would you like help analyzing your system's performance?";
    } else {
      response += "I can help with installation planning, fault detection, maintenance, and performance optimization. What specific aspect of solar panels would you like to discuss?";
    }

    return { response, category };
  }
}

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Helper function to save buffer to temporary file for AI analysis
function saveBufferToTemp(buffer: Buffer, filename: string): string {
  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `${Date.now()}-${filename}`);
  fs.writeFileSync(tempPath, buffer);
  return tempPath;
}

// Configure multer for serverless deployment (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment monitoring
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      service: "SolarScope AI",
      version: "1.0.0"
    });
  });
  // AI analysis endpoints
  app.post("/api/ai/analyze-installation", async (req, res) => {
    try {
      const { imagePath } = req.body;
      const results = await analyzeInstallationWithAI(imagePath);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "AI analysis failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/ai/analyze-faults", async (req, res) => {
    try {
      const { imagePath } = req.body;
      const results = await analyzeFaultsWithAI(imagePath);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "AI analysis failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Upload image and analyze for installation planning
  app.post("/api/analyze/installation", upload.single('image'), async (req: MulterRequest, res) => {
    try {
      console.log('Received installation analysis request');
      console.log('File:', req.file);
      console.log('Body:', req.body);
      
      if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ message: "No image uploaded" });
      }

      // Save buffer to temporary file for AI analysis
      const imagePath = saveBufferToTemp(req.file.buffer, req.file.originalname || 'image.jpg');
      const userId = req.body.userId ? parseInt(req.body.userId) : null;
      
      // Extract roof input parameters
      const roofInput = {
        roofSize: req.body.roofSize ? parseInt(req.body.roofSize) : undefined,
        roofShape: req.body.roofShape || 'auto-detect',
        panelSize: req.body.panelSize || 'auto-optimize'
      };

      console.log('Starting installation analysis for:', imagePath);

      // Real AI analysis with roof input
      const results = await analyzeInstallationWithAI(imagePath, roofInput);

      console.log('Installation analysis completed successfully');

      // Store analysis result with fallback handling
      let analysis = null;
      try {
        analysis = await storage.createAnalysis({
          userId,
          type: 'installation',
          imagePath,
          results,
        });
        console.log('Analysis stored successfully');
      } catch (dbError) {
        console.warn('Database storage failed, continuing with AI results:', dbError);
        // Continue without database storage - AI analysis was successful
      }

      res.json({ analysis, results });
    } catch (error) {
      console.error('Installation analysis error:', error);
      res.status(500).json({ message: "Analysis failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Upload image and analyze for fault detection
  app.post("/api/analyze/fault-detection", upload.single('image'), async (req: MulterRequest, res) => {
    try {
      console.log('Received fault detection request');
      console.log('File:', req.file);
      console.log('Body:', req.body);
      
      if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ message: "No image uploaded" });
      }

      // Save buffer to temporary file for AI analysis
      const imagePath = saveBufferToTemp(req.file.buffer, req.file.originalname || 'image.jpg');
      const userId = req.body.userId ? parseInt(req.body.userId) : null;

      console.log('Starting AI fault analysis for:', imagePath);

      // Real AI analysis
      const results = await analyzeFaultsWithAI(imagePath, req.file.originalname);

      console.log('AI fault analysis completed:', results);

      // Store analysis result with fallback handling
      let analysis = null;
      try {
        analysis = await storage.createAnalysis({
          userId,
          type: 'fault-detection',
          imagePath,
          results,
        });
        console.log('Fault analysis stored successfully');
      } catch (dbError) {
        console.warn('Database storage failed, continuing with AI results:', dbError);
        // Continue without database storage - AI analysis was successful
      }

      res.json({ analysis, results });
    } catch (error) {
      console.error('Fault detection error:', error);
      res.status(500).json({ message: "Analysis failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get user analyses
  app.get("/api/analyses/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const analyses = await storage.getAnalysesByUser(userId);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analyses", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get specific analysis
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analysis", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Chat endpoints
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getChatMessages(limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/chat/send", async (req, res) => {
    try {
      const { message, category = 'general' } = req.body;
      
      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // For now, use a default user - in a real app, this would come from authentication
      const userId = 1;
      const username = "User"; // In a real app, this would come from the authenticated user

      // Create and store the message
      const chatMessage = await storage.createChatMessage({
        userId,
        username,
        message: message.trim(),
        type: 'user',
        category,
      });

      res.json(chatMessage);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // AI Chat endpoint with conversation history
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;
      
      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }

      console.log('AI Chat request received:', message);

      // Store user message in database
      let userMessage = null;
      try {
        userMessage = await storage.createChatMessage({
          userId: 1, // Default user for now
          username: "User",
          message: message.trim(),
          type: 'user',
          category: 'general',
        });
        console.log('User message stored in database');
      } catch (dbError) {
        console.warn('Failed to store user message in database:', dbError);
      }

      // Use Google AI to generate solar panel advice with conversation history
      const aiResponse = await generateSolarAdvice(message.trim(), conversationHistory || []);
      
      // Store AI response in database
      let aiMessage = null;
      try {
        aiMessage = await storage.createChatMessage({
          userId: 1, // Default user for now
          username: "AI Assistant",
          message: aiResponse.response,
          type: 'ai',
          category: aiResponse.category,
        });
        console.log('AI response stored in database');
      } catch (dbError) {
        console.warn('Failed to store AI response in database:', dbError);
      }
      
      res.json(aiResponse);
    } catch (error) {
      console.error('AI Chat error:', error);
      
      // Enhanced fallback response instead of error message
      const lowerMessage = req.body.message?.toLowerCase() || "";
      let category = "general";
      let response = "I understand you're asking about solar panels. ";

      if (lowerMessage.includes("install") || lowerMessage.includes("placement") || lowerMessage.includes("roof")) {
        category = "installation";
        response += "For installation planning, I recommend: **1) Roof Assessment** - Ensure your roof can support solar panels and has good sun exposure. **2) System Sizing** - Calculate your energy needs and determine the right system size. **3) Permits & Codes** - Check local building codes and obtain necessary permits. **4) Professional Installation** - Work with certified installers for safety and warranty coverage. Would you like me to elaborate on any of these areas?";
      } else if (lowerMessage.includes("fault") || lowerMessage.includes("problem") || lowerMessage.includes("defect") || lowerMessage.includes("issue")) {
        category = "fault";
        response += "For solar panel troubleshooting, check these common issues: **1) Shading** - Trees or buildings blocking sunlight. **2) Dirty Panels** - Dust, leaves, or debris reducing efficiency. **3) Loose Connections** - Electrical connections that need tightening. **4) Inverter Issues** - Check inverter display for error codes. **5) Weather Damage** - Inspect for cracks, hot spots, or physical damage. What specific symptoms are you experiencing?";
      } else if (lowerMessage.includes("help") || lowerMessage.includes("support") || lowerMessage.includes("helpline") || lowerMessage.includes("contact")) {
        category = "helpline";
        response += "Here are Indian solar energy helpline numbers: **MNRE Helpline**: 1800-180-3333 (Ministry of New and Renewable Energy) **SECI Support**: 011-2436-0707 (Solar Energy Corporation of India) **National Solar Mission**: 1800-11-3003 **BEE Helpline**: 1800-11-2722 (Bureau of Energy Efficiency) **State Electricity Commission**: 1912 **PM Surya Ghar Scheme**: 1800-11-4455 (Free rooftop solar). These numbers can help with subsidies, installations, grid connections, and technical support.";
      } else if (lowerMessage.includes("maintenance") || lowerMessage.includes("clean") || lowerMessage.includes("care")) {
        category = "maintenance";
        response += "Solar panel maintenance best practices: **1) Regular Cleaning** - Clean panels every 3-6 months or when visibly dirty. **2) Visual Inspections** - Check for damage, loose connections, or shading issues monthly. **3) Performance Monitoring** - Track energy output to identify declining performance. **4) Professional Checkups** - Schedule annual professional inspections. **5) Vegetation Management** - Trim trees to prevent shading. What specific maintenance aspect interests you most?";
      } else if (lowerMessage.includes("performance") || lowerMessage.includes("efficiency") || lowerMessage.includes("output")) {
        category = "performance";
        response += "To optimize solar panel performance: **1) Maximize Sun Exposure** - Ensure panels face south with minimal shading. **2) Keep Panels Clean** - Regular cleaning maintains optimal efficiency. **3) Monitor System** - Track daily/monthly energy production. **4) Check Inverter Health** - Inverters typically last 10-15 years. **5) Consider Upgrades** - Micro-inverters or power optimizers can improve performance. What performance metrics are you concerned about?";
      } else {
        response += "I can provide expert guidance on: **Installation Planning** (roof assessment, system sizing, permits), **Fault Detection** (troubleshooting, defect identification), **Maintenance** (cleaning, inspections, care), and **Performance Optimization** (efficiency improvements, monitoring). What specific aspect would you like to explore?";
      }

      res.json({ response, category });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
