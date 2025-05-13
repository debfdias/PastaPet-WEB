import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    locale = "pt"; // default to English if no locale is provided
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
