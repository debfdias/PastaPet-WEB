import { differenceInYears, differenceInMonths } from "date-fns";
import { Pencil } from "lucide-react";

interface Pet {
  id: string;
  name: string;
  dob: string;
  weight: number;
  type: string;
  breed: string;
}

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
}

export default function PetCard({ pet, onEdit }: PetCardProps) {
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const years = differenceInYears(new Date(), birthDate);
    const months = differenceInMonths(new Date(), birthDate) % 12;

    if (years === 0) {
      return `${months} months`;
    }
    return `${years} years ${months} months`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow relative">
      <button
        onClick={() => onEdit(pet)}
        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
        aria-label="Edit pet"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <h3 className="text-xl font-semibold mb-2 pr-6">{pet.name}</h3>
      <div className="space-y-1">
        <p className="text-gray-600">
          <span className="font-medium">Type:</span> {pet.type}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Breed:</span> {pet.breed}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Weight:</span> {pet.weight} kg
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Age:</span> {calculateAge(pet.dob)}
        </p>
      </div>
    </div>
  );
}
