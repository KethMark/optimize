import { MainNav } from "@/components/navigation/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Information({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto flex min-h-screen border-r">
      <MainNav />
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="block lg:hidden mb-6">
            <Link href='/'>
              <Button>Back</Button>
            </Link>
          </div>
        <div className="mx-auto max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  );
}
