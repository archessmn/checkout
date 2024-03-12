import { db } from "@/server/db";
import { ModuleView } from "./module-view";

export default function ModulePage({
  params,
}: {
  params: { moduleId?: string };
}) {
  const moduleBeans = db.module.findFirstOrThrow({
    where: { id: params.moduleId },
    select: {
      id: true,
      code: true,
      description: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      groups: {
        select: {
          id: true,
          groupNumber: true,
        },
        orderBy: {
          groupNumber: "asc",
        },
      },
    },
  });

  // const groups = db.moduleGroup.findMany({
  //   where: {
  //     moduleId: params.moduleId,
  //   },
  //   orderBy: {
  //     groupNumber: "asc",
  //   },
  // });

  return <ModuleView modulePromise={moduleBeans} />;
}
