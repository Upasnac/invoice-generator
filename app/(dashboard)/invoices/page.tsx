"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button, buttonVariants } from "@/components/ui/button"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Invoice = {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string | null
  total: number
  status: "paid" | "unpaid"

  customers: {
    name: string
    company_name: string | null
  } | null
}

export default function InvoicesPage() {
  const supabase = createClient()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    setLoading(true)
    setMessage("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage("You must be logged in.")
      setLoading(false)
      return
    }

    // Find logged-in user's business
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (businessError || !business) {
      setMessage(
        businessError?.message || "Business profile not found."
      )
      setLoading(false)
      return
    }

    // Load invoices
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        invoice_date,
        due_date,
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

    if (error) {
      setMessage(error.message)
      setInvoices([])
    } else {
      setInvoices((data ?? []) as unknown as Invoice[])
    }

    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice? This action cannot be undone."
    )

    if (!confirmed) return

    setMessage("")

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id)

    if (error) {
      setMessage(error.message)
      return
    }

    await loadInvoices()
  }

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: "NZD",
    }).format(Number(value))
  }

  const formatDate = (date: string | null) => {
    if (!date) return "—"

    return new Intl.DateTimeFormat("en-NZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`))
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Invoices
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View and manage your invoices.
          </p>
        </div>

        <Link
          href="/invoices/new"
          className={buttonVariants()}
        >
          <PlusIcon className="mr-2 size-4" />
          New Invoice
        </Link>
      </div>

      {/* Error Message */}
      {message && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {message}
        </div>
      )}

      {/* Invoice Table */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>

              <TableHead>Customer</TableHead>

              <TableHead>Invoice Date</TableHead>

              <TableHead>Due Date</TableHead>

              <TableHead>Total</TableHead>

              <TableHead>Status</TableHead>

              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-28 text-center text-muted-foreground"
                >
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-28 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-muted-foreground">
                      No invoices yet.
                    </p>

                    <Link
                      href="/invoices/new"
                      className={buttonVariants({
                        variant: "outline",
                      })}
                    >
                      <PlusIcon className="mr-2 size-4" />
                      Create your first invoice
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  {/* Invoice Number */}
                  <TableCell className="font-semibold">
                    {invoice.invoice_number}
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    {invoice.customers?.company_name ||
                      invoice.customers?.name ||
                      "—"}
                  </TableCell>

                  {/* Invoice Date */}
                  <TableCell>
                    {formatDate(invoice.invoice_date)}
                  </TableCell>

                  {/* Due Date */}
                  <TableCell>
                    {formatDate(invoice.due_date)}
                  </TableCell>

                  {/* Total */}
                  <TableCell className="font-medium">
                    {formatMoney(invoice.total)}
                  </TableCell>

                  {/* Payment Status */}
                  <TableCell>
                    <span
                      className={
                        invoice.status === "paid"
                          ? "inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                          : "inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                      }
                    >
                      {invoice.status === "paid"
                        ? "Paid"
                        : "Unpaid"}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {/* View */}
                      <Link
                        href={`/invoices/${invoice.id}`}
                        title="View invoice"
                        className={buttonVariants({
                          variant: "outline",
                          size: "icon",
                        })}
                      >
                        <EyeIcon className="size-4" />
                      </Link>

                      {/* Edit */}
                      <Link
                        href={`/invoices/${invoice.id}/edit`}
                        title="Edit invoice"
                        className={buttonVariants({
                          variant: "outline",
                          size: "icon",
                        })}
                      >
                        <PencilIcon className="size-4" />
                      </Link>

                      {/* Delete */}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Delete invoice"
                        onClick={() =>
                          handleDelete(invoice.id)
                        }
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}