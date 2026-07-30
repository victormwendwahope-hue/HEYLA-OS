import { Outlet } from '@tanstack/react-router';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TopBar } from '@/components/layout/TopBar';

export function NtvLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
