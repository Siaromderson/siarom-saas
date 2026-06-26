import Header from "@/components/Header";
import Hero from "@/components/Hero";
import VideoDemo from "@/components/VideoDemo";
import ComoFunciona from "@/components/ComoFunciona";
import AliceFaz from "@/components/AliceFaz";
import Resultados from "@/components/Resultados";
import Planos from "@/components/Planos";
import Personalizado from "@/components/Personalizado";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <VideoDemo />
        <ComoFunciona />
        <AliceFaz />
        <Resultados />
        <Planos />
        <Personalizado />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
