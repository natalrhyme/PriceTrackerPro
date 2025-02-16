import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Product routes
  app.get("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const products = await storage.getProducts(req.user.id);
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct({
        ...productData,
        userId: req.user.id,
      });
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json(err.errors);
      } else {
        res.status(500).send("Internal server error");
      }
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const product = await storage.getProduct(parseInt(req.params.id));
    if (!product) return res.status(404).send("Product not found");
    if (product.userId !== req.user.id) return res.sendStatus(403);
    
    res.json(product);
  });

  app.get("/api/products/:id/history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const product = await storage.getProduct(parseInt(req.params.id));
    if (!product) return res.status(404).send("Product not found");
    if (product.userId !== req.user.id) return res.sendStatus(403);
    
    const history = await storage.getPriceHistory(product.id);
    res.json(history);
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const product = await storage.getProduct(parseInt(req.params.id));
    if (!product) return res.status(404).send("Product not found");
    if (product.userId !== req.user.id) return res.sendStatus(403);
    
    await storage.deleteProduct(product.id);
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}
