import { postRouter } from "@/server/api/routers/post";
import { createTRPCRouter } from "@/server/api/trpc";
import { activityRouter } from "./routers/activity";
import { moduleRouter } from "./routers/module";
import { departmentRouter } from "./routers/department";
import { codeRouter } from "./routers/code";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  activity: activityRouter,
  module: moduleRouter,
  department: departmentRouter,
  code: codeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
