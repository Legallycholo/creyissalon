import { notFound } from "next/navigation";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { locales, type Locale } from "@/lib/site";
import AndreaChatWidget from "@/components/andrea-chat-widget";
import "../globals.css";
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});
const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  return (
    <html
      lang={locale === "es" ? "es-PR" : "en"}
      className={`${serif.variable} ${sans.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        {children}
        {process.env.NEXT_PUBLIC_ANDREA_ENABLED === "true" && (
          <AndreaChatWidget locale={locale as Locale} />
        )}
      </body>
    </html>
  );
}
