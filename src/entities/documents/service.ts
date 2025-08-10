import HTTPService from '@/shared/utils/http';
import type { Choice } from '@/shared/utils/schemes';
import { choiceSchema, softArrayOf } from '@/shared/utils/schemes';
import type { GetRequestOptions, RequestOptions } from '@/shared/utils/services';
import { EmptyService } from '@/shared/utils/services';
import type z from 'zod';
import { getDocumentSchema } from './schema';

export class IDocumentsService<T> extends EmptyService {
  urlPrefix: string;
  getDocumentSchema: z.ZodType<T>;

  constructor(urlPrefix: string, getDocumentSchema: z.ZodType<T>) {
    super();
    this.urlPrefix = urlPrefix;
    this.getDocumentSchema = getDocumentSchema;
  }

  getTypes = (options?: GetRequestOptions): Promise<Choice[]> => {
    return HTTPService.get(`${this.urlPrefix}/types/`, softArrayOf(choiceSchema), options);
  };

  getDocument = (data: object, options?: RequestOptions): Promise<T> => {
    return HTTPService.post(`${this.urlPrefix}/generate/`, this.getDocumentSchema, {
      body: data,
      ...options,
    });
  };
}

export const DocumentService = new IDocumentsService('documents', getDocumentSchema);
