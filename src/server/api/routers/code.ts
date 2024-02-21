import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

//TODO Move validators to  ../schemas/code.ts
export const codeRouter = createTRPCRouter({
  create: publicProcedure
    .meta({ openapi: { method: "POST", path: "/code/submit" } })
    .input(
      z.object({
        code: z.preprocess((value) => Number(value), z.number()),
        accepted: z.boolean().optional(),
        activityId: z.string(),
      }),
    )
    .output(
      z.object({
        id: z.string().optional().nullable(),
        code: z.number().optional().nullable(),
        ok: z.boolean(),
        message: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();

      const activity = await ctx.db.activity.findFirst({
        where: {
          id: input.activityId,
          startDateTime: {
            lte: now,
          },
          endDateTime: {
            gte: now,
          },
        },
      });

      if (!activity) {
        return {
          ok: false,
          message: "Invalid activity",
        };
      }

      const code = await ctx.db.checkinCode.findFirst({
        where: {
          code: input.code,
          activityId: input.activityId,
        },
      });

      // Update score in database if the code has been submitted already
      if (code) {
        let score: number | undefined;
        if (input.accepted) {
          score = input.accepted ? 2 : -2;
        }

        const updatedCode = await ctx.db.checkinCode.update({
          where: {
            id: code.id,
          },
          data: {
            score: {
              increment: score ?? 1,
            },
          },
        });

        return {
          ok: true,
          id: updatedCode.id,
          code: updatedCode.code,
          message: "Updated successfully",
        };
      }

      const createdCode = await ctx.db.checkinCode.create({
        data: {
          code: input.code,
          activity: { connect: { id: input.activityId } },
        },
      });

      return {
        ok: true,
        id: createdCode.id,
        code: createdCode.code,
        message: "Created successfully",
      };
    }),
});
