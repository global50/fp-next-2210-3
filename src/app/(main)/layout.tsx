import { Header } from "@/../apps/header/Header";
import { Navigation } from "@/../apps/navigation/Navigation";
import { MobileNav } from "@/../apps/mobileNav/MobileNav";
import { Chats } from "@/../apps/chats/Chats";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full flex flex-col bg-background text-foreground overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Navigation />
        <main className="flex-1 p-4 overflow-y-auto lg:flex-1">
          {children}
        </main>
        <div className="hidden lg:block p-4">
          <Chats />
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
