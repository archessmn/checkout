import { z } from "zod";
import csv from "csvtojson";

const castYesNoToBool = z.preprocess((input) => {
  if (input === "Yes") {
    return true;
  }
  return false;
}, z.boolean());

const csvHeaders = [
  "description",
  "moduleCode",
  "startWeek",
  "startDay",
  "startDate",
  "startTime",
  "endDay",
  "endDate",
  "endTime",
  "duration",
  "type",
  "staff",
  "location",
  "students",
  "department",
  "size",
  "activityReference",
  "activityDetails",
  "description2",
  "draft",
  "moduleDescription",
  "numberStudents",
  "weeklyPattern",
  "onLocation",
  "online",
  "onlineDetails",
];

const getCode = {
  input: z.object({
    id: z.preprocess((value) => Number(value), z.number()),
    activity: z.string(),
    lecturer: z.string().optional(),
    space: z.string(),
    time: z.string(),
  }),
  output: z.object({
    id: z.number(),
    code: z.number(),
    activityId: z.string().nullable(),
  }),
};

const getId = {
  input: z.object({
    id: z.preprocess((value) => Number(value), z.number()),
    activity: z.string(),
    lecturer: z.string().optional(),
    space: z.string(),
    time: z.string(),
  }),
  output: z.object({
    id: z.number(),
    activityId: z.string().nullable(),
  }),
};

const parseCsvSchema = z.array(
  z.object({
    description: z.string(),
    moduleCode: z.string(),
    startWeek: z.string(),
    startDay: z.string(),
    startDate: z.string(),
    startTime: z.string(),
    endDay: z.string(),
    endDate: z.string(),
    endTime: z.string(),
    duration: z.string(),
    type: z.string(),
    staff: z.string(),
    location: z.string(),
    students: z.string(),
    department: z.string(),
    size: z.preprocess((input) => Number(input), z.number()),
    activityReference: z.string(),
    activityDetails: z.string(),
    description2: z.string(),
    draft: castYesNoToBool,
    moduleDescription: z.string(),
    numberStudents: z.preprocess((input) => Number(input), z.number()),
    weeklyPattern: z.string(),
    onLocation: castYesNoToBool,
    online: castYesNoToBool,
    onlineDetails: z.string(),
  }),
);

const postTimetableCsv = {
  input: z.object({
    filename: z.string(),
    file: z.preprocess(async (input) => {
      const text = await csv({
        headers: csvHeaders,
      }).fromString(input as string);

      return text as z.infer<typeof parseCsvSchema>;
    }, parseCsvSchema),
  }),
  output: z.object({
    success: z.boolean(),
    count: z.number(),
  }),
};

const create = {
  input: z.object({
    description: z.string(),
    startWeek: z.string(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    duration: z.string(),
    type: z.string(),
    staff: z.string().optional(),
    location: z.string(),
    size: z.number().optional(),
    reference: z.string(),
    details: z.string().optional(),
    moduleId: z.string().optional(),
    departmentId: z.string().optional(),
  }),
};

const getDayActivities = {
  input: z.object({ date: z.string() }),
  output: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      startWeek: z.string(),
      startDateTime: z.date(),
      endDateTime: z.date(),
      duration: z.string(),
      type: z.string(),
      staff: z.string().nullable(),
      location: z.string(),
      size: z.number().nullable(),
      reference: z.string(),
      details: z.string().nullable(),
      moduleId: z.string().optional(),
      departmentId: z.string().optional(),
    }),
  ),
};

export const activitySchema = {
  getCode,
  getId,
  postTimetableCsv,
  create,
  getDayActivities,
};
