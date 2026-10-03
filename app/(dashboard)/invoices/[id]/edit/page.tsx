"use client"

import { use, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon, Trash2Icon } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Customer = {
  id: string
  name: string
  company_name: string | null
}

type InvoiceItem = {
  id?: string
  item_date: string
  description: string
  quantity: string
  unit_price: string
}

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const router = useRouter()
  const supabase = createClient()

  const [businessId, setBusinessId] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])

  const [customerId, setCustomerId] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [reference, setReference] = useState("")

  const [gstRate, setGstRate] = useState(15)
  const [gstIncluded, setGstIncluded] = useState(true)

  const [status, setStatus] =
    useState<"paid" | "unpaid">("unpaid")

  const [notes, setNotes] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")

  const [items, setItems] = useState<InvoiceItem[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [message, setMessage] = useState("")
  const [messageType, setMessageType] =
    useState<"error" | "success">("error")

  useEffect(() => {
    loadInvoice()
  }, [id])

  const showError = (errorMessage: string) => {
    setMessage(errorMessage)
    setMessageType("error")

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 100)
  }

  const loadInvoice = async () => {
    setLoading(true)
    setMessage("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      showError("You must be logged in.")
      setLoading(false)
      return
    }

    // Find logged-in user's business
    const { data: business, error: businessError } =
      await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

    if (businessError || !business) {
      showError(
        businessError?.message ||
          "Business profile not found."
      )
      setLoading(false)
      return
    }

    setBusinessId(business.id)

    // Load customers
    const { data: customerData, error: customerError } =
      await supabase
        .from("customers")
        .select("id, name, company_name")
        .eq("business_id", business.id)
        .order("name")

    if (customerError) {
      showError(customerError.message)
      setLoading(false)
      return
    }

    setCustomers(customerData || [])

    // Load invoice + invoice items
    const { data: invoice, error: invoiceError } =
      await supabase
        .from("invoices")
        .select(`
          *,
          invoice_items (
            id,
            item_date,
            description,
            quantity,
            unit_price,
            sort_order
          )
        `)
        .eq("id", id)
        .eq("business_id", business.id)
        .single()

    if (invoiceError || !invoice) {
      showError(
        invoiceError?.message || "Invoice not found."
      )
      setLoading(false)
      return
    }

    setCustomerId(invoice.customer_id)
    setInvoiceNumber(invoice.invoice_number)
    setInvoiceDate(invoice.invoice_date)
    setDueDate(invoice.due_date || "")
    setReference(invoice.reference || "")

    setGstRate(Number(invoice.gst_rate))
    setGstIncluded(Boolean(invoice.gst_included))

    setStatus(
      invoice.status === "paid" ? "paid" : "unpaid"
    )

    setNotes(invoice.notes || "")
    setPaymentNotes(invoice.payment_notes || "")

    const sortedItems = [...(invoice.invoice_items || [])]
      .sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0)
      )
      .map((item) => ({
        id: item.id,
        item_date: item.item_date || "",
        description: item.description || "",
        quantity: String(item.quantity ?? ""),
        unit_price: String(item.unit_price ?? ""),
      }))

    // Always keep at least one item row
    setItems(
      sortedItems.length > 0
        ? sortedItems
        : [
            {
              item_date: "",
              description: "",
              quantity: "",
              unit_price: "",
            },
          ]
    )

    setLoading(false)
  }

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string
  ) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    )
  }

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        item_date: "",
        description: "",
        quantity: "",
        unit_price: "",
      },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return

    setItems((currentItems) =>
      currentItems.filter(
        (_, itemIndex) => itemIndex !== index
      )
    )
  }

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0
      const unitPrice = Number(item.unit_price) || 0

      return total + quantity * unitPrice
    }, 0)
  }, [items])

  const gstAmount = useMemo(() => {
    if (gstIncluded) {
      return subtotal - subtotal / (1 + gstRate / 100)
    }

    return subtotal * (gstRate / 100)
  }, [subtotal, gstRate, gstIncluded])

  const total = gstIncluded
    ? subtotal
    : subtotal + gstAmount

  const handleUpdate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setMessage("")

    if (!businessId) {
      showError("Business profile not found.")
      return
    }

    if (!customerId) {
      showError("Please select a customer.")
      return
    }

    if (!invoiceDate) {
      showError("Invoice date is required.")
      return
    }

    if (items.length === 0) {
      showError(
        "Please add at least one invoice item."
      )
      return
    }

    const invalidItem = items.some((item) => {
      const quantity = Number(item.quantity)
      const unitPrice = Number(item.unit_price)

      return (
        !item.description.trim() ||
        !item.quantity.trim() ||
        !item.unit_price.trim() ||
        quantity <= 0 ||
        unitPrice < 0
      )
    })

    if (invalidItem) {
      showError(
        "Each item needs a description, quantity greater than 0, and a valid unit price."
      )
      return
    }

    if (gstRate < 0) {
      showError("GST rate cannot be negative.")
      return
    }

    setSaving(true)

    // Update invoice
    const { error: invoiceError } = await supabase
      .from("invoices")
      .update({
        customer_id: customerId,
        invoice_date: invoiceDate,
        due_date: dueDate || null,
        reference: reference.trim() || null,

        subtotal,
        gst_rate: gstRate,
        gst_included: gstIncluded,
        gst_amount: gstAmount,
        discount: 0,
        total,

        status,

        notes: notes.trim() || null,
        payment_notes:
          paymentNotes.trim() || null,
      })
      .eq("id", id)
      .eq("business_id", businessId)

    if (invoiceError) {
      showError(invoiceError.message)
      setSaving(false)
      return
    }

    // Delete existing invoice items
    const { error: deleteError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id)

    if (deleteError) {
      showError(deleteError.message)
      setSaving(false)
      return
    }

    // Prepare updated invoice items
    const newItems = items.map(
      (item, index) => {
        const quantity =
          Number(item.quantity) || 0

        const unitPrice =
          Number(item.unit_price) || 0

        return {
          invoice_id: id,
          item_date: item.item_date || null,
          description: item.description.trim(),
          quantity,
          unit_price: unitPrice,
          amount: quantity * unitPrice,
          sort_order: index,
        }
      }
    )

    // Insert updated invoice items
    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(newItems)

    if (itemsError) {
      showError(itemsError.message)
      setSaving(false)
      return
    }

    setSaving(false)

    router.push(`/invoices/${id}`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading invoice...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Edit Invoice
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update invoice details and items.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={
            messageType === "error"
              ? "mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              : "mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
          }
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleUpdate}
        className="space-y-8"
      >
        {/* Customer + Invoice Details */}
        <div className="grid gap-6 rounded-xl border p-6 md:grid-cols-2">
          {/* Customer */}
          <div className="space-y-2">
            <Label>Customer *</Label>

            <select
              value={customerId}
              onChange={(e) =>
                setCustomerId(e.target.value)
              }
              className="h-10 w-full rounded-md border bg-transparent px-3 text-sm"
            >
              <option value="">
                Select customer
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.company_name ||
                    customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Number */}
          <div className="space-y-2">
            <Label>Invoice Number</Label>

            <Input
              value={invoiceNumber}
              readOnly
              className="bg-muted"
            />
          </div>

          {/* Invoice Date */}
          <div className="space-y-2">
            <Label>Invoice Date *</Label>

            <Input
              type="date"
              value={invoiceDate}
              onChange={(e) =>
                setInvoiceDate(e.target.value)
              }
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>

            <Input
              type="date"
              value={dueDate}
              onChange={(e) =>
                setDueDate(e.target.value)
              }
            />
          </div>

          {/* Reference */}
          <div className="space-y-2 md:col-span-2">
            <Label>Reference</Label>

            <Input
              value={reference}
              onChange={(e) =>
                setReference(e.target.value)
              }
              placeholder="e.g. Purchase order or customer reference"
            />
          </div>
        </div>

        {/* Invoice Items */}
        <div className="rounded-xl border p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Invoice Items
            </h2>

            <Button
              type="button"
              variant="outline"
              onClick={addItem}
            >
              <PlusIcon className="mr-2 size-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const quantity =
                Number(item.quantity) || 0

              const unitPrice =
                Number(item.unit_price) || 0

              const amount =
                quantity * unitPrice

              return (
                <div
                  key={index}
                  className="grid items-end gap-3 rounded-lg border p-4 xl:grid-cols-[145px_1fr_100px_130px_130px_50px]"
                >
                  {/* Date */}
                  <div className="space-y-2">
                    <Label>
                      Date
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        Optional
                      </span>
                    </Label>

                    <Input
                      type="date"
                      value={item.item_date}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "item_date",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label>
                      Description *
                    </Label>

                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Design services"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label>Qty *</Label>

                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      placeholder="e.g. 2"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="space-y-2">
                    <Label>
                      Unit Price *
                    </Label>

                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "unit_price",
                          e.target.value
                        )
                      }
                      placeholder="e.g. 50.00"
                    />
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label>Amount</Label>

                    <Input
                      value={`$${amount.toFixed(
                        2
                      )}`}
                      disabled
                    />
                  </div>

                  {/* Delete */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Remove item"
                    onClick={() =>
                      removeItem(index)
                    }
                    disabled={items.length === 1}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>

        {/* GST */}
        <div className="grid gap-6 rounded-xl border p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>GST Rate (%)</Label>

            <Input
              type="number"
              min="0"
              step="0.01"
              value={gstRate}
              onChange={(e) =>
                setGstRate(
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="gstIncluded"
              type="checkbox"
              checked={gstIncluded}
              onChange={(e) =>
                setGstIncluded(
                  e.target.checked
                )
              }
              className="size-4"
            />

            <Label htmlFor="gstIncluded">
              Prices include GST
            </Label>
          </div>
        </div>

        {/* Payment Status */}
        <div className="rounded-xl border p-6">
          <Label className="mb-4 block">
            Payment Status
          </Label>

          <div className="flex items-center gap-8">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="status"
                value="unpaid"
                checked={status === "unpaid"}
                onChange={() =>
                  setStatus("unpaid")
                }
                className="size-4"
              />

              <span>Unpaid</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="status"
                value="paid"
                checked={status === "paid"}
                onChange={() =>
                  setStatus("paid")
                }
                className="size-4"
              />

              <span>Paid</span>
            </label>
          </div>
        </div>

        {/* Totals */}
        <div className="ml-auto max-w-sm space-y-3 rounded-xl border p-6">
          <div className="flex justify-between">
            <span>Subtotal</span>

            <span>
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>
              {gstIncluded
                ? `Includes GST (${gstRate}%)`
                : `GST (${gstRate}%)`}
            </span>

            <span>
              ${gstAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span>

            <span>
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Notes</Label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              className="min-h-24 w-full rounded-md border bg-transparent p-3 text-sm"
              placeholder="e.g. Thank you for your business."
            />
          </div>

          <div className="space-y-2">
            <Label>
              Payment Notes
            </Label>

            <textarea
              value={paymentNotes}
              onChange={(e) =>
                setPaymentNotes(
                  e.target.value
                )
              }
              className="min-h-24 w-full rounded-md border bg-transparent p-3 text-sm"
              placeholder="e.g. Please make payment to the bank account shown on the invoice."
            />
          </div>
        </div>

        {/* Update */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Updating Invoice..."
              : "Update Invoice"}
          </Button>
        </div>
      </form>
    </div>
  )
}