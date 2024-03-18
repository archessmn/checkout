import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

//TODO Move validators to  ../schemas/code.ts
export const codeRouter = createTRPCRouter({
  create: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/code/submit",
        tags: ["codes"],
        description:
          "If the activityId is obtained from /api/activity/ext then offTimetable should be set to true.",
        example: {
          request: {
            code: "6969",
            activityId: "cltiv1gso006ecsfo8r7p00gh",
            offTimetable: true,
          },
        },
      },
    })
    .input(
      z.object({
        code: z.string().nullable(),
        accepted: z.boolean().optional(),
        activityId: z.string(),
        offTimetable: z.boolean().optional(),
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

      // Activity time check

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

      let internalActivityId: string | undefined = undefined;

      if (input.offTimetable) {
        const externalActivity = await db.externalActivity.findFirst({
          where: {
            id: input.activityId,
          },
          select: {
            internalActivityId: true,
          },
        });

        if (externalActivity) {
          internalActivityId = externalActivity.internalActivityId ?? undefined;
        }
      }

      const inputCodeFormatted = input.code.padStart(6, "0").substring(0, 6);

      const code = await ctx.db.checkinCode.findFirst({
        where: {
          code: inputCodeFormatted,
          activityId: !input.offTimetable ? input.activityId : undefined,
          externalActivityId: input.offTimetable ? input.activityId : undefined,
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
              increment: score ?? 0,
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
          activity: !input.offTimetable
            ? { connect: { id: input.activityId } }
            : internalActivityId
              ? { connect: { id: internalActivityId } }
              : undefined,
          externalActivity: input.offTimetable
            ? { connect: { id: input.activityId } }
            : undefined,
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
