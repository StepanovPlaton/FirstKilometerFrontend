import { baseCompanySchema } from '@/shared/utils/schemes/company';
import type z from 'zod';

export const externalCompanySchema = baseCompanySchema;
export type ExternalCompany = z.output<typeof externalCompanySchema>;
