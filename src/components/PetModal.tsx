"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Pencil, Upload } from "lucide-react";
import { uploadImage } from "@/lib/storage/client";
import Image from "next/image";
import { CgCloseR } from "react-icons/cg";
import { useTranslations } from "next-intl";
import { Switch } from "radix-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pet, PetFormData, PetType, PetGender } from "@/types/pet";
import { createPet, updatePet } from "@/services/pets.service";

interface PetModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet?: Pet;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const t = useTranslations("petModal");
  const commonT = useTranslations("common");

  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PetFormData>({
    defaultValues: {
      name: "",
      dob: "",
      weight: 0,
      type: PetType.DOG,
      breed: "",
      gender: PetGender.FEMALE,
      image: "",
      hasPetPlan: false,
      hasFuneraryPlan: false,
      petPlanName: "",
    },
  });
  const hasPetPlan = watch("hasPetPlan");

  // Reset form when pet changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      const formData: PetFormData = pet
        ? {
            name: pet.name,
            dob: pet.dob.split("T")[0],
            weight: pet.weight,
            type: pet.type,
            breed: pet.breed,
            gender: pet.gender,
            image: pet.image,
            hasPetPlan: pet.hasPetPlan,
            hasFuneraryPlan: pet.hasFuneraryPlan,
            petPlanName: pet.petPlanName || "",
          }
        : {
            name: "",
            dob: "",
            weight: 0,
            type: PetType.DOG,
            breed: "",
            gender: PetGender.FEMALE,
            image: "",
            hasPetPlan: false,
            hasFuneraryPlan: false,
            petPlanName: "",
          };
      reset(formData, { keepDefaultValues: false });
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
      return;
    }
    setIsSubmitting(true);

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

      const petData = {
        name: data.name,
        dob: data.dob,
        weight: data.weight,
        type: data.type, // PetType enum value (string)
        breed: data.breed,
        gender: data.gender, // PetGender enum value (string)
        image: imageUrl,
        hasPetPlan: data.hasPetPlan,
        hasFuneraryPlan: data.hasFuneraryPlan,
        petPlanName: data.petPlanName,
      };

      if (pet) {
        await updatePet(session.user.token, pet.id, petData);
      } else {
        await createPet(session.user.token, petData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving pet:", err);
      // Error handling can be done via toast or formState.errors
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not on modal content
    if (e.target === e.currentTarget) {
      // Check if click is inside a Radix Select portal (dropdown)
      const target = e.target as HTMLElement;
      let element = target;
      while (element && element !== document.body) {
        // Check if element is inside a Radix Select content (has role="listbox" or is inside a portal)
        if (
          element.getAttribute("role") === "listbox" ||
          element.closest('[role="listbox"]') ||
          element.closest("[data-radix-portal]")
        ) {
          return; // Don't close if clicking inside Select dropdown
        }
        element = element.parentElement as HTMLElement;
      }
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-pet-card rounded-lg p-6 w-full max-w-3xl max-h-[85vh] md:max-h-none overflow-y-auto md:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {pet ? (
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                {t("editPet")}
              </div>
            ) : (
              t("addNewPet")
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer "
          >
            <CgCloseR className="w-6 h-6 dark:hover:text-avocado-300" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col lg:flex-row gap-6"
        >
          {/* Image upload - Full width on mobile, 1/3 on desktop */}
          <div className="w-full lg:w-1/3">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-48 lg:h-64 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800">
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
                    <p className="mb-2 text-sm text-gray-500 ">
                      <span className="font-semibold">
                        {t("imageUpload.clickToUpload")}
                      </span>{" "}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("imageUpload.fileTypes")}
                    </p>
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

          {/* Form fields - Full width on mobile, 2/3 on desktop */}
          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("form.name")}
                </label>
                <input
                  type="text"
                  {...register("name", {
                    required: t("form.name") + " is required",
                  })}
                  placeholder={t("form.namePlaceholder")}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("form.dateOfBirth")}
                </label>
                <input
                  type="date"
                  {...register("dob", {
                    required: t("form.dateOfBirth") + " is required",
                  })}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                />
                {errors.dob && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.dob.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("form.weight")}
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("weight", {
                    required: t("form.weight") + " is required",
                    min: {
                      value: 0,
                      message: t("form.weight") + " must be positive",
                    },
                  })}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                />
                {errors.weight && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.weight.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("form.type")}
                </label>
                <Select
                  key={`type-${pet?.id || "new"}-${watch("type")}`}
                  value={watch("type") || PetType.DOG}
                  onValueChange={(value) => {
                    setValue("type", value as PetType, {
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PetType.DOG}>{t("form.dog")}</SelectItem>
                    <SelectItem value={PetType.CAT}>{t("form.cat")}</SelectItem>
                    <SelectItem value={PetType.OTHER}>
                      {t("form.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("form.breed")}
                </label>
                <input
                  type="text"
                  {...register("breed", {
                    required: t("form.breed") + " is required",
                  })}
                  placeholder={t("form.breedPlaceholder")}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                />
                {errors.breed && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.breed.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("form.gender")}
                </label>
                <Select
                  key={`gender-${pet?.id || "new"}-${watch("gender")}`}
                  value={watch("gender") || PetGender.FEMALE}
                  onValueChange={(value) => {
                    setValue("gender", value as PetGender, {
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PetGender.FEMALE}>
                      {t("form.female")}
                    </SelectItem>
                    <SelectItem value={PetGender.MALE}>
                      {t("form.male")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {t("form.hasPetPlan")}
                  </label>
                  <Switch.Root
                    className="w-[42px] h-[25px] bg-gray-300 rounded-full relative data-[state=checked]:bg-avocado-500 outline-none cursor-pointer"
                    checked={hasPetPlan}
                    onCheckedChange={(checked: boolean) => {
                      setValue("hasPetPlan", checked);
                    }}
                  >
                    <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-lg transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                  </Switch.Root>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {t("form.hasFuneraryPlan")}
                  </label>
                  <Switch.Root
                    className="w-[42px] h-[25px] bg-gray-300 rounded-full relative data-[state=checked]:bg-avocado-500 outline-none cursor-pointer"
                    checked={watch("hasFuneraryPlan")}
                    onCheckedChange={(checked: boolean) => {
                      setValue("hasFuneraryPlan", checked);
                    }}
                  >
                    <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-lg transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                  </Switch.Root>
                </div>
              </div>
              {hasPetPlan && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    {t("form.petPlanName")}
                  </label>
                  <input
                    type="text"
                    {...register("petPlanName")}
                    placeholder={t("form.petPlanNamePlaceholder")}
                    className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 cursor-pointer bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="">{commonT("cancel")}</div>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-avocado-500 text-avocado-800 rounded-lg hover:bg-avocado-300 disabled:opacity-50 cursor-pointer font-semibold transition-colors duration-200"
              >
                {isSubmitting
                  ? commonT("loading")
                  : pet
                  ? commonT("update")
                  : commonT("save")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
