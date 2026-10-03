"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Building2Icon,
  CircleDollarSignIcon,
  ClockIcon,
  FileTextIcon,
  PlusIcon,
  ReceiptTextIcon,
  UsersIcon,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

type Invoice = {
  id: string
  invoice_number: string
  invoice_date: string
  total: number
  status: "paid" | "unpaid"

  customers: {
    name: string
    company_name: string | null
  } | null
}

export default function DashboardPage() {
  const supabase = createClient()

  const [hasBusiness, setHasBusiness] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [message, setMessage] =
    useState("")

  const [invoices, setInvoices] =
    useState<Invoice[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    setMessage("")

    // Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    // Find user's business
    const {
      data: business,
      error: businessError,
    } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (businessError) {
      console.error(
        "Business check error:",
        businessError
      )

      setMessage(
        "Unable to load your business profile."
      )

      setLoading(false)
      return
    }

    if (!business) {
      setHasBusiness(false)
      setLoading(false)
      return
    }

    setHasBusiness(true)

    // Load invoices
    const {
      data: invoiceData,
      error: invoiceError,
    } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        invoice_date,
        total,
        status,
        customers (
          name,
          company_name
        )
      `)
      .eq("business_id", business.id)
      .order("created_at", {
        ascending: false,
      })

    if (invoiceError) {
      console.error(
        "Invoice load error:",
        invoiceError
      )

      setMessage(
        "Unable to load invoice statistics."
      )

      setInvoices([])
      setLoading(false)
      return
    }

    setInvoices(
      (invoiceData ?? []) as unknown as Invoice[]
    )

    setLoading(false)
  }

  // -------------------------
  // Dashboard calculations
  // -------------------------

  const totalInvoiced = invoices.reduce(
    (total, invoice) =>
      total + Number(invoice.total || 0),
    0
  )

  const totalPaid = invoices
    .filter(
      (invoice) =>
        invoice.status === "paid"
    )
    .reduce(
      (total, invoice) =>
        total + Number(invoice.total || 0),
      0
    )

  const totalUnpaid = invoices
    .filter(
      (invoice) =>
        invoice.status === "unpaid"
    )
    .reduce(
      (total, invoice) =>
        total + Number(invoice.total || 0),
      0
    )

  const paidCount = invoices.filter(
    (invoice) =>
      invoice.status === "paid"
  ).length

  const unpaidCount = invoices.filter(
    (invoice) =>
      invoice.status === "unpaid"
  ).length

  const recentInvoices =
    invoices.slice(0, 5)

  const formatMoney = (
    value: number
  ) => {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: "NZD",
    }).format(value)
  }

  const formatDate = (
    date: string
  ) => {
    return new Intl.DateTimeFormat(
      "en-NZ",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(
      new Date(`${date}T00:00:00`)
    )
  }

  // -------------------------
  // Loading
  // -------------------------

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-muted-foreground">
          Loading dashboard...
        </p>
      </div>
    )
  }

  // -------------------------
  // New user
  // -------------------------

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
            Add your business details before
            creating customers or invoices.
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

  // -------------------------
  // Dashboard
  // -------------------------

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-1 text-muted-foreground">
            Overview of your invoices and
            payments.
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <PlusIcon className="size-4" />

          Create Invoice
        </Link>
      </div>

      {/* Error */}
      {message && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {message}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Invoiced */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Invoiced
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {formatMoney(
                  totalInvoiced
                )}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {invoices.length}{" "}
                {invoices.length === 1
                  ? "invoice"
                  : "invoices"}
              </p>
            </div>

            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <ReceiptTextIcon className="size-5" />
            </div>
          </div>
        </div>

        {/* Paid */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Paid
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {formatMoney(totalPaid)}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {paidCount}{" "}
                {paidCount === 1
                  ? "invoice"
                  : "invoices"}
              </p>
            </div>

            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <CircleDollarSignIcon className="size-5" />
            </div>
          </div>
        </div>

        {/* Unpaid */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Unpaid
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {formatMoney(
                  totalUnpaid
                )}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {unpaidCount}{" "}
                {unpaidCount === 1
                  ? "invoice"
                  : "invoices"}
              </p>
            </div>

            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <ClockIcon className="size-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="mt-8 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">
              Recent Invoices
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Your latest invoice activity.
            </p>
          </div>

          <Link
            href="/invoices"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileTextIcon className="mx-auto mb-3 size-8 text-muted-foreground" />

            <p className="font-medium">
              No invoices yet
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Create your first invoice to
              see it here.
            </p>

            <Link
              href="/invoices/new"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <PlusIcon className="size-4" />

              Create Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Invoice #
                  </th>

                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Customer
                  </th>

                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>

                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                    Amount
                  </th>

                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentInvoices.map(
                  (invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b last:border-b-0 hover:bg-muted/30"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {
                            invoice.invoice_number
                          }
                        </Link>
                      </td>

                      <td className="px-6 py-4">
                        {invoice
                          .customers
                          ?.company_name ||
                          invoice
                            .customers
                            ?.name ||
                          "—"}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(
                          invoice.invoice_date
                        )}
                      </td>

                      <td className="px-6 py-4 text-right font-medium">
                        {formatMoney(
                          Number(
                            invoice.total
                          )
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            invoice.status ===
                            "paid"
                              ? "inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                              : "inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                          }
                        >
                          {invoice.status ===
                          "paid"
                            ? "Paid"
                            : "Unpaid"}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <FileTextIcon className="size-4" />

            View Invoices
          </Link>

          <Link
            href="/customers"
            className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <UsersIcon className="size-4" />

            Customers
          </Link>

          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <Building2Icon className="size-4" />

            Business Profile
          </Link>
        </div>
      </div>
    </div>
  )
}