import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const moduleRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        description: z.string().optional(),
        departmentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.module.create({
        data: {
          code: input.code,
          description: input.description,
          department: { connect: { id: input.departmentId } },
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  findFirstOrCreate: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        description: z.string().optional(),
        departmentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let moduleBeans = await ctx.db.module.findFirst({
        where: { code: input.code },
      });

      if (!moduleBeans) {
        moduleBeans = await ctx.db.module.create({
          data: {
            code: input.code,
            description: input.description,
            department: { connect: { id: input.departmentId } },
            createdBy: { connect: { id: ctx.session.user.id } },
          },
        });
      }

      return moduleBeans;
    }),
});
