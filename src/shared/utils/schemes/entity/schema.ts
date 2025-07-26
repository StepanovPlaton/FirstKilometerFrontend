import { z } from 'zod';

export const entitySchema = z.object({
  id: z.number().positive().optional(),
});

export type Entity = z.infer<typeof entitySchema>;
