import { NextApiRequest, NextApiResponse } from "next";
import cors from "nextjs-cors";
import { createOpenApiNextHandler } from "trpc-openapi";

import { appRouter } from "@/server/api/root";
import { createPagesTRPCContext } from "@/server/api/trpc";
import { env } from "@/env";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Setup CORS
  await cors(req, res);

  // Handle incoming OpenAPI requests
  return createOpenApiNextHandler({
    router: appRouter,
    createContext: createPagesTRPCContext,
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }: { path: string | undefined; error: any }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
    responseMeta: undefined,
  })(req, res);
};

export default handler;
