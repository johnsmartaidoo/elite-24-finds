import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { createPin, validatePinData } from "../integrations/pinterest";

export const pinterestRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0), status: z.string().optional() }))
    .query(async ({ input }) => {
      return db.getPinterestPosts(input.limit, input.offset, input.status);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getPinterestPost(input.id);
    }),

  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        affiliateLinkId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
        scheduledAt: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can create Pinterest posts");
      }

      const post = await db.createPinterestPost({
        productId: input.productId,
        affiliateLinkId: input.affiliateLinkId,
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        status: input.scheduledAt ? "scheduled" : "draft",
        scheduledAt: input.scheduledAt,
      });

      return { success: true, postId: (post as any).insertId };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          status: z.enum(["draft", "scheduled", "posted", "failed"]).optional(),
          scheduledAt: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can update Pinterest posts");
      }

      await db.updatePinterestPost(input.id, input.data as any);
      return { success: true };
    }),

  post: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can post to Pinterest");
      }

      const post = await db.getPinterestPost(input.id);
      if (!post) throw new Error("Post not found");

      try {
        const pinResult = await createPin({
          title: post.title,
          description: post.description || "",
          imageUrl: post.imageUrl || "https://via.placeholder.com/1000x1500",
          link: post.pinUrl || "",
        });

        if (pinResult) {
          await db.updatePinterestPost(input.id, {
            status: "posted",
            postedAt: new Date(),
            pinId: pinResult.pinId,
            pinUrl: pinResult.url,
          });
          return { success: true, pinId: pinResult.pinId, url: pinResult.url };
        } else {
          throw new Error("Failed to create pin");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await db.updatePinterestPost(input.id, {
          status: "failed",
          errorMessage,
        });
        throw error;
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can delete Pinterest posts");
      }

      await db.updatePinterestPost(input.id, { status: "draft" });
      return { success: true };
    }),

  getStats: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const post = await db.getPinterestPost(input.id);
      if (!post) throw new Error("Post not found");

      return {
        clicks: post.clicks || 0,
        saves: post.saves || 0,
        impressions: post.impressions || 0,
        status: post.status,
        postedAt: post.postedAt,
      };
    }),
});
