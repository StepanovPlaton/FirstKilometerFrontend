import { baseCompanySchema } from '@/shared/utils/schemes/company';
import type z from 'zod';

export const internalCompanySchema = baseCompanySchema;
export type InternalCompany = z.output<typeof internalCompanySchema>;
