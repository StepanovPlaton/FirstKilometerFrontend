import { z } from 'zod';

export const softArrayOf = <T extends z.ZodType>(schema: T) => {
  type Type = z.TypeOf<typeof schema>;
  const isType = (a: unknown): a is Type => schema.safeParse(a).success;

  return z.array(z.any()).transform((a) => {
    const array: Type[] = [];
    a.forEach((e) => {
      if (isType(e)) {
        array.push(schema.parse(e));
      } else {
        // eslint-disable-next-line no-console
        console.warn(e, schema, schema.safeParse(e).error);
      }
    });
    return array;
  });
};
