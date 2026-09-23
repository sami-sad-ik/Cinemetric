import { auth } from "../../lib/auth";

interface IRegisterUserPayload {
  name: string;
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
  if (!data.user) {
    throw new Error("User registration failed");
  }
  return data;
};

export const authService = {
  registerUser,
};
