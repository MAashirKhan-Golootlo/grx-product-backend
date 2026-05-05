export interface ApiResponse<T> {
  success: boolean;
  path: string;
  timestamp: string;
  data?: T;
  error?: unknown;
}
