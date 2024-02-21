import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import moment from "moment";
import { activitySchema } from "../schemas/activity";

export const activityRouter = createTRPCRouter({
  getCode: publicProcedure
    .meta({ openapi: { method: "POST", path: "/activity/code" } })
    .input(activitySchema.getCode.input)
    .output(activitySchema.getCode.output)
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const currentActivity = await ctx.db.activity.findFirst({
        where: {
          startDateTime: {
            lte: now,
          },
          endDateTime: {
            gte: now,
          },
          reference: {
            contains: input.activity,
          },
          location: {
            contains: input.space,
          },
        },
      });

      const code = await ctx.db.checkinCode.findFirst({
        orderBy: {
          score: "desc",
        },
        where: {
          activityId: currentActivity?.id,
        },
      });

      if (code) {
        return {
          id: input.id,
          code: code.code,
          activityId: currentActivity!.id,
        };
      }

      return {
        id: input.id,
        code: -1,
        activityId: null,
      };
    }),

  getId: publicProcedure
    .meta({ openapi: { method: "POST", path: "/activity/id" } })
    .input(activitySchema.getId.input)
    .output(activitySchema.getId.output)
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const currentActivity = await ctx.db.activity.findFirst({
        where: {
          startDateTime: {
            lte: now,
          },
          endDateTime: {
            gte: now,
          },
          reference: {
            contains: input.activity,
          },
          location: {
            contains: input.space,
          },
        },
      });

      if (currentActivity) {
        return {
          id: input.id,
          activityId: currentActivity.id,
        };
      }

      return {
        id: input.id,
        activityId: null,
      };
    }),

  postTimetableCsv: protectedProcedure
    .input(activitySchema.postTimetableCsv.input)
    .output(activitySchema.postTimetableCsv.output)
    .mutation(async ({ ctx, input }) => {
      let count = 0;

      for (const activity of input.file) {
        let department = await ctx.db.department.findFirst({
          where: { name: activity.department },
        });

        if (!department) {
          department = await ctx.db.department.create({
            data: {
              name: activity.department,
              createdBy: { connect: { id: ctx.session.user.id } },
            },
          });
        }

        let moduleBeans = await ctx.db.module.findFirst({
          where: { code: activity.moduleCode },
        });

        if (!moduleBeans) {
          moduleBeans = await ctx.db.module.create({
            data: {
              code: activity.moduleCode,
              description: activity.moduleDescription,
              department: { connect: { id: department.id } },
              createdBy: { connect: { id: ctx.session.user.id } },
            },
          });
        }

        const startDateTime = new Date(
          `${activity.startDate} ${activity.startTime}`,
        );
        const endDateTime = new Date(`${activity.endDate} ${activity.endTime}`);

        const searchActivity = await ctx.db.activity.findFirst({
          where: {
            startDateTime,
            endDateTime,
            module: moduleBeans,
            reference: activity.activityReference,
          },
        });

        if (!searchActivity) {
          await ctx.db.activity.create({
            data: {
              description: activity.description,
              startWeek: activity.startWeek,
              startDateTime,
              endDateTime,
              duration: activity.duration,
              type: activity.type,
              staff: activity.staff,
              location: activity.location,
              size: activity.size,
              reference: activity.activityReference,
              details: activity.activityDetails,

              module: { connect: { id: moduleBeans.id } },
              department: { connect: { id: department.id } },
              createdBy: { connect: { id: ctx.session.user.id } },
            },
          });

          count += 1;
        }
      }

      return {
        success: true,
        count,
      };
    }),

  create: protectedProcedure
    .input(activitySchema.create.input)
    .mutation(({ ctx, input }) => {
      return ctx.db.activity.create({
        data: {
          description: input.description,
          startWeek: input.startWeek,
          startDateTime: input.startDateTime,
          endDateTime: input.endDateTime,
          duration: input.duration,
          type: input.type,
          staff: input.staff,
          location: input.location,
          size: input.size,
          reference: input.reference,
          details: input.details,
          module: { connect: { id: input.moduleId } },
          department: { connect: { id: input.departmentId } },
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getDayActivities: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/activity/by-day/{date}",
      },
    })
    .input(activitySchema.getDayActivities.input)
    .output(activitySchema.getDayActivities.output)
    .query(async ({ ctx, input }) => {
      const date = moment(input.date).toDate();
      const endDate = moment(input.date).endOf("day").toDate();
      return await ctx.db.activity.findMany({
        where: {
          startDateTime: {
            gte: date,
            lte: endDate,
          },
        },
      });
    }),
});
