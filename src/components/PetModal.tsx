"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Pencil, Upload } from "lucide-react";
import { uploadImage } from "@/lib/storage/client";
import Image from "next/image";

interface PetFormData {
  name: string;
  dob: string;
  weight: number;
  type: "DOG" | "CAT" | "OTHER";
  breed: string;
  gender: "FEMALE" | "MALE";
  image?: string;
}

interface PetModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet?: {
    id: string;
    name: string;
    dob: string;
    weight: number;
    type: string;
    breed: string;
    gender: string;
    image?: string;
  };
  onSuccess: () => void;
}

async function convertBlobUrlToFile(blobUrl: string) {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  const fileName = Math.random().toString(36).slice(2, 9);
  const mimeType = blob.type || "application/octet-stream";
  const file = new File([blob], `${fileName}.${mimeType.split("/")[1]}`, {
    type: mimeType,
  });
  return file;
}

export default function PetModal({
  isOpen,
  onClose,
  pet,
  onSuccess,
}: PetModalProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PetFormData>();

  // Reset form when pet changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset(
        pet
          ? {
              name: pet.name,
              dob: pet.dob.split("T")[0],
              weight: pet.weight,
              type: pet.type as "DOG" | "CAT" | "OTHER",
              breed: pet.breed,
              gender: pet.gender as "FEMALE" | "MALE",
              image: pet.image,
            }
          : {
              name: "",
              dob: "",
              weight: 0,
              type: "DOG",
              breed: "",
              gender: "FEMALE",
              image: "",
            }
      );
      setSelectedImage(null);
      setPreviewUrl(pet?.image || null);
    }
  }, [isOpen, pet, reset]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setPreviewUrl(imageUrl);
      e.target.value = "";
    }
  };

  const onSubmit = async (data: PetFormData) => {
    if (!session?.user?.token) {
      setError("Authentication required");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = data.image;

      if (selectedImage) {
        const imageFile = await convertBlobUrlToFile(selectedImage);
        const { imageUrl: uploadedUrl, error } = await uploadImage({
          file: imageFile,
          bucket: "pets-images",
        });

        if (error) {
          console.error(error);
          return;
        }
        imageUrl = uploadedUrl;
      }

      const url = pet
        ? `${process.env.NEXT_PUBLIC_API_URL}/pets/${pet.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/pets`;

      console.log(url);
      const response = await fetch(url, {
        method: pet ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({
          ...data,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save pet");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {pet ? (
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                Edit Pet
              </div>
            ) : (
              "Add New Pet"
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pet Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Pet preview"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={imageInputRef}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              type="text"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              {...register("dob", { required: "Date of birth is required" })}
              className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              type="date"
            />
            {errors.dob && (
              <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              {...register("weight", {
                required: "Weight is required",
                min: { value: 0, message: "Weight must be positive" },
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              type="number"
              step="0.1"
            />
            {errors.weight && (
              <p className="text-red-500 text-sm mt-1">
                {errors.weight.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              {...register("type", { required: "Type is required" })}
              className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="DOG">Dog</option>
              <option value="CAT">Cat</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Breed
            </label>
            <input
              {...register("breed", { required: "Breed is required" })}
              className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              type="text"
            />
            {errors.breed && (
              <p className="text-red-500 text-sm mt-1">
                {errors.breed.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              {...register("gender", { required: "Gender is required" })}
              className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : pet ? "Update" : "Add Pet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
