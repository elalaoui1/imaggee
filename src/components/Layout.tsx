import { ReactNode } from "react";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Desktop Layout with Ad Sidebars */}
      <div className="hidden lg:grid lg:grid-cols-[100px_1fr_100px] gap-6 px-6 pb-6">
        {/* Left Ad Space - Hidden but layout preserved */}
        <aside className="sticky top-24 h-[600px] glass rounded-2xl flex items-center justify-center opacity-0 pointer-events-none">
          <div className="text-muted-foreground text-sm text-center p-4">
            Ad Space
            <br />
            160x600
          </div>
        </aside>

        {/* Main Content */}
        <main className="max-w-7xl w-full mx-auto">{children}</main>

        {/* Right Ad Space - Hidden but layout preserved */}
        <aside className="sticky top-24 h-[600px] glass rounded-2xl flex items-center justify-center opacity-0 pointer-events-none">
          <div className="text-muted-foreground text-sm text-center p-4">
            Ad Space
            <br />
            160x600
          </div>
        </aside>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden">        
        <main className="max-w-3xl mx-auto p-4 pb-8">{children}</main>
      </div>
    </div>
  );
};