import type { Metadata } from "next";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import ScrollRefresh from "@/components/layout/ScrollRefresh";
import Quote from "@/components/sections/Quote";

export const metadata: Metadata = {
  title: "Get a Quote | TAS Group of Companies",
  description: "Request a logistics quote from TAS Group: sea, air, land or multimodal freight, customs, warehousing, project cargo and marine services.",
};

export default function QuotePage() {
  return (
    <ScrollRefresh>
      <Nav />
      <main id="main">
        <Quote standalone />
      </main>
      <Footer />
    </ScrollRefresh>
  );
}
