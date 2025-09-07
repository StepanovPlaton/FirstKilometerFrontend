import { baseCompanySchema } from '@/shared/utils/schemes/company';
import z from 'zod';

export const internalCompanySchema = baseCompanySchema;
export type InternalCompany = z.TypeOf<typeof internalCompanySchema>;
