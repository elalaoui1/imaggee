import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout with Ad Sidebars */}
      <div className="hidden lg:grid lg:grid-cols-[200px_1fr_200px] gap-6 p-6">
        {/* Left Ad Space */}
        <aside className="sticky top-6 h-[600px] glass rounded-2xl flex items-center justify-center">
          <div className="text-muted-foreground text-sm text-center p-4">
            Ad Space
            <br />
            160x600
          </div>
        </aside>

        {/* Main Content */}
        <main className="max-w-5xl w-full mx-auto">{children}</main>

        {/* Right Ad Space */}
        <aside className="sticky top-6 h-[600px] glass rounded-2xl flex items-center justify-center">
          <div className="text-muted-foreground text-sm text-center p-4">
            Ad Space
            <br />
            160x600
          </div>
        </aside>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden p-4 pb-20">
        <main className="max-w-3xl mx-auto">{children}</main>
        
        {/* Mobile Ad Banner */}
        <div className="fixed bottom-16 left-0 right-0 h-16 glass flex items-center justify-center">
          <div className="text-muted-foreground text-xs">Responsive Ad Banner</div>
        </div>
      </div>
    </div>
  );
};
