/* eslint-disable */
//@ts-nocheck

import type { Rule } from 'antd/es/form';
import type { ZodType } from 'zod';
import z from 'zod';

export function getValidationRules<T extends ZodType>(
  schema: T,
  path: string,
  required: boolean = true
): Rule[] {
  const fieldSchema = getFieldSchema(schema, path);

  if (!fieldSchema) {
    return [];
  }

  const rules: Rule[] = [];

  // Проверка на обязательность поля
  if (
    !fieldSchema.safeParse(undefined).success &&
    !fieldSchema.safeParse(null).success &&
    required
  ) {
    rules.push({
      required: true,
      message: 'Это поле обязательно для заполнения',
    });
  }

  // Основное правило валидации через safeParse
  rules.push({
    validator: async (_, value) => {
      const result = await fieldSchema.safeParseAsync(value);
      if (!result.success) {
        // Берем первое сообщение об ошибке
        throw new Error(z.treeifyError(result.error).errors[0] || 'Неверное значение');
      }
    },
  });

  return rules;
}

function getFieldSchema(schema: z.ZodType, path: string): z.ZodType | null {
  const paths = path.split('.');
  let currentSchema = schema;

  for (const p of paths) {
    if (currentSchema instanceof z.ZodObject) {
      currentSchema = currentSchema.shape[p] as z.ZodType;
    } else if (currentSchema instanceof z.ZodPipe) {
      currentSchema = currentSchema.def.in.shape[p];
    } else {
      return null;
    }

    if (!currentSchema) {
      return null;
    }
  }

  return currentSchema;
}
