import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

//TODO Move validators to  ../schemas/code.ts
export const codeRouter = createTRPCRouter({
  create: publicProcedure
    .meta({
      openapi: { method: "POST", path: "/code/submit", tags: ["codes"] },
    })
    .input(
      z.object({
        code: z.string().nullable(),
        accepted: z.boolean().optional(),
        activityId: z.string(),
      }),
    )
    .output(
      z.object({
        id: z.string().optional().nullable(),
        code: z.string().optional().nullable(),
        ok: z.boolean(),
        message: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.code) {
        return {
          ok: false,
        };
      }

      // const activity = await ctx.db.activity.findFirst({
      //   where: {
      //     id: input.activityId,
      //     startDateTime: {
      //       lte: now,
      //     },
      //     endDateTime: {
      //       gte: now,
      //     },
      //   },
      // });

      // if (!activity) {
      //   return {
      //     ok: false,
      //     message: "Invalid activity",
      //   };
      // }

      const inputCodeFormatted = input.code.padStart(6, "0").substring(0, 6);

      const code = await ctx.db.checkinCode.findFirst({
        where: {
          code: inputCodeFormatted,
          activityId: input.activityId,
        },
      });

      // Update score in database if the code has been submitted already
      if (code) {
        let score: number | undefined;
        if (input.accepted !== undefined) {
          score = input.accepted ? 1 : -1;
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
          code: inputCodeFormatted,
          score: 1,
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
