import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  type: text("type").notNull(), // 'installation' or 'fault-detection'
  imagePath: text("image_path").notNull(),
  results: jsonb("results").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  username: text("username").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default('user'), // 'user', 'system', 'ai'
  category: text("category").default('general'), // 'installation', 'maintenance', 'fault', 'general'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  userId: true,
  type: true,
  imagePath: true,
  results: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  username: true,
  message: true,
  type: true,
  category: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Analysis result types
export const roofInputSchema = z.object({
  roofSize: z.number().min(100).max(10000).optional(), // Square feet
  roofShape: z.enum(['gable', 'hip', 'shed', 'flat', 'complex', 'auto-detect']).optional(),
  panelSize: z.enum(['standard', 'large', 'auto-optimize']).optional(),
});

export const installationResultSchema = z.object({
  totalPanels: z.number(),
  coverage: z.number(),
  efficiency: z.number(),
  confidence: z.number(),
  powerOutput: z.number(),
  orientation: z.string(),
  shadingAnalysis: z.string(),
  notes: z.string(),
  roofType: z.string().optional(),
  estimatedRoofArea: z.number().optional(),
  usableRoofArea: z.number().optional(),
  roofSections: z.array(z.object({
    name: z.string(),
    orientation: z.string(),
    tiltAngle: z.number(),
    area: z.number(),
    panelCount: z.number(),
    efficiency: z.number()
  })).optional(),
  regions: z.array(z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    roofSection: z.string().optional()
  })),
});

export const faultResultSchema = z.object({
  panelId: z.string(),
  faults: z.array(z.object({
    type: z.string(),
    severity: z.string(),
    x: z.number(),
    y: z.number(),
    description: z.string(),
  })),
  overallHealth: z.string(),
  recommendations: z.array(z.string()),
});

export type RoofInput = z.infer<typeof roofInputSchema>;
export type InstallationResult = z.infer<typeof installationResultSchema>;
export type FaultResult = z.infer<typeof faultResultSchema>;
