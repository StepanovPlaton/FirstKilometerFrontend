import { CRUDCService } from '@/shared/utils/services';
import type { ExternalCompany } from './schema';
import { externalCompanySchema } from './schema';

export class IExternalCompanyService extends CRUDCService<ExternalCompany> {}

export const ExternalCompanyService = new IExternalCompanyService(
  'companies/external',
  externalCompanySchema
);
