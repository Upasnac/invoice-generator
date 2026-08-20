"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, PrinterIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { Button, buttonVariants } from "@/components/ui/button";
type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  sort_order: number;
};

type Invoice = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  reference: string | null;
  subtotal: number;
  gst_rate: number;
  gst_amount: number;
  gst_included: boolean;
  total: number;
  status: string;
  notes: string | null;
  payment_notes: string | null;

  businesses: {
    business_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    gst_number: string | null;
    bank_name: string | null;
    bank_account_name: string | null;
    bank_account_number: string | null;
  } | null;

  customers: {
    name: string;
    company_name: string | null;
    email: string | null;
    phone: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    postcode: string | null;
    country: string | null;
  } | null;

  invoice_items: InvoiceItem[];
};

export default function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const supabase = createClient();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
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
          description,
          quantity,
          unit_price,
          amount,
          sort_order
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      setMessage(error.message);
    } else {
      const invoiceData = data as unknown as Invoice;

      invoiceData.invoice_items =
        invoiceData.invoice_items?.sort(
          (a, b) => a.sort_order - b.sort_order,
        ) || [];

      setInvoice(invoiceData);
    }

    setLoading(false);
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: "NZD",
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-NZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  };

  if (loading) {
    return <div className="p-6">Loading invoice...</div>;
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <p>{message || "Invoice not found."}</p>
      </div>
    );
  }

  const business = invoice.businesses;
  const customer = invoice.customers;

  const handlePrint = () => {
    const customerName =
      invoice.customers?.company_name || invoice.customers?.name || "Customer";

    const safeCustomerName = customerName
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-");

    const oldTitle = document.title;

    document.title = `Invoice-${invoice.invoice_number}-${safeCustomerName}`;

    window.print();

    document.title = oldTitle;
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      {/* Page controls */}
      <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between print:hidden">
        <Link
          href="/invoices"
          className={buttonVariants({
            variant: "outline",
          })}
        >
          <ArrowLeftIcon className="mr-2 size-4" />
          Back to Invoices
        </Link>
        <Link
          href={`/invoices/${invoice.id}/edit`}
          className={buttonVariants({
            variant: "outline",
          })}
        >
          Edit Invoice
        </Link>
        <Button onClick={handlePrint}>
          <PrinterIcon className="mr-2 size-4" />
          Print / Save PDF
        </Button>
      </div>

      {/* Invoice */}

      <div className="invoice-print-area mx-auto max-w-5xl bg-white p-8 shadow-sm md:p-12">
        {/* Top */}
        <div className="flex flex-col justify-between gap-8 border-b pb-8 md:flex-row">
          <div>
            <h1 className="text-3xl font-bold">
              {business?.business_name || "Business"}
            </h1>

            <div className="mt-3 space-y-1 text-sm text-gray-600">
              {business?.address && <p>{business.address}</p>}

              {business?.phone && <p>{business.phone}</p>}

              {business?.email && <p>{business.email}</p>}

              {business?.gst_number && <p>GST Number: {business.gst_number}</p>}
            </div>
          </div>

          <div className="md:text-right">
            <h2 className="text-4xl font-light tracking-wide">TAX INVOICE</h2>

            <p className="mt-3 font-semibold">{invoice.invoice_number}</p>

            {/* <p className="mt-1 text-sm text-gray-600">
              Status:{" "}
              <span className="capitalize">
                {invoice.status}
              </span>
            </p> */}
          </div>
        </div>

        {/* Customer + dates */}
        <div className="invoice-meta grid gap-8 py-8 md:grid-cols-2">
          {" "}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Bill To
            </p>

            <p className="font-semibold">
              {customer?.company_name || customer?.name}
            </p>

            {customer?.company_name && customer?.name && (
              <p className="text-sm">{customer.name}</p>
            )}

            <div className="mt-2 text-sm text-gray-600">
              {customer?.address_line1 && <p>{customer.address_line1}</p>}

              {customer?.address_line2 && <p>{customer.address_line2}</p>}

              {(customer?.city || customer?.postcode) && (
                <p>
                  {customer.city} {customer.postcode}
                </p>
              )}

              {customer?.country && <p>{customer.country}</p>}
            </div>
          </div>
          <div className="space-y-2 text-sm md:ml-auto md:min-w-72">
            <div className="flex justify-between gap-8">
              <span className="text-gray-500">Invoice Date</span>

              <span>{formatDate(invoice.invoice_date)}</span>
            </div>

            <div className="flex justify-between gap-8">
              <span className="text-gray-500">Due Date</span>

              <span>{formatDate(invoice.due_date)}</span>
            </div>

            {invoice.reference && (
              <div className="flex justify-between gap-8">
                <span className="text-gray-500">Reference</span>

                <span>{invoice.reference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Description</th>

                <th className="px-4 py-3 text-right">Qty</th>

                <th className="px-4 py-3 text-right">Unit Price</th>

                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {invoice.invoice_items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">{item.description}</td>

                  <td className="px-4 py-3 text-right">{item.quantity}</td>

                  <td className="px-4 py-3 text-right">
                    {formatMoney(item.unit_price)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {formatMoney(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-8 ml-auto max-w-sm space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>

            <span>{formatMoney(invoice.subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>
              {invoice.gst_included
                ? `Includes GST (${invoice.gst_rate}%)`
                : `GST (${invoice.gst_rate}%)`}
            </span>

            <span>{formatMoney(invoice.gst_amount)}</span>
          </div>

          <div className="flex justify-between border-t pt-3 text-xl font-bold">
            <span>Total NZD</span>

            <span>{formatMoney(invoice.total)}</span>
          </div>
        </div>

        {/* Payment details */}
        {(business?.bank_name ||
          business?.bank_account_name ||
          business?.bank_account_number) && (
          <div className="mt-12 border-t pt-6">
            <h3 className="font-semibold">Payment Details</h3>

            <div className="mt-3 space-y-1 text-sm text-gray-600">
              {business.bank_name && <p>Bank: {business.bank_name}</p>}

              {business.bank_account_name && (
                <p>Account Name: {business.bank_account_name}</p>
              )}

              {business.bank_account_number && (
                <p>Account Number: {business.bank_account_number}</p>
              )}
            </div>
          </div>
        )}

        {invoice.payment_notes && (
          <div className="mt-6">
            <h3 className="font-semibold">Payment Notes</h3>

            <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
              {invoice.payment_notes}
            </p>
          </div>
        )}

        {invoice.notes && (
          <div className="mt-6">
            <h3 className="font-semibold">Notes</h3>

            <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
              {invoice.notes}
            </p>
          </div>
        )}
        <div className="mt-6 border-t pt-4 text-center text-sm text-gray-500">
          Thank you for your business.
        </div>
      </div>
    </div>
  );
}
