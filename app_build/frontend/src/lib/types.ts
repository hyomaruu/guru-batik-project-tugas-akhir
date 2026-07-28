// src/lib/types.ts — Central type definitions for Guru Batik frontend

// ─── Generic API Response Wrappers ────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ─── Domain Models ─────────────────────────────────────────────

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id: number;
  customer_id: number;
  customer?: Pick<Customer, "id" | "name" | "email">;
  amount: number;
  transaction_date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Article uses thumbnail + is_published to match the actual backend response
export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  // Backend returns both image_url and thumbnail; use thumbnail as canonical
  image_url?: string;
  thumbnail?: string;
  author?: string;
  published?: boolean;
  is_published?: boolean;
  created_at: string;
  updated_at: string;
}

// Gallery uses src/alt/caption/category to match the actual backend response
export interface Gallery {
  id: number;
  src: string;
  alt: string;
  caption?: string;
  category?: string;
  order?: number;
  created_at: string;
  updated_at: string;
}

export interface Agenda {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  created_at: string;
  updated_at: string;
}

// ─── Admin & Auth ──────────────────────────────────────────────

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  username?: string;
  admin?: AdminUser;
}

// ─── Customer Stats ────────────────────────────────────────────

export interface CustomerStats {
  total_customers: number;
  total_transactions: number;
  total_revenue: number;
  avg_transaction_value: number;
}

// ─── RFM ──────────────────────────────────────────────────────

export interface RFMResult {
  customer_id: number;
  customer_name: string;
  email?: string;
  recency: number;
  frequency: number;
  monetary: number;
  rfm_score: number;
  segment: string;
}

export interface RFMSegmentSummary {
  segment: string;
  count: number;
  avg_recency: number;
  avg_frequency: number;
  avg_monetary: number;
}

export interface RFMStats {
  total_customers: number;
  avg_recency: number;
  avg_frequency: number;
  avg_monetary: number;
}

// The getResults response data has a custom shape, not a plain PaginatedData<RFMResult>
export interface RFMResultsData {
  results: RFMResult[];
  segment_summary: RFMSegmentSummary[];
  stats: RFMStats | null;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ─── K-Means Clustering ───────────────────────────────────────

export interface KMeansRun {
  id: string;
  k_value: number;
  inertia: number;
  silhouette: number;
  created_at: string;
}

export interface ClusterResultItem {
  customer_id: number;
  customer_name: string;
  email?: string;
  cluster_label: number;
  cluster_name: string;
  priority_level: string;
  recency: number;
  frequency: number;
  monetary: number;
  pca_x: number;
  pca_y: number;
}

export interface ClusterSummaryItem {
  cluster_label: number;
  cluster_name: string;
  priority_level: string;
  count: number;
  avg_recency: number;
  avg_frequency: number;
  avg_monetary: number;
}

// The getClusterResults / runKMeans response data has a custom shape
export interface ClusterResultsData {
  run: KMeansRun | null;
  results: ClusterResultItem[];
  summary: ClusterSummaryItem[];
  run_id?: string;
}

// ─── Upload Responses ──────────────────────────────────────────

// uploadImage returns ApiResponse<{ url: string }>
export interface UploadImageData {
  url: string;
}

export interface UploadImageResponse {
  success: boolean;
  message?: string;
  data: UploadImageData;
}

export interface UploadCSVResponse {
  inserted: number;
  skipped: number;
  errors?: string[];
}
