import { UserRole } from '@prisma/client';

export interface IAuthUser {
  email: string;
  role: UserRole;
}
