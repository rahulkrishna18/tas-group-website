import type { Metadata } from "next";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import ScrollRefresh from "@/components/layout/ScrollRefresh";
import ContactOffices from "@/components/sections/ContactOffices";

export const metadata: Metadata = {
  title: "Contact | TAS Group of Companies",
  description: "Contact TAS Group: head office in Butterworth, Penang, with offices in Port Klang, KLIA, Langkawi and Singapore.",
};

export default function ContactPage() {
  return (
    <ScrollRefresh>
      <Nav />
      <main id="main">
        <ContactOffices />
      </main>
      <Footer />
    </ScrollRefresh>
  );
}
