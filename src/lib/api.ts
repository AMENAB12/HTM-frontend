const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  message: string;
}

export interface FileMetadata {
  id: number;
  filename: string;
  upload_timestamp: string;
  row_count: number;
  parquet_path: string;
  status: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || `API Error: ${response.statusText}`
    );
  }

  return response.json();
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function uploadFile(
  file: File,
  token: string
): Promise<FileMetadata> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || `Upload failed: ${response.statusText}`
    );
  }

  return response.json();
}

export async function getFiles(token: string): Promise<FileMetadata[]> {
  return apiRequest<FileMetadata[]>("/files", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getFileById(
  fileId: number,
  token: string
): Promise<FileMetadata> {
  return apiRequest<FileMetadata>(`/files/${fileId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function deleteFile(
  fileId: number,
  token: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export interface FileDataResponse {
  file_id: number;
  filename: string;
  format: string;
  total_rows: number;
  returned_rows: number;
  offset: number;
  limit: number;
  columns: string[];
  data: Record<string, any>[];
}

export interface FileStatistics {
  file_info: {
    id: number;
    filename: string;
    upload_timestamp: string;
    status: string;
    total_rows: number;
    total_columns: number;
  };
  columns: Array<{
    name: string;
    data_type: string;
    missing_count: number;
    missing_percentage: number;
    unique_count: number;
    sample_values: any[];
    min_value?: number;
    max_value?: number;
    mean_value?: number;
    median_value?: number;
  }>;
  data_quality: {
    total_missing_values: number;
    missing_percentage: number;
    duplicate_rows: number;
    unique_rows: number;
  };
  file_sizes: {
    csv_size_bytes: number;
    parquet_size_bytes: number;
    compression_ratio: number;
    space_saved_percentage: number;
  };
}

export interface FilePreview {
  file_id: number;
  filename: string;
  status: string;
  rows_requested: number;
  csv_preview: {
    columns: string[];
    data: Record<string, any>[];
    rows_returned: number;
  };
  parquet_preview: {
    columns: string[];
    data: Record<string, any>[];
    rows_returned: number;
  };
}

export async function getFileData(
  fileId: number,
  token: string,
  options: { limit?: number; offset?: number; format?: string } = {}
): Promise<FileDataResponse> {
  const params = new URLSearchParams({
    limit: (options.limit || 100).toString(),
    offset: (options.offset || 0).toString(),
    format: options.format || "parquet",
  });

  return apiRequest<FileDataResponse>(`/files/${fileId}/data?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getFileStatistics(
  fileId: number,
  token: string
): Promise<FileStatistics> {
  return apiRequest<FileStatistics>(`/files/${fileId}/statistics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getFilePreview(
  fileId: number,
  token: string,
  rows: number = 10
): Promise<FilePreview> {
  return apiRequest<FilePreview>(`/files/${fileId}/preview?rows=${rows}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Dashboard Analytics Interfaces
export interface DashboardOverview {
  overview: {
    total_files: number;
    processed_files: number;
    processing_files: number;
    error_files: number;
    success_rate_percentage: number;
    total_rows_processed: number;
    average_rows_per_file: number;
  };
  storage: {
    total_csv_size_bytes: number;
    total_parquet_size_bytes: number;
    space_saved_bytes: number;
    space_saved_percentage: number;
    compression_ratio: number;
    total_csv_size_mb: number;
    total_parquet_size_mb: number;
  };
  recent_activity: {
    files_this_week: number;
    rows_this_week: number;
    latest_uploads: Array<{
      filename: string;
      upload_time: string;
      status: string;
      rows: number;
    }>;
  };
  file_distribution: {
    by_status: {
      done: number;
      processing: number;
      error: number;
    };
    largest_files: Array<{
      filename: string;
      size_mb: number;
      rows: number;
      upload_date: string;
    }>;
    most_rows: Array<{
      filename: string;
      size_mb: number;
      rows: number;
      upload_date: string;
    }>;
  };
  performance: {
    average_compression_ratio: number;
    total_storage_saved_mb: number;
    processing_efficiency: number;
  };
}

export interface ActivityData {
  period_days: number;
  start_date: string;
  end_date: string;
  daily_activity: Array<{
    date: string;
    files_uploaded: number;
    files_processed: number;
    files_failed: number;
    total_rows: number;
    total_size_mb: number;
  }>;
  summary: {
    total_files: number;
    total_processed: number;
    total_rows: number;
    total_size_mb: number;
  };
}

export interface DataQuality {
  total_files_analyzed: number;
  data_completeness: Array<{
    filename: string;
    completeness_percentage: number;
    missing_values: number;
    total_cells: number;
    duplicate_rows: number;
  }>;
  file_quality_scores: Array<{
    filename: string;
    quality_score: number;
    rows: number;
    columns: number;
  }>;
  overall: {
    average_completeness: number;
    average_quality_score: number;
    files_with_high_quality: number;
    files_with_issues: number;
  };
}

export interface SystemStats {
  directories: {
    uploads: {
      exists: boolean;
      file_count: number;
      total_size_bytes: number;
      total_size_mb: number;
    };
    parquet: {
      exists: boolean;
      file_count: number;
      total_size_bytes: number;
      total_size_mb: number;
    };
  };
  database: {
    total_files: number;
    status_counts: {
      Done: number;
      Processing: number;
      Error: number;
    };
    total_rows_processed: number;
  };
  processing: {
    supported_formats: string[];
    supported_encodings: string[];
    supported_delimiters: string[];
    max_file_size_mb: number;
    processing_timeout_seconds: number;
  };
  api_info: {
    version: string;
    uptime_check: string;
    token_expiry_days: number;
    cors_enabled: boolean;
  };
}

// Dashboard API Functions
export async function getDashboardOverview(
  token: string
): Promise<DashboardOverview> {
  return apiRequest<DashboardOverview>("/dashboard/overview", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getActivityData(
  token: string,
  days: number = 30
): Promise<ActivityData> {
  return apiRequest<ActivityData>(`/dashboard/activity?days=${days}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getDataQuality(token: string): Promise<DataQuality> {
  return apiRequest<DataQuality>("/dashboard/data-quality", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getSystemStats(token: string): Promise<SystemStats> {
  return apiRequest<SystemStats>("/dashboard/system-stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
