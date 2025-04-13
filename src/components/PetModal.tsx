"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Pencil } from "lucide-react";

interface PetFormData {
  name: string;
  dob: string;
  weight: number;
  type: "DOG" | "CAT" | "OTHER";
  breed: string;
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
  };
  onSuccess: () => void;
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
            }
          : {
              name: "",
              dob: "",
              weight: 0,
              type: "DOG",
              breed: "",
            }
      );
    }
  }, [isOpen, pet, reset]);

  const onSubmit = async (data: PetFormData) => {
    if (!session?.user?.token) {
      setError("Authentication required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = pet
        ? `http://localhost:3000/api/pets/${pet.id}`
        : "http://localhost:3000/api/pets";

      const response = await fetch(url, {
        method: pet ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify(data),
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
