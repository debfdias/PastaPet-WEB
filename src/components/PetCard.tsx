import { differenceInYears, differenceInMonths } from "date-fns";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MdHealthAndSafety } from "react-icons/md";
import { GiTombstone } from "react-icons/gi";

interface Pet {
  id: string;
  name: string;
  dob: string;
  weight: number;
  type: string;
  breed: string;
  image?: string;
  gender: string;
  hasPetPlan: boolean;
  hasFuneraryPlan: boolean;
  petPlanName?: string;
}

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
}

export default function PetCard({ pet, onEdit }: PetCardProps) {
  const router = useRouter();
  const t = useTranslations("petCard");

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const years = differenceInYears(new Date(), birthDate);
    const months = differenceInMonths(new Date(), birthDate) % 12;

    if (years === 0) {
      return `${months} ${t("months")}`;
    }
    return `${years} ${t("years")} ${months} ${t("months")}`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the edit button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    router.push(`/pets/${pet.id}`);
  };

  return (
    <div
      className="bg-pet-card rounded-lg p-3 relative cursor-pointer border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 hover:shadow-lg transition-all duration-200"
      onClick={handleCardClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(pet);
        }}
        className="absolute top-2 right-2 text-avocado-800 rounded-full bg-avocado-500 hover:bg-avocado-300 p-3 cursor-pointer"
        aria-label={t("editPet")}
      >
        <Pencil className="w-4 h-4" />
      </button>
      {pet.image && (
        <div className="mb-4">
          <Image
            src={pet.image}
            alt={`${pet.name}'s photo`}
            width={400}
            height={192}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        </div>
      )}
      <h3 className="text-base font-semibold mb-2 pr-6 text-transform: uppercase dark:text-white">
        {pet.name}
      </h3>
      <div className="bg-[#b0b9a2]/20 dark:bg-gray-700 w-full h-[2px] mb-2"></div>
      <div className="flex justify-between items-start">
        {/* Left side - Age and Weight */}
        <div className="space-y-0.5">
          <p className="text-sm">{pet.weight} kg</p>
          <p className="text-sm">{calculateAge(pet.dob)}</p>
        </div>
        {/* Right side - Pet Plan and Funerary Plan */}
        <div className="flex flex-col items-end space-y-1">
          {pet.hasPetPlan && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {pet.petPlanName || t("petPlan")}
              </span>
              <div className="w-5 h-5 rounded-full bg-blue-400 dark:bg-blue-500 flex items-center justify-center">
                <MdHealthAndSafety className="text-white text-md" />
              </div>
            </div>
          )}
          {pet.hasFuneraryPlan && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Pet Fenix
              </span>
              <div className="w-5 h-5 rounded-full bg-gray-400 dark:bg-gray-500 flex items-center justify-center">
                <GiTombstone className="text-white text-md" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
