"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Building2Icon,
  FileTextIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const supabase = createClient()

  const [hasBusiness, setHasBusiness] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkBusiness = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data: business, error } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Business check error:", error)
      }

      setHasBusiness(!!business)
      setLoading(false)
    }

    checkBusiness()
  }, [])

  // Loading
  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-muted-foreground">
          Loading dashboard...
        </p>
      </div>
    )
  }

  // NEW USER - No business profile
  if (!hasBusiness) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mx-auto mt-10 max-w-xl rounded-xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <Building2Icon className="size-6" />
          </div>

          <h1 className="text-2xl font-bold">
            Set up your business profile
          </h1>

          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Add your business details before creating customers
            or invoices.
          </p>

          <Link
            href="/settings"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <Building2Icon className="size-4" />
            Set Up Business Profile
          </Link>
        </div>
      </div>
    )
  }

  // EXISTING USER - Business profile exists
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>

        <p className="mt-1 text-muted-foreground">
          Manage your invoices and customers.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <PlusIcon className="size-4" />
          Create Invoice
        </Link>

        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium"
        >
          <FileTextIcon className="size-4" />
          View Invoices
        </Link>

        <Link
          href="/customers"
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium"
        >
          <UsersIcon className="size-4" />
          Customers
        </Link>
      </div>
    </div>
  )
}