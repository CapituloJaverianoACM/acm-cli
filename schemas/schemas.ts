import { z, ZodType } from "zod";

const arrayFromString = <T extends ZodType>(schema: T) => {
  return z.preprocess((obj: unknown) => {
    if (!obj) {
      return [];
    }
    if (Array.isArray(obj)) {
      return obj;
    }
    if (typeof obj === "string") {
      return obj.split(",").map((_) => _.trim());
    }

    return [];
  }, z.array(schema));
};

const activity = z.object({
  title: z
    .string()
    .describe("Activity title"),
  description: z
    .string()
    .describe("Activity description"),
  eventType: z.string().describe("Activity type"),
  link: z
    .string()
    .optional()
    .describe("(OPTIONAL) If necessary, add a relevant link."),
  location: z
    .string()
    .optional()
    .describe("Location where the activity will take place"),
  duration: z.string().describe("How long will the activity take"),
  speaker: z
    .string()
    .describe("Name of the speaker or person in charge of the activity?"),
  timestamp: z.iso
    .time()
    .describe("Time at which the activity will take place"),
  date: z.iso
    .date()
    .describe(
      "Date in YYYY-MM-DD format on which the activity will take place",
    ),
});

const members = z.object({
  _id: z.coerce.number().describe("Member identification number (C.C or T.I)"),
  name: z.string().describe("Member's full name"),
  title: z.string().describe("Degree studied or in progress"),
  role: z.string().describe("Group role"),
  email: z.email().describe("University email"),
  bio: z.string().describe("Brief member biography"),
  skills: arrayFromString(z.string()).describe(
    "Member's skills and areas of expertise. E.j: JavaScript, Python, Git, and GitHub",
  ),
  image: z
    .string()
    .optional()
    .describe(
      "Image in the format https://drive.google.com/uc?export=view&id=ID_DEL_ARCHIVO"),
  active: z
    .stringbool()
    .describe(
      "Whether you are an active member or were a past member of the chapter (true or false)"),
  linkedin: z
    .string()
    .optional()
    .describe("Member's LinkedIn link"),
  github: z
    .string()
    .optional()
    .describe("Member's GitHub link"),
  memberSince: z
    .string()
    .describe("Period of admission to the group. E.j: 2024-1"),
});

const constestLevelOptions = ["Initial", "Advanced"];

const contests = z.object({
  name: z.string().describe("Contest name"),
  date: z.iso.date().describe("Date of contest in YYYY-MM-DD format"),
  start_hour: z.iso
    .datetime()
    .describe(
      "Contest start time in yyyy-mm-ddThh:mmZ format (military time)"),
  final_hour: z.iso
    .datetime()
    .describe(
      "Final time of the contest in yyyy-mm-ddThh:mmZ format (military time)"),
  level: z
    .enum(constestLevelOptions)
    .describe(`Contest level (${constestLevelOptions.join(",")})`),
  classroom: z
    .string()
    .optional()
    .describe("University classroom where the contest will take place"),
});

const pictures = z.object({
  contest_id: z.coerce.number().describe("Contest ID"),
  link: z.string().describe("URL of the picture"),
});

export default {
  activity,
  members,
  contests,
  pictures
};
