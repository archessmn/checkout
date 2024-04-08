import type { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import moment from "moment";
import { activitySchema } from "../schemas/activity";
import type { ModuleGroup } from "@prisma/client";
import { db } from "@/server/db";

export const activityRouter = createTRPCRouter({
  getCode: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/activity/{activityId}/highest-code",
        tags: ["activities", "codes"],
      },
    })
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
          score: code.score,
          code: code.code,
        };
      }

      return {
        ok: false,
        score: -1,
        code: null,
      };
    }),

  getAllCodes: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/activity/{activityId}/codes",
        tags: ["activities", "codes"],
      },
    })
    .input(activitySchema.getAllCodes.input)
    .output(activitySchema.getAllCodes.output)
    .query(async ({ ctx, input }) => {
      const codes = await ctx.db.checkinCode.findMany({
        orderBy: {
          score: "desc",
        },
        where: {
          activityId: input.activityId,
        },
        select: {
          code: true,
          score: true,
        },
      });

      return {
        ok: true,
        codes,
      };
    }),

  getId: publicProcedure
    .meta({
      openapi: { method: "POST", path: "/activity/id", tags: ["activities"] },
    })
    .input(activitySchema.getId.input)
    .output(activitySchema.getId.output)
    .query(async ({ input }) => {
      const currentActivity = await getInternalActivityFromInput(input);

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

        const groupNumber = extractGroupNumber(activity.activityReference);

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
        tags: ["activities"],
      },
    })
    .input(activitySchema.getDayActivities.input)
    .output(activitySchema.getDayActivities.filteredOutput)
    .query(async ({ ctx, input }) => {
      const date = moment(input.date).startOf("day").toDate();
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

      const finalActivities = await Promise.all(
        dayActivities.map(async (activity) => {
          const codes = await getAllInternalCodes(activity.id);
          return { ...activity, checkinCodes: codes };
        }),
      );

      return finalActivities;
    }),

  getIdExternal: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/activity/id-external",
        tags: ["activities"],
        deprecated: true,
      },
    })
    .input(activitySchema.getIdExternal.input)
    .output(activitySchema.getIdExternal.output)
    .query(async ({ input }) => {
      const currentActivity = await getInternalActivityFromInput(input);

      return {
        ok: currentActivity ? true : false,
        activityId: currentActivity ? currentActivity.id : null,
      };
    }),

  externalActivityFlow: publicProcedure
    .meta({
      openapi: {
        path: "/activity/ext/id",
        method: "POST",
        tags: ["activities"],
      },
    })
    .input(activitySchema.externalActivityFlow.input)
    .output(activitySchema.externalActivityFlow.output)
    .mutation(async ({ input, ctx }) => {
      const exisitingExternal = await getExternalActivityFromInput(input);

      if (exisitingExternal) {
        return {
          externalId: exisitingExternal.id,
        };
      }

      const existingInternal = await getInternalActivityFromInput(input);

      let date = moment(input.date).startOf("day");

      if (date.year() === 2001) date.year(moment().year());

      const newExternal = await ctx.db.externalActivity.create({
        data: {
          activity: input.activity,
          lecturer: input.lecturer,
          space: input.space,
          time: input.time,
          date: date.toDate(),

          internalActivity: existingInternal
            ? { connect: { id: existingInternal?.id } }
            : undefined,
        },
      });

      return {
        externalId: newExternal.id,
      };
    }),

  externalAllCodes: publicProcedure
    .meta({
      openapi: {
        path: "/activity/ext/{externalId}/all-codes",
        method: "GET",
        tags: ["codes"],
        description: "Returns codes from all 3 backends.",
      },
    })
    .input(activitySchema.externalCodes.input)
    .output(activitySchema.externalCodes.output)
    .query(async ({ input }) => {
      const externalActivity = await getExternalActivity(input.externalId);

      if (!externalActivity) {
        return {
          ok: false,
          codes: [],
        };
      }

      // Fetch all codes from internal activity if it has been linked
      let finalCodes: z.infer<typeof activitySchema.util.codeType>[];

      if (externalActivity.internalActivityId) {
        finalCodes = await getAllInternalCodes(
          externalActivity.internalActivityId,
          input.externalId,
        );
      } else {
        finalCodes = externalActivity.checkinCodes;
      }

      // Logic for fetching ACI and Reject Codes pls

      const rejectCodes = await getRejectCodes(externalActivity);

      rejectCodes.map((rc) => {
        const exisitingCode = finalCodes.find((code) => code.code == rc.code);

        if (exisitingCode) {
          finalCodes[finalCodes.indexOf(exisitingCode)]!.score += rc.score;
        } else {
          finalCodes.push(rc);
        }
      });

      const aciCodes = await getAciCodes(externalActivity);

      aciCodes.map((rc) => {
        const exisitingCode = finalCodes.find((code) => code.code == rc.code);

        if (exisitingCode) {
          finalCodes[finalCodes.indexOf(exisitingCode)]!.score += rc.score;
        } else {
          finalCodes.push(rc);
        }
      });

      finalCodes = finalCodes.sort((one, two) => {
        return one.score < two.score ? 1 : -1;
      });

      return { ok: true, codes: finalCodes };
    }),

  externalCodes: publicProcedure
    .meta({
      openapi: {
        path: "/activity/ext/{externalId}/codes",
        method: "GET",
        tags: ["codes"],
        description: "Returns codes from just this backend.",
      },
    })
    .input(activitySchema.externalCodes.input)
    .output(activitySchema.externalCodes.output)
    .query(async ({ input }) => {
      const externalActivity = await getExternalActivity(input.externalId);

      if (!externalActivity) {
        return {
          ok: false,
          codes: [],
        };
      }

      let finalCodes: z.infer<typeof activitySchema.util.codeType>[];

      if (externalActivity.internalActivityId) {
        finalCodes = await getAllInternalCodes(
          externalActivity.internalActivityId,
          input.externalId,
        );
      } else {
        finalCodes = externalActivity.checkinCodes;
      }

      finalCodes = finalCodes.sort((one, two) => {
        return one.score < two.score ? 1 : -1;
      });

      return { ok: true, codes: finalCodes };
    }),
});

// Utility functions below

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

export async function getInternalActivityFromInput(input: {
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

async function getExternalActivityFromInput(
  input: z.infer<typeof activitySchema.externalActivityFlow.input>,
) {
  const externalDate = moment(input.date).startOf("day").toDate();

  const exisitingExternal = await db.externalActivity.findFirst({
    where: {
      activity: input.activity,
      space: input.space,
      time: input.time,
      date: externalDate,
    },
  });

  return exisitingExternal;
}

async function getAllInternalCodes(internalId: string, externalId?: string) {
  const internalActivity = await db.activity.findFirst({
    where: {
      id: internalId,
    },
    select: {
      checkinCodes: {
        select: {
          code: true,
          score: true,
        },
      },
      externalActivities: {
        where: {
          id: {
            not: {
              equals: externalId,
            },
          },
          internalActivityId: {
            not: {
              equals: !externalId ? internalId : undefined,
            },
          },
        },
        select: {
          checkinCodes: {
            select: {
              code: true,
              score: true,
            },
          },
        },
      },
    },
  });

  if (!internalActivity) {
    return [];
  }

  let finalCodes: z.infer<typeof activitySchema.util.codeType>[] = [];

  internalActivity?.checkinCodes.map((intCode) => {
    const exisitingCode = finalCodes.find((code) => intCode.code === code.code);

    if (exisitingCode) {
      finalCodes[finalCodes.indexOf(exisitingCode)]!.score += intCode.score;
    } else {
      finalCodes.push(intCode);
    }
  });

  internalActivity.externalActivities.map((activity) => {
    activity.checkinCodes.map((code) => {
      console.log(finalCodes);
      const exisitingCode = finalCodes.find(
        (ffsCode) => ffsCode.code === code.code,
      );

      if (exisitingCode) {
        finalCodes[finalCodes.indexOf(exisitingCode)]!.score += code.score;
      } else {
        finalCodes.push(code);
      }
    });
  });

  finalCodes = finalCodes.sort((one, two) => {
    return one.score < two.score ? 1 : -1;
  });

  return finalCodes;
}

async function getExternalActivity(externalId: string) {
  return db.externalActivity.findFirst({
    where: {
      id: externalId,
    },
    select: {
      activity: true,
      lecturer: true,
      space: true,
      time: true,
      date: true,
      internalActivityId: true,
      checkinCodes: {
        select: {
          code: true,
          score: true,
        },
      },
    },
  });
}

async function getRejectCodes(
  externalActivity: z.infer<typeof activitySchema.externalCodes.activitySearch>,
) {
  const rejectResponse = await fetch(
    "https://rejectdopamine.com/api/app/active/yrk/cs/1",
  );

  let rejectJson;

  try {
    rejectJson = await rejectResponse.json();
  } catch (e) {
    return [];
  }

  const rejectResponseSafe =
    activitySchema.rejectResponses.appActive.safeParse(rejectJson);

  if (!rejectResponseSafe.success) {
    return [];
  }

  const finalCodes: z.infer<typeof activitySchema.util.codeType>[] = [];

  if (rejectResponseSafe.data.sessionCount > 0) {
    // Get the wanted activity from rejectdopamines active sessions
    const rejectActivity = rejectResponseSafe.data.sessions.find(
      (activity) =>
        (activity.description.includes(externalActivity.activity) ||
          externalActivity.space.includes(activity.location)) &&
        externalActivity.time == `${activity.startTime} - ${activity.endTime}`,
    );

    // console.log(rejectActivity);

    if (!rejectActivity) {
      return finalCodes;
    }

    rejectActivity.codes.map((code) => {
      finalCodes.push({ code: `${code.checkinCode}`, score: code.count });
    });
  }

  return finalCodes;
}

async function getAciCodes(
  externalActivity: z.infer<typeof activitySchema.externalCodes.activitySearch>,
) {
  const aciResponse = await fetch("https://aci-api.ashhhleyyy.dev/api/codes", {
    headers: {
      "User-Agent": "Checkout Backend :3",
    },
  });

  let aciJson;

  try {
    aciJson = await aciResponse.json();
  } catch (e) {
    return [];
  }

  const aciResponseSafe = activitySchema.aciResponses.codes.safeParse(aciJson);

  if (!aciResponseSafe.success) {
    return [];
  }

  let finalCodes: z.infer<typeof activitySchema.util.codeType>[] = [];

  const aciActivity = aciResponseSafe.data.activities.find(
    (activity) =>
      (activity.activity == externalActivity.activity ||
        activity.space == externalActivity.space) &&
      activity.time == externalActivity.time,
  );

  if (aciActivity) {
    finalCodes = finalCodes.concat(aciActivity.codes);
  }

  return finalCodes;
}
