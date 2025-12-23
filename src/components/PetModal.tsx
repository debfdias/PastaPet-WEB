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

interface PetFormData {
  name: string;
  dob: string;
  weight: number;
  type: "DOG" | "CAT" | "OTHER";
  breed: string;
  gender: "FEMALE" | "MALE";
  image?: string;
  hasPetPlan: boolean;
  hasFuneraryPlan: boolean;
  petPlanName?: string;
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
    hasPetPlan: boolean;
    hasFuneraryPlan: boolean;
    petPlanName?: string;
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
  const modalRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("petModal");
  const commonT = useTranslations("common");

  const imageInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<PetFormData>({
      defaultValues: {
        name: "",
        dob: "",
        weight: 0,
        type: "DOG",
        breed: "",
        gender: "FEMALE",
        image: "",
        hasPetPlan: false,
        hasFuneraryPlan: false,
        petPlanName: "",
      },
    });
  const hasPetPlan = watch("hasPetPlan");

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if click is outside modal
      if (modalRef.current && !modalRef.current.contains(target)) {
        // Check if click is inside a Radix Select portal (dropdown)
        // Radix Select renders the dropdown in a portal, check if target is inside any portal
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

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Reset form when pet changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      const formData: PetFormData = pet
        ? {
            name: pet.name,
            dob: pet.dob.split("T")[0],
            weight: pet.weight,
            type: pet.type as "DOG" | "CAT" | "OTHER",
            breed: pet.breed,
            gender: pet.gender as "FEMALE" | "MALE",
            image: pet.image,
            hasPetPlan: pet.hasPetPlan,
            hasFuneraryPlan: pet.hasFuneraryPlan,
            petPlanName: pet.petPlanName || "",
          }
        : {
            name: "",
            dob: "",
            weight: 0,
            type: "DOG",
            breed: "",
            gender: "FEMALE",
            image: "",
            hasPetPlan: false,
            hasFuneraryPlan: false,
            petPlanName: "",
          };
      reset(formData, { keepDefaultValues: false });
      setSelectedImage(null);
      setPreviewUrl(pet?.image || null);
    }
  }, [isOpen, pet, reset, setValue]);

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
      setError(t("errors.authenticationRequired"));
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
        throw new Error(t("errors.failedToSave"));
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("errors.anErrorOccurred")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-pet-card rounded-lg p-6 w-full max-w-3xl"
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
                  {...register("name", { required: true })}
                  placeholder={t("form.namePlaceholder")}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("form.dateOfBirth")}
                </label>
                <input
                  type="date"
                  {...register("dob", { required: true })}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("form.weight")}
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("weight", { required: true })}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("form.type")}
                </label>
                <Select
                  key={`type-${pet?.id || "new"}-${watch("type")}`}
                  value={watch("type") || "DOG"}
                  onValueChange={(value) => {
                    setValue("type", value as "DOG" | "CAT" | "OTHER", {
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOG">{t("form.dog")}</SelectItem>
                    <SelectItem value="CAT">{t("form.cat")}</SelectItem>
                    <SelectItem value="OTHER">{t("form.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("form.breed")}
                </label>
                <input
                  type="text"
                  {...register("breed", { required: true })}
                  placeholder={t("form.breedPlaceholder")}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("form.gender")}
                </label>
                <Select
                  key={`gender-${pet?.id || "new"}-${watch("gender")}`}
                  value={watch("gender") || "FEMALE"}
                  onValueChange={(value) => {
                    setValue("gender", value as "FEMALE" | "MALE", {
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEMALE">{t("form.female")}</SelectItem>
                    <SelectItem value="MALE">{t("form.male")}</SelectItem>
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

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

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
