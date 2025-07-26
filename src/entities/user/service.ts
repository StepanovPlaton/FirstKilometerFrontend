import { CRUDService } from '@/shared/utils/services';

import { type User, userSchema } from './schema';

export class IUserService extends CRUDService<User> {}

export const UserService = new IUserService('users', userSchema);
