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
      <div className="lg:hidden">
        {/* Compact Top Ad Banner - Mobile Only */}
        <div className="sticky top-0 z-40 h-12 glass-subtle border-b border-border/50 flex items-center justify-center">
          <div className="text-muted-foreground text-xs">Ad Banner 320x50</div>
        </div>
        
        <main className="max-w-3xl mx-auto p-4 pb-24">{children}</main>
      </div>
    </div>
  );
};
