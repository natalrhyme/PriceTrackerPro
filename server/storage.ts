import { users, products, priceHistory, type User, type Product, type PriceHistory, type InsertUser, type InsertProduct, type InsertPriceHistory } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.SessionStore;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getProducts(userId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct & { userId: number }): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Price history operations
  getPriceHistory(productId: number): Promise<PriceHistory[]>;
  addPriceHistory(history: InsertPriceHistory): Promise<PriceHistory>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProducts(userId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.userId, userId));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct & { userId: number }): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values({
        ...product,
        lastChecked: new Date(),
        currentPrice: 0,
        imageUrl: null,
      })
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getPriceHistory(productId: number): Promise<PriceHistory[]> {
    return await db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.productId, productId));
  }

  async addPriceHistory(history: InsertPriceHistory): Promise<PriceHistory> {
    const [newHistory] = await db.insert(priceHistory).values(history).returning();
    return newHistory;
  }
}

export const storage = new DatabaseStorage();