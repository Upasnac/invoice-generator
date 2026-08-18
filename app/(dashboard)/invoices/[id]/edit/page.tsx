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
  description: string
  quantity: number
  unit_price: number
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

  const [notes, setNotes] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")

  const [items, setItems] = useState<InvoiceItem[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadInvoice()
  }, [id])

  const loadInvoice = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage("You must be logged in.")
      setLoading(false)
      return
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!business) {
      setMessage("Business profile not found.")
      setLoading(false)
      return
    }

    setBusinessId(business.id)

    const { data: customerData } = await supabase
      .from("customers")
      .select("id, name, company_name")
      .eq("business_id", business.id)
      .order("name")

    setCustomers(customerData || [])

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(`
        *,
        invoice_items (
          id,
          description,
          quantity,
          unit_price,
          sort_order
        )
      `)
      .eq("id", id)
      .single()

    if (error || !invoice) {
      setMessage(error?.message || "Invoice not found.")
      setLoading(false)
      return
    }

    setCustomerId(invoice.customer_id)
    setInvoiceNumber(invoice.invoice_number)
    setInvoiceDate(invoice.invoice_date)
    setDueDate(invoice.due_date || "")
    setReference(invoice.reference || "")
    setGstRate(Number(invoice.gst_rate))
    setGstIncluded(invoice.gst_included)
    setNotes(invoice.notes || "")
    setPaymentNotes(invoice.payment_notes || "")

    const sortedItems = [...(invoice.invoice_items || [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      }))

    setItems(sortedItems)

    setLoading(false)
  }

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string
  ) => {
    const updated = [...items]

    if (field === "description") {
      updated[index].description = value
    } else if (field === "quantity") {
      updated[index].quantity = Number(value)
    } else if (field === "unit_price") {
      updated[index].unit_price = Number(value)
    }

    setItems(updated)
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        unit_price: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return

    setItems(items.filter((_, i) => i !== index))
  }

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + item.quantity * item.unit_price,
      0
    )
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!businessId || !customerId) {
      setMessage("Business or customer missing.")
      return
    }

    setSaving(true)
    setMessage("")

    const { error: invoiceError } = await supabase
      .from("invoices")
      .update({
        customer_id: customerId,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate || null,
        reference: reference || null,
        subtotal,
        gst_rate: gstRate,
        gst_included: gstIncluded,
        gst_amount: gstAmount,
        total,
        notes: notes || null,
        payment_notes: paymentNotes || null,
      })
      .eq("id", id)

    if (invoiceError) {
      setMessage(invoiceError.message)
      setSaving(false)
      return
    }

    // For MVP: delete old items and insert current items again
    const { error: deleteError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id)

    if (deleteError) {
      setMessage(deleteError.message)
      setSaving(false)
      return
    }

    const newItems = items.map((item, index) => ({
      invoice_id: id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price,
      sort_order: index,
    }))

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(newItems)

    if (itemsError) {
      setMessage(itemsError.message)
      setSaving(false)
      return
    }

    setSaving(false)

    router.push(`/invoices/${id}`)
    router.refresh()
  }

  if (loading) {
    return <div className="p-6">Loading invoice...</div>
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Edit Invoice
        </h1>

        <p className="text-sm text-muted-foreground">
          Update invoice details and items.
        </p>
      </div>

      {message && (
        <p className="mb-4 text-sm text-destructive">
          {message}
        </p>
      )}

      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="grid gap-6 rounded-lg border p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Customer</Label>

            <select
              value={customerId}
              onChange={(e) =>
                setCustomerId(e.target.value)
              }
              className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
            >
              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.company_name || customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Invoice Number</Label>

            <Input
              value={invoiceNumber}
              onChange={(e) =>
                setInvoiceNumber(e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Invoice Date</Label>

            <Input
              type="date"
              value={invoiceDate}
              onChange={(e) =>
                setInvoiceDate(e.target.value)
              }
            />
          </div>

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

          <div className="space-y-2 md:col-span-2">
            <Label>Reference</Label>

            <Input
              value={reference}
              onChange={(e) =>
                setReference(e.target.value)
              }
            />
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
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
            {items.map((item, index) => (
              <div
                key={index}
                className="grid items-end gap-3 md:grid-cols-[1fr_120px_150px_150px_50px]"
              >
                <div className="space-y-2">
                  <Label>Description</Label>

                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Qty</Label>

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unit Price</Label>

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
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>

                  <Input
                    value={`$${(
                      item.quantity * item.unit_price
                    ).toFixed(2)}`}
                    disabled
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 rounded-lg border p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>GST Rate (%)</Label>

            <Input
              type="number"
              value={gstRate}
              onChange={(e) =>
                setGstRate(Number(e.target.value))
              }
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={gstIncluded}
              onChange={(e) =>
                setGstIncluded(e.target.checked)
              }
            />

            <Label>Prices include GST</Label>
          </div>
        </div>

        <div className="ml-auto max-w-sm space-y-3 rounded-lg border p-6">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>GST ({gstRate}%)</span>
            <span>${gstAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Notes</Label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              className="min-h-24 w-full rounded-md border bg-transparent p-3 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Notes</Label>

            <textarea
              value={paymentNotes}
              onChange={(e) =>
                setPaymentNotes(e.target.value)
              }
              className="min-h-24 w-full rounded-md border bg-transparent p-3 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Updating..." : "Update Invoice"}
          </Button>
        </div>
      </form>
    </div>
  )
}