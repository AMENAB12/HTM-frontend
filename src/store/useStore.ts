import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FileStatus = "processing" | "error" | "done";

export interface FileData {
  id: string;
  fileName: string;
  uploadTimestamp: string;
  status: FileStatus;
  rowCount?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

interface FileState {
  files: FileData[];
  addFile: (file: Omit<FileData, "id">) => string;
  updateFileStatus: (id: string, status: FileStatus, rowCount?: number) => void;
  setFiles: (files: FileData[]) => void;
}

type Store = AuthState & FileState;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Auth state
      isAuthenticated: false,
      token: null,
      login: (token: string) => set({ isAuthenticated: true, token }),
      logout: () => set({ isAuthenticated: false, token: null, files: [] }),

      // File state
      files: [],
      addFile: (file: Omit<FileData, "id">) => {
        const id = Date.now().toString();
        const newFile = { ...file, id };
        set((state) => ({ files: [...state.files, newFile] }));
        return id;
      },
      updateFileStatus: (id: string, status: FileStatus, rowCount?: number) =>
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, status, rowCount } : file
          ),
        })),
      setFiles: (files: FileData[]) => set({ files }),
    }),
    {
      name: "htm-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
);
