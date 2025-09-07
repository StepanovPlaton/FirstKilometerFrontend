import { baseCompanySchema } from '@/shared/utils/schemes/company';
import z from 'zod';

export const externalCompanySchema = baseCompanySchema;
export type ExternalCompany = z.TypeOf<typeof externalCompanySchema>;
