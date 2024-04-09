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

const util = {
  filteredOutput: z.object({
    id: z.string(),
    description: z.string(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    type: z.string(),
    reference: z.string(),
    weekName: z
      .object({
        name: z.string(),
      })
      .nullable(),
    group: z
      .object({
        id: z.string(),
        groupNumber: z.number(),
      })
      .nullable(),
    checkinCodes: z.array(
      z.object({
        code: z.string(),
        score: z.number(),
      }),
    ),
    module: z
      .object({
        id: z.string(),
        code: z.string(),
        description: z.string().nullable(),
        department: z
          .object({
            name: z.string(),
          })
          .nullable(),
      })
      .nullable(),
  }),
  codeType: z.object({
    code: z.string(),
    score: z.number(),
  }),
  codeTypeId: z.object({
    id: z.string(),
    code: z.string(),
    score: z.number(),
  }),
};

const getCode = {
  input: z.object({
    activityId: z.string(),
  }),
  output: z.object({
    ok: z.boolean(),
    score: z.number(),
    code: z.string().nullable(),
  }),
};

const getAllCodes = {
  input: z.object({
    activityId: z.string(),
  }),
  output: z.object({
    ok: z.boolean(),
    codes: z.array(
      z.object({
        score: z.number(),
        code: z.string(),
      }),
    ),
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
  input: z.object({
    date: z.string(),
    groupId: z.string().optional(),
    moduleId: z.string().optional(),
  }),
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
  filteredOutput: z.array(util.filteredOutput),
};

const getIdExternal = {
  input: z.object({
    time: z.string(),
    activity: z.string(),
    lecturer: z.string(),
    space: z.string(),
  }),
  output: z.object({ ok: z.boolean(), activityId: z.string().nullable() }),
};

const externalActivityFlow = {
  input: z.object({
    activity: z.string(),
    lecturer: z.string().optional(),
    space: z.string(),
    time: z.string(),
    date: z.date(),
  }),
  output: z.object({
    externalId: z.string(),
  }),
};

const externalCodes = {
  input: z.object({
    externalId: z.string(),
  }),
  output: z.object({
    ok: z.boolean(),
    codes: z.array(
      z.object({
        score: z.number(),
        code: z.string(),
      }),
    ),
  }),
  activitySearch: z.object({
    date: z.date(),
    checkinCodes: z.array(
      z.object({
        code: z.string(),
        score: z.number(),
      }),
    ),
    activity: z.string(),
    lecturer: z.string().nullable(),
    space: z.string(),
    time: z.string(),
  }),
};

const rejectResponses = {
  appActive: z.object({
    sessionCount: z.number(),
    msg: z.string(),
    api: z.string(),
    userPerms: z.string(),
    sessions: z.array(
      z.object({
        startDate: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        description: z.string(),
        moduleName: z.string(),
        moduleCode: z.string(),
        rejectID: z.number(),
        location: z.string(),
        codesCount: z.number(),
        codes: z.array(
          z.object({
            groupCode: z.string(),
            checkinCode: z.number(),
            count: z.number(),
          }),
        ),
      }),
    ),
  }),
};

const aciResponses = {
  codes: z.object({
    activities: z.array(
      z.object({
        date: z.string(),
        time: z.string(),
        space: z.string(),
        activity: z.string(),
        codes: z.array(util.codeType),
      }),
    ),
  }),
};

const deleteFutureActivities = {
  input: z.undefined(),
  output: z.object({
    ok: z.boolean(),
    count: z.number(),
  }),
};

export const activitySchema = {
  util,
  getCode,
  getAllCodes,
  getId,
  postTimetableCsv,
  create,
  getDayActivities,
  getIdExternal,
  externalActivityFlow,
  externalCodes,
  rejectResponses,
  aciResponses,
  deleteFutureActivities,
};
