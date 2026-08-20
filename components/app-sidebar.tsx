"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  FileTextIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { NavMain } from "@/components/nav-main";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const basicNav = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Business Profile",
    url: "/settings",
    icon: Settings2Icon,
  },
];
const fullNav = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: FileTextIcon,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: UsersIcon,
  },
  {
    title: "Business Profile",
    url: "/settings",
    icon: Settings2Icon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const supabase = createClient();
  const pathname = usePathname();
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [hasBusiness, setHasBusiness] = React.useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserName(user.user_metadata?.full_name || "User");

      setUserEmail(user.email || "");

      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      setHasBusiness(!!business);
    };

    loadUser();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-sidebar-accent"
            >
              <FileTextIcon className="size-5" />

              <div className="flex flex-col">
                <span className="font-semibold">Invoice Generator</span>

                <span className="text-xs text-muted-foreground">
                  Invoice Manager
                </span>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={hasBusiness ? fullNav : basicNav} />{" "}
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="mb-2 px-3">
          <p className="text-sm font-semibold">{userName}</p>

          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="h-10 w-full gap-3 px-3"
            >
              <LogOutIcon className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
