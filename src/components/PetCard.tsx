import { differenceInYears, differenceInMonths } from "date-fns";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Pet {
  id: string;
  name: string;
  dob: string;
  weight: number;
  type: string;
  breed: string;
  image?: string;
  gender: string;
}

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
}

export default function PetCard({ pet, onEdit }: PetCardProps) {
  const router = useRouter();

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const years = differenceInYears(new Date(), birthDate);
    const months = differenceInMonths(new Date(), birthDate) % 12;

    if (years === 0) {
      return `${months} months`;
    }
    return `${years} years ${months} months`;
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
        aria-label="Edit pet"
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
      <h3 className="text-xl font-semibold mb-4 pr-6 text-transform: uppercase dark:text-white">
        {pet.name}
      </h3>
      <div className="bg-[#b0b9a2]/20 dark:bg-gray-700 w-full h-[2px] mb-4"></div>
      <div className="space-y-1">
        <p className="">
          <span className="font-medium">Weight:</span> {pet.weight} kg
        </p>
        <p className="">
          <span className="font-medium">Age:</span> {calculateAge(pet.dob)}
        </p>
      </div>
    </div>
  );
}
