import { Outlet } from '@tanstack/react-router';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { NtvSidebar } from '@/components/layout/NtvSidebar';

export function NtvLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <TopBar />
        <div className="flex-1 flex">
          <NtvSidebar />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
