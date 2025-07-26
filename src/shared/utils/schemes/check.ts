import type { z } from 'zod';

export const isTypeOfSchema = <Z extends z.ZodType>(a: unknown, schema: Z): a is z.output<Z> =>
  schema.safeParse(a).success;
