import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";
import { createSupabaseClient } from "../supabase";

function getStorage() {
  const { storage } = createSupabaseClient();
  return storage;
}

type UploadProps = {
  file: File;
  bucket: string;
  folder?: string;
};

export const uploadFile = async ({ file, bucket, folder }: UploadProps) => {
  const fileName = file.name;
  const fileExtension = fileName.slice(fileName.lastIndexOf(".") + 1);
  const path = `${folder ? folder + "/" : ""}${uuidv4()}.${fileExtension}`;

  const storage = getStorage();

  // If it's an image, compress it first
  if (file.type.startsWith("image/")) {
    try {
      file = await imageCompression(file, {
        maxSizeMB: 1,
      });
    } catch (error) {
      console.error(error);
      return { fileUrl: "", error: "Image compression failed" };
    }
  }

  const { data, error } = await storage.from(bucket).upload(path, file);

  if (error) {
    return { fileUrl: "", error: "File upload failed" };
  }

  const fileUrl = `${process.env
    .NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/object/public/${bucket}/${
    data?.path
  }`;

  return { fileUrl, error: "" };
};

// Keeping this for backward compatibility and type safety
export const uploadImage = async ({ file, bucket, folder }: UploadProps) => {
  if (!file.type.startsWith("image/")) {
    return { imageUrl: "", error: "File must be an image" };
  }
  const { fileUrl, error } = await uploadFile({ file, bucket, folder });
  return { imageUrl: fileUrl, error };
};

export const deleteImage = async (imageUrl: string) => {
  const bucketAndPathString = imageUrl.split("/storage/v1/object/public/")[1];
  const firstSlashIndex = bucketAndPathString.indexOf("/");

  const bucket = bucketAndPathString.slice(0, firstSlashIndex);
  const path = bucketAndPathString.slice(firstSlashIndex + 1);

  const storage = getStorage();

  const { data, error } = await storage.from(bucket).remove([path]);

  return { data, error };
};
