import { PharmacyProvider } from "@/lib/pharmacy-store";
import { PharmacyHeader } from "@/components/pharmacy/PharmacyHeader";
import { PharmacyNav } from "@/components/pharmacy/PharmacyNav";

export default function PharmacyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PharmacyProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <PharmacyHeader />
        <PharmacyNav />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </PharmacyProvider>
  );
}
