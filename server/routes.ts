import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client using the environment variables set by the integration
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // --- Chat API ---
  app.post(api.chat.send.path, async (req, res) => {
    try {
      const { message } = api.chat.send.input.parse(req.body);

      // Save user message
      await storage.createMessage({
        role: "user",
        content: message,
      });

      // Get history for context (last 10 messages)
      const history = await storage.getMessages();
      const recentHistory = history.slice(-10).map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      }));

      // Call OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-5.2", // Use the recommended model
        messages: [
          { 
            role: "system", 
            content: "You are JARVIS, a highly advanced virtual assistant. You are helpful, precise, and speak in a technical but polite manner. Keep responses concise and suitable for a HUD interface." 
          },
          ...recentHistory,
          { role: "user", content: message }
        ],
      });

      const assistantMessage = completion.choices[0].message.content || "I am unable to process that request.";

      // Save assistant message
      await storage.createMessage({
        role: "assistant",
        content: assistantMessage,
      });

      res.json({ message: assistantMessage });

    } catch (err) {
      console.error("Chat Error:", err);
      res.status(500).json({ message: "Failed to process chat request" });
    }
  });

  app.get(api.chat.history.path, async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  // --- System Metrics API (Mock) ---
  app.get(api.system.metrics.path, async (req, res) => {
    // Generate realistic fluctuating metrics
    const metrics = {
      cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
      memory: Math.floor(Math.random() * 40) + 20, // 20-60%
      temperature: Math.floor(Math.random() * 15) + 45, // 45-60C
      networkUp: Math.floor(Math.random() * 500) + 100, // Kbps
      networkDown: Math.floor(Math.random() * 2000) + 500, // Kbps
      tasks: Math.floor(Math.random() * 5) + 40,
    };
    res.json(metrics);
  });

  return httpServer;
}
