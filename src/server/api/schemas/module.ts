import { z } from "zod";

const db = {
  findOne: z.object({
    id: z.string(),
    code: z.string(),
    description: z.string().nullable(),
    departmentId: z.string(),
    createdById: z.string(),
  }),
};

export const moduleSchema = { db };
