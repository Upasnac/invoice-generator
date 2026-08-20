"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pathname === "/dashboard") {
      return "Dashboard"
    }

    if (pathname === "/invoices") {
      return "Invoices"
    }

    if (pathname === "/invoices/new") {
      return "Create Invoice"
    }

    if (
      pathname.startsWith("/invoices/") &&
      pathname.endsWith("/edit")
    ) {
      return "Edit Invoice"
    }

    if (pathname.startsWith("/invoices/")) {
      return "Invoice"
    }

    if (pathname === "/customers") {
      return "Customers"
    }

    if (pathname === "/settings") {
      return "Business Profile"
    }

    return "Invoice Generator"
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />

        <h1 className="text-base font-medium">
          {getPageTitle()}
        </h1>
      </div>
    </header>
  )
}