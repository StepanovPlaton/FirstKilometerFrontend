import HTTPService from '@/shared/utils/http';
import type { Choice } from '@/shared/utils/schemes';
import { choiceSchema, softArrayOf } from '@/shared/utils/schemes';
import type { GetRequestOptions } from '@/shared/utils/services';
import { EmptyService } from '@/shared/utils/services';

export class ICompanyService extends EmptyService {
  urlPrefix: string;

  constructor(urlPrefix: string) {
    super();
    this.urlPrefix = urlPrefix;
  }

  getChoices = (options?: GetRequestOptions): Promise<Choice[]> => {
    return HTTPService.get(`${this.urlPrefix}/choices/`, softArrayOf(choiceSchema), options);
  };
}

export const CompanyService = new ICompanyService('companies');
