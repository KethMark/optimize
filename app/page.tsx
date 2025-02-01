
import { auth } from "@/auth";
import Footer from "@/components/(landingpage)/footer";
import Hero from "@/components/(landingpage)/hero";
import LogoCloud from "@/components/(landingpage)/logoOptimize";
import { Navigation } from "@/components/(landingpage)/navbar";

export default async function Home() {

  return (
    <div className="min-h-screen scroll-auto selection:bg-orange-100 selection:text-orange-700 ">
      <Navigation/>
      <main className="flex flex-col overflow-hidden">
        <Hero/>
        <LogoCloud/>
      </main>
      <Footer/>
    </div>
  );
}