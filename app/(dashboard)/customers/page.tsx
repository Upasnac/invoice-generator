"use client"

import { useEffect, useState } from "react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Customer = {
  id: string
  business_id: string
  name: string
  company_name: string | null
  email: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  postcode: string | null
  country: string | null
}

export default function CustomersPage() {
  const supabase = createClient()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [businessId, setBusinessId] = useState<string | null>(null)

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null)

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [city, setCity] = useState("")
  const [postcode, setPostcode] = useState("")
  const [country, setCountry] = useState("New Zealand")

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
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

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (businessError || !business) {
      setMessage("Business profile not found.")
      setLoading(false)
      return
    }

    setBusinessId(business.id)

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })

    if (error) {
      setMessage(error.message)
    } else {
      setCustomers(data || [])
    }

    setLoading(false)
  }

  const resetForm = () => {
    setName("")
    setCompanyName("")
    setEmail("")
    setPhone("")
    setAddressLine1("")
    setAddressLine2("")
    setCity("")
    setPostcode("")
    setCountry("New Zealand")
    setEditingCustomer(null)
  }

  const openAddCustomer = () => {
    resetForm()
    setOpen(true)
  }

  const openEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)

    setName(customer.name || "")
    setCompanyName(customer.company_name || "")
    setEmail(customer.email || "")
    setPhone(customer.phone || "")
    setAddressLine1(customer.address_line1 || "")
    setAddressLine2(customer.address_line2 || "")
    setCity(customer.city || "")
    setPostcode(customer.postcode || "")
    setCountry(customer.country || "New Zealand")

    setOpen(true)
  }

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!businessId) {
      setMessage("Business profile not found.")
      return
    }

    setSaving(true)
    setMessage("")

    const customerData = {
      business_id: businessId,
      name,
      company_name: companyName || null,
      email: email || null,
      phone: phone || null,
      address_line1: addressLine1 || null,
      address_line2: addressLine2 || null,
      city: city || null,
      postcode: postcode || null,
      country,
    }

    let error

    if (editingCustomer) {
      const result = await supabase
        .from("customers")
        .update(customerData)
        .eq("id", editingCustomer.id)

      error = result.error
    } else {
      const result = await supabase
        .from("customers")
        .insert(customerData)

      error = result.error
    }

    if (error) {
      setMessage(error.message)
      setSaving(false)
      return
    }

    resetForm()
    setOpen(false)
    setSaving(false)

    await loadCustomers()
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    )

    if (!confirmed) return

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id)

    if (error) {
      setMessage(error.message)
      return
    }

    await loadCustomers()
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>

          <p className="text-sm text-muted-foreground">
            Manage customers used on your invoices.
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value)

            if (!value) {
              resetForm()
            }
          }}
        >
          <DialogTrigger
            render={
              <Button onClick={openAddCustomer}>
                <PlusIcon className="mr-2 size-4" />
                Add Customer
              </Button>
            }
          />

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Edit Customer" : "Add Customer"}
              </DialogTitle>

              <DialogDescription>
                {editingCustomer
                  ? "Update the customer details."
                  : "Enter the customer details that should appear on invoices."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveCustomer}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Customer Name *</Label>

                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Green Dog"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="company">
                    Company Name
                  </Label>

                  <Input
                    id="company"
                    value={companyName}
                    onChange={(e) =>
                      setCompanyName(e.target.value)
                    }
                    placeholder="Green Dog Ltd"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>

                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="customer@example.com"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>

                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      placeholder="021 123 4567"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address1">
                    Address Line 1
                  </Label>

                  <Input
                    id="address1"
                    value={addressLine1}
                    onChange={(e) =>
                      setAddressLine1(e.target.value)
                    }
                    placeholder="7/180 Maces Road"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address2">
                    Address Line 2
                  </Label>

                  <Input
                    id="address2"
                    value={addressLine2}
                    onChange={(e) =>
                      setAddressLine2(e.target.value)
                    }
                    placeholder="Bromley"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>

                    <Input
                      id="city"
                      value={city}
                      onChange={(e) =>
                        setCity(e.target.value)
                      }
                      placeholder="Christchurch"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="postcode">
                      Postcode
                    </Label>

                    <Input
                      id="postcode"
                      value={postcode}
                      onChange={(e) =>
                        setPostcode(e.target.value)
                      }
                      placeholder="8062"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="country">
                    Country
                  </Label>

                  <Input
                    id="country"
                    value={country}
                    onChange={(e) =>
                      setCountry(e.target.value)
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCustomer
                    ? "Update Customer"
                    : "Save Customer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages */}
      {message && (
        <p className="mb-4 text-sm text-destructive">
          {message}
        </p>
      )}

      {/* Customer Table */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>

              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center"
                >
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No customers yet. Add your first customer.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.name}
                  </TableCell>

                  <TableCell>
                    {customer.company_name || "—"}
                  </TableCell>

                  <TableCell>
                    {customer.email || "—"}
                  </TableCell>

                  <TableCell>
                    {customer.phone || "—"}
                  </TableCell>

                  <TableCell>
                    {customer.city || "—"}
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          openEditCustomer(customer)
                        }
                      >
                        <PencilIcon className="size-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleDelete(customer.id)
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