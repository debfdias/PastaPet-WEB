import { differenceInYears, differenceInMonths } from "date-fns";

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
}

export default function PetCard({ pet }: PetCardProps) {
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
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{pet.name}</h3>
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
