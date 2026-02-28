import { PlanProvider } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Nav } from "@/components/layout/Nav";

export default function MealPlanerLayout({
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
