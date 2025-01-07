import { z } from 'zod';

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
export default {
    activity
}; 
