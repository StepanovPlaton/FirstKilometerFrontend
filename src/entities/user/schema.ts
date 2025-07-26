import dayjs from 'dayjs';
import { z } from 'zod';

import { entitySchema } from '@/shared/utils/schemes';

export const userSchema = entitySchema
  .extend({
    date: z.iso
      .date()
      .nullable()
      .transform((d) => (d ? dayjs(d) : null)),
    region: z.string().min(3).nullable(),
    district: z.string().min(3).nullable(),
    settlement: z.string().min(3).nullable(),
    area: z.string().min(1).nullable(),
    street: z.string().min(1).nullable(),
    house: z.string().min(1).nullable(),
    Issue_organization_ru: z
      .string()
      .min(3)
      .nullable()
      .transform((s) => (s ? s.toUpperCase() : null)),
    Licence_number: z.string().min(3).nullable(),
    Issue_date: z.iso
      .date()
      .nullable()
      .transform((d) => (d ? dayjs(d) : null)),
    Issue_organisation_code: z.string().min(3).nullable(),
    Last_name_ru: z
      .string()
      .min(3)
      .nullable()
      .transform((s) => (s ? s.toUpperCase() : null)),
    First_name_ru: z
      .string()
      .min(3)
      .nullable()
      .transform((s) => (s ? s.toUpperCase() : null)),
    Middle_name_ru: z
      .string()
      .min(3)
      .nullable()
      .transform((s) => (s ? s.toUpperCase() : null)),
    Sex_ru: z.literal(['М', 'Ж']).nullable(),
    Birth_date: z.iso.date().transform((d) => (d ? dayjs(d) : null)),
    Birth_place_ru: z
      .string()
      .min(3)
      .nullable()
      .transform((s) => (s ? s.toUpperCase() : null)),
  })
  .transform((user) => ({
    id: user.id,
    registration: {
      date: user.date,
      region: user.region,
      district: user.district,
      settlement: user.settlement,
      area: user.area,
      street: user.street,
      house: user.house,
    },
    issue: {
      organization: user.Issue_organization_ru,
      number: user.Licence_number,
      date: user.Issue_date,
      organization_code: user.Issue_organisation_code,
    },
    name: {
      last: user.Last_name_ru,
      first: user.First_name_ru,
      middle: user.Middle_name_ru,
    },
    birth: {
      date: user.Birth_date,
      place: user.Birth_place_ru,
    },
    sex: user.Sex_ru,
  }));

export type User = z.TypeOf<typeof userSchema>;
