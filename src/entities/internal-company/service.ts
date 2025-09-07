import { CRUDCService } from '@/shared/utils/services';
import { InternalCompany, internalCompanySchema } from './schema';

export class IInternalCompanyService extends CRUDCService<InternalCompany> {}

export const InternalCompanyService = new IInternalCompanyService(
  'companies/internal',
  internalCompanySchema
);
