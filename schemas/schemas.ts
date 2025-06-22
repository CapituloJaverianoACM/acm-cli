import { z, ZodTypeAny } from 'zod';

const activity = z.object({
        title: z.string(),
        description: z.string(), 
        eventType: z.string(), 
        link: z.string().optional(), 
        location: z.string().optional(), 
        duration: z.string(),
        speaker: z.string(), 
        timestamp: z.string()
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
  _id: z.coerce.number(),
  name: z.string(),
  career: z.string(),
  rol: z.string(),
  email: z.string().email(),
  bio: z.string(),
  skills: arrayFromString(z.string()),
  image: z.string().optional(),
  active: z.coerce.boolean()
});

export default {
    activity,
    members
}; 
