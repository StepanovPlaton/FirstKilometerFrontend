export {
  apiVehicleSchema,
  formVehicleSchema,
  rawVehicleSchema,
  type ApiVehicle,
  type FormVehicle,
  type Vehicle,
} from './schema';
export type { IVehicleService };
import { VehicleService, type IVehicleService } from './service';
export default VehicleService;
