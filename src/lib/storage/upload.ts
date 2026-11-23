"use client";

import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { clientStorage, firebaseReady } from "@/lib/firebase/client";

export type UploadOpts = {
  maxMb?: number;
  accept?: string[]; // e.g. ["image/", "application/pdf"]
  onProgress?: (pct: number) => void;
};

export function uploadToStorage(path: string, file: File, opts: UploadOpts = {}): Promise<{ url: string; path: string }> {
  const maxMb = opts.maxMb ?? 8;
  const accept = opts.accept ?? ["image/"];

  if (!firebaseReady()) {
    return Promise.reject(new Error("Firebase Storage isn't configured in this environment."));
  }
  if (file.size > maxMb * 1024 * 1024) {
    return Promise.reject(new Error(`File is too large. Max allowed size is ${maxMb} MB.`));
  }
  if (!accept.some((prefix) => file.type.startsWith(prefix))) {
    return Promise.reject(new Error("Unsupported file type."));
  }

  const storageRef = ref(clientStorage(), path);
  const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        if (snap.totalBytes > 0) opts.onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
      },
      (err) => reject(err),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, path });
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

