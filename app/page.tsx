import Calculator from "@/components/calculator";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <Header />
      <Calculator />
      <Toaster />
    </main>
  );
}
