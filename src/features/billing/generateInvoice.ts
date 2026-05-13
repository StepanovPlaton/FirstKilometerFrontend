import HTTPService from '@/shared/utils/http';
import { z } from 'zod';

/** Ответ POST billings/generate/ (авто — один XLSX, услуги — ZIP). */
export const billingGenerateResponseSchema = z.object({
  document_name: z.string().optional(),
  document_url: z.string().optional(),
  billing_uuid: z.string().optional(),
  billing_number: z.union([z.number(), z.string()]).optional(),
  billing_date: z.string().optional(),
  archive_name: z.string().optional(),
  archive_url: z.string().optional(),
  billing_count: z.number().optional(),
  billings: z
    .array(
      z.object({
        file_name: z.string(),
        file_url: z.string(),
      })
    )
    .optional(),
});

export type BillingGenerateResponse = z.infer<typeof billingGenerateResponseSchema>;

export function postGenerateBilling(body: Record<string, unknown>) {
  return HTTPService.post('billings/generate', billingGenerateResponseSchema, {
    body,
  });
}
