import { env } from "@/env";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  const file = await fs.readFile(
    process.cwd() + "/public/api/userscript-template.js",
    "utf8",
  );

  return new Response(
    file
      .replaceAll("${env.PUBLIC_URL}", env.PUBLIC_URL)
      .replaceAll("env.AUTOFILL_ENABLED", `${env.AUTOFILL_ENABLED}`),
    {
      headers: {
        "Content-Type": "text/javascript",
        "Cache-Control": "no-store",
      },
    },
  );
}
