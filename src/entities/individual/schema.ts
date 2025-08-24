import { z } from 'zod';

import { entitySchema } from '@/shared/utils/schemes';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const toDayjsDate = (d?: string | null) => (d ? dayjs(d) : null);

export const rawIndividualSchema = entitySchema.extend({
  first_name: z.string({ error: 'Имя должно быть строкой' }),
  last_name: z.string({ error: 'Фамилия должно быть строкой' }),
  middle_name: z.string({ error: 'Отчество должно быть строкой' }),

  sex: z.literal(['М', 'Ж'], { error: 'Допустимые значения пола: М или Ж' }),
  birth_date: z.iso.date({ error: 'Некорректная дата рождения' }),
  birth_place: z.string({ error: 'Место рождения должно быть строкой' }),

  issue_organization: z.string({ error: 'Организация выдавшая паспорт задаётся строкой' }),
  issue_organization_code: z.string({ error: 'Код подразделения должен быть строкой' }),
  issue_date: z.iso.date({ error: 'Некорректная дата выдачи' }),

  licence_number: z.string({ error: 'Номер паспорта должен быть строкой' }),
});
export type Individual = z.TypeOf<typeof rawIndividualSchema>;

export const apiIndividualSchema = entitySchema.extend({
  first_name: rawIndividualSchema.shape.first_name.nullable(),
  last_name: rawIndividualSchema.shape.last_name.nullable(),
  middle_name: rawIndividualSchema.shape.middle_name.nullable(),

  sex: rawIndividualSchema.shape.sex.nullable(),
  birth_date: rawIndividualSchema.shape.birth_date.nullable().transform(toDayjsDate),
  birth_place: rawIndividualSchema.shape.birth_place.nullable(),

  issue_organization: rawIndividualSchema.shape.issue_organization.nullable(),
  issue_organization_code: rawIndividualSchema.shape.issue_organization_code.nullable(),
  issue_date: rawIndividualSchema.shape.issue_date.nullable().transform(toDayjsDate),

  licence_number: rawIndividualSchema.shape.licence_number.nullable(),

  passport_url: z.url(),
});
export type ApiIndividual = z.TypeOf<typeof apiIndividualSchema>;

export const formIndividualSchema = entitySchema.extend({
  first_name: rawIndividualSchema.shape.first_name
    .min(2, { error: 'Имя слишком короткое' })
    .max(150, { error: 'Имя слишком длинное' }),
  last_name: rawIndividualSchema.shape.last_name
    .min(2, { error: 'Фамилия слишком короткая' })
    .max(150, { error: 'Фамилия слишком длинная' }),
  middle_name: rawIndividualSchema.shape.middle_name
    .min(2, { error: 'Отчество слишком короткое' })
    .max(150, { error: 'Отчество слишком длинное' })
    .or(z.literal(''))
    .nullable(),
  sex: rawIndividualSchema.shape.sex,
  birth_date: z
    .any()
    .refine((o) => dayjs.isDayjs(o))
    .transform((d) => (d as never as Dayjs)?.format('YYYY-MM-DD')),
  birth_place: rawIndividualSchema.shape.birth_place
    .min(3, { error: 'Место рождения слишком короткое' })
    .max(255, { error: 'Место рождения слишком длинное' }),
  issue_organization: rawIndividualSchema.shape.issue_organization
    .min(3, { error: 'Слишком короткое название организации' })
    .max(255, { error: 'Название организации слишком длинное' }),
  issue_organization_code: rawIndividualSchema.shape.issue_organization_code.regex(
    /^[0-9]{3}-[0-9]{3}$/,
    { error: 'Код подразделения должен иметь формат ###-###' }
  ),
  issue_date: z
    .any()
    .refine((o) => dayjs.isDayjs(o))
    .transform((d) => (d as never as Dayjs)?.format('YYYY-MM-DD')),

  licence_number: rawIndividualSchema.shape.licence_number
    .min(10, { error: 'Слишком короткий номер паспорта' })
    .max(12, { error: 'Слишком длинный номер паспорта' })
    .regex(/^[0-9]{2}\s[0-9]{2}\s[0-9]{6}$/, {
      error: 'Серия и номер паспорта должны иметь формат "## ## ######"',
    }),
});
export type FormIndividual = z.TypeOf<typeof formIndividualSchema>;
