export {
  apiIndividualSchema,
  formIndividualSchema,
  rawIndividualSchema,
  type ApiIndividual,
  type FormIndividual,
  type Individual,
} from './schema';
export type { IIndividualService };
import { IndividualService, type IIndividualService } from './service';
export default IndividualService;
