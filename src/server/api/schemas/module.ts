import { z } from "zod";

const db = {
  findOne: z.object({
    id: z.string(),
    code: z.string(),
    description: z.string().nullable(),
    departmentId: z.string(),
    createdById: z.string(),
  }),
  withGroups: z.object({
    id: z.string(),
    code: z.string(),
    description: z.string().nullable(),
    department: z
      .object({
        id: z.string(),
        name: z.string(),
      })
      .nullable(),
    groups: z.array(
      z.object({
        id: z.string(),
        groupNumber: z.number(),
      }),
    ),
  }),
};

export const moduleSchema = { db };
