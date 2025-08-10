/* eslint-disable */
//@ts-nocheck

import z from 'zod';

export function deepNullable<T extends z.ZodTypeAny>(schema: T): T | null {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const newShape = Object.keys(shape).reduce(
      (acc, key) => {
        acc[key] = deepNullable(shape[key]);
        return acc;
      },
      {} as Record<string, z.ZodTypeAny>
    );
    return z.object(newShape).nullable() as T | null;
  }
  if (schema instanceof z.ZodArray) {
    return deepNullable(schema.element).array().nullable() as T | null;
  }
  return schema.nullable() as T | null;
}
