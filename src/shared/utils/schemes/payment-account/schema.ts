import { idEntitySchema } from '@/shared/utils/schemes/entity';
import z from 'zod';

/** Банковские поля счёта (POST / строка формы с заполненными реквизитами). */
export const paymentAccountCoreSchema = z.object({
  bank_account: z.coerce
    .string('Номер расчётного счёта должен быть строкой')
    .trim()
    .regex(/^\d{20}$/, { error: 'Расчётный счёт должен содержать 20 цифр' }),
  bank_name: z
    .string('Название банка должно быть строкой')
    .trim()
    .min(1, { error: 'Укажите наименование банка' })
    .max(300, { error: 'Слишком длинное название банка' }),
  bik: z.coerce
    .string('БИК должен быть строкой')
    .trim()
    .regex(/^\d{9}$/, { error: 'БИК должен содержать 9 цифр' }),
  corr_account: z.coerce
    .string('Корреспондентский счёт должен быть строкой')
    .trim()
    .regex(/^\d{20}$/, { error: 'Корреспондентский счёт должен содержать 20 цифр' }),
});

export type PaymentAccountCore = z.output<typeof paymentAccountCoreSchema>;

export const paymentAccountSchema = idEntitySchema.extend({
  bank_account: paymentAccountCoreSchema.shape.bank_account,
  bank_name: paymentAccountCoreSchema.shape.bank_name,
  bik: paymentAccountCoreSchema.shape.bik,
  corr_account: paymentAccountCoreSchema.shape.corr_account,
});

export type PaymentAccount = z.output<typeof paymentAccountSchema>;

/** Строка формы: может быть без id (новый счёт). */
export const paymentAccountFormRowSchema = z
  .object({
    id: z.number().positive().optional(),
    created_at: z.any().optional(),
    updated_at: z.any().optional(),
    bank_account: z.coerce.string().trim().optional().default(''),
    bank_name: z.string().trim().optional().default(''),
    bik: z.coerce.string().trim().optional().default(''),
    corr_account: z.coerce.string().trim().optional().default(''),
  })
  .superRefine((row, ctx) => {
    const hasAny =
      (row.bank_account?.length ?? 0) > 0 ||
      (row.bank_name?.length ?? 0) > 0 ||
      (row.bik?.length ?? 0) > 0 ||
      (row.corr_account?.length ?? 0) > 0;
    if (!hasAny) {
      return;
    }
    const parsed = paymentAccountCoreSchema.safeParse({
      bank_account: row.bank_account,
      bank_name: row.bank_name,
      bik: row.bik,
      corr_account: row.corr_account,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue({
          code: 'custom',
          message: issue.message,
          path: issue.path,
        });
      }
    }
  });

export type PaymentAccountFormRow = z.output<typeof paymentAccountFormRowSchema>;

export const isPaymentAccountFormRowEmpty = (row: PaymentAccountFormRow): boolean =>
  !row.bank_account?.trim() &&
  !row.bank_name?.trim() &&
  !String(row.bik ?? '').trim() &&
  !row.corr_account?.trim();
