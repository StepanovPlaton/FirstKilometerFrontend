import { z } from 'zod';

export const choiceSchema = z.object({
  label: z.string(),
  value: z.string().or(z.number()),
});

export type Choice = z.infer<typeof choiceSchema>;
