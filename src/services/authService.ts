/// <reference types="vite/client" />

import { join } from "path";

export interface AuthUser {
  email: string;
  id: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

const API_URL = "http://127.0.0.1:5000";

export const login = async (
  email: string,
  password: string,
  role: string,
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    }

    const data: LoginResponse = await response.json();

    // Save token to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signup = async (
  name: string,
  email: string,
  password: string,
  phone: string,
  role: string,
  avatar: string,
  status: string,
  id: string,
  joinDate: string,
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/users/customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        phone,
        role,
        avatar,
        status,
        id,
        joinDate,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || "Signup failed");
    }

    const data: LoginResponse = await response.json();

    // Save token to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const updateProfile = async (
  userData: Partial<AuthUser>,
): Promise<AuthUser> => {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update profile");
    }

    const updatedUser: AuthUser = await response.json();
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getStoredUser = (): AuthUser | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
