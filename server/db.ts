import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, affiliateLinks, pinterestPosts, automationLogs, analytics, automationSettings, fileStorage } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ PRODUCTS ============

export async function getProducts(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt)).limit(limit).offset(offset);
}

export async function getProductByAsin(asin: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.asin, asin)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createProduct(data: typeof products.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, id));
}

// ============ AFFILIATE LINKS ============

export async function getAffiliateLinksByProductId(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliateLinks).where(eq(affiliateLinks.productId, productId));
}

export async function createAffiliateLink(data: typeof affiliateLinks.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(affiliateLinks).values(data);
  return result;
}

export async function getAffiliateLink(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(affiliateLinks).where(eq(affiliateLinks.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateAffiliateLink(id: number, data: Partial<typeof affiliateLinks.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(affiliateLinks).set(data).where(eq(affiliateLinks.id, id));
}

// ============ PINTEREST POSTS ============

export async function getPinterestPosts(limit = 50, offset = 0, status?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = status ? [eq(pinterestPosts.status, status as any)] : [];
  return db.select().from(pinterestPosts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(pinterestPosts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function createPinterestPost(data: typeof pinterestPosts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pinterestPosts).values(data);
  return result;
}

export async function getPinterestPost(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(pinterestPosts).where(eq(pinterestPosts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updatePinterestPost(id: number, data: Partial<typeof pinterestPosts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(pinterestPosts).set(data).where(eq(pinterestPosts.id, id));
}

// ============ AUTOMATION LOGS ============

export async function createAutomationLog(data: typeof automationLogs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(automationLogs).values(data);
  return result;
}

export async function getAutomationLogs(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(automationLogs).orderBy(desc(automationLogs.createdAt)).limit(limit).offset(offset);
}

// ============ ANALYTICS ============

export async function createAnalyticsEvent(data: typeof analytics.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(analytics).values(data);
}

export async function getAnalyticsByAffiliateLinkId(affiliateLinkId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(analytics).where(eq(analytics.affiliateLinkId, affiliateLinkId));
}

// ============ AUTOMATION SETTINGS ============

export async function getAutomationSetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(automationSettings).where(eq(automationSettings.key, key)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function setAutomationSetting(key: string, value: string, dataType: "string" | "number" | "boolean" | "json" = "string") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getAutomationSetting(key);
  if (existing) {
    return db.update(automationSettings).set({ value, dataType }).where(eq(automationSettings.key, key));
  } else {
    return db.insert(automationSettings).values({ key, value, dataType });
  }
}

// ============ FILE STORAGE ============

export async function createFileStorageRecord(data: typeof fileStorage.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(fileStorage).values(data);
}

export async function getFileStorageByS3Key(s3Key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(fileStorage).where(eq(fileStorage.s3Key, s3Key)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getFileStorageByProductId(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fileStorage).where(eq(fileStorage.relatedProductId, productId));
}
