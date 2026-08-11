import { Building2, LayoutDashboard, Library, Palette, Settings, Users } from "lucide-react"
import { NavLink, useLocation } from "react-router"
import adrivaLogo from "@/assets/adriva-logo-transparent.png"
import { ICON_SIZE, ICON_STROKE_WIDTH } from "@/lib/icons"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/companies", label: "Companies", icon: Building2 },
  { to: "/dashboard/employees", label: "Employees", icon: Users },
  { to: "/dashboard/themes", label: "Themes", icon: Palette },
  { to: "/dashboard/theme-library", label: "Theme Library", icon: Library },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const

export function AppSidebar() {
  const { pathname } = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <img src={adrivaLogo} alt="Adriva" className="h-6 w-auto shrink-0" />
          <span className="truncate text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Adriva
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = "end" in item && item.end
                  ? pathname === item.to
                  : pathname.startsWith(item.to)

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
                      <NavLink to={item.to} end={"end" in item ? item.end : false}>
                        <item.icon size={ICON_SIZE.md} strokeWidth={ICON_STROKE_WIDTH} />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
