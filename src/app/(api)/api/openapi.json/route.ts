import { openApiDocument } from "@/server/api/openapi";
import type { NextRequest, NextResponse } from "next/server";

// Respond with our OpenAPI schema
export const GET = () => {
  // res.send(openApiDocument);
  return Response.json(openApiDocument);
};
