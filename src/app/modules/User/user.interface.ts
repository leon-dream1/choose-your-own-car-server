import { TRole, TSession } from './user.constant';

export type TUser = {
  name: string;
  email: string;
  password: string;
  role: TRole;
  isBlocked: boolean;

  isVerified: boolean;
  sessions: TSession[];
};
