import { PlanProvider } from "@/lib/store";
import { Header } from "@/components/meal-planer/layout/Header";
import { Nav } from "@/components/meal-planer/layout/Nav";

export default function PlanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PlanProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Nav />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </PlanProvider>
  );
}
