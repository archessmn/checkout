import { string, z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import moment from "moment";
import { activitySchema } from "../schemas/activity";
import { ModuleGroup } from "@prisma/client";
import { db } from "@/server/db";

export const activityRouter = createTRPCRouter({
  getCode: publicProcedure
    .meta({ openapi: { method: "GET", path: "/activity/code" } })
    .input(activitySchema.getCode.input)
    .output(activitySchema.getCode.output)
    .query(async ({ ctx, input }) => {
      const code = await ctx.db.checkinCode.findFirst({
        orderBy: {
          score: "desc",
        },
        where: {
          activityId: input.activityId,
        },
      });

      if (code) {
        return {
          ok: true,
          code: code.code,
        };
      }

      return {
        ok: false,
        code: null,
      };
    }),

  getId: publicProcedure
    .meta({ openapi: { method: "POST", path: "/activity/id" } })
    .input(activitySchema.getId.input)
    .output(activitySchema.getId.output)
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const currentActivity = await getActivityFromExternalInput(input);

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

        let weekName = await ctx.db.weekName.findFirst({
          where: { name: activity.startWeek },
        });

        if (!weekName) {
          weekName = await ctx.db.weekName.create({
            data: {
              name: activity.startWeek,
            },
          });
        }

        let groupNumber = extractGroupNumber(activity.activityReference);

        let group: ModuleGroup | undefined = undefined;

        if (groupNumber) {
          group =
            (await ctx.db.moduleGroup.findFirst({
              where: {
                groupNumber,
                moduleId: moduleBeans.id,
              },
            })) ?? undefined;

          if (!group) {
            group = await ctx.db.moduleGroup.create({
              data: {
                groupNumber,
                module: { connect: { id: moduleBeans.id } },
              },
            });
          }
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
              weekName: { connect: { id: weekName.id } },
              group: group ? { connect: { id: group.id } } : undefined,
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
    .mutation(async ({ ctx, input }) => {
      let weekName = await ctx.db.weekName.findFirst({
        where: { name: input.startWeek },
      });

      if (!weekName) {
        weekName = await ctx.db.weekName.create({
          data: {
            name: input.startWeek,
          },
        });
      }

      return ctx.db.activity.create({
        data: {
          description: input.description,
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
          weekName: { connect: { id: weekName.id } },
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
    .output(activitySchema.getDayActivities.filteredOutput)
    .query(async ({ ctx, input }) => {
      const date = moment(input.date).toDate();
      const endDate = moment(input.date).endOf("day").toDate();

      let groupId = input.groupId;

      if (Number(groupId) > 0) {
        const group = await ctx.db.moduleGroup.findFirst({
          where: {
            groupNumber: Number(groupId),
            moduleId: input.moduleId,
          },
        });

        groupId = group?.id ?? groupId;
      }

      const dayActivities = await ctx.db.activity.findMany({
        where: {
          startDateTime: {
            gte: date,
            lte: endDate,
          },
          groupId,
          moduleId: input.moduleId,
        },
        select: {
          id: true,
          description: true,
          startDateTime: true,
          endDateTime: true,
          type: true,
          reference: true,
          weekName: {
            select: {
              name: true,
            },
          },
          group: {
            select: {
              id: true,
              groupNumber: true,
            },
          },
          checkinCodes: {
            select: {
              id: true,
              code: true,
              score: true,
            },
            orderBy: {
              score: "desc",
            },
          },
          module: {
            select: {
              id: true,
              code: true,
              description: true,
              department: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return dayActivities;
    }),

  getIdExternal: publicProcedure
    .meta({ openapi: { method: "POST", path: "/activity/id-external" } })
    .input(
      z.object({
        time: z.string(),
        activity: z.string(),
        lecturer: z.string(),
        space: z.string(),
      }),
    )
    .output(z.object({ ok: z.boolean(), activityId: z.string().nullable() }))
    .query(async ({ ctx, input }) => {
      const currentActivity = await getActivityFromExternalInput(input);

      if (currentActivity) {
        return {
          ok: true,
          activityId: currentActivity.id,
        };
      }

      return {
        ok: false,
        activityId: null,
      };
    }),
});

function extractGroupNumber(reference: string): number | null {
  let groupNum: number | null = null;

  if (reference.includes(" Grp ")) {
    const splitReference = reference.split(" ");

    groupNum =
      Number(splitReference[splitReference.indexOf("Grp") + 1]) ?? null;

    groupNum = groupNum > 0 ? groupNum : null;
  }

  return groupNum;
}

async function getActivityFromExternalInput(input: {
  activity: string;
  space: string;
}) {
  const now = new Date();

  const currentActivity = await db.activity.findFirst({
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

  return currentActivity;
}
