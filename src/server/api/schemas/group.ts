import { z } from "zod";

const db = {
  findOne: z.object({
    id: z.string(),
    groupNumber: z.number(),
  }),
};

export const groupSchema = { db };
