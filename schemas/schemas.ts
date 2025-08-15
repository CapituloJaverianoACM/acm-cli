import { z, ZodTypeAny } from 'zod';

const activity = z.object({
  title: z.string().describe("The title of the activity to be carried out"),
  description: z.string().describe("Show the description of the activity"),
  eventType: z.string().describe("Activity type"),
  link: z.string().optional().describe("(OPTIONAL) If necessary, add a relevant link."),
  location: z.string().optional().describe("Location where the activity will take place"),
  duration: z.string().describe("How long will the activity take"),
  speaker: z.string().describe("Name of the speaker or person in charge of the activity"),
  timestamp: z.string().describe("Time at which the activity will take place")
}
);
const arrayFromString = <T extends ZodTypeAny>(schema: T) => {
  return z.preprocess((obj: unknown) => {
    if (!obj) {
      return [];
    }
    if (Array.isArray(obj)) {
      return obj;
    }
    if (typeof obj === 'string') {
      return obj.split(',').map(_ => _.trim());
    }

    return [];
  }, z.array(schema));
};

const members = z.object({
  _id: z.coerce.number().describe("Member identification number (C.C or T.I)"),
  name: z.string().describe("Member's full name"),
  title: z.string().describe("Degree completed or in progress"),
  role: z.string().describe("Current group role"),
  email: z.string().email().describe("University email"),
  bio: z.string().describe("Brief biography of the member"),
  skills: arrayFromString(z.string()).describe("Member's skills and areas of expertise. E.j: JavaScript, Python, Git, and GitHub"),
  image: z.string().optional().describe("Image with the format https://drive.google.com/uc?export=view&id=ID_DEL_ARCHIVO"),
  active: z.coerce.boolean().describe("Whether you are an active member or were a past member of the chapter (true or false)"),
  linkedin: z.string().optional().describe("Member's LinkedIn link"),
  github: z.string().optional().describe("Member's GitHub link"),
  memberSince: z.string().describe("Period of admission to the group. E.j: 2024-1"),
});

export default {
  activity,
  members
}; 
