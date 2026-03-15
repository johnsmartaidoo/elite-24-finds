import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Amazon products discovered through automated searches
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  asin: varchar("asin", { length: 20 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }),
  discount: int("discount"), // percentage
  imageUrl: text("imageUrl"),
  productUrl: text("productUrl").notNull(),
  category: varchar("category", { length: 255 }),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  reviewCount: int("reviewCount"),
  inStock: boolean("inStock").default(true),
  isPrime: boolean("isPrime").default(false),
  seoDescription: text("seoDescription"), // LLM-generated
  pinterestCaption: text("pinterestCaption"), // LLM-generated
  tags: json("tags").$type<string[]>().default([]),
  source: varchar("source", { length: 50 }).default("amazon"), // amazon, manual, etc
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  asinIdx: index("asin_idx").on(table.asin),
  categoryIdx: index("category_idx").on(table.category),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Affiliate links generated for products
 */
export const affiliateLinks = mysqlTable("affiliate_links", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  associateId: varchar("associateId", { length: 50 }).notNull(),
  affiliateUrl: text("affiliateUrl").notNull(),
  shortUrl: varchar("shortUrl", { length: 255 }),
  clicks: int("clicks").default(0),
  conversions: int("conversions").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  productIdIdx: index("product_id_idx").on(table.productId),
  associateIdIdx: index("associate_id_idx").on(table.associateId),
}));

export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type InsertAffiliateLink = typeof affiliateLinks.$inferInsert;

/**
 * Pinterest posts and pins
 */
export const pinterestPosts = mysqlTable("pinterest_posts", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  affiliateLinkId: int("affiliateLinkId").notNull().references(() => affiliateLinks.id, { onDelete: "cascade" }),
  pinId: varchar("pinId", { length: 100 }),
  boardId: varchar("boardId", { length: 100 }),
  pinUrl: text("pinUrl"),
  imageUrl: text("imageUrl"),
  title: text("title").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "scheduled", "posted", "failed"]).default("draft"),
  scheduledAt: timestamp("scheduledAt"),
  postedAt: timestamp("postedAt"),
  clicks: int("clicks").default(0),
  saves: int("saves").default(0),
  impressions: int("impressions").default(0),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  productIdIdx: index("pinterest_product_id_idx").on(table.productId),
  statusIdx: index("pinterest_status_idx").on(table.status),
  postedAtIdx: index("posted_at_idx").on(table.postedAt),
}));

export type PinterestPost = typeof pinterestPosts.$inferSelect;
export type InsertPinterestPost = typeof pinterestPosts.$inferInsert;

/**
 * Automation execution logs
 */
export const automationLogs = mysqlTable("automation_logs", {
  id: int("id").autoincrement().primaryKey(),
  automationType: mysqlEnum("automationType", ["amazon_search", "pinterest_post", "analytics_sync"]).notNull(),
  status: mysqlEnum("status", ["started", "completed", "failed", "partial"]).notNull(),
  productsFound: int("productsFound").default(0),
  productsPosted: int("productsPosted").default(0),
  errorCount: int("errorCount").default(0),
  errorDetails: json("errorDetails").$type<Record<string, unknown>[]>().default([]),
  executionTime: int("executionTime"), // milliseconds
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("automation_type_idx").on(table.automationType),
  statusIdx: index("automation_status_idx").on(table.status),
  createdAtIdx: index("automation_created_at_idx").on(table.createdAt),
}));

export type AutomationLog = typeof automationLogs.$inferSelect;
export type InsertAutomationLog = typeof automationLogs.$inferInsert;

/**
 * Analytics and tracking data
 */
export const analytics = mysqlTable("analytics", {
  id: int("id").autoincrement().primaryKey(),
  affiliateLinkId: int("affiliateLinkId").references(() => affiliateLinks.id, { onDelete: "cascade" }),
  pinterestPostId: int("pinterestPostId").references(() => pinterestPosts.id, { onDelete: "cascade" }),
  eventType: mysqlEnum("eventType", ["click", "conversion", "impression", "save"]).notNull(),
  referrer: varchar("referrer", { length: 500 }),
  userAgent: varchar("userAgent", { length: 500 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  revenue: decimal("revenue", { precision: 12, scale: 2 }),
  metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  affiliateLinkIdIdx: index("analytics_affiliate_link_id_idx").on(table.affiliateLinkId),
  pinterestPostIdIdx: index("analytics_pinterest_post_id_idx").on(table.pinterestPostId),
  eventTypeIdx: index("event_type_idx").on(table.eventType),
  createdAtIdx: index("analytics_created_at_idx").on(table.createdAt),
}));

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

/**
 * Automation settings and configuration
 */
export const automationSettings = mysqlTable("automation_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  dataType: mysqlEnum("dataType", ["string", "number", "boolean", "json"]).default("string"),
  description: text("description"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutomationSetting = typeof automationSettings.$inferSelect;
export type InsertAutomationSetting = typeof automationSettings.$inferInsert;

/**
 * S3 file storage metadata
 */
export const fileStorage = mysqlTable("file_storage", {
  id: int("id").autoincrement().primaryKey(),
  s3Key: varchar("s3Key", { length: 500 }).notNull().unique(),
  s3Url: text("s3Url").notNull(),
  fileType: varchar("fileType", { length: 50 }),
  fileName: varchar("fileName", { length: 255 }),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  relatedProductId: int("relatedProductId").references(() => products.id, { onDelete: "set null" }),
  relatedPostId: int("relatedPostId").references(() => pinterestPosts.id, { onDelete: "set null" }),
  uploadedBy: int("uploadedBy").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  s3KeyIdx: index("s3_key_idx").on(table.s3Key),
  productIdIdx: index("file_product_id_idx").on(table.relatedProductId),
}));

export type FileStorage = typeof fileStorage.$inferSelect;
export type InsertFileStorage = typeof fileStorage.$inferInsert;