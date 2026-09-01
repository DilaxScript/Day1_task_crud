const API_URL = "http://127.0.0.1:8000/api";

type TokenProvider = () => string | null;

let getToken: TokenProvider = () => null;

export function setTokenProvider(provider: TokenProvider) {
  getToken = provider;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { message?: string }).message || "Something went wrong");
  }

  return data as T;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  quantity: number;
  user_id?: number | null;
  user?: { id: number; name: string } | null;
  created_at?: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    request<LoginResponse>("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  me: () => request<{ user: User }>("/me"),
  logout: () => request<{ message: string }>("/logout", { method: "POST" }),

  getProducts: () => request<Product[]>("/products"),
  createProduct: (data: Partial<Product>) =>
    request<{ message: string; product: Product }>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduct: (id: number, data: Partial<Product>) =>
    request<{ message: string; product: Product }>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: number) =>
    request<{ message: string }>(`/products/${id}`, { method: "DELETE" }),

  getUsers: () => request<User[]>("/users"),
  createUser: (data: { name: string; email: string; password: string; role: string }) =>
    request<{ message: string; user: User }>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (id: number, data: Partial<User> & { password?: string }) =>
    request<{ message: string; user: User }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteUser: (id: number) =>
    request<{ message: string }>(`/users/${id}`, { method: "DELETE" }),
};
