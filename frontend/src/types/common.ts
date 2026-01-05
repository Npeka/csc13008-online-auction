export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  pages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ApiErrorDetail {
  message: string;
  [key: string]: any;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
  stack?: string;
}

export interface ApiErrorResponse {
  success: boolean;
  error: ApiError;
}
