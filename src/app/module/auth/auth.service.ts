import { UserStatus } from "../../../generated/prisma/schema/enums";
import { auth } from "../../lib/auth";

interface IRegisterUserPayload {
  name: string;
  email: string;
  password: string;
}
interface ILoginUserPayload {
  email: string;
  password: string;
}

const registerUser = async (payload: IRegisterUserPayload) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new Error("User is blocked");
  }

  if (data.user.status === UserStatus.DELETED) {
    throw new Error("User is deleted");
  }

  if (!data.user) {
    throw new Error("User registration failed");
  }
  return data;
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
  return data;
};

export const authService = {
  registerUser,
  loginUser,
};
