/* eslint-disable */
//@ts-nocheck
import z from 'zod';

import { faker } from '@faker-js/faker';

export const createMockData = <T extends z.ZodTypeAny>(schema: T): z.infer<T> => {
  // Для необязательных полей иногда возвращаем undefined
  if (schema instanceof z.ZodOptional) {
    return Math.random() > 0.05 ? createMockData(schema._def.innerType) : undefined;
  }

  // Для nullable полей иногда возвращаем null
  if (schema instanceof z.ZodNullable) {
    return Math.random() > 0.05 ? createMockData(schema._def.innerType) : null;
  }

  if (schema instanceof z.ZodString) {
    const checks = schema._def.checks || [];
    if (checks.some((check: any) => check.kind === 'email')) {
      return faker.internet.email() as any;
    }
    if (checks.some((check: any) => check.kind === 'uuid')) {
      return faker.string.uuid() as any;
    }
    if (checks.some((check: any) => check.kind === 'datetime')) {
      return faker.date.recent().toISOString() as any;
    }
    return faker.lorem.words(1) as any;
  }

  if (schema instanceof z.ZodNumber) {
    const checks = schema._def.checks || [];
    const min = checks.find((c: any) => c.kind === 'min')?.value ?? 0;
    const max = checks.find((c: any) => c.kind === 'max')?.value ?? 100;
    return faker.number.float({ min, max }) as any;
  }

  if (schema instanceof z.ZodBoolean) {
    return faker.datatype.boolean() as any;
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const result: Record<string, any> = {};
    for (const key in shape) {
      if (faker.datatype.boolean({ probability: 0.8 })) {
        result[key] = createMockData(shape[key]);
      }
    }
    return result as any;
  }

  if (schema instanceof z.ZodArray) {
    const length = faker.number.int({ min: 0, max: 5 });
    return Array.from({ length }, () => createMockData(schema.element)) as any;
  }

  if (schema instanceof z.ZodEnum) {
    const options = schema._def.values;
    return faker.helpers.arrayElement(options) as any;
  }

  if (schema instanceof z.ZodLiteral) {
    return schema._def.value as any;
  }

  if (schema instanceof z.ZodUnion) {
    const options = schema._def.options as z.ZodTypeAny[];
    return createMockData(faker.helpers.arrayElement(options));
  }

  if (schema instanceof z.ZodDate) {
    return faker.date.recent() as any;
  }

  return null as any;
};
