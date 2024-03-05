import { openApiDocument } from "@/server/api/openapi";

// Respond with our OpenAPI schema
export const GET = () => {
  // res.send(openApiDocument);
  return Response.json(openApiDocument);
};
