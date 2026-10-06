import Nav from "@/components/layout/Nav";
import JourneyRail from "@/components/layout/JourneyRail";
import Footer from "@/components/layout/Footer";
import ScrollRefresh from "@/components/layout/ScrollRefresh";
import Hero from "@/components/sections/Hero";
import Heritage from "@/components/sections/Heritage";
import PortOps from "@/components/sections/PortOps";
import Multimodal from "@/components/sections/Multimodal";
import Services from "@/components/sections/Services";
import ProjectCargo from "@/components/sections/ProjectCargo";
import Marine from "@/components/sections/Marine";
import Network from "@/components/sections/Network";
import Ecosystem from "@/components/sections/Ecosystem";
import ShipmentDemo from "@/components/sections/ShipmentDemo";
import Sustainability from "@/components/sections/Sustainability";
import Destination from "@/components/sections/Destination";

export default function Home() {
  return (
    <ScrollRefresh>
      <Nav />
      <JourneyRail />
      <main id="main">
        <Hero />
        <Heritage />
        <PortOps />
        <Multimodal />
        <Services />
        <ProjectCargo />
        <Marine />
        <Network />
        <Ecosystem />
        <ShipmentDemo />
        <Sustainability />
        <Destination />
      </main>
      <Footer />
    </ScrollRefresh>
  );
}
