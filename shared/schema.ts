import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  currentPrice: integer("current_price").notNull(),
  targetPrice: integer("target_price"),
  lastChecked: timestamp("last_checked").notNull(),
  platform: text("platform").notNull(),
  imageUrl: text("image_url"),
  notifyOnDrop: boolean("notify_on_drop").default(false),
});

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  price: integer("price").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const insertUserSchema = createInsertSchema(users).extend({
  email: z.string().email(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  lastChecked: true,
  currentPrice: true,
  imageUrl: true,
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
