import { z } from 'zod';

export const entitySchema = z.object({
  // id: z.number().positive().optional(),
  uuid: z.uuid(),
});

export type Entity = z.infer<typeof entitySchema>;

export const idEntitySchema = z.object({
  id: z.number().positive(),
});

export type IDEntity = z.infer<typeof idEntitySchema>;
