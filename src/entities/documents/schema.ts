import z from 'zod';

export const getDocumentSchema = z.object({
  document_name: z.string(),
  document_url: z.url(),
});
export type Document = z.output<typeof getDocumentSchema>;
