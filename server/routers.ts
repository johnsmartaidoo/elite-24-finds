import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { productsRouter } from "./routers/products";
import { pinterestRouter } from "./routers/pinterest";
import { automationRouter } from "./routers/automation";
import { analyticsRouter } from "./routers/analytics";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  products: productsRouter,
  pinterest: pinterestRouter,
  automation: automationRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
