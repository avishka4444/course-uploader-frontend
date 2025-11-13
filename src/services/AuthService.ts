import { axios } from "./index";
import type { LoginCredentials, RegisterCredentials, TokenResponse, User } from "../types/auth";

export const login = async (credentials: LoginCredentials): Promise<TokenResponse> => {
  const response = await axios.post<TokenResponse>("/user/login", credentials);
  return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<void> => {
  await axios.post("/user/register", credentials);
};

export const getCurrentUser = async (): Promise<User> => {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("No token found");
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { username: payload.sub || payload.username };
  } catch {
    throw new Error("Invalid token");
  }
};

export const logout = async (): Promise<void> => {
  // Stateless JWT logout handled on client
};

