import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { notifyOwner } from "../_core/notification";

export const automationRouter = router({
  getLogs: protectedProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view automation logs");
      }
      return db.getAutomationLogs(input.limit, input.offset);
    }),

  getSettings: protectedProcedure
    .input(z.object({ key: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view automation settings");
      }
      if (input.key) {
        return db.getAutomationSetting(input.key);
      }
      return null;
    }),

  updateSetting: protectedProcedure
    .input(z.object({ key: z.string(), value: z.string(), dataType: z.enum(["string", "number", "boolean", "json"]) }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can update automation settings");
      }
      await db.setAutomationSetting(input.key, input.value, input.dataType);
      return { success: true };
    }),

  startAutomation: protectedProcedure
    .input(z.object({ type: z.enum(["amazon_search", "pinterest_post", "analytics_sync"]) }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can start automation");
      }

      const startTime = Date.now();
      const log = await db.createAutomationLog({
        automationType: input.type,
        status: "started",
        message: `${input.type} automation started`,
      });

      await notifyOwner({
        title: `Automation Started: ${input.type}`,
        content: `The ${input.type} automation has been started.`,
      });

      return { success: true, logId: (log as any).insertId, startTime };
    }),

  completeAutomation: protectedProcedure
    .input(
      z.object({
        logId: z.number(),
        status: z.enum(["completed", "failed", "partial"]),
        productsFound: z.number().optional(),
        productsPosted: z.number().optional(),
        errorCount: z.number().optional(),
        errorDetails: z.array(z.string()).optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can complete automation");
      }

      const executionTime = Math.floor(Date.now() / 1000);

      await db.updateAutomationLog(input.logId, {
        status: input.status as any,
        productsFound: input.productsFound || 0,
        productsPosted: input.productsPosted || 0,
        errorCount: input.errorCount || 0,
        errorDetails: (input.errorDetails || []).map((e) => ({ message: e })) as any,
        executionTime,
        message: input.message,
      });

      const statusMessage =
        input.status === "completed"
          ? `Automation completed successfully. Found: ${input.productsFound}, Posted: ${input.productsPosted}`
          : `Automation ${input.status}. Errors: ${input.errorCount}`;

      await notifyOwner({
        title: `Automation ${input.status.charAt(0).toUpperCase() + input.status.slice(1)}`,
        content: statusMessage,
      });

      return { success: true };
    }),

  getStatus: publicProcedure.query(async () => {
    const logs = await db.getAutomationLogs(1, 0);
    if (logs.length === 0) {
      return { status: "idle", lastRun: null };
    }

    const lastLog = logs[0];
    return {
      status: lastLog.status,
      lastRun: lastLog.createdAt,
      type: lastLog.automationType,
      message: lastLog.message,
    };
  }),
});

// Helper function to update automation log
async function updateAutomationLog(
  logId: number,
  data: {
    status?: string;
    productsFound?: number;
    productsPosted?: number;
    errorCount?: number;
    errorDetails?: any[];
    executionTime?: number;
    message?: string;
  }
) {
  const db_module = await import("../db");
  // This would be implemented in db.ts
}
