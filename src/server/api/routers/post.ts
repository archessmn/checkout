import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .meta({ openapi: { method: "GET", path: "/test" } })
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

  getMessage: protectedProcedure
    .meta({
      /* 👉 */ openapi: { method: "GET", path: "/test2" },
    })
    .input(z.void())
    .output(z.any())
    .query(() => {
      const dayActivities = [
        {
          id: "clsw2s0cg000lah2v32ysr8lh",
          description: "Practical Grp 2 - COM00016C-A",
          startDateTime: "2024-02-20T09:30:00.000Z",
          endDateTime: "2024-02-20T10:30:00.000Z",
          type: "Practical",
          reference: "Practical Grp 2",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2re610008ga92ndijawdp", code: "COM00016C" },
        },
        {
          id: "clsw2s0cl000mah2vkrxz6rwy",
          description: "Seminar Grp 3 - COM00016C-A",
          startDateTime: "2024-02-20T09:30:00.000Z",
          endDateTime: "2024-02-20T10:30:00.000Z",
          type: "Seminar",
          reference: "Seminar Grp 3",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2re610008ga92ndijawdp", code: "COM00016C" },
        },
        {
          id: "clsw2s0cq000nah2v5jwyogz0",
          description: "Practical Grp 3 - COM00016C-A",
          startDateTime: "2024-02-20T10:30:00.000Z",
          endDateTime: "2024-02-20T11:30:00.000Z",
          type: "Practical",
          reference: "Practical Grp 3",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2re610008ga92ndijawdp", code: "COM00016C" },
        },
        {
          id: "clsw2s0cu000oah2v70tw1tvq",
          description: "Seminar Grp 2 - COM00016C-A",
          startDateTime: "2024-02-20T10:30:00.000Z",
          endDateTime: "2024-02-20T11:30:00.000Z",
          type: "Seminar",
          reference: "Seminar Grp 2",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2re610008ga92ndijawdp", code: "COM00016C" },
        },
        {
          id: "clsw2s0cz000pah2v077cruhx",
          description: "Lecture 2 - COM00014C-A",
          startDateTime: "2024-02-20T11:30:00.000Z",
          endDateTime: "2024-02-20T12:30:00.000Z",
          type: "Lecture",
          reference: "Lecture 2",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2s09v0002ah2vflrfze7g", code: "COM00014C" },
        },
        {
          id: "clsw2s0d4000qah2v9xqs59r7",
          description: "Practical Grp 4 - COM00016C-A",
          startDateTime: "2024-02-20T12:30:00.000Z",
          endDateTime: "2024-02-20T13:30:00.000Z",
          type: "Practical",
          reference: "Practical Grp 4",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2re610008ga92ndijawdp", code: "COM00016C" },
        },
        {
          id: "clsw2s0d9000rah2vwttqkygd",
          description: "Seminar Grp 1 - COM00016C-A",
          startDateTime: "2024-02-20T12:30:00.000Z",
          endDateTime: "2024-02-20T13:30:00.000Z",
          type: "Seminar",
          reference: "Seminar Grp 1",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2re610008ga92ndijawdp", code: "COM00016C" },
        },
        {
          id: "clsw2s0df000sah2vhqztfl9h",
          description: "Lecture - COM00011C-A",
          startDateTime: "2024-02-20T13:30:00.000Z",
          endDateTime: "2024-02-20T14:30:00.000Z",
          type: "Lecture",
          reference: "Lecture",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2s0aa0005ah2vipj74rpn", code: "COM00011C" },
        },
        {
          id: "clsw2s0dn000tah2v783zbslz",
          description: "Practical Grp 1 - COM00016C-A",
          startDateTime: "2024-02-20T14:30:00.000Z",
          endDateTime: "2024-02-20T15:30:00.000Z",
          type: "Practical",
          reference: "Practical Grp 1",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2re610008ga92ndijawdp", code: "COM00016C" },
        },
        {
          id: "clsw2s0ds000uah2vc8ejksdc",
          description: "Seminar Grp 4 (wk 2) - COM00016C-A",
          startDateTime: "2024-02-20T14:30:00.000Z",
          endDateTime: "2024-02-20T15:30:00.000Z",
          type: "Seminar",
          reference: "Seminar Grp 4 (wk 2)",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2re610008ga92ndijawdp", code: "COM00016C" },
        },
        {
          id: "clsw2s0dx000vah2vqgbzj3jj",
          description: "Practical Grp 5 - COM00016C-A",
          startDateTime: "2024-02-20T15:30:00.000Z",
          endDateTime: "2024-02-20T16:30:00.000Z",
          type: "Practical",
          reference: "Practical Grp 5",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2re610008ga92ndijawdp", code: "COM00016C" },
        },
        {
          id: "clsw2s0e3000wah2v407qoztr",
          description: "Seminar Grp 6 (wk 2) - COM00016C-A",
          startDateTime: "2024-02-20T15:30:00.000Z",
          endDateTime: "2024-02-20T16:30:00.000Z",
          type: "Seminar",
          reference: "Seminar Grp 6 (wk 2)",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2re610008ga92ndijawdp", code: "COM00016C" },
        },
        {
          id: "clsw2s0e8000xah2vbjwoyjze",
          description: "Practical Grp 6 - COM00016C-A",
          startDateTime: "2024-02-20T16:30:00.000Z",
          endDateTime: "2024-02-20T17:30:00.000Z",
          type: "Practical",
          reference: "Practical Grp 6",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2re610008ga92ndijawdp", code: "COM00016C" },
        },
        {
          id: "clsw2s0ed000yah2v54qhjxm3",
          description: "Seminar Grp 5 (wk 2) - COM00016C-A",
          startDateTime: "2024-02-20T16:30:00.000Z",
          endDateTime: "2024-02-20T17:30:00.000Z",
          type: "Seminar",
          reference: "Seminar Grp 5 (wk 2)",
          weekName: { name: "Week 2, Semester 2" },
          module: { id: "clsw2re610008ga92ndijawdp", code: "COM00016C" },
        },
      ];

      const groupExtracted = dayActivities.map((activity) => {
        let hasGroupNum = false;
        let groupNum = -1;

        if (activity.reference.includes(" Grp ")) {
          hasGroupNum = true;
          const splitReference = activity.reference.split(" ");

          groupNum =
            Number(splitReference[splitReference.indexOf("Grp") + 1]) ?? -1;

          groupNum = groupNum > 0 ? groupNum : -1;
        }

        return {
          id: activity.id,
          reference: activity.reference,
          hasGroupNum,
          groupNum,
        };
      });

      return groupExtracted;
    }),
});
