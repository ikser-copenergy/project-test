import type { Metadata } from "next";
import "./globals.css";
import { PlanProvider } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Nav } from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "Meal planner",
  description: "Weekly meal planning for families",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PlanProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <Nav />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </PlanProvider>
      </body>
    </html>
  );
}
