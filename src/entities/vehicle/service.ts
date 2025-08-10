import { CRUDCService } from '@/shared/utils/services';
import type { ApiVehicle } from './schema';
import { apiVehicleSchema } from './schema';

export class IVehicleService extends CRUDCService<ApiVehicle> {}

export const VehicleService = new IVehicleService('vehicles', apiVehicleSchema);
