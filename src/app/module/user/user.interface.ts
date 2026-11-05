export interface UpdateMyProfilePayload {
  name?: string;
  profileImage?: string | null;
}

export interface UpdateUserByAdminPayload {
  role?: "USER" | "ADMIN";
  status?: "ACTIVE" | "BLOCKED";
}
