"use client"

import { useEffect, useMemo, useState } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
type Customer = {
  id: string
  name: string
  company_name: string | null
}

type InvoiceItem = {
  description: string
  quantity: number
  unit_price: number
}

export default function NewInvoicePage() {
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

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: "",
      quantity: 1,
      unit_price: 0,
    },
  ])

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
const [messageType, setMessageType] = useState<"error" | "success">("error")
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage("You must be logged in.")
      return
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!business) {
      setMessage("Business profile not found.")
      return
    }

    setBusinessId(business.id)

    const { data: customerData } = await supabase
      .from("customers")
      .select("id, name, company_name")
      .eq("business_id", business.id)
      .order("name")

    setCustomers(customerData || [])

    const today = new Date()
    const dateString = today.toISOString().split("T")[0]

    setInvoiceDate(dateString)

    const due = new Date()
    due.setDate(due.getDate() + 7)

    setDueDate(due.toISOString().split("T")[0])
const { data: nextNumber, error: numberError } =
  await supabase.rpc("get_next_invoice_number", {
    p_business_id: business.id,
  })

if (numberError) {
  showError(numberError.message)
  return
}

setInvoiceNumber(nextNumber)

  }

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string
  ) => {
    const updatedItems = [...items]

    if (field === "description") {
      updatedItems[index][field] = value
    } else {
      updatedItems[index][field] = Number(value)
    }

    setItems(updatedItems)
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

  const handleSaveInvoice = async (

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

if (items.length === 0) {
  showError("Please add at least one invoice item.")
  return
}

if (
  items.some(
    (item) =>
      !item.description.trim() ||
      item.quantity <= 0 ||
      item.unit_price < 0
  )
) {
  showError(
    "Each item needs a description, quantity greater than 0, and a valid price."
  )
  return
}

    setSaving(true)
    setMessage("")

    const { data: invoice, error: invoiceError } =
      await supabase
        .from("invoices")
        .insert({
          business_id: businessId,
          customer_id: customerId,
          invoice_number: invoiceNumber,
          invoice_date: invoiceDate,
          due_date: dueDate || null,
          reference: reference || null,

          subtotal,
          gst_rate: gstRate,
          gst_included: gstIncluded,
          gst_amount: gstAmount,
          discount: 0,
          total,

          status: "draft",
          notes: notes || null,
          payment_notes: paymentNotes || null,
        })
        .select()
        .single()

    if (invoiceError || !invoice) {
      showError(
        invoiceError?.message || "Unable to save invoice."
      )
      setSaving(false)
      return
    }

    const invoiceItems = items.map((item, index) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price,
      sort_order: index,
    }))

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(invoiceItems)

    if (itemsError) {
      showError(itemsError.message)
      setSaving(false)
      return
    }

    // setMessage("Invoice saved successfully.")
    router.push(`/invoices/${invoice.id}`)
    setSaving(false)
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create Invoice
        </h1>

        <p className="text-sm text-muted-foreground">
          Create a new invoice for your customer.
        </p>
      </div>

     {message && (
  <div
    className={
      messageType === "error"
        ? "mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        : "mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
    }
  >
    {message}
  </div>
)}

      <form
        onSubmit={handleSaveInvoice}
        className="space-y-8"
      >
        {/* Customer + Invoice Details */}
        <div className="grid gap-6 rounded-lg border p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Customer</Label>

            <select
              value={customerId}
              onChange={(e) =>
                setCustomerId(e.target.value)
              }
              className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
              required
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

          <div className="space-y-2">
            <Label>Invoice Number</Label>

          <Input
  value={invoiceNumber}
  readOnly
  className="bg-muted"
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
              required
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
              placeholder="Reference"
            />
          </div>
        </div>

        {/* Invoice Items */}
        <div className="rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
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
              const amount =
                item.quantity * item.unit_price

              return (
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
                      placeholder="Description"
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
                      value={`$${amount.toFixed(2)}`}
                      disabled
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
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

            <Label>
              Prices include GST
            </Label>
          </div>
        </div>

        {/* Totals */}
        <div className="ml-auto max-w-sm space-y-3 rounded-lg border p-6">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>GST ({gstRate}%)</span>
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
              placeholder="Thank you for your business."
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
              placeholder="Please make payment to the bank account shown on the invoice."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving Invoice..."
              : "Save Invoice"}
          </Button>
        </div>
      </form>
    </div>
  )
}