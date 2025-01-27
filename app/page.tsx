
import { auth } from "@/auth";
import Footer from "@/components/(landingpage)/footer";
import Hero from "@/components/(landingpage)/hero";
import { Navigation } from "@/components/(landingpage)/navbar";

export default async function Home() {
  const authUser = await auth()

  return (
    <div className="min-h-screen scroll-auto selection:bg-orange-100 selection:text-orange-700 dark:bg-gray-950">
      <Navigation/>
      <main className="flex flex-col overflow-hidden">
        <Hero/>
      </main>
      <Footer/>
    </div>
  );
}