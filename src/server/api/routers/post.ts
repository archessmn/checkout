import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .meta({ openapi: { method: "GET", path: "/test", tags: ["test"] } })
    .input(z.object({ text: z.string() }))
    .output(z.object({ greeting: z.string() }))
    .mutation(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.post.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getLatest: protectedProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  getAciCodes: protectedProcedure
    .meta({
      /* 👉 */ openapi: { method: "GET", path: "/aci/codes", enabled: true },
    })
    .input(z.void())
    .output(z.any())
    .query(async () => {
      const aciCodesResponse = await fetch(
        "https://aci-api.ashhhleyyy.dev/api/codes",
        {
          headers: {
            "User-Agent": "",
          },
        },
      );

      const aciCodes = await aciCodesResponse.json();

      return aciCodes;
    }),
});
