import { CRUDCService } from '@/shared/utils/services';
import { ExternalCompany, externalCompanySchema } from './schema';

export class IExternalCompanyService extends CRUDCService<ExternalCompany> {}

export const ExternalCompanyService = new IExternalCompanyService(
  'companies/external',
  externalCompanySchema
);
