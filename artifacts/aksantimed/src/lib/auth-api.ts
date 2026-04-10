const API_BASE = "/api";

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string;
  jobTitle: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedProduct {
  id: number;
  userId: number;
  productId: number;
  productName: string;
  productImageUrl: string | null;
  productCategory: string | null;
  createdAt: string;
}

export interface UserInquiry {
  id: number;
  userId: number;
  submissionId: string | null;
  productId: number | null;
  productName: string;
  productSku: string | null;
  message: string;
  contactName: string | null;
  contactPhone: string | null;
  contactCompany: string | null;
  status: string;
  createdAt: string;
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = (data as { error?: string }).error ?? `Request failed (${res.status})`;
    throw new Error(err);
  }

  return data as T;
}

export async function apiRegister(body: {
  fullName: string;
  email: string;
  phone?: string;
  companyName: string;
  jobTitle?: string;
  password: string;
}): Promise<{ token: string; user: AuthUser }> {
  return request("/auth/register", { method: "POST", body: JSON.stringify(body) });
}

export async function apiLogin(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  return request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export async function apiGetMe(token: string): Promise<{ user: AuthUser }> {
  return request("/auth/me", {}, token);
}

export async function apiUpdateProfile(token: string, body: {
  fullName?: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
}): Promise<{ user: AuthUser }> {
  return request("/auth/profile", { method: "PUT", body: JSON.stringify(body) }, token);
}

export async function apiChangePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
  await request("/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }, token);
}

export async function apiForgotPassword(email: string): Promise<{ message: string }> {
  return request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

export async function apiResetPassword(token: string, password: string): Promise<{ message: string }> {
  return request("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
}

export async function apiGetSavedProducts(token: string): Promise<SavedProduct[]> {
  return request("/account/saved-products", {}, token);
}

export async function apiSaveProduct(token: string, product: {
  productId: number;
  productName: string;
  productImageUrl?: string;
  productCategory?: string;
}): Promise<SavedProduct> {
  return request("/account/saved-products", { method: "POST", body: JSON.stringify(product) }, token);
}

export async function apiUnsaveProduct(token: string, id: number): Promise<void> {
  await fetch(`${API_BASE}/account/saved-products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiGetInquiries(token: string): Promise<UserInquiry[]> {
  return request("/account/inquiries", {}, token);
}

export async function apiAddInquiry(token: string, inquiry: {
  productId?: number;
  productName: string;
  productSku?: string;
  message: string;
  submissionId?: string;
  contactName?: string;
  contactPhone?: string;
  contactCompany?: string;
}): Promise<UserInquiry> {
  return request("/account/inquiries", { method: "POST", body: JSON.stringify(inquiry) }, token);
}

export async function apiSubmitBulkInquiry(token: string, payload: {
  submissionId: string;
  products: { productId?: number; productName: string; productSku?: string }[];
  message: string;
  contactName?: string;
  contactPhone?: string;
  contactCompany?: string;
}): Promise<UserInquiry[]> {
  return request("/account/inquiries/bulk", { method: "POST", body: JSON.stringify(payload) }, token);
}

export async function apiDeleteInquiry(token: string, id: number): Promise<void> {
  await fetch(`${API_BASE}/account/inquiries/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface QuoteRequestItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string | null;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: string | null;
}

export interface MyQuoteRequest {
  id: number;
  requestNumber: string;
  status: string;
  deliveryCity: string | null;
  message: string | null;
  adminNotes: string | null;
  responseMessage: string | null;
  totalAmount: string | null;
  currency: string | null;
  createdAt: string;
  items: QuoteRequestItem[];
}

export async function apiGetMyQuoteRequests(token: string): Promise<MyQuoteRequest[]> {
  return request("/quote-requests/my", {}, token);
}
