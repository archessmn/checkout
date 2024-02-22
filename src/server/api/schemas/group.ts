import { z } from "zod";

const db = {
  findOne: z.object({
    id: z.string(),
    groupNumber: z.number(),
    moduleId: z.string(),
  }),
};

export const groupSchema = { db };
