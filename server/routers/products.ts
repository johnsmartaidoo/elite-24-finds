import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { generateProductDescription, generatePinterestCaption, generateProductTags, analyzeDealWorthiness } from "../integrations/llm";
import { generateAffiliateLink } from "../integrations/amazon";
import { ENV } from "../_core/env";

const productSchema = z.object({
  asin: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().optional(),
  originalPrice: z.number().optional(),
  discount: z.number().optional(),
  imageUrl: z.string().optional(),
  productUrl: z.string().url(),
  category: z.string().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  inStock: z.boolean().default(true),
  isPrime: z.boolean().default(false),
});

export const productsRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return db.getProducts(input.limit, input.offset);
    }),

  getByAsin: publicProcedure
    .input(z.object({ asin: z.string() }))
    .query(async ({ input }) => {
      return db.getProductByAsin(input.asin);
    }),

  create: protectedProcedure
    .input(productSchema)
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can create products");
      }

      const existing = await db.getProductByAsin(input.asin);
      if (existing) {
        throw new Error("Product with this ASIN already exists");
      }

      const [seoDescription, pinterestCaption, tags] = await Promise.all([
        generateProductDescription(input),
        generatePinterestCaption(input),
        generateProductTags(input),
      ]);

      const result = await db.createProduct({
        ...input,
        seoDescription,
        pinterestCaption,
        tags,
        source: "manual",
      } as any);

      const productId = (result as any).insertId || 0;
      const affiliateUrl = generateAffiliateLink(input.asin, ENV.amazonAssociateId);
      await db.createAffiliateLink({
        productId,
        associateId: ENV.amazonAssociateId,
        affiliateUrl,
      });

      return { success: true, productId };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: productSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can update products");
      }

      const updateData: any = { ...input.data };
      await db.updateProduct(input.id, updateData);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can delete products");
      }

      await db.deleteProduct(input.id);
      return { success: true };
    }),

  generateContent: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can generate content");
      }

      const products = await db.getProducts(1, 0);
      if (!products || products.length === 0) {
        throw new Error("Product not found");
      }

      const p = products[0];
      const productData: any = {
        title: p.title,
        description: p.description || undefined,
        price: p.price ? Number(p.price) : undefined,
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        discount: p.discount || undefined,
        category: p.category || undefined,
        rating: p.rating ? Number(p.rating) : undefined,
        reviewCount: p.reviewCount || undefined,
        isPrime: p.isPrime || false,
        inStock: p.inStock || true,
      };

      const [seoDescription, pinterestCaption, tags] = await Promise.all([
        generateProductDescription(productData),
        generatePinterestCaption(productData),
        generateProductTags(productData),
      ]);

      await db.updateProduct(input.productId, {
        seoDescription,
        pinterestCaption,
        tags,
      });

      return { success: true, seoDescription, pinterestCaption, tags };
    }),

  analyzeDeal: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const products = await db.getProducts(1, 0);
      if (!products || products.length === 0) {
        throw new Error("Product not found");
      }

      const p = products[0];
      const productData: any = {
        title: p.title,
        description: p.description || undefined,
        price: p.price ? Number(p.price) : undefined,
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        discount: p.discount || undefined,
        category: p.category || undefined,
        rating: p.rating ? Number(p.rating) : undefined,
        reviewCount: p.reviewCount || undefined,
        isPrime: p.isPrime || false,
        inStock: p.inStock || true,
      };

      return analyzeDealWorthiness(productData);
    }),
});
