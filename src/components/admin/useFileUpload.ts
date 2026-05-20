"use client";

import { useState } from "react";
import { uploadAdminFile, type AdminUploadBucket } from "@/lib/admin-upload";

export interface FileUploadState {
  uploading: boolean;
  error: string;
  upload: (files: File[]) => Promise<string[]>;
}

/**
 * Sube una lista de Files a /api/admin/upload (bucket por defecto "projects").
 * Pasa `bucket: "profile"` para subir al bucket de perfil/avatar.
 */
export function useFileUpload(bucket: AdminUploadBucket = "projects"): FileUploadState {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(files: File[]): Promise<string[]> {
    if (files.length === 0) return [];
    setError("");
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        urls.push(await uploadAdminFile(f, bucket));
      }
      return urls;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al subir";
      setError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  }

  return { uploading, error, upload };
}
