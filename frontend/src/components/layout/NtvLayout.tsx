import { Outlet } from '@tanstack/react-router';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { NtvSidebar } from '@/components/layout/NtvSidebar';

export function NtvLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <NtvSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
