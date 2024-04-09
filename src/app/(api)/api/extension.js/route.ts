import { env } from "@/env";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const download = searchParams.get("download");

  const file = await fs.readFile(
    process.cwd() + "/public/api/extension-template.js",
    "utf8",
  );

  return new Response(
    file
      .replaceAll("${env.PUBLIC_URL}", env.PUBLIC_URL)
      .replaceAll("env.AUTOFILL_ENABLED", `${env.AUTOFILL_ENABLED}`)
      .replaceAll("${process.env.NODE_ENV}", process.env.NODE_ENV),
    {
      headers: {
        "Content-Type": "text/javascript",
        "Content-Disposition":
          download == "true" ? "attachment; filename=userscript.js" : "",
        "Cache-Control": "no-store",
      },
    },
  );
}
