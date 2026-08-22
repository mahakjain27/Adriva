import { Outlet } from "react-router"
import { AdminAccessGate } from "@/features/auth"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Topbar } from "./Topbar"

export function DashboardLayout() {
  return (
    <AdminAccessGate>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Topbar />
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminAccessGate>
  )
}
