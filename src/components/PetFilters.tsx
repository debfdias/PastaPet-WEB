import { ChangeEvent, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface Filters {
  name: string;
  type: string;
  orderByAge?: string;
  underTreatment: boolean;
}

interface PetFiltersProps {
  onFilterChange: (filters: Filters) => void;
  initialUnderTreatment?: boolean;
}

const TYPES = ["", "DOG", "CAT", "OTHER"] as const;
const TYPE_KEY: Record<string, string> = {
  "": "all",
  DOG: "dog",
  CAT: "cat",
  OTHER: "other",
};

export default function PetFilters({
  onFilterChange,
  initialUnderTreatment = false,
}: PetFiltersProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [ageOrder, setAgeOrder] = useState<string>("");
  const [underTreatment, setUnderTreatment] = useState<boolean>(
    initialUnderTreatment
  );
  const t = useTranslations("petFilters");

  // Single place to emit the current filter state to the parent.
  const emit = (next: Partial<Filters>) =>
    onFilterChange({
      name: nameInput,
      type: selectedType,
      orderByAge: ageOrder,
      underTreatment,
      ...next,
    });

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
    emit({ name: e.target.value });
  };

  const selectType = (type: string) => {
    setSelectedType(type);
    emit({ type });
  };

  const handleAgeOrderClick = () => {
    const next = ageOrder === "" ? "asc" : ageOrder === "asc" ? "desc" : "";
    setAgeOrder(next);
    emit({ orderByAge: next });
  };

  const handleUnderTreatmentToggle = () => {
    const next = !underTreatment;
    setUnderTreatment(next);
    emit({ underTreatment: next });
  };

  const handleReset = () => {
    setNameInput("");
    setSelectedType("");
    setAgeOrder("");
    setUnderTreatment(false);
    onFilterChange({
      name: "",
      type: "",
      orderByAge: "",
      underTreatment: false,
    });
  };

  const SearchIcon = icons.search;
  const SortIcon = icons.sort;
  const TreatmentIcon = icons.medical_services;
  const ClearIcon = icons.filter_alt_off;

  return (
    <div className="mb-6 flex flex-col gap-2.5 rounded-card bg-surface p-3 shadow-card lg:flex-row lg:flex-wrap lg:items-center">
      {/* search */}
      <div className="relative w-full lg:flex-1 lg:min-w-[200px]">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-faint" />
        <input
          type="text"
          id="name"
          placeholder={t("searchPlaceholder")}
          value={nameInput}
          onChange={handleNameChange}
          className="w-full rounded-ctrl border border-hair bg-panel py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-faint focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30"
        />
      </div>

      {/* type — segmented, single select (Todos default) */}
      <div className="flex gap-1 rounded-ctrl bg-panel p-1">
        {TYPES.map((type) => {
          const active = selectedType === type;
          return (
            <button
              key={type || "all"}
              onClick={() => selectType(type)}
              aria-pressed={active}
              className={cn(
                "flex-1 cursor-pointer rounded-[9px] px-3 py-1.5 text-sm font-bold transition-colors lg:flex-none",
                active
                  ? "bg-mint text-white"
                  : "text-muted hover:bg-tint hover:text-deep"
              )}
            >
              {t(`types.${TYPE_KEY[type]}`)}
            </button>
          );
        })}
      </div>

      {/* actions — single row on mobile, inline on desktop (lg:contents) */}
      <div className="flex gap-2.5 lg:contents">
        {/* sort by age */}
        <button
          onClick={handleAgeOrderClick}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-ctrl border border-hair bg-panel px-3.5 py-2.5 text-sm font-bold text-muted transition-colors hover:bg-tint hover:text-deep lg:flex-none"
        >
          <SortIcon className="h-[18px] w-[18px]" strokeWidth={2.5} />
          <span>{t("orderByAge.label")}</span>
          {ageOrder === "asc" && (
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          )}
          {ageOrder === "desc" && (
            <ArrowDown className="h-4 w-4" strokeWidth={2.5} />
          )}
        </button>

        {/* under-treatment toggle — mint when on */}
        <button
          onClick={handleUnderTreatmentToggle}
          aria-pressed={underTreatment}
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-ctrl border px-3.5 py-2.5 text-sm font-bold transition-colors lg:flex-none",
            underTreatment
              ? "border-mint bg-mint text-white"
              : "border-hair bg-panel text-muted hover:bg-tint hover:text-deep"
          )}
        >
          <TreatmentIcon className="h-[18px] w-[18px]" strokeWidth={2.5} />
          <span>{t("underTreatment")}</span>
        </button>

        {/* reset */}
        <button
          onClick={handleReset}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-ctrl px-3.5 py-2.5 text-sm font-bold text-muted transition-colors hover:bg-tint hover:text-deep lg:flex-none"
        >
          <ClearIcon className="h-[18px] w-[18px]" strokeWidth={2.5} />
          <span>{t("clearFilter")}</span>
        </button>
      </div>
    </div>
  );
}
