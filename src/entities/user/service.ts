import { CRUDCService } from '@/shared/utils/services';
import { type ApiUser, apiUserSchema } from './schema';

export class IUserService extends CRUDCService<ApiUser> {}

export const UserService = new IUserService('users', apiUserSchema);
