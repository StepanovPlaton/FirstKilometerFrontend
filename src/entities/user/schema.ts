import type { z } from 'zod';

import { apiPersonSchema, formPersonSchema, rawPersonSchema } from '@/shared/utils/schemes/person';

export const rawUserSchema = rawPersonSchema;
export type User = z.TypeOf<typeof rawUserSchema>;

export const apiUserSchema = apiPersonSchema;
export type ApiUser = z.TypeOf<typeof apiUserSchema>;

export const formUserSchema = formPersonSchema;
export type FormUser = z.TypeOf<typeof formUserSchema>;
