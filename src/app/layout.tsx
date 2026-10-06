import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TAS Group of Companies | Integrated Logistics from Penang since 1978",
  description:
    "Freight forwarding, customs brokerage, transportation, warehousing, project cargo, tug & barge and marine services. Penang roots since 1978, with offices in Port Klang, KLIA, Langkawi and Singapore.",
  keywords: [
    "TAS Group",
    "logistics Penang",
    "freight forwarding Malaysia",
    "customs brokerage",
    "tug and barge Penang",
    "ship agency",
    "project cargo heavy lift",
  ],
  openGraph: {
    title: "TAS Group of Companies | From Port to Possibility",
    description:
      "Integrated logistics across sea, air and land, from the quays of Penang since 1978.",
    type: "website",
    locale: "en_MY",
    images: [{ url: "/images/port-cranes.jpg", width: 2000, height: 1335, alt: "Port cranes at sunset" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#06141d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plex.variable} ${plexMono.variable}`}>
      <body>
        <a
          href="#main"
          className="label sr-only z-[100] bg-cargo px-4 py-3 text-abyss focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
