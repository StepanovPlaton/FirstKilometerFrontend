import { idEntitySchema } from '@/shared/utils/schemes/entity';
import z from 'zod';

export const companySchema = idEntitySchema.extend({
  name: z.string(),
  short_name: z.string(),
  inn: z.string(),
  ogrn: z.string(),
  legal_address: z.string(),
  postal_address: z.string(),
  phone: z.string(),
  email: z.string(),
  bank_account: z.string(),
  bank_name: z.string(),
  bik: z.string(),
  corr_account: z.string(),
  director_name: z.string(),
  director_position: z.string(),
});
export type Company = z.TypeOf<typeof companySchema>;
