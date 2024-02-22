import { db } from "@/server/db";
import { ModuleList } from "./module-list";

export default function ModulesPage({
  searchParams,
}: {
  searchParams: { department?: string };
}) {
  let modules;

  if (searchParams.department) {
    modules = db.module.findMany({
      where: {
        departmentId: searchParams.department,
      },
    });
  } else {
    modules = db.module.findMany({});
  }

  return <ModuleList modulesPromise={modules} />;
}
