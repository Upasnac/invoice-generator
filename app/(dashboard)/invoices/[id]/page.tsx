"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  PencilIcon,
  PrinterIcon,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import {
  Button,
  buttonVariants,
} from "@/components/ui/button"

type InvoiceItem = {
  id: string
  item_date: string | null
  description: string
  quantity: number
  unit_price: number
  amount: number
  sort_order: number
}

type Invoice = {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string | null
  reference: string | null

  subtotal: number
  gst_rate: number
  gst_amount: number
  gst_included: boolean
  total: number

  status: "paid" | "unpaid"

  notes: string | null
  payment_notes: string | null

  businesses: {
    business_name: string | null
    email: string | null
    phone: string | null
    address: string | null
    gst_number: string | null
    bank_name: string | null
    bank_account_name: string | null
    bank_account_number: string | null
  } | null

  customers: {
    name: string
    company_name: string | null
    email: string | null
    phone: string | null
    address_line1: string | null
    address_line2: string | null
    city: string | null
    postcode: string | null
    country: string | null
  } | null

  invoice_items: InvoiceItem[]
}

export default function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const supabase = createClient()

  const [invoice, setInvoice] =
    useState<Invoice | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [message, setMessage] =
    useState("")

  useEffect(() => {
    loadInvoice()
  }, [id])

  const loadInvoice = async () => {
    setLoading(true)
    setMessage("")

    // Check logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage("You must be logged in.")
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

    if (businessError || !business) {
      setMessage(
        businessError?.message ||
          "Business profile not found."
      )

      setLoading(false)
      return
    }

    // Load invoice
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        invoice_date,
        due_date,
        reference,

        subtotal,
        gst_rate,
        gst_amount,
        gst_included,
        total,

        status,
        notes,
        payment_notes,

        businesses (
          business_name,
          email,
          phone,
          address,
          gst_number,
          bank_name,
          bank_account_name,
          bank_account_number
        ),

        customers (
          name,
          company_name,
          email,
          phone,
          address_line1,
          address_line2,
          city,
          postcode,
          country
        ),

        invoice_items (
          id,
          item_date,
          description,
          quantity,
          unit_price,
          amount,
          sort_order
        )
      `)
      .eq("id", id)
      .eq("business_id", business.id)
      .single()

    if (error || !data) {
      setMessage(
        error?.message ||
          "Invoice not found."
      )

      setLoading(false)
      return
    }

    const invoiceData =
      data as unknown as Invoice

    invoiceData.invoice_items =
      invoiceData.invoice_items
        ?.sort(
          (a, b) =>
            (a.sort_order ?? 0) -
            (b.sort_order ?? 0)
        ) || []

    setInvoice(invoiceData)
    setLoading(false)
  }

  const formatMoney = (
    value: number
  ) => {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: "NZD",
    }).format(Number(value))
  }

  const formatDate = (
    date: string | null
  ) => {
    if (!date) return "—"

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

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading invoice...
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <p className="text-destructive">
          {message ||
            "Invoice not found."}
        </p>

        <Link
          href="/invoices"
          className={`${buttonVariants({
            variant: "outline",
          })} mt-4`}
        >
          <ArrowLeftIcon className="mr-2 size-4" />

          Back to Invoices
        </Link>
      </div>
    )
  }

  const business = invoice.businesses
  const customer = invoice.customers

  const customerName =
    customer?.company_name ||
    customer?.name ||
    "Customer"

  const handlePrint = () => {
    const safeCustomerName =
      customerName
        .replace(
          /[^a-zA-Z0-9]/g,
          "-"
        )
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

    const oldTitle = document.title

    document.title =
      `Invoice-${invoice.invoice_number}-${safeCustomerName}`

    window.print()

    setTimeout(() => {
      document.title = oldTitle
    }, 500)
  }

  return (
    <>
      {/* PRINT STYLES */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 8mm;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            font-size: 10px !important;
          }

          .invoice-page {
            min-height: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .invoice-print-area {
            width: 100% !important;
            max-width: none !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 5mm !important;
            box-shadow: none !important;
          }

          .screen-only {
            display: none !important;
          }

          .invoice-header {
            gap: 12px !important;
            padding-bottom: 12px !important;
          }

          .invoice-header h1 {
            font-size: 22px !important;
          }

          .invoice-title {
            font-size: 25px !important;
          }

          .invoice-meta {
            gap: 18px !important;
            padding-top: 14px !important;
            padding-bottom: 14px !important;
          }

          .invoice-items-table {
            break-inside: auto;
            page-break-inside: auto;
          }

          .invoice-items-table table {
            font-size: 9px !important;
          }

          .invoice-items-table th,
          .invoice-items-table td {
            padding-top: 5px !important;
            padding-bottom: 5px !important;
          }

          .invoice-item-row {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .invoice-totals {
            margin-top: 14px !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .invoice-payment {
            margin-top: 16px !important;
            padding-top: 12px !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .invoice-notes {
            margin-top: 12px !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .invoice-footer {
            margin-top: 14px !important;
            padding-top: 10px !important;
          }
        }
      `}</style>

      <div className="invoice-page min-h-screen bg-muted/30 p-4 sm:p-6">
        {/* PAGE CONTROLS - NEVER PRINT */}
        <div className="screen-only mx-auto mb-4 flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/invoices"
            className={buttonVariants({
              variant: "outline",
            })}
          >
            <ArrowLeftIcon className="mr-2 size-4" />

            Back to Invoices
          </Link>

          <div className="flex gap-2">
            <Link
              href={`/invoices/${invoice.id}/edit`}
              className={buttonVariants({
                variant: "outline",
              })}
            >
              <PencilIcon className="mr-2 size-4" />

              Edit Invoice
            </Link>

            <Button
              type="button"
              onClick={handlePrint}
            >
              <PrinterIcon className="mr-2 size-4" />

              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* INVOICE */}
        <div className="invoice-print-area mx-auto max-w-5xl bg-white p-8 text-gray-900 shadow-sm md:p-10">
          {/* HEADER */}
          <div className="invoice-header flex flex-col justify-between gap-6 border-b pb-6 md:flex-row">
            {/* Business */}
            <div>
              <h1 className="text-3xl font-bold">
                {business?.business_name ||
                  "Business"}
              </h1>

              <div className="mt-3 space-y-1 text-sm text-gray-600">
                {business?.address && (
                  <p>
                    {business.address}
                  </p>
                )}

                {business?.phone && (
                  <p>
                    Phone:{" "}
                    {business.phone}
                  </p>
                )}

                {business?.email && (
                  <p>
                    Email:{" "}
                    {business.email}
                  </p>
                )}

                {business?.gst_number && (
                  <p>
                    GST Number:{" "}
                    {business.gst_number}
                  </p>
                )}
              </div>
            </div>

            {/* Invoice title */}
            <div className="md:text-right">
              <h2 className="invoice-title text-3xl font-light tracking-wide">
                TAX INVOICE
              </h2>

              <p className="mt-3 font-semibold">
                Invoice Number:{" "}
                {invoice.invoice_number}
              </p>

              {/*
                STATUS BADGE

                Visible when viewing invoice.
                Hidden when printing / saving PDF.
              */}
              <div className="screen-only mt-3 md:flex md:justify-end">
                <span
                  className={
                    invoice.status === "paid"
                      ? "inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700"
                      : "inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700"
                  }
                >
                  {invoice.status ===
                  "paid"
                    ? "Paid"
                    : "Unpaid"}
                </span>
              </div>
            </div>
          </div>

          {/* CUSTOMER + INVOICE DETAILS */}
          <div className="invoice-meta grid gap-6 py-6 md:grid-cols-2">
            {/* Customer */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Bill To
              </p>

              <p className="font-semibold">
                {customerName}
              </p>

              {customer?.company_name &&
                customer?.name && (
                  <p className="text-sm">
                    {customer.name}
                  </p>
                )}

              <div className="mt-2 space-y-1 text-sm text-gray-600">
                {customer?.address_line1 && (
                  <p>
                    {
                      customer.address_line1
                    }
                  </p>
                )}

                {customer?.address_line2 && (
                  <p>
                    {
                      customer.address_line2
                    }
                  </p>
                )}

                {(customer?.city ||
                  customer?.postcode) && (
                  <p>
                    {customer.city}

                    {customer.city &&
                    customer.postcode
                      ? " "
                      : ""}

                    {customer.postcode}
                  </p>
                )}

                {customer?.country && (
                  <p>
                    {customer.country}
                  </p>
                )}

                {customer?.email && (
                  <p>
                    {customer.email}
                  </p>
                )}

                {customer?.phone && (
                  <p>
                    {customer.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Invoice information */}
            <div className="space-y-2 text-sm md:ml-auto md:min-w-72">
              <div className="flex justify-between gap-8">
                <span className="text-gray-500">
                  Invoice Date
                </span>

                <span>
                  {formatDate(
                    invoice.invoice_date
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-8">
                <span className="text-gray-500">
                  Due Date
                </span>

                <span>
                  {formatDate(
                    invoice.due_date
                  )}
                </span>
              </div>

              {invoice.reference && (
                <div className="flex justify-between gap-8">
                  <span className="text-gray-500">
                    Reference
                  </span>

                  <span className="max-w-48 text-right">
                    {invoice.reference}
                  </span>
                </div>
              )}

              {/*
                STATUS ROW

                Visible on website.
                Hidden from Print/PDF.
              */}
              <div className="screen-only flex justify-between gap-8">
                <span className="text-gray-500">
                  Status
                </span>

                <span className="font-medium">
                  {invoice.status ===
                  "paid"
                    ? "Paid"
                    : "Unpaid"}
                </span>
              </div>
            </div>
          </div>

          {/* ITEMS */}
          <div className="invoice-items-table overflow-hidden rounded-md border">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-[16%] px-3 py-2.5 text-left">
                    Date
                  </th>

                  <th className="w-[36%] px-3 py-2.5 text-left">
                    Description
                  </th>

                  <th className="w-[10%] px-3 py-2.5 text-right">
                    Qty
                  </th>

                  <th className="w-[18%] px-3 py-2.5 text-right">
                    Unit Price
                  </th>

                  <th className="w-[20%] px-3 py-2.5 text-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {invoice.invoice_items.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="invoice-item-row border-t"
                    >
                      <td className="whitespace-nowrap px-3 py-2.5">
                        {item.item_date
                          ? formatDate(
                              item.item_date
                            )
                          : "—"}
                      </td>

                      <td className="break-words px-3 py-2.5">
                        {
                          item.description
                        }
                      </td>

                      <td className="px-3 py-2.5 text-right">
                        {item.quantity}
                      </td>

                      <td className="px-3 py-2.5 text-right">
                        {formatMoney(
                          item.unit_price
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-right font-medium">
                        {formatMoney(
                          item.amount
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* TOTALS */}
          <div className="invoice-totals mt-6 ml-auto max-w-sm space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Subtotal
              </span>

              <span>
                {formatMoney(
                  invoice.subtotal
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>
                {invoice.gst_included
                  ? `Includes GST (${invoice.gst_rate}%)`
                  : `GST (${invoice.gst_rate}%)`}
              </span>

              <span>
                {formatMoney(
                  invoice.gst_amount
                )}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3 text-xl font-bold">
              <span>
                Total NZD
              </span>

              <span>
                {formatMoney(
                  invoice.total
                )}
              </span>
            </div>
          </div>

          {/* PAYMENT DETAILS */}
          {(business?.bank_name ||
            business?.bank_account_name ||
            business?.bank_account_number) && (
            <div className="invoice-payment mt-8 border-t pt-5">
              <h3 className="font-semibold">
                Payment Details
              </h3>

              <div className="mt-2 space-y-1 text-sm text-gray-600">
                {business.bank_name && (
                  <p>
                    <span className="font-medium text-gray-700">
                      Bank:
                    </span>{" "}
                    {business.bank_name}
                  </p>
                )}

                {business.bank_account_name && (
                  <p>
                    <span className="font-medium text-gray-700">
                      Account Name:
                    </span>{" "}
                    {
                      business.bank_account_name
                    }
                  </p>
                )}

                {business.bank_account_number && (
                  <p>
                    <span className="font-medium text-gray-700">
                      Account Number:
                    </span>{" "}
                    {
                      business.bank_account_number
                    }
                  </p>
                )}
              </div>
            </div>
          )}

          {/* PAYMENT NOTES */}
          {invoice.payment_notes && (
            <div className="invoice-notes mt-5">
              <h3 className="font-semibold">
                Payment Notes
              </h3>

              <p className="mt-1 whitespace-pre-line text-sm text-gray-600">
                {
                  invoice.payment_notes
                }
              </p>
            </div>
          )}

          {/* NOTES */}
          {invoice.notes && (
            <div className="invoice-notes mt-5">
              <h3 className="font-semibold">
                Notes
              </h3>

              <p className="mt-1 whitespace-pre-line text-sm text-gray-600">
                {invoice.notes}
              </p>
            </div>
          )}

          {/* FOOTER */}
          <div className="invoice-footer mt-6 border-t pt-4 text-center text-sm text-gray-500">
            Thank you for your business.
          </div>
        </div>
      </div>
    </>
  )
}