import { CRUDCService } from '@/shared/utils/services';
import type { ApiIndividual } from './schema';
import { apiIndividualSchema } from './schema';

export class IIndividualService extends CRUDCService<ApiIndividual> {}

export const IndividualService = new IIndividualService('persons', apiIndividualSchema);
