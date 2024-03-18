import { db } from "@/server/db";
import { ActivityView } from "./activity-view";

export default function ActivityPage({
  params,
}: {
  params: { activityId: string };
}) {
  const event = db.activity.findFirstOrThrow({
    where: {
      id: params.activityId,
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

  return <ActivityView activityPromise={event} />;
}
