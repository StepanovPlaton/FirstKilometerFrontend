import { CRUDCService } from '@/shared/utils/services';
import type { Procedure } from './schema';
import { procedureSchema } from './schema';

export class IProcedureService extends CRUDCService<Procedure> {}

export const ProcedureService = new IProcedureService('procedures/procedures', procedureSchema);
