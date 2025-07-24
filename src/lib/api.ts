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

export async function getFileById(fileId: number, token: string): Promise<FileMetadata> {
  return apiRequest<FileMetadata>(`/files/${fileId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function deleteFile(fileId: number, token: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
