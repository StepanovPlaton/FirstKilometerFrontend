import { z } from 'zod';

import { type Entity, entitySchema } from '../entity';
import { softArrayOf } from '../softArray';

// TODO: Edit

const pageInfoSchema = z.object({
  count: z.number().nonnegative(),
  next: z.url().nullable(),
  previous: z.url().nullable(),
});

export const pageSchema = pageInfoSchema.extend({
  count: z.number().nonnegative(),
  next: z.url().nullable(),
  previous: z.url().nullable(),
  results: softArrayOf(entitySchema),
});

export type Page = z.infer<typeof pageSchema>;

export const schemaPageOf = <T extends z.ZodType>(schema: T) =>
  pageInfoSchema.extend({
    results: softArrayOf(schema),
  });

export const schemaStrictPageOf = <T extends z.ZodType>(schema: T) =>
  pageInfoSchema.extend({
    results: z.array(schema),
  });

export interface PageOf<E extends Entity> {
  count: number;
  next: string | null;
  previous: string | null;
  results: E[];
}
