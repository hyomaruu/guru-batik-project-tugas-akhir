// src/lib/api.ts — API client untuk komunikasi dengan Go backend

import type {
  ApiResponse,
  PaginatedData,
  Article,
  Gallery,
  Agenda,
  Customer,
  Transaction,
  AdminUser,
  LoginResponse,
  CustomerStats,
  RFMResultsData,
  ClusterResultsData,
  UploadCSVResponse,
  UploadImageResponse,
  UploadImageData,
} from "./types";
// Gunakan relative path "/api" di client agar Next.js proxy berfungsi (mendukung Ngrok tanpa error CORS).
// Di server (SSR), kita harus menembak langsung ke backend Go untuk menghindari timeout.
const IS_SERVER = typeof window === "undefined";
const API_BASE = IS_SERVER
  ? (process.env.INTERNAL_API_URL || "http://localhost:8080/api/v1")
  : (process.env.NEXT_PUBLIC_API_URL || "/api");

// ─── Core Fetch Wrapper ───────────────────────────────────────

async function fetchAPI<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const { headers, ...restOptions } = options;

  const res = await fetch(url, {
    cache: "no-store",
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  // 401 interceptor: token expired / invalid → hapus token & redirect ke login
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("gb_token");
      window.location.href = "/admin/login";
    }
    throw new Error("Sesi berakhir. Silakan login kembali.");
  }

  const text = await res.text();
  // Strip hardcoded localhost from backend responses so Ngrok works universally
  const cleanText = text.replace(/http:\/\/localhost:8080/g, "");
  const data = JSON.parse(cleanText);

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Request gagal");
  }
  return data as T;
}

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("gb_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Public API ───────────────────────────────────────────────

export const publicApi = {
  getArticles: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI<ApiResponse<PaginatedData<Article>>>(`/articles${qs}`);
  },
  getArticle: (slug: string) =>
    fetchAPI<ApiResponse<Article>>(`/articles/${slug}`),
  getCategories: () =>
    fetchAPI<ApiResponse<string[]>>(`/articles/categories`),
  getGalleries: () =>
    fetchAPI<ApiResponse<Gallery[]>>(`/gallery`),
  getAgendas: () =>
    fetchAPI<ApiResponse<Agenda[]>>(`/agenda`),
};

// ─── Admin Auth ───────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    fetchAPI<ApiResponse<LoginResponse>>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () =>
    fetchAPI<ApiResponse<AdminUser>>("/admin/me", { headers: getAuthHeaders() }),
  updateProfile: (data: { username?: string; password?: string }) =>
    fetchAPI<ApiResponse<AdminUser>>("/admin/me", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
};

// ─── Admin Articles ───────────────────────────────────────────

export const adminArticleApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI<ApiResponse<PaginatedData<Article>>>(`/admin/articles${qs}`, {
      headers: getAuthHeaders(),
    });
  },
  get: (id: number) =>
    fetchAPI<ApiResponse<Article>>(`/admin/articles/${id}`, {
      headers: getAuthHeaders(),
    }),
  create: (data: Partial<Article>) =>
    fetchAPI<ApiResponse<Article>>("/admin/articles", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Article>) =>
    fetchAPI<ApiResponse<Article>>(`/admin/articles/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchAPI<ApiResponse<null>>(`/admin/articles/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }),
  uploadImage: (file: File): Promise<UploadImageResponse> => {
    const form = new FormData();
    form.append("image", file);
    return fetch(`${API_BASE}/admin/upload`, {
      method: "POST",
      headers: getAuthHeaders() as Record<string, string>,
      body: form,
    }).then((r) => r.json() as Promise<UploadImageResponse>);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _uploadImageData: null as unknown as UploadImageData,
};

// ─── Admin Gallery ────────────────────────────────────────────

export const adminGalleryApi = {
  list: () =>
    fetchAPI<ApiResponse<Gallery[]>>(`/admin/gallery`, { headers: getAuthHeaders() }),
  get: (id: number) =>
    fetchAPI<ApiResponse<Gallery>>(`/admin/gallery/${id}`, { headers: getAuthHeaders() }),
  create: (data: Partial<Gallery>) =>
    fetchAPI<ApiResponse<Gallery>>("/admin/gallery", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Gallery>) =>
    fetchAPI<ApiResponse<Gallery>>(`/admin/gallery/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchAPI<ApiResponse<null>>(`/admin/gallery/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }),
};

// ─── Admin Agenda ─────────────────────────────────────────────

export const adminAgendaApi = {
  list: () =>
    fetchAPI<ApiResponse<Agenda[]>>(`/admin/agenda`, { headers: getAuthHeaders() }),
  get: (id: number) =>
    fetchAPI<ApiResponse<Agenda>>(`/admin/agenda/${id}`, { headers: getAuthHeaders() }),
  create: (data: Partial<Agenda>) =>
    fetchAPI<ApiResponse<Agenda>>("/admin/agenda", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Agenda>) =>
    fetchAPI<ApiResponse<Agenda>>(`/admin/agenda/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchAPI<ApiResponse<null>>(`/admin/agenda/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }),
};

// ─── Admin Customers ──────────────────────────────────────────

export const adminCustomerApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI<ApiResponse<PaginatedData<Customer>>>(`/admin/customers${qs}`, {
      headers: getAuthHeaders(),
    });
  },
  get: (id: number) =>
    fetchAPI<ApiResponse<Customer>>(`/admin/customers/${id}`, {
      headers: getAuthHeaders(),
    }),
  create: (data: Partial<Customer>) =>
    fetchAPI<ApiResponse<Customer>>("/admin/customers", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Customer>) =>
    fetchAPI<ApiResponse<Customer>>(`/admin/customers/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchAPI<ApiResponse<null>>(`/admin/customers/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }),
  stats: () =>
    fetchAPI<ApiResponse<CustomerStats>>("/admin/customers/stats", {
      headers: getAuthHeaders(),
    }),
  uploadCSV: (file: File): Promise<ApiResponse<UploadCSVResponse>> => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${API_BASE}/admin/customers/upload-csv`, {
      method: "POST",
      headers: getAuthHeaders() as Record<string, string>,
      body: form,
    }).then((r) => r.json() as Promise<ApiResponse<UploadCSVResponse>>);
  },
};

// ─── Admin Transactions ───────────────────────────────────────

export const adminTransactionApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI<ApiResponse<PaginatedData<Transaction>>>(`/admin/transactions${qs}`, {
      headers: getAuthHeaders(),
    });
  },
  create: (data: Omit<Transaction, "id" | "customer" | "created_at" | "updated_at">) =>
    fetchAPI<ApiResponse<Transaction>>("/admin/transactions", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Pick<Transaction, "amount" | "transaction_date" | "description">>) =>
    fetchAPI<ApiResponse<Transaction>>(`/admin/transactions/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
};

// ─── Admin RFM & Clustering ───────────────────────────────────

export const adminRFMApi = {
  calculate: () =>
    fetchAPI<ApiResponse<null>>("/admin/rfm/calculate", {
      method: "POST",
      headers: getAuthHeaders(),
    }),
  getResults: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI<ApiResponse<RFMResultsData>>(`/admin/rfm/results${qs}`, {
      headers: getAuthHeaders(),
    });
  },
  runKMeans: (k: number) =>
    fetchAPI<ApiResponse<ClusterResultsData>>("/admin/rfm/kmeans", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ k }),
    }),
  getClusterResults: (runId?: string) => {
    const qs = runId ? `?run_id=${runId}` : "";
    return fetchAPI<ApiResponse<ClusterResultsData>>(`/admin/rfm/cluster-results${qs}`, {
      headers: getAuthHeaders(),
    });
  },
};
