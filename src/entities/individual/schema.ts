import type { z } from 'zod';

import { apiPersonSchema, formPersonSchema } from '@/shared/utils/schemes/person';

export const rawIndividualSchema = apiPersonSchema;
export type Individual = z.TypeOf<typeof rawIndividualSchema>;

export const apiIndividualSchema = apiPersonSchema;
export type ApiIndividual = z.TypeOf<typeof apiIndividualSchema>;

export const formIndividualSchema = formPersonSchema;
export type FormIndividual = z.TypeOf<typeof formIndividualSchema>;
