const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface LoginResponse {
  token: string;
}

export interface FileMetadata {
  fileName: string;
  uploadTimestamp: string;
  rowCount: number;
  parquetPath: string;
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
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
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

export async function uploadFile(file: File, token: string): Promise<void> {
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
    throw new ApiError(
      response.status,
      `Upload failed: ${response.statusText}`
    );
  }
}

export async function getFiles(token: string): Promise<FileMetadata[]> {
  return apiRequest<FileMetadata[]>("/files", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
