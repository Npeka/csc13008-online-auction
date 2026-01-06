import { generateId } from "./utils";

// Supabase Storage REST API configuration
// These should be in your .env file
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const STORAGE_BUCKET = "products"; // Create this bucket in Supabase dashboard

export async function uploadImage(file: File): Promise<string> {
  // 1. Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid file type. Please upload an image.");
  }

  // 2. Validate file size (e.g. 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size too large. Max 5MB.");
  }

  // 3. Generate unique filename
  const extension = file.name.split(".").pop();
  const filename = `${generateId()}-${Date.now()}.${extension}`;
  const filePath = `${filename}`;

  // 4. Upload to Supabase Storage via REST API
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filePath}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": file.type,
      "x-upsert": "true", // Overwrite if exists
    },
    body: file,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload image");
  }

  // 5. Return public URL
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath}`;
  return publicUrl;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadImage));
}
