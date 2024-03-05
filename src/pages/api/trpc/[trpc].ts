import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createPagesTRPCContext } from "@/server/api/trpc";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createPagesTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({
          path,
          error,
        }: {
          path: string | undefined;
          error: { message: string };
        }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
          );
        }
      : undefined,
});
