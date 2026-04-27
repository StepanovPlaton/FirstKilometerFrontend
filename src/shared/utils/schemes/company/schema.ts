import { idEntitySchema } from '@/shared/utils/schemes/entity';
import { paymentAccountSchema } from '@/shared/utils/schemes/payment-account';
import { softArrayOf } from '@/shared/utils/schemes/softArray';
import z from 'zod';

const emptyToNull = (v: unknown) => (v === '' || v === undefined ? null : v);
const asUnknownArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

const phoneValueSchema = z
  .string()
  .regex(/^\+7\s?\([0-9]{3}\)\s?[0-9]{3}-[0-9]{2}-[0-9]{2}$/, {
    error: 'Номер телефона должен иметь формат "+7 (###) ###-##-##"',
  });

const emailValueSchema = z.string().trim().email({ error: 'Некорректный адрес электронной почты' });

/** Поля компании без id и вложенных счетов (общая часть API и формы). */
const companyFieldsSchema = z.object({
  name: z
    .string('Название юридического лица должно быть строкой')
    .min(3, { error: 'Слишком короткое название юридического лица' })
    .max(500, { error: 'Слишком длинное название юридического лица' }),
  short_name: z.preprocess(emptyToNull, z.union([z.null(), z.string().max(200)])),
  inn: z.coerce
    .string('ИНН должен быть числом')
    .min(9, { error: 'ИНН не может быть короче 10 цифр' })
    .max(15, { error: 'ИНН не может быть длиннее 15 цифр' }),
  kpp: z.preprocess(emptyToNull, z.union([z.null(), z.coerce.string().max(12)])),
  ogrn: z.coerce
    .string('ОРГН должен быть числом')
    .min(10, { error: 'ОГРН не может быть короче 10 цифр' })
    .max(15, { error: 'ОГРН не может быть длиннее 15 цифр' }),
  legal_address: z
    .string('Юридический адрес должен быть строкой')
    .min(3, { error: 'Слишком короткий юридический адрес' })
    .max(5000, { error: 'Слишком длинный юридический адрес' }),
  postal_address: z.preprocess(emptyToNull, z.union([z.null(), z.string().max(5000)])),
  phone: z.preprocess(emptyToNull, z.union([z.null(), phoneValueSchema])),
  email: z.preprocess((v) => (v === '' || v === undefined ? null : v), z.union([z.null(), emailValueSchema])),
  director_name: z.preprocess(emptyToNull, z.union([z.null(), z.string().min(1).max(255)])),
  director_position: z
    .string('Должность руководителя должна быть строкой')
    .min(1, { error: 'Укажите должность руководителя' })
    .max(100, { error: 'Слишком длинное значение должности' }),
  company_type: z.enum(['internal', 'external']),
});

/** Ответ API и тип после загрузки (вложенные счета). */
export const companyApiSchema = idEntitySchema.merge(companyFieldsSchema).extend({
  payment_accounts: z.preprocess(asUnknownArray, softArrayOf(paymentAccountSchema)),
});

export type CompanyApi = z.output<typeof companyApiSchema>;

/** Значения формы: привязка счетов по id (редактирование счетов — отдельный справочник). */
export const companyFormValuesSchema = companyFieldsSchema
  .omit({ company_type: true })
  .extend({
    id: z.number().positive().optional(),
    created_at: z.any().optional(),
    updated_at: z.any().optional(),
    company_type: z.enum(['internal', 'external']).optional(),
    payment_account_ids: z.preprocess(
      (v) =>
        Array.isArray(v)
          ? v.map((x) => (typeof x === 'number' ? x : Number(x))).filter((n) => Number.isInteger(n) && n > 0)
          : [],
      z.array(z.number().int().positive()).default([])
    ),
  });

export type CompanyFormValues = z.output<typeof companyFormValuesSchema>;

/** Тело запроса для создания/обновления компании (без read-only вложенного списка счетов). */
export const companyWritePayloadSchema = companyFieldsSchema
  .pick({
    name: true,
    short_name: true,
    inn: true,
    kpp: true,
    ogrn: true,
    legal_address: true,
    postal_address: true,
    phone: true,
    email: true,
    director_name: true,
    director_position: true,
    company_type: true,
  })
  .extend({
    payment_account_ids: z.array(z.number().int().positive()),
  });

export type CompanyWritePayload = z.infer<typeof companyWritePayloadSchema>;

export type CompanyCorePayload = Omit<CompanyWritePayload, 'payment_account_ids'>;

/** Нормализация полей формы в вид, пригодный для сериализатора (пустая строка -> null). */
export const normalizeCompanyFieldsForApi = (
  values: CompanyFormValues,
  companyType: 'internal' | 'external'
): CompanyCorePayload => ({
  name: values.name,
  short_name: values.short_name === '' || values.short_name === undefined ? null : values.short_name,
  inn: values.inn,
  kpp: values.kpp === '' || values.kpp === undefined ? null : values.kpp,
  ogrn: values.ogrn,
  legal_address: values.legal_address,
  postal_address:
    values.postal_address === '' || values.postal_address === undefined ? null : values.postal_address,
  phone: values.phone === '' || values.phone === undefined ? null : values.phone,
  email: values.email === '' || values.email === undefined ? null : values.email,
  director_name:
    values.director_name === '' || values.director_name === undefined ? null : values.director_name,
  director_position: values.director_position,
  company_type: values.company_type ?? companyType,
});

/** Обратная совместимость имён: прежний `baseCompanySchema` = модель API компании. */
export const baseCompanySchema = companyApiSchema;
export type BaseCompany = CompanyApi;
