import type { z } from 'zod';

import { apiPersonSchema, formPersonSchema, rawPersonSchema } from '@/shared/utils/schemes/person';

export const rawUserSchema = rawPersonSchema;
export type User = z.output<typeof rawUserSchema>;

export const apiUserSchema = apiPersonSchema;
export type ApiUser = z.output<typeof apiUserSchema>;

export const formUserSchema = formPersonSchema;
export type FormUser = z.output<typeof formUserSchema>;
