import { z } from 'zod';

import { entitySchema } from '@/shared/utils/schemes';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const toDayjsDate = (d?: string | null) => (d ? dayjs(d) : null);
const toUpperCase = (s?: string | null) => (s ? s.toUpperCase() : null);

export const rawUserSchema = entitySchema.extend({
  first_name: z.string({ error: 'Имя должно быть строкой' }),
  last_name: z.string({ error: 'Фамилия должно быть строкой' }),
  middle_name: z.string({ error: 'Отчество должно быть строкой' }),

  sex: z.literal(['М', 'Ж'], { error: 'Допустимые значения пола: М или Ж' }),
  birth_date: z.iso.date({ error: 'Некорректная дата рождения' }),
  birth_place: z.string({ error: 'Место рождения должно быть строкой' }),

  issue_organization: z.string({ error: 'Организация выдавшая паспорт задаётся строкой' }),
  issue_organization_code: z.string({ error: 'Код подразделения должен быть строкой' }),
  issue_date: z.iso.date({ error: 'Некорректная дата выдачи' }),

  registration_date: z.iso.date({ error: 'Некорректная дата регистрации' }),
  registration_region: z.string({ error: 'Регион регистрации должен быть строкой' }),
  registration_district: z.string({ error: 'Район регистрации должен быть строкой' }),
  registration_settlement: z.string({ error: 'Название населённого пункта должно быть строкой' }),
  registration_area: z.string({ error: 'Название участка должно быть строкой' }),
  registration_street: z.string({ error: 'Название улицы должно быть строкой' }),
  registration_address: z.string({ error: 'Название улицы должно быть строкой' }),
  licence_number: z.string({ error: 'Номер паспорта должен быть строкой' }),
});
export type User = z.TypeOf<typeof rawUserSchema>;

export const apiUserSchema = entitySchema.extend({
  first_name: rawUserSchema.shape.first_name.nullable().transform(toUpperCase),
  last_name: rawUserSchema.shape.last_name.nullable().transform(toUpperCase),
  middle_name: rawUserSchema.shape.middle_name.nullable().transform(toUpperCase),

  sex: rawUserSchema.shape.sex.nullable(),
  birth_date: rawUserSchema.shape.birth_date.nullable().transform(toDayjsDate),
  birth_place: rawUserSchema.shape.birth_place.nullable().transform(toUpperCase),

  issue_organization: rawUserSchema.shape.issue_organization.nullable().transform(toUpperCase),
  issue_organization_code: rawUserSchema.shape.issue_organization_code.nullable(),
  issue_date: rawUserSchema.shape.issue_date.nullable().transform(toDayjsDate),

  registration_date: rawUserSchema.shape.registration_date.nullable().transform(toDayjsDate),
  registration_region: rawUserSchema.shape.registration_region.nullable(),
  registration_district: rawUserSchema.shape.registration_district.nullable(),
  registration_settlement: rawUserSchema.shape.registration_settlement.nullable(),
  registration_area: rawUserSchema.shape.registration_area.nullable(),
  registration_street: rawUserSchema.shape.registration_street.nullable(),
  registration_address: rawUserSchema.shape.registration_address.nullable(),

  licence_number: rawUserSchema.shape.licence_number.nullable(),

  passport_url: z.url(),
  reg_url: z.url(),
});
export type ApiUser = z.TypeOf<typeof apiUserSchema>;

export const formUserSchema = entitySchema.extend({
  first_name: rawUserSchema.shape.first_name
    .min(2, { error: 'Имя слишком короткое' })
    .max(150, { error: 'Имя слишком длинное' })
    .transform(toUpperCase),
  last_name: rawUserSchema.shape.last_name
    .min(2, { error: 'Фамилия слишком короткая' })
    .max(150, { error: 'Фамилия слишком длинная' })
    .transform(toUpperCase),
  middle_name: rawUserSchema.shape.middle_name
    .min(2, { error: 'Отчество слишком короткое' })
    .max(150, { error: 'Отчество слишком длинное' })
    .or(z.literal(''))
    .nullable()
    .transform(toUpperCase),

  sex: rawUserSchema.shape.sex,
  birth_date: z
    .any()
    .refine((o) => dayjs.isDayjs(o))
    .transform((d) => (d as never as Dayjs)?.format('YYYY-MM-DD')),
  birth_place: rawUserSchema.shape.birth_place
    .min(3, { error: 'Место рождения слишком короткое' })
    .max(255, { error: 'Место рождения слишком длинное' })
    .transform(toUpperCase),

  issue_organization: rawUserSchema.shape.issue_organization
    .min(3, { error: 'Слишком короткое название организации' })
    .max(255, { error: 'Название организации слишком длинное' })
    .transform(toUpperCase),
  issue_organization_code: rawUserSchema.shape.issue_organization_code.regex(
    /^[0-9]{3}-[0-9]{3}$/,
    { error: 'Код подразделения должен иметь формат ###-###' }
  ),
  issue_date: z
    .any()
    .refine((o) => dayjs.isDayjs(o))
    .transform((d) => (d as never as Dayjs)?.format('YYYY-MM-DD')),

  registration_date: z
    .any()
    .refine((o) => dayjs.isDayjs(o))
    .transform((d) => (d as never as Dayjs)?.format('YYYY-MM-DD')),
  registration_region: rawUserSchema.shape.registration_region
    .min(3, {
      error: 'Слишком короткое название региона регистрации',
    })
    .max(100, { error: 'Слишком длинное название региона регистрации' })
    .transform(toUpperCase),
  registration_district: rawUserSchema.shape.registration_district
    .min(3, { error: 'Слишком короткое название района' })
    .max(100, { error: 'Слишком длинное название района' })
    .or(z.literal(''))
    .nullable()
    .transform(toUpperCase),
  registration_settlement: rawUserSchema.shape.registration_settlement
    .min(3, {
      error: 'Слишком короткое название населённого пункта',
    })
    .max(100, { error: 'Слишком длинное название населённого пункта' })
    .transform(toUpperCase),
  registration_area: rawUserSchema.shape.registration_area
    .min(1, { error: 'Слишком короткое название участка' })
    .max(50, { error: 'Слишком длинное название участка' })
    .or(z.literal(''))
    .nullable()
    .transform(toUpperCase),
  registration_street: rawUserSchema.shape.registration_street
    .min(3, {
      error: 'Слишком короткое название улицы',
    })
    .max(100, { error: 'Слишком длинное название улицы' })
    .transform(toUpperCase),
  registration_address: rawUserSchema.shape.registration_address
    .min(3, {
      error: 'Слишком короткий адрес',
    })
    .max(100, { error: 'Слишком длинный адрес' }),

  licence_number: rawUserSchema.shape.licence_number
    .min(10, { error: 'Слишком короткий номер паспорта' })
    .max(12, { error: 'Слишком длинный номер паспорта' })
    .regex(/^[0-9]{2}\s[0-9]{2}\s[0-9]{6}$/, {
      error: 'Серия и номер паспорта должны иметь формат "## ## ######"',
    }),
});
export type FormUser = z.TypeOf<typeof formUserSchema>;
