import { ChangeEvent, useState } from "react";
import { MdFilterAltOff, MdSearch } from "react-icons/md";
import { useTranslations } from "next-intl";

interface PetFiltersProps {
  onFilterChange: (filters: { name: string; type: string }) => void;
}

export default function PetFilters({ onFilterChange }: PetFiltersProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const t = useTranslations("petFilters");

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setNameInput(newName);
    onFilterChange({ name: newName, type: selectedType });
  };

  const handleTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newType = e.target.value;
    setSelectedType(newType);
    onFilterChange({ name: nameInput, type: newType });
  };

  const handleReset = () => {
    setNameInput("");
    setSelectedType("");
    onFilterChange({ name: "", type: "" });
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:flex-1">
          <div className="relative">
            <input
              type="text"
              id="name"
              placeholder={t("searchPlaceholder")}
              value={nameInput}
              onChange={handleNameChange}
              className="appearance-none relative block w-full p-3 pr-10 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 sm:text-md bg-gray-100 dark:bg-gray-700"
            />
            <MdSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="w-full md:flex-1">
          <label className="block text-sm font-medium mb-2">{t("type")}</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="DOG"
                checked={selectedType === "DOG"}
                onChange={handleTypeChange}
                className="w-4 h-4 text-avocado-500 bg-gray-100 border-gray-300 focus:ring-avocado-500 cursor-pointer"
              />
              <span className="ml-2">{t("types.dog")}</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="CAT"
                checked={selectedType === "CAT"}
                onChange={handleTypeChange}
                className="w-4 h-4 text-avocado-500 bg-gray-100 border-gray-300 focus:ring-avocado-500 cursor-pointer"
              />
              <span className="ml-2">{t("types.cat")}</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="OTHER"
                checked={selectedType === "OTHER"}
                onChange={handleTypeChange}
                className="w-4 h-4 text-avocado-500 bg-gray-100 border-gray-300 focus:ring-avocado-500 cursor-pointer"
              />
              <span className="ml-2">{t("types.other")}</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full md:w-auto px-4 py-2 cursor-pointer bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
        >
          <div>{t("clearFilter")}</div>
          <MdFilterAltOff className="ml-2" />
        </button>
      </div>
    </div>
  );
}
