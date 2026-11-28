import { format } from "date-fns";

/**
 * Opens the browser's print dialog (Save as PDF). The suggested file name
 * comes from document.title, so we temporarily set it to
 * "<Pet> - report - <yyyy-MM-dd>" and restore it once printing finishes.
 */
export function printReport(petName: string) {
  const original = document.title;
  document.title = `${petName} - report - ${format(new Date(), "yyyy-MM-dd")}`;
  const restore = () => {
    document.title = original;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}
