import { CRUDCService } from '@/shared/utils/services';
import type { Company } from './schema';
import { companySchema } from './schema';

export class ICompanyService extends CRUDCService<Company> {}

export const CompanyService = new ICompanyService('companies', companySchema);
