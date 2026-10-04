import { Role } from "../../generated/prisma/schema/enums";

export interface IRequestUser {
  userId: string;
  role: Role;
  email: string;
}
