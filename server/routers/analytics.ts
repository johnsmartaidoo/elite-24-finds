import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const analyticsRouter = router({
  trackEvent: publicProcedure
    .input(
      z.object({
        affiliateLinkId: z.number().optional(),
        pinterestPostId: z.number().optional(),
        eventType: z.enum(["click", "conversion", "impression", "save"]),
        referrer: z.string().optional(),
        userAgent: z.string().optional(),
        ipAddress: z.string().optional(),
        revenue: z.number().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.createAnalyticsEvent({
        affiliateLinkId: input.affiliateLinkId || undefined,
        pinterestPostId: input.pinterestPostId || undefined,
        eventType: input.eventType as any,
        referrer: input.referrer,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
        revenue: input.revenue ? parseFloat(input.revenue.toString()) : undefined,
        metadata: input.metadata,
      } as any);

      return { success: true };
    }),

  getAffiliateLinkStats: protectedProcedure
    .input(z.object({ affiliateLinkId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view analytics");
      }

      const events = await db.getAnalyticsByAffiliateLinkId(input.affiliateLinkId);
      const link = await db.getAffiliateLink(input.affiliateLinkId);

      if (!link) throw new Error("Affiliate link not found");

      const stats = {
        clicks: link.clicks || 0,
        conversions: link.conversions || 0,
        revenue: link.revenue ? parseFloat(link.revenue.toString()) : 0,
        events: events.length,
        eventBreakdown: {
          clicks: events.filter((e) => e.eventType === "click").length,
          conversions: events.filter((e) => e.eventType === "conversion").length,
          impressions: events.filter((e) => e.eventType === "impression").length,
          saves: events.filter((e) => e.eventType === "save").length,
        },
      };

      return stats;
    }),

  getPinterestPostStats: protectedProcedure
    .input(z.object({ pinterestPostId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view analytics");
      }

      const post = await db.getPinterestPost(input.pinterestPostId);
      if (!post) throw new Error("Pinterest post not found");

      const events = await db.getAnalyticsByPinterestPostId(input.pinterestPostId);

      return {
        clicks: post.clicks || 0,
        saves: post.saves || 0,
        impressions: post.impressions || 0,
        status: post.status,
        postedAt: post.postedAt,
        events: events.length,
        eventBreakdown: {
          clicks: events.filter((e) => e.eventType === "click").length,
          conversions: events.filter((e) => e.eventType === "conversion").length,
          impressions: events.filter((e) => e.eventType === "impression").length,
          saves: events.filter((e) => e.eventType === "save").length,
        },
      };
    }),

  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can view analytics");
    }

    const products = await db.getProducts(1000, 0);
    const posts = await db.getPinterestPosts(1000, 0);

    const totalClicks = posts.reduce((sum, p) => sum + (p.clicks || 0), 0);
    const totalSaves = posts.reduce((sum, p) => sum + (p.saves || 0), 0);
    const totalImpressions = posts.reduce((sum, p) => sum + (p.impressions || 0), 0);

    const postedCount = posts.filter((p) => p.status === "posted").length;
    const draftCount = posts.filter((p) => p.status === "draft").length;
    const failedCount = posts.filter((p) => p.status === "failed").length;

    return {
      totalProducts: products.length,
      totalPosts: posts.length,
      postedCount,
      draftCount,
      failedCount,
      totalClicks,
      totalSaves,
      totalImpressions,
      averageClicksPerPost: postedCount > 0 ? totalClicks / postedCount : 0,
      averageSavesPerPost: postedCount > 0 ? totalSaves / postedCount : 0,
    };
  }),
});

// Helper function to get analytics by Pinterest post ID
async function getAnalyticsByPinterestPostId(pinterestPostId: number) {
  const db_module = await import("../db");
  // This would be implemented in db.ts
  return [];
}
