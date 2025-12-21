import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { MdEvent, MdEventNote } from "react-icons/md";
import { FaPlus } from "react-icons/fa";

interface Event {
  id: string;
  title: string;
  type: string;
  eventDate: string;
  petId: string;
  userId: string;
}

interface EventsSectionProps {
  events: Event[];
  onAddClick: () => void;
  parseDateString: (dateString: string) => Date;
}

export default function EventsSection({
  events,
  onAddClick,
  parseDateString,
}: EventsSectionProps) {
  const t = useTranslations("petDetails.events");

  return (
    <div className="bg-pet-card rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <MdEventNote className="text-2xl text-avocado-500" />
          <h2 className="text-2xl font-bold">{t("title")}</h2>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-1 px-3 py-3 rounded-lg bg-avocado-500 hover:bg-avocado-300 text-gray-800 transition-colors cursor-pointer"
        >
          <FaPlus size={12} />
          <MdEvent size={16} />
        </button>
      </div>
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-avocado-500/10 dark:hover:bg-avocado-500/20 hover:border-avocado-500/50 transition-all cursor-pointer"
          >
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {format(parseDateString(event.eventDate), "PPP", {
                locale: ptBR,
              })}
            </p>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {t("noEvents")}
          </p>
        )}
      </div>
    </div>
  );
}
