import { analyses, users, chatMessages, type User, type InsertUser, type Analysis, type InsertAnalysis, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { eq, desc, count } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysesByUser(userId: number): Promise<Analysis[]>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private analyses: Map<number, Analysis>;
  private chatMessages: Map<number, ChatMessage>;
  private currentUserId: number;
  private currentAnalysisId: number;
  private currentChatMessageId: number;

  constructor() {
    this.users = new Map();
    this.analyses = new Map();
    this.chatMessages = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
    this.currentChatMessageId = 1;
    
    // Add some initial chat messages to demonstrate the system
    this.addInitialChatMessages();
  }

  private addInitialChatMessages() {
    // Welcome message
    this.chatMessages.set(this.currentChatMessageId++, {
      id: this.currentChatMessageId - 1,
      userId: null,
      username: 'System',
      message: 'Welcome to the Solar Panel Community Chat!\n\nThis is a space for discussing solar panel installations, maintenance, troubleshooting, and sharing experiences. Feel free to ask questions or share your knowledge!',
      type: 'system',
      category: 'general',
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    });

    // AI introduction
    this.chatMessages.set(this.currentChatMessageId++, {
      id: this.currentChatMessageId - 1,
      userId: null,
      username: 'SolarScope AI',
      message: 'Hello! I\'m SolarScope AI, your solar panel analysis assistant. I can help with:\n\n• Installation planning and optimal panel placement\n• Fault detection and defect identification\n• Maintenance recommendations\n• Performance optimization tips\n• Safety guidelines and best practices\n\nFeel free to ask me anything about solar panels!',
      type: 'ai',
      category: 'general',
      createdAt: new Date(Date.now() - 3000000), // 50 minutes ago
    });

    // Sample community message
    this.chatMessages.set(this.currentChatMessageId++, {
      id: this.currentChatMessageId - 1,
      userId: 1,
      username: 'SolarEnthusiast',
      message: 'Just completed my first solar panel analysis using SolarScope! The AI detected some micro-cracks in my panels that I hadn\'t noticed. Really impressed with the accuracy.',
      type: 'user',
      category: 'fault',
      createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.currentAnalysisId++;
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
      userId: insertAnalysis.userId ?? null,
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysesByUser(userId: number): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).filter(
      (analysis) => analysis.userId === userId,
    );
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
      userId: insertMessage.userId ?? null,
      category: insertMessage.category ?? null,
      type: insertMessage.type || 'user',
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(limit: number = 50): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values())
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Return the most recent messages up to the limit
    return messages.slice(-limit);
  }
}

export class DatabaseStorage implements IStorage {
  private async getDb() {
    const { db } = await import("./db");
    if (!db) {
      throw new Error("Database connection not available");
    }
    return db;
  }

  async getUser(id: number): Promise<User | undefined> {
    const db = await this.getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await this.getDb();
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await this.getDb();
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const db = await this.getDb();
    const [analysis] = await db
      .insert(analyses)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getAnalysesByUser(userId: number): Promise<Analysis[]> {
    const db = await this.getDb();
    return await db
      .select()
      .from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.createdAt));
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const db = await this.getDb();
    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, id));
    return analysis || undefined;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const db = await this.getDb();
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getChatMessages(limit: number = 50): Promise<ChatMessage[]> {
    const db = await this.getDb();
    return await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }
}

// Enhanced storage initialization with database for production
export const storage = (() => {
  // Use database storage when DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    console.log('Using database storage for production');
    return new DatabaseStorage();
  }
  
  // Fallback to memory storage for local development
  console.log('Using memory storage for development');
  return new MemStorage();
})();
