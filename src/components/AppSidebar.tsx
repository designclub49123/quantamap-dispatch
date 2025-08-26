
import { Home, BarChart3, Upload, Users, MapPin, Settings, History, Truck } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Upload Orders",
    url: "/upload",
    icon: Upload,
  },
  {
    title: "Optimization Jobs",
    url: "/jobs",
    icon: BarChart3,
  },
  {
    title: "Job History",
    url: "/job-history",
    icon: History,
  },
  {
    title: "Partners",
    url: "/partners",
    icon: Users,
  },
  {
    title: "Live Map",
    url: "/map",
    icon: MapPin,
  },
  {
    title: "Driver App",
    url: "/driver",
    icon: Truck,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-bold bg-quantum-gradient bg-clip-text text-transparent">
          QuantumFleet
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <p className="text-xs text-muted-foreground">
          Quantum-powered fleet optimization
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
