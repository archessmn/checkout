import { generateOpenApiDocument } from "trpc-openapi";

import { appRouter } from "./root";

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Checkout API Docs",
  description:
    "OpenAPI compliant REST API built using tRPC with Next.js, there is no guarantee that these routes will remain the same as this project is still in development.",
  version: process.env.npm_package_version ?? "uh_oh",
  baseUrl: `${process.env.PUBLIC_URL}/api`,
  docsUrl: "https://github.com/jlalmes/trpc-openapi",
  tags: ["activities", "codes"],
});
