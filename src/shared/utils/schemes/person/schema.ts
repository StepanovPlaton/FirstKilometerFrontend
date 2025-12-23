import { z } from 'zod';

import { entitySchema } from '@/shared/utils/schemes';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const toDayjsDate = (d?: string | null) => (d ? dayjs(d) : null);

export const rawPersonSchema = entitySchema.extend({
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
export type Person = z.output<typeof rawPersonSchema>;

export const apiPersonSchema = entitySchema.extend({
  first_name: rawPersonSchema.shape.first_name.nullable(),
  last_name: rawPersonSchema.shape.last_name.nullable(),
  middle_name: rawPersonSchema.shape.middle_name.nullable(),

  sex: rawPersonSchema.shape.sex.nullable(),
  birth_date: rawPersonSchema.shape.birth_date.nullable().transform(toDayjsDate),
  birth_place: rawPersonSchema.shape.birth_place.nullable(),

  issue_organization: rawPersonSchema.shape.issue_organization.nullable(),
  issue_organization_code: rawPersonSchema.shape.issue_organization_code.nullable(),
  issue_date: rawPersonSchema.shape.issue_date.nullable().transform(toDayjsDate),

  registration_date: rawPersonSchema.shape.registration_date.nullable().transform(toDayjsDate),
  registration_region: rawPersonSchema.shape.registration_region.nullable(),
  registration_district: rawPersonSchema.shape.registration_district.nullable(),
  registration_settlement: rawPersonSchema.shape.registration_settlement.nullable(),
  registration_area: rawPersonSchema.shape.registration_area.nullable(),
  registration_street: rawPersonSchema.shape.registration_street.nullable(),
  registration_address: rawPersonSchema.shape.registration_address.nullable(),

  licence_number: rawPersonSchema.shape.licence_number.nullable(),

  passport_url: z.url(),
  reg_url: z.url(),
});
export type ApiPerson = z.output<typeof apiPersonSchema>;

export const formPersonSchema = entitySchema.extend({
  first_name: rawPersonSchema.shape.first_name
    .min(2, { error: 'Имя слишком короткое' })
    .max(150, { error: 'Имя слишком длинное' }),
  last_name: rawPersonSchema.shape.last_name
    .min(2, { error: 'Фамилия слишком короткая' })
    .max(150, { error: 'Фамилия слишком длинная' }),
  middle_name: rawPersonSchema.shape.middle_name
    .min(2, { error: 'Отчество слишком короткое' })
    .max(150, { error: 'Отчество слишком длинное' })
    .or(z.literal(''))
    .nullable(),
  sex: rawPersonSchema.shape.sex,
  birth_date: z
    .any()
    .refine((o) => dayjs.isDayjs(o))
    .transform((d) => (d as never as Dayjs)?.format('YYYY-MM-DD')),
  birth_place: rawPersonSchema.shape.birth_place
    .min(3, { error: 'Место рождения слишком короткое' })
    .max(255, { error: 'Место рождения слишком длинное' }),
  issue_organization: rawPersonSchema.shape.issue_organization
    .min(3, { error: 'Слишком короткое название организации' })
    .max(255, { error: 'Название организации слишком длинное' }),
  issue_organization_code: rawPersonSchema.shape.issue_organization_code.regex(
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
  registration_region: rawPersonSchema.shape.registration_region
    .min(3, {
      error: 'Слишком короткое название региона регистрации',
    })
    .max(100, { error: 'Слишком длинное название региона регистрации' }),
  registration_district: rawPersonSchema.shape.registration_district
    .min(3, { error: 'Слишком короткое название района' })
    .max(100, { error: 'Слишком длинное название района' })
    .or(z.literal(''))
    .nullable(),
  registration_settlement: rawPersonSchema.shape.registration_settlement
    .min(3, {
      error: 'Слишком короткое название населённого пункта',
    })
    .max(100, { error: 'Слишком длинное название населённого пункта' }),
  registration_area: rawPersonSchema.shape.registration_area
    .min(1, { error: 'Слишком короткое название участка' })
    .max(50, { error: 'Слишком длинное название участка' })
    .or(z.literal(''))
    .nullable(),
  registration_street: rawPersonSchema.shape.registration_street
    .min(3, {
      error: 'Слишком короткое название улицы',
    })
    .max(100, { error: 'Слишком длинное название улицы' }),
  registration_address: rawPersonSchema.shape.registration_address
    .min(3, {
      error: 'Слишком короткий адрес',
    })
    .max(100, { error: 'Слишком длинный адрес' }),

  licence_number: rawPersonSchema.shape.licence_number
    .min(10, { error: 'Слишком короткий номер паспорта' })
    .max(12, { error: 'Слишком длинный номер паспорта' })
    .regex(/^[0-9]{2}\s[0-9]{2}\s[0-9]{6}$/, {
      error: 'Серия и номер паспорта должны иметь формат "## ## ######"',
    }),
});
export type FormPerson = z.output<typeof formPersonSchema>;
